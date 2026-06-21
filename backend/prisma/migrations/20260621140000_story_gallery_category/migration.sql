-- Migration: story_gallery_category
-- Adds a programme-vertical `category` to Story and re-bases the existing
-- GalleryItem.category to the same vocabulary so both content verticals can be
-- filtered by programme on the public site.
--
-- Vocabulary (app-wide): 'BADLAAV' (The Retreat) | 'FUTURE_READINESS'
-- (The Badlaav Experience) | 'GENERAL' (default).

-- Story gains a brand-new column, default 'GENERAL' so existing rows backfill.
ALTER TABLE "Story"
  ADD COLUMN IF NOT EXISTS "category" TEXT NOT NULL DEFAULT 'GENERAL';

-- GalleryItem already has a `category` column (previously a free-form admin
-- grouping with no default). Give it the same default so new rows fall back to
-- 'GENERAL', and normalise any legacy lowercase values onto the new vocabulary.
ALTER TABLE "GalleryItem"
  ALTER COLUMN "category" SET DEFAULT 'GENERAL';

UPDATE "GalleryItem"
  SET "category" = 'BADLAAV'
  WHERE "category" = 'badlaav';

UPDATE "GalleryItem"
  SET "category" = 'GENERAL'
  WHERE "category" IN ('abhyasika', 'community', 'gallery');
