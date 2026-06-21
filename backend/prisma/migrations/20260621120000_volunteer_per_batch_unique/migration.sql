-- Volunteer dedup moves from per-user to per-(user, batch) so an existing
-- volunteer can apply for another / the next batch without being blocked,
-- while a duplicate application for the SAME batch is still rejected (P2002).

-- DropIndex (old single-column unique on userId)
DROP INDEX IF EXISTS "Volunteer_userId_key";

-- CreateIndex (composite unique on userId + batchAttended)
CREATE UNIQUE INDEX IF NOT EXISTS "Volunteer_userId_batchAttended_key" ON "Volunteer"("userId", "batchAttended");

-- CreateIndex (plain index on userId for relation lookups, replacing the dropped unique)
CREATE INDEX IF NOT EXISTS "Volunteer_userId_idx" ON "Volunteer"("userId");
