-- Add the SUPERADMIN staff tier. SUPERADMIN has all ADMIN powers and can
-- additionally delete ADMIN accounts (regular ADMINs can only delete
-- CONTRIBUTOR/VIEWER). Additive enum change — safe and non-destructive.
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'SUPERADMIN';
