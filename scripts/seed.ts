import { createClient, type Client } from '@libsql/client';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

const DB_PATH = process.env.DATABASE_PATH || './database.db';
const MIGRATIONS_DIR = path.join(process.cwd(), 'migrations');
const DATA_DIR = path.join(process.cwd(), 'data');

function hash(text: string): string {
  return crypto.createHash('sha256').update(text).digest('hex').slice(0, 16);
}

// ================================================================
// DB helpers
// ================================================================

async function runMigrations(db: Client): Promise<void> {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL UNIQUE,
      applied TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
  const result = await db.execute('SELECT filename FROM _migrations');
  const applied = new Set(result.rows.map((r) => r.filename as string));
  const files = fs.readdirSync(MIGRATIONS_DIR).filter((f: string) => f.endsWith('.sql') && !applied.has(f)).sort();
  for (const file of files) {
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf-8');
    await db.executeMultiple(sql);
    await db.execute({ sql: 'INSERT INTO _migrations (filename) VALUES (?)', args: [file] });
    console.log(`[seed] Applied migration: ${file}`);
  }
}

async function upsertProvince(db: Client, p: ProvinceData): Promise<number> {
  const r = await db.execute({
    sql: `INSERT OR REPLACE INTO provinces
      (name_vi, name_en, slug, type, type_en, svg_path_id, status, meta_description_vi, meta_description_en, population, area_km2, region_vi, region_en)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [p.name_vi, p.name_en, p.slug, p.type, p.type_en, p.svg_path_id, p.status,
           p.meta_description_vi ?? null, p.meta_description_en ?? null,
           p.population ?? null, p.area_km2 ?? null, p.region_vi ?? null, p.region_en ?? null],
  });
  return Number(r.lastInsertRowid);
}

async function upsertEvent(db: Client, provinceId: number, e: EventData): Promise<number> {
  const r = await db.execute({
    sql: `INSERT INTO events
      (province_id, title_vi, title_en, content_vi, content_en, event_date, event_date_display, image_url, status, content_hash, slug)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [provinceId, e.title_vi, e.title_en, e.content_vi, e.content_en,
           e.event_date, e.event_date_display, e.image_url ?? null, e.status, hash(e.content_hash), e.slug ?? null],
  });
  return Number(r.lastInsertRowid);
}

async function upsertCulturalPost(db: Client, provinceId: number, p: CulturalPostData): Promise<number> {
  const contentVi = JSON.stringify(p.content_vi);
  const contentEn = JSON.stringify(p.content_en);
  const r = await db.execute({
    sql: `INSERT INTO cultural_posts
      (province_id, title_vi, title_en, content_vi, content_en, type, status, content_hash)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [provinceId, p.title_vi, p.title_en, contentVi, contentEn, p.type, p.status, hash(p.content_hash)],
  });
  return Number(r.lastInsertRowid);
}

async function upsertFoodItem(db: Client, culturalPostId: number, f: FoodItemData): Promise<number> {
  const r = await db.execute({
    sql: `INSERT INTO food_items
      (cultural_post_id, slug, title_vi, title_en, lede_vi, lede_en, tags_json,
       info_origin_vi, info_origin_en, info_best_time_vi, info_best_time_en, info_price_range,
       info_vegetarian_vi, info_vegetarian_en,
       story_vi, story_en, story_blockquote_vi, story_blockquote_en, story_blockquote_cite,
       body_blocks_json,
       ingredients_json, how_to_eat_vi, how_to_eat_en, eateries_json,
       tip_title_vi, tip_title_en, tip_body_vi, tip_body_en,
       image_url, gallery_json, status, content_hash)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    args: [
      culturalPostId, f.slug, f.title_vi, f.title_en, f.lede_vi, f.lede_en,
      JSON.stringify(f.tags),
      f.info_origin_vi ?? null, f.info_origin_en ?? null,
      f.info_best_time_vi ?? null, f.info_best_time_en ?? null,
      f.info_price_range ?? null,
      f.info_vegetarian_vi ?? null, f.info_vegetarian_en ?? null,
      f.story_vi, f.story_en,
      f.story_blockquote_vi ?? null, f.story_blockquote_en ?? null, f.story_blockquote_cite ?? null,
      f.body_blocks ? JSON.stringify(f.body_blocks) : null,
      JSON.stringify(f.ingredients), f.how_to_eat_vi, f.how_to_eat_en,
      JSON.stringify(f.eateries),
      f.tip_title_vi ?? null, f.tip_title_en ?? null,
      f.tip_body_vi ?? null, f.tip_body_en ?? null,
      f.image_url ?? null, JSON.stringify(f.gallery ?? []),
      f.status, hash(f.content_hash),
    ],
  });
  return Number(r.lastInsertRowid);
}

async function insertSource(db: Client, entityType: string, entityId: number, s: SourceData): Promise<void> {
  await db.execute({
    sql: `INSERT OR IGNORE INTO sources (entity_type, entity_id, url, title, publisher, accessed_date) VALUES (?, ?, ?, ?, ?, ?)`,
    args: [entityType, entityId, s.url, s.title, s.publisher, s.accessed_date],
  });
}

async function insertFoodItemSource(db: Client, foodItemId: number, s: SourceData): Promise<void> {
  await db.execute({
    sql: `INSERT OR IGNORE INTO food_item_sources (food_item_id, url, title, publisher, accessed_date) VALUES (?,?,?,?,?)`,
    args: [foodItemId, s.url, s.title, s.publisher, s.accessed_date],
  });
}

async function upsertPlaceItem(db: Client, culturalPostId: number, p: PlaceItemData): Promise<number> {
  const r = await db.execute({
    sql: `INSERT INTO place_items
      (cultural_post_id, slug, title_vi, title_en, lede_vi, lede_en, tags_json,
       info_address_vi, info_address_en, info_hours_vi, info_hours_en,
       info_price_vi, info_price_en, info_best_time_vi, info_best_time_en,
       story_vi, story_en, story_blockquote_vi, story_blockquote_en, story_blockquote_cite,
       body_blocks_json,
       highlights_json, how_to_visit_vi, how_to_visit_en,
       tip_title_vi, tip_title_en, tip_body_vi, tip_body_en,
       image_url, gallery_json, status, content_hash)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    args: [
      culturalPostId, p.slug, p.title_vi, p.title_en, p.lede_vi, p.lede_en,
      JSON.stringify(p.tags ?? []),
      p.info_address_vi ?? null, p.info_address_en ?? null,
      p.info_hours_vi ?? null, p.info_hours_en ?? null,
      p.info_price_vi ?? null, p.info_price_en ?? null,
      p.info_best_time_vi ?? null, p.info_best_time_en ?? null,
      p.story_vi, p.story_en,
      p.story_blockquote_vi ?? null, p.story_blockquote_en ?? null, p.story_blockquote_cite ?? null,
      p.body_blocks ? JSON.stringify(p.body_blocks) : null,
      JSON.stringify(p.highlights ?? []),
      p.how_to_visit_vi, p.how_to_visit_en,
      p.tip_title_vi ?? null, p.tip_title_en ?? null,
      p.tip_body_vi ?? null, p.tip_body_en ?? null,
      p.image_url ?? null, JSON.stringify(p.gallery ?? []),
      p.status, hash(p.content_hash),
    ],
  });
  return Number(r.lastInsertRowid);
}

async function insertPlaceItemSource(db: Client, placeItemId: number, s: SourceData): Promise<void> {
  await db.execute({
    sql: `INSERT OR IGNORE INTO place_item_sources (place_item_id, url, title, publisher, accessed_date) VALUES (?,?,?,?,?)`,
    args: [placeItemId, s.url, s.title, s.publisher, s.accessed_date],
  });
}

async function insertFestival(db: Client, provinceId: number, f: FestivalData): Promise<number> {
  const r = await db.execute({
    sql: `INSERT OR IGNORE INTO festivals
      (province_id, name_vi, name_en, description_vi, description_en, content_vi, content_en, start_date, end_date, is_lunar, is_trending, status, slug)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [provinceId, f.name_vi, f.name_en, f.description_vi ?? null, f.description_en ?? null,
           f.content_vi ?? null, f.content_en ?? null,
           f.start_date, f.end_date ?? null, f.is_lunar, f.is_trending, f.status, f.slug ?? null],
  });
  return Number(r.lastInsertRowid);
}

async function upsertFestivalItem(db: Client, festivalId: number, fi: FestivalItemData): Promise<number> {
  const r = await db.execute({
    sql: `INSERT INTO festival_items
      (festival_id, slug, title_vi, title_en, lede_vi, lede_en, tags_json,
       info_when_vi, info_when_en, info_location_vi, info_location_en,
       info_admission_vi, info_admission_en, info_best_time_vi, info_best_time_en,
       story_vi, story_en, story_blockquote_vi, story_blockquote_en, story_blockquote_cite,
       body_blocks_json, highlights_json, how_to_attend_vi, how_to_attend_en,
       tip_title_vi, tip_title_en, tip_body_vi, tip_body_en,
       image_url, gallery_json, status, content_hash)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    args: [
      festivalId, fi.slug, fi.title_vi, fi.title_en, fi.lede_vi, fi.lede_en,
      JSON.stringify(fi.tags ?? []),
      fi.info_when_vi ?? null, fi.info_when_en ?? null,
      fi.info_location_vi ?? null, fi.info_location_en ?? null,
      fi.info_admission_vi ?? null, fi.info_admission_en ?? null,
      fi.info_best_time_vi ?? null, fi.info_best_time_en ?? null,
      fi.story_vi, fi.story_en,
      fi.story_blockquote_vi ?? null, fi.story_blockquote_en ?? null, fi.story_blockquote_cite ?? null,
      fi.body_blocks ? JSON.stringify(fi.body_blocks) : null,
      JSON.stringify(fi.highlights ?? []),
      fi.how_to_attend_vi, fi.how_to_attend_en,
      fi.tip_title_vi ?? null, fi.tip_title_en ?? null,
      fi.tip_body_vi ?? null, fi.tip_body_en ?? null,
      fi.image_url ?? null, JSON.stringify(fi.gallery ?? []),
      fi.status, hash(fi.content_hash),
    ],
  });
  return Number(r.lastInsertRowid);
}

async function insertFestivalItemSource(db: Client, festivalItemId: number, s: SourceData): Promise<void> {
  await db.execute({
    sql: `INSERT OR IGNORE INTO festival_item_sources (festival_item_id, url, title, publisher, accessed_date) VALUES (?,?,?,?,?)`,
    args: [festivalItemId, s.url, s.title, s.publisher, s.accessed_date],
  });
}

// ================================================================
// JSON data types
// ================================================================

interface SourceData {
  url: string;
  title: string;
  publisher: string;
  accessed_date: string;
}

interface ProvinceData {
  name_vi: string; name_en: string; slug: string;
  type: string; type_en: string; svg_path_id: string; status: string;
  meta_description_vi?: string; meta_description_en?: string;
  population?: string; area_km2?: number; region_vi?: string; region_en?: string;
}

interface EventData {
  content_hash: string;
  slug?: string;
  title_vi: string; title_en: string;
  content_vi: string; content_en: string;
  event_date: string; event_date_display: string;
  image_url?: string | null; status: string;
  sources: SourceData[];
}

interface CulturalPostData {
  content_hash: string; type: string; status: string;
  title_vi: string; title_en: string;
  content_vi: Array<{ item: string; description: string }>;
  content_en: Array<{ item: string; description: string }>;
  sources: SourceData[];
}

interface FoodItemData {
  content_hash: string; cultural_post_hash: string; slug: string;
  title_vi: string; title_en: string; lede_vi: string; lede_en: string;
  tags: string[];
  info_origin_vi?: string; info_origin_en?: string;
  info_best_time_vi?: string; info_best_time_en?: string;
  info_price_range?: string;
  info_vegetarian_vi?: string; info_vegetarian_en?: string;
  story_vi: string; story_en: string;
  story_blockquote_vi?: string; story_blockquote_en?: string; story_blockquote_cite?: string;
  body_blocks?: unknown[];
  ingredients: Array<{ name_vi: string; name_en: string; role_vi: string; role_en: string; svgVariant: number }>;
  how_to_eat_vi: string; how_to_eat_en: string;
  eateries: Array<{ name: string; address: string; tags: string[]; price_vnd: string; price_note?: string }>;
  tip_title_vi?: string; tip_title_en?: string; tip_body_vi?: string; tip_body_en?: string;
  image_url?: string | null; gallery?: string[];
  status: string; sources: SourceData[];
}

interface PlaceItemData {
  content_hash: string; cultural_post_hash: string; slug: string;
  title_vi: string; title_en: string; lede_vi: string; lede_en: string;
  tags?: string[];
  info_address_vi?: string; info_address_en?: string;
  info_hours_vi?: string; info_hours_en?: string;
  info_price_vi?: string; info_price_en?: string;
  info_best_time_vi?: string; info_best_time_en?: string;
  story_vi: string; story_en: string;
  story_blockquote_vi?: string; story_blockquote_en?: string; story_blockquote_cite?: string;
  body_blocks?: unknown[];
  highlights: Array<{ title_vi: string; title_en: string; body_vi: string; body_en: string }>;
  how_to_visit_vi: string; how_to_visit_en: string;
  tip_title_vi?: string; tip_title_en?: string; tip_body_vi?: string; tip_body_en?: string;
  image_url?: string | null; gallery?: string[];
  status: string; sources: SourceData[];
}

interface FestivalData {
  name_vi: string; name_en: string;
  slug?: string;
  description_vi?: string; description_en?: string;
  content_vi?: string; content_en?: string;
  start_date: string; end_date?: string | null;
  is_lunar: number; is_trending: number; status: string;
  sources?: SourceData[];
}

interface FestivalItemData {
  content_hash: string; festival_slug: string; slug: string;
  title_vi: string; title_en: string; lede_vi: string; lede_en: string;
  tags?: string[];
  info_when_vi?: string; info_when_en?: string;
  info_location_vi?: string; info_location_en?: string;
  info_admission_vi?: string; info_admission_en?: string;
  info_best_time_vi?: string; info_best_time_en?: string;
  story_vi: string; story_en: string;
  story_blockquote_vi?: string; story_blockquote_en?: string; story_blockquote_cite?: string;
  body_blocks?: unknown[];
  highlights: Array<{ title_vi: string; title_en: string; body_vi: string; body_en: string }>;
  how_to_attend_vi: string; how_to_attend_en: string;
  tip_title_vi?: string; tip_title_en?: string; tip_body_vi?: string; tip_body_en?: string;
  image_url?: string | null; gallery?: string[];
  status: string; sources: SourceData[];
}

function readJson<T>(filePath: string): T | null {
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as T;
}

// ================================================================
// Main seeder
// ================================================================

const dbPath = path.resolve(process.cwd(), DB_PATH);
const db = createClient({ url: `file:${dbPath}` });

async function seedAll(): Promise<void> {
  await runMigrations(db);

  // Clear existing seed data
  await db.executeMultiple(`
    DELETE FROM festival_item_sources;
    DELETE FROM festival_items;
    DELETE FROM place_item_sources;
    DELETE FROM place_items;
    DELETE FROM food_item_sources;
    DELETE FROM food_items;
    DELETE FROM sources;
    DELETE FROM festivals;
    DELETE FROM cultural_posts;
    DELETE FROM events;
    DELETE FROM provinces;
    DELETE FROM sqlite_sequence WHERE name IN ('provinces','events','cultural_posts','sources','festivals','food_items','food_item_sources','place_items','place_item_sources','festival_items','festival_item_sources');
  `);

  const provinces = readJson<ProvinceData[]>(path.join(DATA_DIR, 'provinces.json'));
  if (!provinces) throw new Error('data/provinces.json not found');

  for (const province of provinces) {
    const provinceId = await upsertProvince(db, province);
    const slug = province.slug;
    const provinceDir = path.join(DATA_DIR, slug);
    console.log(`[seed] Province: ${province.name_en} (id: ${provinceId})`);

    // Events
    const events = readJson<EventData[]>(path.join(provinceDir, 'events.json')) ?? [];
    for (const event of events) {
      const eventId = await upsertEvent(db, provinceId, event);
      for (const source of event.sources) {
        await insertSource(db, 'event', eventId, source);
      }
    }
    console.log(`[seed]   events: ${events.length}`);

    // Cultural posts — track hash→id map for food items
    const culturalPosts = readJson<CulturalPostData[]>(path.join(provinceDir, 'cultural-posts.json')) ?? [];
    const culturalPostIdByHash = new Map<string, number>();
    for (const post of culturalPosts) {
      const postId = await upsertCulturalPost(db, provinceId, post);
      culturalPostIdByHash.set(post.content_hash, postId);
      for (const source of post.sources) {
        await insertSource(db, 'cultural_post', postId, source);
      }
    }
    console.log(`[seed]   cultural_posts: ${culturalPosts.length}`);

    // Food items
    const foodItems = readJson<FoodItemData[]>(path.join(provinceDir, 'food-items.json')) ?? [];
    for (const food of foodItems) {
      const culturalPostId = culturalPostIdByHash.get(food.cultural_post_hash);
      if (!culturalPostId) {
        console.warn(`[seed]   WARNING: cultural_post_hash "${food.cultural_post_hash}" not found for food "${food.slug}" — skipping`);
        continue;
      }
      const foodId = await upsertFoodItem(db, culturalPostId, food);
      for (const source of food.sources) {
        await insertFoodItemSource(db, foodId, source);
      }
    }
    console.log(`[seed]   food_items: ${foodItems.length}`);

    // Place items
    const placeItems = readJson<PlaceItemData[]>(path.join(provinceDir, 'place-items.json')) ?? [];
    for (const place of placeItems) {
      const culturalPostId = culturalPostIdByHash.get(place.cultural_post_hash);
      if (!culturalPostId) {
        console.warn(`[seed]   WARNING: cultural_post_hash "${place.cultural_post_hash}" not found for place "${place.slug}" — skipping`);
        continue;
      }
      const placeId = await upsertPlaceItem(db, culturalPostId, place);
      for (const source of place.sources) {
        await insertPlaceItemSource(db, placeId, source);
      }
    }
    console.log(`[seed]   place_items: ${placeItems.length}`);

    // Festivals
    const festivals = readJson<FestivalData[]>(path.join(provinceDir, 'festivals.json')) ?? [];
    const festivalIdBySlug = new Map<string, number>();
    for (const festival of festivals) {
      const festivalId = await insertFestival(db, provinceId, festival);
      if (festival.slug) festivalIdBySlug.set(festival.slug, festivalId);
      for (const source of festival.sources ?? []) {
        await insertSource(db, 'festival', festivalId, source);
      }
    }
    console.log(`[seed]   festivals: ${festivals.length}`);

    // Festival items
    const festivalItems = readJson<FestivalItemData[]>(path.join(provinceDir, 'festival-items.json')) ?? [];
    for (const fi of festivalItems) {
      const festivalId = festivalIdBySlug.get(fi.festival_slug);
      if (!festivalId) {
        console.warn(`[seed]   WARNING: festival_slug "${fi.festival_slug}" not found for festival-item "${fi.slug}" — skipping`);
        continue;
      }
      const fiId = await upsertFestivalItem(db, festivalId, fi);
      for (const source of fi.sources) {
        await insertFestivalItemSource(db, fiId, source);
      }
    }
    console.log(`[seed]   festival_items: ${festivalItems.length}`);
  }

  console.log('[seed] Database seeded successfully!');
}

seedAll().then(() => db.close()).catch((err) => { console.error(err); process.exit(1); });
