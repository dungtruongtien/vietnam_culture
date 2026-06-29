/**
 * Image search via DuckDuckGo — proposes relevant image URLs for each item
 * in data/[province]/image-sources.json by searching "{label}" on DDG Images.
 *
 * USAGE
 *   npx tsx scripts/search-images.ts ha-giang food          # all food in ha-giang
 *   npx tsx scripts/search-images.ts ha-giang food ha-giang-men-men  # single item
 *   npx tsx scripts/search-images.ts dak-lak place          # all places
 *
 * OUTPUT
 *   Writes/updates data/[province]/image-sources.json with proposed URLs.
 *   Only items with NO existing hero URL are updated (existing URLs preserved).
 *   Use --force flag to overwrite existing URLs:
 *     npx tsx scripts/search-images.ts ha-giang food ha-giang-men-men --force
 *
 * REVIEW
 *   Check data/[province]/image-sources.json before running download-images.ts.
 *   Remove any irrelevant URLs manually, then run the downloader.
 *
 * BLOCKED DOMAINS (filtered out from results)
 *   pinterest.com, shutterstock.com, getty*, istockphoto, alamy, dreamstime,
 *   youtube.com, ytimg.com, googleusercontent.com, facebook.com, instagram.com
 */

import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';

// ── Config ────────────────────────────────────────────────────────────────────

const BLOCKED_DOMAINS = [
  'pinterest.', 'shutterstock.', 'gettyimages.', 'istockphoto.', 'alamy.',
  'dreamstime.', 'youtube.com', 'ytimg.com', 'googleusercontent.com',
  'facebook.com', 'fbsbx.com', 'fbcdn.net', 'instagram.com', 'twitter.com', 'tiktok.com', 'flickr.com',
];

const PREFERRED_DOMAINS = [
  'mia.vn', 'ivivu.com', 'dulichvietnam.com.vn', 'toquoc.vn',
  'vietnamtourism.gov.vn', 'vnexpress.net', 'tuoitre.vn', 'dantri.com.vn',
  'vovworld.vn', 'baovanhoa.vn', 'luhanhvietnam.com.vn',
];

const DATA_DIR = 'data';
const GALLERY_COUNT = { food: 4, place: 5, festival: 5 };

// ── Types ─────────────────────────────────────────────────────────────────────

type ImageType = 'food' | 'place' | 'festival';

type ImageSource = {
  slug: string;
  type: ImageType;
  label: string;
  hero: string;
  gallery: string[];
};

type DDGResult = {
  image: string;
  url: string;
  title: string;
  width: number;
  height: number;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function sleep(ms: number) {
  return new Promise<void>(r => setTimeout(r, ms));
}

function fetch(url: string, opts: { headers?: Record<string, string> } = {}): Promise<string> {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith('https') ? https : http;
    const req = proto.get(url, { headers: opts.headers ?? {} }, res => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        if (res.statusCode === 200) resolve(body);
        else reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      });
    });
    req.on('error', reject);
  });
}

function isBlocked(imageUrl: string): boolean {
  return BLOCKED_DOMAINS.some(d => imageUrl.includes(d));
}

function preferenceScore(imageUrl: string): number {
  const domain = PREFERRED_DOMAINS.find(d => imageUrl.includes(d));
  return domain ? PREFERRED_DOMAINS.indexOf(domain) : PREFERRED_DOMAINS.length;
}

// ── DDG search ────────────────────────────────────────────────────────────────

async function getVqd(query: string): Promise<string> {
  const encoded = encodeURIComponent(query);
  const html = await fetch(
    `https://duckduckgo.com/?q=${encoded}&iax=images&ia=images`,
    { headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120' } }
  );
  const match = html.match(/vqd="([^"]+)"/);
  if (!match) throw new Error('Could not extract vqd token from DDG response');
  return match[1];
}

async function searchDDGImages(query: string): Promise<DDGResult[]> {
  const vqd = await getVqd(query);
  await sleep(500);

  const encoded = encodeURIComponent(query);
  const body = await fetch(
    `https://duckduckgo.com/i.js?q=${encoded}&o=json&s=0&vqd=${vqd}&f=,,,,,&l=us-en`,
    {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120',
        'Referer': 'https://duckduckgo.com/',
        'Accept': 'application/json',
      }
    }
  );

  const data = JSON.parse(body);
  return data.results ?? [];
}

function pickBestImages(results: DDGResult[], needed: number): string[] {
  const candidates = results
    .filter(r => r.image && !isBlocked(r.image))
    .filter(r => r.width >= 400 && r.height >= 300)
    .sort((a, b) => preferenceScore(a.image) - preferenceScore(b.image));

  // Deduplicate by domain to avoid all images from one source
  const used = new Set<string>();
  const picked: string[] = [];

  // First pass: preferred domains
  for (const r of candidates) {
    if (picked.length >= needed) break;
    try {
      const dom = new URL(r.image).hostname;
      if (!used.has(dom)) {
        picked.push(r.image);
        used.add(dom);
      }
    } catch {}
  }

  // Second pass: fill remaining from any domain
  if (picked.length < needed) {
    for (const r of candidates) {
      if (picked.length >= needed) break;
      if (!picked.includes(r.image)) picked.push(r.image);
    }
  }

  return picked.slice(0, needed);
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const force = args.includes('--force');
  const cleanArgs = args.filter(a => a !== '--force');
  const [provinceArg, typeArg, slugArg] = cleanArgs;

  if (!provinceArg) {
    console.error('Usage: npx tsx scripts/search-images.ts <province> [type] [slug] [--force]');
    process.exit(1);
  }

  const srcFile = path.join(DATA_DIR, provinceArg, 'image-sources.json');
  if (!fs.existsSync(srcFile)) {
    console.error(`Not found: ${srcFile}`);
    process.exit(1);
  }

  const items: ImageSource[] = JSON.parse(fs.readFileSync(srcFile, 'utf8'));

  const targets = items.filter(item => {
    if (typeArg && item.type !== typeArg) return false;
    if (slugArg && item.slug !== slugArg) return false;
    if (!force && item.hero) return false; // already has URLs
    return true;
  });

  if (targets.length === 0) {
    console.log('No items to search (all already have URLs). Use --force to overwrite.');
    process.exit(0);
  }

  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Image Search — DuckDuckGo');
  console.log(`  Province : ${provinceArg}`);
  console.log(`  Type     : ${typeArg ?? 'all'}`);
  console.log(`  Items    : ${targets.length}${force ? ' (force overwrite)' : ''}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  for (const item of targets) {
    const galleryCount = GALLERY_COUNT[item.type];
    const needed = 1 + galleryCount; // hero + gallery

    console.log(`\n▶ ${item.slug}`);
    console.log(`  ${item.label}`);
    console.log(`  Searching: "${item.label}"…`);

    try {
      const results = await searchDDGImages(item.label);
      console.log(`  Found ${results.length} raw results`);

      const picked = pickBestImages(results, needed);
      console.log(`  Picked ${picked.length} images:`);

      for (let i = 0; i < picked.length; i++) {
        const tag = i === 0 ? 'hero' : `gallery-${i}`;
        const dom = (() => { try { return new URL(picked[i]).hostname; } catch { return '?'; } })();
        console.log(`    [${tag}] ${dom}`);
        console.log(`           ${picked[i].slice(0, 90)}`);
      }

      // Update item
      item.hero = picked[0] ?? item.hero;
      item.gallery = picked.slice(1);

      if (picked.length < needed) {
        console.log(`  ⚠ Only ${picked.length}/${needed} images found — you may need to add URLs manually`);
      }
    } catch (e: any) {
      console.log(`  ✗ Search failed: ${e?.message}`);
    }

    // Be polite between requests
    await sleep(2000);
  }

  // Write back
  fs.writeFileSync(srcFile, JSON.stringify(items, null, 2));
  console.log(`\n✓ Updated ${srcFile}`);
  console.log('  Review URLs above, edit the file if needed, then run:');
  console.log(`  npx tsx scripts/download-images.ts ${provinceArg}${typeArg ? ' ' + typeArg : ''}`);
  console.log('');
}

main().catch(err => {
  console.error('\n✗ Fatal:', err);
  process.exit(1);
});
