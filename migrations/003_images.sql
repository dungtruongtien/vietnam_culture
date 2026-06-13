-- Migration 003: Add image columns to food_items, cultural_posts, provinces
-- events already has image_url from 001_init.sql

PRAGMA foreign_keys = ON;

ALTER TABLE food_items ADD COLUMN image_url TEXT;
ALTER TABLE food_items ADD COLUMN gallery_json TEXT NOT NULL DEFAULT '[]';

ALTER TABLE cultural_posts ADD COLUMN image_url TEXT;
ALTER TABLE provinces ADD COLUMN image_url TEXT;
