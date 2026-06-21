-- Migration: coupon_applicable_batches
-- Adds the applicableBatches column to Coupon for optional per-batch scoping.
-- Empty array = the coupon applies to all batches (program-level only), mirroring
-- the existing applicablePrograms semantics. Values are Batch cuids (TEXT[]).

ALTER TABLE "Coupon"
  ADD COLUMN IF NOT EXISTS "applicableBatches" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
