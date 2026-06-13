-- Migration 002: Food item detail pages
-- Extends cultural_posts (am-thuc type) with rich editorial content

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS food_items (
  id                    INTEGER PRIMARY KEY AUTOINCREMENT,
  cultural_post_id      INTEGER NOT NULL REFERENCES cultural_posts(id),
  slug                  TEXT NOT NULL UNIQUE,
  title_vi              TEXT NOT NULL,
  title_en              TEXT NOT NULL,
  lede_vi               TEXT NOT NULL,
  lede_en               TEXT NOT NULL,
  tags_json             TEXT NOT NULL DEFAULT '[]',
  info_origin_vi        TEXT,
  info_origin_en        TEXT,
  info_best_time_vi     TEXT,
  info_best_time_en     TEXT,
  info_price_range      TEXT,
  info_vegetarian_vi    TEXT,
  info_vegetarian_en    TEXT,
  story_vi              TEXT NOT NULL,
  story_en              TEXT NOT NULL,
  story_blockquote_vi   TEXT,
  story_blockquote_en   TEXT,
  story_blockquote_cite TEXT,
  ingredients_json      TEXT NOT NULL DEFAULT '[]',
  how_to_eat_vi         TEXT NOT NULL,
  how_to_eat_en         TEXT NOT NULL,
  eateries_json         TEXT NOT NULL DEFAULT '[]',
  tip_title_vi          TEXT,
  tip_title_en          TEXT,
  tip_body_vi           TEXT,
  tip_body_en           TEXT,
  status                TEXT NOT NULL DEFAULT 'published'
                          CHECK(status IN ('published', 'draft', 'archived')),
  content_hash          TEXT,
  created_at            TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at            TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_food_items_post ON food_items(cultural_post_id);
CREATE INDEX IF NOT EXISTS idx_food_items_slug ON food_items(slug);

-- Separate sources table for food items to avoid altering the CHECK constraint on sources
CREATE TABLE IF NOT EXISTS food_item_sources (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  food_item_id  INTEGER NOT NULL REFERENCES food_items(id),
  url           TEXT NOT NULL,
  title         TEXT NOT NULL,
  publisher     TEXT NOT NULL,
  accessed_date TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_food_item_sources ON food_item_sources(food_item_id);
