-- Migration: dedup_registration_community
-- Adds dedup guards per the duplicate registration audit fixes.
--
-- 1. Registration: composite index on (userId, batchId, program) to speed up
--    the duplicate pre-check query in registrations.controller.js.
--    (A partial unique index is not directly expressible in Prisma schema, so
--    deduplication is enforced at the controller level; this index makes it fast.)
--
-- 2. CommunityMember: unique constraint on (phone, initiative) so the same
--    WhatsApp number cannot join the same initiative twice. The P2002 violation
--    is handled gracefully in community.controller.js with a friendly 409.

-- 1. Registration dedup index
CREATE INDEX IF NOT EXISTS "Registration_userId_batchId_program_idx"
  ON "Registration" ("userId", "batchId", "program");

-- 2. CommunityMember unique constraint
CREATE UNIQUE INDEX "CommunityMember_phone_initiative_key"
  ON "CommunityMember" ("phone", "initiative");
