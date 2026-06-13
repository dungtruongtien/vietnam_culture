CREATE TABLE IF NOT EXISTS place_items (
  id                    INTEGER PRIMARY KEY AUTOINCREMENT,
  cultural_post_id      INTEGER NOT NULL REFERENCES cultural_posts(id),
  slug                  TEXT NOT NULL UNIQUE,
  title_vi              TEXT NOT NULL,
  title_en              TEXT NOT NULL,
  lede_vi               TEXT NOT NULL,
  lede_en               TEXT NOT NULL,
  tags_json             TEXT NOT NULL DEFAULT '[]',
  info_address_vi       TEXT,
  info_address_en       TEXT,
  info_hours_vi         TEXT,
  info_hours_en         TEXT,
  info_price_vi         TEXT,
  info_price_en         TEXT,
  info_best_time_vi     TEXT,
  info_best_time_en     TEXT,
  story_vi              TEXT NOT NULL,
  story_en              TEXT NOT NULL,
  story_blockquote_vi   TEXT,
  story_blockquote_en   TEXT,
  story_blockquote_cite TEXT,
  highlights_json       TEXT NOT NULL DEFAULT '[]',
  how_to_visit_vi       TEXT NOT NULL,
  how_to_visit_en       TEXT NOT NULL,
  tip_title_vi          TEXT,
  tip_title_en          TEXT,
  tip_body_vi           TEXT,
  tip_body_en           TEXT,
  image_url             TEXT,
  gallery_json          TEXT NOT NULL DEFAULT '[]',
  status                TEXT NOT NULL DEFAULT 'published'
                          CHECK(status IN ('published', 'draft', 'archived')),
  content_hash          TEXT,
  created_at            TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at            TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_place_items_post ON place_items(cultural_post_id);
CREATE INDEX IF NOT EXISTS idx_place_items_slug ON place_items(slug);

CREATE TABLE IF NOT EXISTS place_item_sources (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  place_item_id INTEGER NOT NULL REFERENCES place_items(id),
  url           TEXT NOT NULL,
  title         TEXT NOT NULL,
  publisher     TEXT NOT NULL,
  accessed_date TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_place_item_sources ON place_item_sources(place_item_id);
