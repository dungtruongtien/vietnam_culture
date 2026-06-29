/**
 * Unified image downloader — reads source URLs from data/[province]/image-sources.json,
 * downloads to public/{food|places|festivals}/[slug]/, validates every file is a real
 * image, and writes a sources.json audit log alongside each folder.
 *
 * USAGE
 *   npx tsx scripts/download-images.ts                      # all provinces, all types
 *   npx tsx scripts/download-images.ts dak-lak              # one province
 *   npx tsx scripts/download-images.ts dak-lak food         # one province, one type
 *   npx tsx scripts/download-images.ts dak-lak food dak-lak-bun-do  # single item
 *
 * SOURCE FILES
 *   data/[province]/image-sources.json — array of:
 *   {
 *     "slug":    "dak-lak-bun-do",
 *     "type":    "food" | "place" | "festival",
 *     "label":   "Bún Đỏ Buôn Ma Thuột",   ← stored in sources.json for relevance review
 *     "hero":    "https://...",
 *     "gallery": ["https://...", ...]        ← 4 items for food, 5 for place/festival
 *   }
 *
 * OUTPUT
 *   public/food/[slug]/hero.jpg
 *   public/food/[slug]/gallery-1.jpg  …  gallery-4.jpg
 *   public/food/[slug]/sources.json   ← URL + domain + timestamp + ok/error per file
 *
 * FAILURE POLICY
 *   A failed download leaves the file ABSENT. Never copy a placeholder.
 *   sources.json records the error so you know exactly what needs fixing.
 *
 * RATE LIMITING
 *   Wikimedia: 3 s between requests; auto-waits 700 s and retries once on 429.
 *   All other hosts: 1 s between requests.
 */

import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';

// ── Types ─────────────────────────────────────────────────────────────────────

type ImageType = 'food' | 'place' | 'festival';

type ImageSource = {
  slug: string;
  type: ImageType;
  label: string;
  hero: string;
  gallery: string[];
};

type SourceRecord = {
  file: string;
  label: string;
  url: string;
  domain: string;
  downloaded_at: string;
  ok: boolean;
  size_kb?: number;
  error?: string;
};

// ── Constants ─────────────────────────────────────────────────────────────────

const PUBLIC_DIR_MAP: Record<ImageType, string> = {
  food:     'public/food',
  place:    'public/places',
  festival: 'public/festivals',
};

const DATA_DIR = 'data';

// ── Helpers ───────────────────────────────────────────────────────────────────

function sleep(ms: number) {
  return new Promise<void>(r => setTimeout(r, ms));
}

function domain(url: string) {
  try { return new URL(url).hostname; } catch { return url; }
}

const MAGIC = {
  jpg:  [0xff, 0xd8],
  png:  [0x89, 0x50, 0x4e, 0x47],
  webp: [0x52, 0x49, 0x46, 0x46], // RIFF....WEBP
};

function isValidImage(filePath: string): boolean {
  try {
    const buf = fs.readFileSync(filePath);
    if (buf.length < 16) return false;
    return (
      (buf[0] === 0xff && buf[1] === 0xd8) ||
      (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) ||
      (buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46)
    );
  } catch {
    return false;
  }
}

function downloadFile(url: string, dest: string, hops = 0): Promise<void> {
  return new Promise((resolve, reject) => {
    if (hops > 5) { reject(new Error('Too many redirects')); return; }

    const file = fs.createWriteStream(dest);
    const proto = url.startsWith('https') ? https : http;

    const req = proto.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120',
        'Accept':     'image/webp,image/jpeg,image/png,*/*',
        'Referer':    (() => { try { return new URL(url).origin + '/'; } catch { return ''; } })(),
      },
    }, (res) => {
      const { statusCode, headers } = res;

      if (statusCode === 301 || statusCode === 302 || statusCode === 307 || statusCode === 308) {
        file.close(); fs.unlink(dest, () => {});
        const loc = headers.location!;
        const next = loc.startsWith('http') ? loc : new URL(loc, url).href;
        downloadFile(next, dest, hops + 1).then(resolve).catch(reject);
        return;
      }
      if (statusCode === 429) {
        file.close(); fs.unlink(dest, () => {});
        reject(new Error('RATE_LIMIT_429'));
        return;
      }
      if (statusCode !== 200) {
        file.close(); fs.unlink(dest, () => {});
        reject(new Error(`HTTP ${statusCode}`));
        return;
      }

      res.pipe(file);
      file.on('finish', () => file.close(() => resolve()));
    });

    req.on('error', err => { fs.unlink(dest, () => {}); reject(err); });
  });
}

// ── Progress display ──────────────────────────────────────────────────────────

const TICK = ['⠋','⠙','⠹','⠸','⠼','⠴','⠦','⠧','⠇','⠏'];
let tickIdx = 0;
let spinTimer: ReturnType<typeof setInterval> | null = null;
let currentStatus = '';

function startSpinner(msg: string) {
  currentStatus = msg;
  if (spinTimer) clearInterval(spinTimer);
  spinTimer = setInterval(() => {
    process.stdout.write(`\r${TICK[tickIdx % TICK.length]} ${currentStatus}   `);
    tickIdx++;
  }, 80);
}

function stopSpinner() {
  if (spinTimer) { clearInterval(spinTimer); spinTimer = null; }
  process.stdout.write('\r');
}

function log(line: string) {
  stopSpinner();
  console.log(line);
}

// ── Summary counters ──────────────────────────────────────────────────────────

type Summary = { ok: number; skip: number; fail: number; items: number };

// ── Core download logic ───────────────────────────────────────────────────────

async function processItem(item: ImageSource, summary: Summary) {
  const dir = path.join(PUBLIC_DIR_MAP[item.type], item.slug);
  fs.mkdirSync(dir, { recursive: true });

  const sourcesPath = path.join(dir, 'sources.json');
  let existingRecords: SourceRecord[] = [];
  try { existingRecords = JSON.parse(fs.readFileSync(sourcesPath, 'utf8')); } catch {}

  const allFiles: { name: string; url: string }[] = [
    { name: 'hero.jpg', url: item.hero },
    ...item.gallery.map((url, i) => ({ name: `gallery-${i + 1}.jpg`, url })),
  ];

  const newRecords: SourceRecord[] = [];
  summary.items++;

  log(`\n▶ [${item.type}] ${item.slug}`);
  log(`  ${item.label}`);

  for (const { name, url } of allFiles) {
    const dest = path.join(dir, name);
    const src = domain(url);
    const isWikimedia = url.includes('wikimedia.org');

    // Skip already-valid files
    if (fs.existsSync(dest) && isValidImage(dest)) {
      const kb = Math.round(fs.statSync(dest).size / 1024);
      log(`  ✓ ${name} — ${kb}KB [already valid, skipped]`);
      const existing = existingRecords.find(r => r.file === name);
      newRecords.push(existing ?? { file: name, label: item.label, url, domain: src, downloaded_at: new Date().toISOString(), ok: true, size_kb: kb });
      summary.skip++;
      continue;
    }

    startSpinner(`${name}  ←  ${src}`);

    // Rate-limit delay
    if (isWikimedia) await sleep(3000);
    else await sleep(1000);

    let ok = false;
    let error: string | undefined;
    let sizeKb: number | undefined;

    const tryDownload = async () => {
      await downloadFile(url, dest);
      if (!isValidImage(dest)) {
        fs.unlinkSync(dest);
        throw new Error('Not a valid image (HTML or empty response)');
      }
      sizeKb = Math.round(fs.statSync(dest).size / 1024);
    };

    try {
      await tryDownload();
      ok = true;
      stopSpinner();
      log(`  ✓ ${name} — ${sizeKb}KB  ←  ${src}`);
      summary.ok++;
    } catch (e: any) {
      const msg: string = e?.message ?? String(e);

      if (msg === 'RATE_LIMIT_429' && isWikimedia) {
        stopSpinner();
        log(`  ⚠ ${name} — Wikimedia 429. Waiting 700 s before retry…`);
        await sleep(700_000);
        startSpinner(`${name} (retry)  ←  ${src}`);
        try {
          await tryDownload();
          ok = true;
          stopSpinner();
          log(`  ✓ ${name} — ${sizeKb}KB  ←  ${src}  [after retry]`);
          summary.ok++;
        } catch (e2: any) {
          error = `Retry failed: ${e2?.message}`;
          stopSpinner();
          log(`  ✗ ${name} — ${error}  [file left absent]`);
          summary.fail++;
        }
      } else {
        error = msg;
        stopSpinner();
        log(`  ✗ ${name} — ${error}  [file left absent]`);
        summary.fail++;
      }
    }

    newRecords.push({
      file: name,
      label: item.label,
      url,
      domain: src,
      downloaded_at: new Date().toISOString(),
      ok,
      ...(sizeKb !== undefined ? { size_kb: sizeKb } : {}),
      ...(error ? { error } : {}),
    });
  }

  // Merge and write sources.json
  const merged = [
    ...existingRecords.filter(e => !newRecords.find(n => n.file === e.file)),
    ...newRecords,
  ];
  fs.writeFileSync(sourcesPath, JSON.stringify(merged, null, 2));
  log(`  → sources.json updated (${merged.length} entries)`);
}

// ── Load source catalog ───────────────────────────────────────────────────────

function loadSources(provinceFilter?: string): ImageSource[] {
  const provinces = fs.readdirSync(DATA_DIR).filter(d => {
    if (!fs.statSync(path.join(DATA_DIR, d)).isDirectory()) return false;
    if (provinceFilter && d !== provinceFilter) return false;
    return true;
  });

  const items: ImageSource[] = [];
  for (const province of provinces) {
    const srcFile = path.join(DATA_DIR, province, 'image-sources.json');
    if (!fs.existsSync(srcFile)) continue;
    try {
      const loaded: ImageSource[] = JSON.parse(fs.readFileSync(srcFile, 'utf8'));
      items.push(...loaded);
    } catch (e) {
      console.warn(`⚠ Could not parse ${srcFile}: ${e}`);
    }
  }
  return items;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const [, , provinceArg, typeArg, slugArg] = process.argv;

  // Validate type filter
  const validTypes: ImageType[] = ['food', 'place', 'festival'];
  if (typeArg && !validTypes.includes(typeArg as ImageType)) {
    console.error(`Unknown type "${typeArg}". Must be one of: food, place, festival`);
    process.exit(1);
  }

  const allItems = loadSources(provinceArg);

  if (allItems.length === 0) {
    console.error(
      provinceArg
        ? `No image-sources.json found for province "${provinceArg}". Check data/${provinceArg}/image-sources.json exists.`
        : 'No image-sources.json files found in any data/ subdirectory.'
    );
    process.exit(1);
  }

  // Apply filters
  const items = allItems.filter(item => {
    if (typeArg && item.type !== typeArg) return false;
    if (slugArg && item.slug !== slugArg) return false;
    return true;
  });

  if (items.length === 0) {
    console.error(`No items match: province=${provinceArg ?? '*'} type=${typeArg ?? '*'} slug=${slugArg ?? '*'}`);
    process.exit(1);
  }

  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Image Downloader — Khám Phá Việt Nam');
  console.log(`  Province : ${provinceArg ?? 'all'}`);
  console.log(`  Type     : ${typeArg ?? 'all'}`);
  console.log(`  Slug     : ${slugArg ?? 'all'}`);
  console.log(`  Items    : ${items.length}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const summary: Summary = { ok: 0, skip: 0, fail: 0, items: 0 };
  const t0 = Date.now();

  for (const item of items) {
    await processItem(item, summary);
  }

  stopSpinner();

  const elapsed = Math.round((Date.now() - t0) / 1000);
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  Done in ${elapsed}s`);
  console.log(`  Items processed : ${summary.items}`);
  console.log(`  ✓ Downloaded    : ${summary.ok}`);
  console.log(`  ✓ Skipped       : ${summary.skip}  (already valid)`);
  console.log(`  ✗ Failed        : ${summary.fail}  (files left absent)`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  if (summary.fail > 0) {
    console.log('\n  Failed files were left absent. Find replacement URLs and re-run:');
    console.log(`  npx tsx scripts/download-images.ts ${provinceArg ?? '<province>'} ${typeArg ?? '<type>'} <slug>`);
  }
}

main().catch(err => {
  stopSpinner();
  console.error('\n✗ Fatal:', err);
  process.exit(1);
});
