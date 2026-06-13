-- Migration 004: Add slug to events for dedicated event detail pages

PRAGMA foreign_keys = ON;

ALTER TABLE events ADD COLUMN slug TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_events_slug ON events(slug) WHERE slug IS NOT NULL;
