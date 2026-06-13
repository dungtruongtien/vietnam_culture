import express from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

const MIGRATIONS_DIR = path.join(__dirname, '..', 'migrations', 'generated');
if (!fs.existsSync(MIGRATIONS_DIR)) fs.mkdirSync(MIGRATIONS_DIR, { recursive: true });

function timestamp(): string {
  return new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
}

function hashContent(str: string): string {
  return crypto.createHash('sha256').update(str).digest('hex').slice(0, 16);
}

function escapeSql(s: string): string {
  return s.replace(/'/g, "''");
}

// Generate migration for new province
app.post('/api/province', (req, res) => {
  const { name_vi, name_en, slug, type, type_en, meta_description_vi, meta_description_en, population, area_km2, region_vi, region_en } = req.body;

  if (!name_vi || !name_en || !slug || !type || !type_en) {
    return res.status(400).json({ error: 'Missing required fields: name_vi, name_en, slug, type, type_en' });
  }

  const filename = `${timestamp()}_add_province_${slug}.sql`;
  const filepath = path.join(MIGRATIONS_DIR, filename);

  const sql = `-- Migration: Thêm tỉnh ${name_vi}
-- Generated: ${new Date().toISOString()}
-- TODO: Review trước khi apply

BEGIN TRANSACTION;

INSERT INTO provinces (name_vi, name_en, slug, type, type_en, svg_path_id, status, meta_description_vi, meta_description_en, population, area_km2, region_vi, region_en)
VALUES (
  '${escapeSql(name_vi)}',
  '${escapeSql(name_en)}',
  '${escapeSql(slug)}',
  '${escapeSql(type)}',
  '${escapeSql(type_en)}',
  '${escapeSql(slug)}',
  'draft',
  ${meta_description_vi ? `'${escapeSql(meta_description_vi)}'` : 'NULL'},
  ${meta_description_en ? `'${escapeSql(meta_description_en)}'` : 'NULL'},
  ${population ? `'${escapeSql(population)}'` : 'NULL'},
  ${area_km2 ? area_km2 : 'NULL'},
  ${region_vi ? `'${escapeSql(region_vi)}'` : 'NULL'},
  ${region_en ? `'${escapeSql(region_en)}'` : 'NULL'}
);

COMMIT;

-- Activate after review:
-- UPDATE provinces SET status = 'active' WHERE slug = '${escapeSql(slug)}';
`;

  fs.writeFileSync(filepath, sql);
  res.json({ success: true, file: filename, path: filepath });
});

// Generate migration for new event
app.post('/api/event', (req, res) => {
  const {
    province_slug, title_vi, title_en, content_vi, content_en,
    event_date, event_date_display, image_url,
    sources // array of {url, title, publisher, accessed_date}
  } = req.body;

  if (!province_slug || !title_vi || !title_en || !content_vi || !content_en || !event_date || !event_date_display) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const parsedSources = typeof sources === 'string' ? JSON.parse(sources) : sources;
  if (!parsedSources || parsedSources.length < 2) {
    return res.status(400).json({ error: 'Phải có ít nhất 2 nguồn tham khảo' });
  }

  const contentHash = hashContent(title_vi + content_vi);
  const filename = `${timestamp()}_add_event_${province_slug}.sql`;
  const filepath = path.join(MIGRATIONS_DIR, filename);

  const sourceInserts = parsedSources.map((s: { url: string; title: string; publisher: string; accessed_date: string }) => `
INSERT INTO sources (entity_type, entity_id, url, title, publisher, accessed_date)
VALUES ('event', last_insert_rowid(), '${escapeSql(s.url)}', '${escapeSql(s.title)}', '${escapeSql(s.publisher)}', '${escapeSql(s.accessed_date)}');`).join('\n');

  const sql = `-- Migration: Thêm sự kiện lịch sử cho ${province_slug}
-- Generated: ${new Date().toISOString()}
-- TODO: Review nội dung và nguồn trước khi apply

BEGIN TRANSACTION;

INSERT INTO events (province_id, title_vi, title_en, content_vi, content_en, event_date, event_date_display, image_url, status, content_hash)
SELECT
  p.id,
  '${escapeSql(title_vi)}',
  '${escapeSql(title_en)}',
  '${escapeSql(content_vi)}',
  '${escapeSql(content_en)}',
  '${escapeSql(event_date)}',
  '${escapeSql(event_date_display)}',
  ${image_url ? `'${escapeSql(image_url)}'` : 'NULL'},
  'published',
  '${contentHash}'
FROM provinces p WHERE p.slug = '${escapeSql(province_slug)}';
${sourceInserts}

COMMIT;
`;

  fs.writeFileSync(filepath, sql);
  res.json({ success: true, file: filename, path: filepath });
});

// Generate migration for cultural post
app.post('/api/cultural-post', (req, res) => {
  const {
    province_slug, title_vi, title_en, content_vi, content_en, type,
    sources
  } = req.body;

  if (!province_slug || !title_vi || !title_en || !content_vi || !content_en || !type) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const parsedSources = typeof sources === 'string' ? JSON.parse(sources) : (sources || []);
  if (!parsedSources || parsedSources.length < 2) {
    return res.status(400).json({ error: 'Phải có ít nhất 2 nguồn tham khảo' });
  }

  const contentHash = hashContent(title_vi + content_vi);
  const filename = `${timestamp()}_add_cultural_post_${province_slug}_${type}.sql`;
  const filepath = path.join(MIGRATIONS_DIR, filename);

  const sourceInserts = parsedSources.map((s: { url: string; title: string; publisher: string; accessed_date: string }) => `
INSERT INTO sources (entity_type, entity_id, url, title, publisher, accessed_date)
VALUES ('cultural_post', last_insert_rowid(), '${escapeSql(s.url)}', '${escapeSql(s.title)}', '${escapeSql(s.publisher)}', '${escapeSql(s.accessed_date)}');`).join('\n');

  const sql = `-- Migration: Thêm bài viết văn hóa (${type}) cho ${province_slug}
-- Generated: ${new Date().toISOString()}

BEGIN TRANSACTION;

INSERT INTO cultural_posts (province_id, title_vi, title_en, content_vi, content_en, type, status, content_hash)
SELECT
  p.id,
  '${escapeSql(title_vi)}',
  '${escapeSql(title_en)}',
  '${escapeSql(content_vi)}',
  '${escapeSql(content_en)}',
  '${escapeSql(type)}',
  'published',
  '${contentHash}'
FROM provinces p WHERE p.slug = '${escapeSql(province_slug)}';
${sourceInserts}

COMMIT;
`;

  fs.writeFileSync(filepath, sql);
  res.json({ success: true, file: filename, path: filepath });
});

// Generate migration for festival
app.post('/api/festival', (req, res) => {
  const {
    province_slug, name_vi, name_en, description_vi, description_en,
    start_date, end_date, is_lunar, is_trending
  } = req.body;

  if (!province_slug || !name_vi || !name_en || !start_date) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const filename = `${timestamp()}_add_festival_${province_slug}.sql`;
  const filepath = path.join(MIGRATIONS_DIR, filename);

  const sql = `-- Migration: Thêm lễ hội cho ${province_slug}
-- Generated: ${new Date().toISOString()}

BEGIN TRANSACTION;

INSERT INTO festivals (province_id, name_vi, name_en, description_vi, description_en, start_date, end_date, is_lunar, is_trending, status)
SELECT
  p.id,
  '${escapeSql(name_vi)}',
  '${escapeSql(name_en)}',
  ${description_vi ? `'${escapeSql(description_vi)}'` : 'NULL'},
  ${description_en ? `'${escapeSql(description_en)}'` : 'NULL'},
  '${escapeSql(start_date)}',
  ${end_date ? `'${escapeSql(end_date)}'` : 'NULL'},
  ${is_lunar ? 1 : 0},
  ${is_trending ? 1 : 0},
  'active'
FROM provinces p WHERE p.slug = '${escapeSql(province_slug)}';

COMMIT;
`;

  fs.writeFileSync(filepath, sql);
  res.json({ success: true, file: filename, path: filepath });
});

// List generated migrations
app.get('/api/migrations', (_req, res) => {
  const files = fs.existsSync(MIGRATIONS_DIR)
    ? fs.readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith('.sql')).sort().reverse()
    : [];
  res.json({ files });
});

// Get migration content
app.get('/api/migrations/:filename', (req, res) => {
  const filepath = path.join(MIGRATIONS_DIR, req.params.filename);
  if (!fs.existsSync(filepath)) return res.status(404).json({ error: 'Not found' });
  res.type('text/plain').send(fs.readFileSync(filepath, 'utf-8'));
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`\n🛠️  Admin Tool running at http://localhost:${PORT}`);
  console.log(`📁 Generated migrations saved to: ${MIGRATIONS_DIR}\n`);
});
