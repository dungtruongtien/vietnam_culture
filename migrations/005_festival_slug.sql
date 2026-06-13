ALTER TABLE festivals ADD COLUMN slug TEXT;
ALTER TABLE festivals ADD COLUMN content_vi TEXT;
ALTER TABLE festivals ADD COLUMN content_en TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_festivals_slug ON festivals(slug) WHERE slug IS NOT NULL;
