import { getDb, ensureReady } from './db';

export type Province = {
  id: number;
  name_vi: string;
  name_en: string;
  slug: string;
  type: 'thanh-pho' | 'tinh';
  type_en: 'city' | 'province';
  svg_path_id: string | null;
  status: 'active' | 'draft' | 'archived';
  meta_description_vi: string | null;
  meta_description_en: string | null;
  population: string | null;
  area_km2: number | null;
  region_vi: string | null;
  region_en: string | null;
};

export type Event = {
  id: number;
  province_id: number;
  title_vi: string;
  title_en: string;
  content_vi: string;
  content_en: string;
  event_date: string;
  event_date_display: string;
  image_url: string | null;
  status: 'published' | 'draft' | 'archived';
  slug: string | null;
};

export type Source = {
  id: number;
  entity_type: string;
  entity_id: number;
  url: string;
  title: string;
  publisher: string;
  accessed_date: string;
};

export type CulturalPost = {
  id: number;
  province_id: number;
  title_vi: string;
  title_en: string;
  content_vi: string;
  content_en: string;
  type: 'am-thuc' | 'dia-diem' | 'phong-tuc' | 'le-hoi';
  status: 'published' | 'draft' | 'archived';
  image_url: string | null;
};

export type Festival = {
  id: number;
  province_id: number;
  slug: string | null;
  name_vi: string;
  name_en: string;
  description_vi: string | null;
  description_en: string | null;
  content_vi: string | null;
  content_en: string | null;
  start_date: string;
  end_date: string | null;
  is_lunar: number;
  is_trending: number;
  province_name_vi?: string;
  province_name_en?: string;
  province_slug?: string;
  province_type?: string;
  province_type_en?: string;
};

export type SearchResult = {
  provinces: Province[];
  events: (Event & { province_name_vi: string; province_name_en: string; province_slug: string })[];
  cultural_posts: (CulturalPost & { province_name_vi: string; province_name_en: string; province_slug: string })[];
};

function toRow<T>(row: Record<string, unknown>): T {
  return Object.fromEntries(Object.entries(row)) as T;
}

export async function getProvinces(): Promise<Province[]> {
  await ensureReady();
  const db = getDb();
  const result = await db.execute({ sql: 'SELECT * FROM provinces WHERE status = ? ORDER BY name_vi', args: ['active'] });
  return result.rows.map((r) => toRow<Province>(r as Record<string, unknown>));
}

export async function getAllProvinces(): Promise<Province[]> {
  await ensureReady();
  const db = getDb();
  const result = await db.execute({ sql: 'SELECT * FROM provinces WHERE status != ? ORDER BY name_vi', args: ['archived'] });
  return result.rows.map((r) => toRow<Province>(r as Record<string, unknown>));
}

export async function getProvinceBySlug(slug: string): Promise<Province | null> {
  const db = getDb();
  const result = await db.execute({ sql: 'SELECT * FROM provinces WHERE slug = ? AND status = ?', args: [slug, 'active'] });
  return result.rows.length ? toRow<Province>(result.rows[0] as Record<string, unknown>) : null;
}

export async function getEventsByProvince(provinceId: number): Promise<Event[]> {
  const db = getDb();
  const result = await db.execute({
    sql: 'SELECT * FROM events WHERE province_id = ? AND status = ? ORDER BY event_date ASC',
    args: [provinceId, 'published'],
  });
  return result.rows.map((r) => toRow<Event>(r as Record<string, unknown>));
}

export async function getEventById(id: number): Promise<Event | null> {
  const db = getDb();
  const result = await db.execute({ sql: 'SELECT * FROM events WHERE id = ? AND status = ?', args: [id, 'published'] });
  return result.rows.length ? toRow<Event>(result.rows[0] as Record<string, unknown>) : null;
}

export async function getEventBySlug(
  provinceSlug: string,
  eventSlug: string
): Promise<(Event & { province_name_vi: string; province_name_en: string; province_slug: string; province_type: string; province_type_en: string }) | null> {
  const db = getDb();
  const result = await db.execute({
    sql: `
      SELECT e.*, p.name_vi as province_name_vi, p.name_en as province_name_en,
             p.slug as province_slug, p.type as province_type, p.type_en as province_type_en
      FROM events e
      JOIN provinces p ON e.province_id = p.id
      WHERE e.slug = ? AND p.slug = ? AND e.status = 'published' AND p.status = 'active'
    `,
    args: [eventSlug, provinceSlug],
  });
  return result.rows.length
    ? toRow<Event & { province_name_vi: string; province_name_en: string; province_slug: string; province_type: string; province_type_en: string }>(result.rows[0] as Record<string, unknown>)
    : null;
}

export async function getAllEvents(): Promise<(Event & { province_slug: string; province_type: string; province_type_en: string })[]> {
  const db = getDb();
  const result = await db.execute({
    sql: `
      SELECT e.*, p.slug as province_slug, p.type as province_type, p.type_en as province_type_en
      FROM events e
      JOIN provinces p ON e.province_id = p.id
      WHERE e.status = 'published' AND p.status = 'active' AND e.slug IS NOT NULL
    `,
    args: [],
  });
  return result.rows.map((r) => toRow<Event & { province_slug: string; province_type: string; province_type_en: string }>(r as Record<string, unknown>));
}

export async function getEventsOnThisDay(
  month: number,
  day: number
): Promise<(Event & { province_name_vi: string; province_name_en: string; province_slug: string; province_type: string; province_type_en: string })[]> {
  const db = getDb();
  const mm = String(month).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  const result = await db.execute({
    sql: `
      SELECT e.*, p.name_vi as province_name_vi, p.name_en as province_name_en,
             p.slug as province_slug, p.type as province_type, p.type_en as province_type_en
      FROM events e
      JOIN provinces p ON e.province_id = p.id
      WHERE strftime('%m-%d', e.event_date) = ?
      AND e.status = 'published'
      AND p.status = 'active'
      ORDER BY e.event_date ASC
    `,
    args: [`${mm}-${dd}`],
  });
  return result.rows.map((r) => toRow<Event & { province_name_vi: string; province_name_en: string; province_slug: string; province_type: string; province_type_en: string }>(r as Record<string, unknown>));
}

export async function getEventsInMonth(
  month: number
): Promise<(Event & { province_name_vi: string; province_name_en: string; province_slug: string; province_type: string; province_type_en: string })[]> {
  const db = getDb();
  const mm = String(month).padStart(2, '0');
  const result = await db.execute({
    sql: `
      SELECT e.*, p.name_vi as province_name_vi, p.name_en as province_name_en,
             p.slug as province_slug, p.type as province_type, p.type_en as province_type_en
      FROM events e
      JOIN provinces p ON e.province_id = p.id
      WHERE strftime('%m', e.event_date) = ?
      AND e.status = 'published'
      AND p.status = 'active'
      ORDER BY e.event_date ASC
    `,
    args: [mm],
  });
  return result.rows.map((r) => toRow<Event & { province_name_vi: string; province_name_en: string; province_slug: string; province_type: string; province_type_en: string }>(r as Record<string, unknown>));
}

export async function getSourcesForEntity(entityType: string, entityId: number): Promise<Source[]> {
  const db = getDb();
  const result = await db.execute({
    sql: 'SELECT * FROM sources WHERE entity_type = ? AND entity_id = ?',
    args: [entityType, entityId],
  });
  return result.rows.map((r) => toRow<Source>(r as Record<string, unknown>));
}

export async function getCulturalPosts(provinceId: number, type?: string): Promise<CulturalPost[]> {
  const db = getDb();
  const result = type
    ? await db.execute({
        sql: 'SELECT * FROM cultural_posts WHERE province_id = ? AND type = ? AND status = ? ORDER BY created_at DESC',
        args: [provinceId, type, 'published'],
      })
    : await db.execute({
        sql: 'SELECT * FROM cultural_posts WHERE province_id = ? AND status = ? ORDER BY type, created_at DESC',
        args: [provinceId, 'published'],
      });
  return result.rows.map((r) => toRow<CulturalPost>(r as Record<string, unknown>));
}

export async function getTrendingFestivals(): Promise<Festival[]> {
  const db = getDb();
  const today = new Date().toISOString().split('T')[0];
  const in30days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const result = await db.execute({
    sql: `
      SELECT f.*, p.name_vi as province_name_vi, p.name_en as province_name_en,
             p.slug as province_slug, p.type as province_type, p.type_en as province_type_en
      FROM festivals f
      JOIN provinces p ON f.province_id = p.id
      WHERE f.status = 'active'
        AND p.status = 'active'
        AND (
          (f.start_date >= ? AND f.start_date <= ?)
          OR f.is_trending = 1
        )
      ORDER BY f.is_trending DESC, f.start_date ASC
      LIMIT 6
    `,
    args: [today, in30days],
  });
  return result.rows.map((r) => toRow<Festival>(r as Record<string, unknown>));
}

export async function getAllFestivals(): Promise<(Festival & { province_slug: string; province_type: string; province_type_en: string })[]> {
  await ensureReady();
  const db = getDb();
  const result = await db.execute({
    sql: `
      SELECT f.*, p.name_vi as province_name_vi, p.name_en as province_name_en,
             p.slug as province_slug, p.type as province_type, p.type_en as province_type_en
      FROM festivals f
      JOIN provinces p ON f.province_id = p.id
      WHERE f.status = 'active' AND p.status = 'active' AND f.slug IS NOT NULL
    `,
    args: [],
  });
  return result.rows.map((r) => toRow<Festival & { province_slug: string; province_type: string; province_type_en: string }>(r as Record<string, unknown>));
}

export async function getFestivalBySlug(provinceSlug: string, festivalSlug: string): Promise<Festival | null> {
  await ensureReady();
  const db = getDb();
  const result = await db.execute({
    sql: `
      SELECT f.*, p.name_vi as province_name_vi, p.name_en as province_name_en,
             p.slug as province_slug, p.type as province_type, p.type_en as province_type_en
      FROM festivals f
      JOIN provinces p ON f.province_id = p.id
      WHERE p.slug = ? AND f.slug = ? AND f.status = 'active'
      LIMIT 1
    `,
    args: [provinceSlug, festivalSlug],
  });
  if (result.rows.length === 0) return null;
  return toRow<Festival>(result.rows[0] as Record<string, unknown>);
}

export async function getFestivalsByProvince(provinceId: number): Promise<Festival[]> {
  await ensureReady();
  const db = getDb();
  const result = await db.execute({
    sql: `SELECT * FROM festivals WHERE province_id = ? AND status = 'active' ORDER BY start_date ASC`,
    args: [provinceId],
  });
  return result.rows.map((r) => toRow<Festival>(r as Record<string, unknown>));
}

export type EditorialPickRow = {
  kind: 'event' | 'am-thuc' | 'dia-diem';
  id: number;
  title_vi: string;
  title_en: string;
  slug: string | null;
  province_name_vi: string;
  province_name_en: string;
  province_slug: string;
  province_type: string;
  province_type_en: string;
};

export async function getEditorialPicks(): Promise<EditorialPickRow[]> {
  await ensureReady();
  const db = getDb();
  const result = await db.execute({
    sql: `
      SELECT * FROM (
        SELECT 'event' AS kind,
               e.id, e.title_vi, e.title_en, e.slug,
               p.name_vi AS province_name_vi, p.name_en AS province_name_en,
               p.slug AS province_slug, p.type AS province_type, p.type_en AS province_type_en
        FROM events e
        JOIN provinces p ON e.province_id = p.id
        WHERE e.status = 'published' AND p.status = 'active'
          AND p.slug IN ('ho-chi-minh', 'ha-noi')

        UNION ALL

        SELECT cp.type AS kind,
               cp.id, cp.title_vi, cp.title_en, fi.slug,
               p.name_vi, p.name_en, p.slug, p.type, p.type_en
        FROM cultural_posts cp
        JOIN provinces p ON cp.province_id = p.id
        LEFT JOIN food_items fi ON fi.cultural_post_id = cp.id
        WHERE cp.status = 'published' AND p.status = 'active'
          AND cp.type IN ('am-thuc', 'dia-diem')
          AND p.slug IN ('ho-chi-minh', 'ha-noi')
      )
      ORDER BY RANDOM()
      LIMIT 5
    `,
    args: [],
  });
  return result.rows.map((r) => toRow<EditorialPickRow>(r as Record<string, unknown>));
}

export type FoodItem = {
  id: number;
  cultural_post_id: number;
  slug: string;
  title_vi: string;
  title_en: string;
  lede_vi: string;
  lede_en: string;
  tags_json: string;
  info_origin_vi: string | null;
  info_origin_en: string | null;
  info_best_time_vi: string | null;
  info_best_time_en: string | null;
  info_price_range: string | null;
  info_vegetarian_vi: string | null;
  info_vegetarian_en: string | null;
  story_vi: string;
  story_en: string;
  story_blockquote_vi: string | null;
  story_blockquote_en: string | null;
  story_blockquote_cite: string | null;
  body_blocks_json: string | null;
  ingredients_json: string;
  how_to_eat_vi: string;
  how_to_eat_en: string;
  eateries_json: string;
  tip_title_vi: string | null;
  tip_title_en: string | null;
  tip_body_vi: string | null;
  tip_body_en: string | null;
  image_url: string | null;
  gallery_json: string;
  status: 'published' | 'draft' | 'archived';
};

export type FoodItemSource = {
  id: number;
  food_item_id: number;
  url: string;
  title: string;
  publisher: string;
  accessed_date: string;
};

export async function getFoodItemBySlug(slug: string): Promise<FoodItem | null> {
  const db = getDb();
  const result = await db.execute({
    sql: 'SELECT * FROM food_items WHERE slug = ? AND status = ?',
    args: [slug, 'published'],
  });
  return result.rows.length ? toRow<FoodItem>(result.rows[0] as Record<string, unknown>) : null;
}

export async function getFoodItemsByCulturalPost(culturalPostId: number): Promise<FoodItem[]> {
  const db = getDb();
  const result = await db.execute({
    sql: 'SELECT * FROM food_items WHERE cultural_post_id = ? AND status = ? ORDER BY id ASC',
    args: [culturalPostId, 'published'],
  });
  return result.rows.map((r) => toRow<FoodItem>(r as Record<string, unknown>));
}

export async function getFoodItemsByProvince(provinceId: number): Promise<FoodItem[]> {
  const db = getDb();
  const result = await db.execute({
    sql: `
      SELECT fi.*
      FROM food_items fi
      JOIN cultural_posts cp ON fi.cultural_post_id = cp.id
      WHERE cp.province_id = ? AND fi.status = 'published' AND cp.status = 'published'
      ORDER BY fi.id ASC
    `,
    args: [provinceId],
  });
  return result.rows.map((r) => toRow<FoodItem>(r as Record<string, unknown>));
}

export async function getFoodItemSources(foodItemId: number): Promise<FoodItemSource[]> {
  const db = getDb();
  const result = await db.execute({
    sql: 'SELECT * FROM food_item_sources WHERE food_item_id = ?',
    args: [foodItemId],
  });
  return result.rows.map((r) => toRow<FoodItemSource>(r as Record<string, unknown>));
}

// ----------------------------------------------------------------
// Place items
// ----------------------------------------------------------------

export type PlaceItem = {
  id: number;
  cultural_post_id: number;
  slug: string;
  title_vi: string;
  title_en: string;
  lede_vi: string;
  lede_en: string;
  tags_json: string;
  info_address_vi: string | null;
  info_address_en: string | null;
  info_hours_vi: string | null;
  info_hours_en: string | null;
  info_price_vi: string | null;
  info_price_en: string | null;
  info_best_time_vi: string | null;
  info_best_time_en: string | null;
  story_vi: string;
  story_en: string;
  story_blockquote_vi: string | null;
  story_blockquote_en: string | null;
  story_blockquote_cite: string | null;
  body_blocks_json: string | null;
  highlights_json: string;
  how_to_visit_vi: string;
  how_to_visit_en: string;
  tip_title_vi: string | null;
  tip_title_en: string | null;
  tip_body_vi: string | null;
  tip_body_en: string | null;
  image_url: string | null;
  gallery_json: string;
  status: 'published' | 'draft' | 'archived';
};

export type PlaceItemSource = {
  id: number;
  place_item_id: number;
  url: string;
  title: string;
  publisher: string;
  accessed_date: string;
};

export async function getPlaceItemBySlug(slug: string): Promise<PlaceItem | null> {
  const db = getDb();
  const result = await db.execute({
    sql: 'SELECT * FROM place_items WHERE slug = ? AND status = ?',
    args: [slug, 'published'],
  });
  return result.rows.length ? toRow<PlaceItem>(result.rows[0] as Record<string, unknown>) : null;
}

export async function getPlaceItemsByProvince(provinceId: number): Promise<PlaceItem[]> {
  const db = getDb();
  const result = await db.execute({
    sql: `
      SELECT pi.*
      FROM place_items pi
      JOIN cultural_posts cp ON pi.cultural_post_id = cp.id
      WHERE cp.province_id = ? AND pi.status = 'published' AND cp.status = 'published'
      ORDER BY pi.id ASC
    `,
    args: [provinceId],
  });
  return result.rows.map((r) => toRow<PlaceItem>(r as Record<string, unknown>));
}

export type FeaturedPlaceRow = {
  slug: string;
  title_vi: string;
  title_en: string;
  lede_vi: string;
  lede_en: string;
  image_url: string | null;
  province_slug: string;
  province_type: string;
  province_type_en: string;
  province_name_vi: string;
  province_name_en: string;
};

export type FeaturedFoodRow = {
  slug: string;
  title_vi: string;
  title_en: string;
  lede_vi: string;
  lede_en: string;
  image_url: string | null;
  province_slug: string;
  province_type: string;
  province_type_en: string;
  province_name_vi: string;
  province_name_en: string;
};

export async function getFeaturedFoods(provinceSlugs: string[]): Promise<FeaturedFoodRow[]> {
  const db = getDb();
  const results: FeaturedFoodRow[] = [];
  for (const slug of provinceSlugs) {
    const result = await db.execute({
      sql: `
        SELECT fi.slug, fi.title_vi, fi.title_en, fi.lede_vi, fi.lede_en, fi.image_url,
               p.slug AS province_slug, p.type AS province_type, p.type_en AS province_type_en,
               p.name_vi AS province_name_vi, p.name_en AS province_name_en
        FROM food_items fi
        JOIN cultural_posts cp ON fi.cultural_post_id = cp.id
        JOIN provinces p ON cp.province_id = p.id
        WHERE p.slug = ? AND fi.status = 'published' AND fi.image_url IS NOT NULL
        ORDER BY fi.id ASC
        LIMIT 1
      `,
      args: [slug],
    });
    if (result.rows.length) results.push(toRow<FeaturedFoodRow>(result.rows[0] as Record<string, unknown>));
  }
  return results;
}

export async function getFeaturedPlaces(provinceSlugs: string[]): Promise<FeaturedPlaceRow[]> {
  const db = getDb();
  const results: FeaturedPlaceRow[] = [];
  for (const slug of provinceSlugs) {
    const result = await db.execute({
      sql: `
        SELECT pi.slug, pi.title_vi, pi.title_en, pi.lede_vi, pi.lede_en, pi.image_url,
               p.slug AS province_slug, p.type AS province_type, p.type_en AS province_type_en,
               p.name_vi AS province_name_vi, p.name_en AS province_name_en
        FROM place_items pi
        JOIN cultural_posts cp ON pi.cultural_post_id = cp.id
        JOIN provinces p ON cp.province_id = p.id
        WHERE p.slug = ? AND pi.status = 'published' AND pi.image_url IS NOT NULL
        ORDER BY pi.id ASC
        LIMIT 1
      `,
      args: [slug],
    });
    if (result.rows.length) results.push(toRow<FeaturedPlaceRow>(result.rows[0] as Record<string, unknown>));
  }
  return results;
}

export async function getPlaceItemSources(placeItemId: number): Promise<PlaceItemSource[]> {
  const db = getDb();
  const result = await db.execute({
    sql: 'SELECT * FROM place_item_sources WHERE place_item_id = ?',
    args: [placeItemId],
  });
  return result.rows.map((r) => toRow<PlaceItemSource>(r as Record<string, unknown>));
}

// ----------------------------------------------------------------
// Festival items
// ----------------------------------------------------------------

export type FestivalItem = {
  id: number;
  festival_id: number;
  slug: string;
  title_vi: string;
  title_en: string;
  lede_vi: string;
  lede_en: string;
  tags_json: string;
  info_when_vi: string | null;
  info_when_en: string | null;
  info_location_vi: string | null;
  info_location_en: string | null;
  info_admission_vi: string | null;
  info_admission_en: string | null;
  info_best_time_vi: string | null;
  info_best_time_en: string | null;
  story_vi: string;
  story_en: string;
  story_blockquote_vi: string | null;
  story_blockquote_en: string | null;
  story_blockquote_cite: string | null;
  body_blocks_json: string | null;
  highlights_json: string;
  how_to_attend_vi: string;
  how_to_attend_en: string;
  tip_title_vi: string | null;
  tip_title_en: string | null;
  tip_body_vi: string | null;
  tip_body_en: string | null;
  image_url: string | null;
  gallery_json: string;
  status: 'published' | 'draft' | 'archived';
};

export type FestivalItemSource = {
  id: number;
  festival_item_id: number;
  url: string;
  title: string;
  publisher: string;
  accessed_date: string;
};

export async function getFestivalItemBySlug(slug: string): Promise<FestivalItem | null> {
  const db = getDb();
  const result = await db.execute({
    sql: 'SELECT * FROM festival_items WHERE slug = ? AND status = ?',
    args: [slug, 'published'],
  });
  return result.rows.length ? toRow<FestivalItem>(result.rows[0] as Record<string, unknown>) : null;
}

export async function getFestivalItemsByProvince(provinceId: number): Promise<FestivalItem[]> {
  const db = getDb();
  const result = await db.execute({
    sql: `
      SELECT fi.*
      FROM festival_items fi
      JOIN festivals f ON fi.festival_id = f.id
      WHERE f.province_id = ? AND fi.status = 'published' AND f.status = 'active'
      ORDER BY f.start_date ASC
    `,
    args: [provinceId],
  });
  return result.rows.map((r) => toRow<FestivalItem>(r as Record<string, unknown>));
}

export async function getFestivalItemSources(festivalItemId: number): Promise<FestivalItemSource[]> {
  const db = getDb();
  const result = await db.execute({
    sql: 'SELECT * FROM festival_item_sources WHERE festival_item_id = ?',
    args: [festivalItemId],
  });
  return result.rows.map((r) => toRow<FestivalItemSource>(r as Record<string, unknown>));
}

export async function searchAll(query: string): Promise<SearchResult> {
  const db = getDb();
  const q = `%${query}%`;

  const [provincesRes, eventsRes, postsRes] = await Promise.all([
    db.execute({
      sql: `SELECT * FROM provinces WHERE status = 'active' AND (name_vi LIKE ? OR name_en LIKE ?) LIMIT 5`,
      args: [q, q],
    }),
    db.execute({
      sql: `
        SELECT e.*, p.name_vi as province_name_vi, p.name_en as province_name_en, p.slug as province_slug
        FROM events e
        JOIN provinces p ON e.province_id = p.id
        WHERE e.status = 'published' AND p.status = 'active'
          AND (e.title_vi LIKE ? OR e.title_en LIKE ? OR e.content_vi LIKE ? OR e.content_en LIKE ?)
        LIMIT 5
      `,
      args: [q, q, q, q],
    }),
    db.execute({
      sql: `
        SELECT cp.*, p.name_vi as province_name_vi, p.name_en as province_name_en, p.slug as province_slug
        FROM cultural_posts cp
        JOIN provinces p ON cp.province_id = p.id
        WHERE cp.status = 'published' AND p.status = 'active'
          AND (cp.title_vi LIKE ? OR cp.title_en LIKE ?)
        LIMIT 5
      `,
      args: [q, q],
    }),
  ]);

  return {
    provinces: provincesRes.rows.map((r) => toRow<Province>(r as Record<string, unknown>)),
    events: eventsRes.rows.map((r) => toRow<Event & { province_name_vi: string; province_name_en: string; province_slug: string }>(r as Record<string, unknown>)),
    cultural_posts: postsRes.rows.map((r) => toRow<CulturalPost & { province_name_vi: string; province_name_en: string; province_slug: string }>(r as Record<string, unknown>)),
  };
}
