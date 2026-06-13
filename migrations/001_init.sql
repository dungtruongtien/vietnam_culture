-- Migration 001: Initial schema
-- Khám Phá Việt Nam

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS provinces (
  id                    INTEGER PRIMARY KEY AUTOINCREMENT,
  name_vi               TEXT NOT NULL,
  name_en               TEXT NOT NULL,
  slug                  TEXT NOT NULL UNIQUE,
  type                  TEXT NOT NULL CHECK(type IN ('thanh-pho', 'tinh')),
  type_en               TEXT NOT NULL CHECK(type_en IN ('city', 'province')),
  svg_path_id           TEXT,
  status                TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('active', 'draft', 'archived')),
  meta_description_vi   TEXT,
  meta_description_en   TEXT,
  population            TEXT,
  area_km2              REAL,
  region_vi             TEXT,
  region_en             TEXT,
  created_at            TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS events (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  province_id         INTEGER NOT NULL REFERENCES provinces(id),
  title_vi            TEXT NOT NULL,
  title_en            TEXT NOT NULL,
  content_vi          TEXT NOT NULL,
  content_en          TEXT NOT NULL,
  event_date          TEXT NOT NULL,
  event_date_display  TEXT NOT NULL,
  image_url           TEXT,
  status              TEXT NOT NULL DEFAULT 'published' CHECK(status IN ('published', 'draft', 'archived')),
  content_hash        TEXT,
  created_at          TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at          TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS cultural_posts (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  province_id   INTEGER NOT NULL REFERENCES provinces(id),
  title_vi      TEXT NOT NULL,
  title_en      TEXT NOT NULL,
  content_vi    TEXT NOT NULL,
  content_en    TEXT NOT NULL,
  type          TEXT NOT NULL CHECK(type IN ('am-thuc', 'dia-diem', 'phong-tuc', 'le-hoi')),
  status        TEXT NOT NULL DEFAULT 'published' CHECK(status IN ('published', 'draft', 'archived')),
  content_hash  TEXT,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sources (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  entity_type   TEXT NOT NULL CHECK(entity_type IN ('event', 'cultural_post', 'festival')),
  entity_id     INTEGER NOT NULL,
  url           TEXT NOT NULL,
  title         TEXT NOT NULL,
  publisher     TEXT NOT NULL,
  accessed_date TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS festivals (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  province_id INTEGER NOT NULL REFERENCES provinces(id),
  name_vi     TEXT NOT NULL,
  name_en     TEXT NOT NULL,
  description_vi TEXT,
  description_en TEXT,
  start_date  TEXT NOT NULL,
  end_date    TEXT,
  is_lunar    INTEGER NOT NULL DEFAULT 0,
  is_trending INTEGER NOT NULL DEFAULT 0,
  status      TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'archived')),
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_events_province ON events(province_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_cultural_province ON cultural_posts(province_id);
CREATE INDEX IF NOT EXISTS idx_sources_entity ON sources(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_festivals_province ON festivals(province_id);
CREATE INDEX IF NOT EXISTS idx_festivals_start ON festivals(start_date);
CREATE INDEX IF NOT EXISTS idx_provinces_slug ON provinces(slug);

-- Full-text search virtual table
CREATE VIRTUAL TABLE IF NOT EXISTS search_index USING fts5(
  entity_type,
  entity_id UNINDEXED,
  title_vi,
  title_en,
  content_vi,
  content_en
);
