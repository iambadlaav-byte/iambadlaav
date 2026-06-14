-- Migration: add_registration_optional_fields
-- Adds the age, occupation columns to Registration that exist in schema.prisma
-- but were missing from the init migration (added manually previously).
-- Also adds the composite index from the dedup migration if it doesn't exist yet.

ALTER TABLE "Registration"
  ADD COLUMN IF NOT EXISTS "age"         INTEGER,
  ADD COLUMN IF NOT EXISTS "occupation"  TEXT;
