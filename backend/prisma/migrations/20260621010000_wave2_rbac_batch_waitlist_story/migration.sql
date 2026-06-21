-- Wave 2 foundation: staff roles, waitlist status, batch location/waitlist,
-- candidate IDs, Story CMS, and password-reset tokens.

-- Enum additions (Postgres 12+: safe in a transaction as long as the new value
-- is not used in the same transaction — it isn't here).
ALTER TYPE "UserRole" ADD VALUE 'CONTRIBUTOR';
ALTER TYPE "UserRole" ADD VALUE 'VIEWER';
ALTER TYPE "RegistrationStatus" ADD VALUE 'WAITLISTED';

-- Batch: location + waitlist + corporate-annual price
ALTER TABLE "Batch" ADD COLUMN "address" TEXT;
ALTER TABLE "Batch" ADD COLUMN "mapLink" TEXT;
ALTER TABLE "Batch" ADD COLUMN "waitlistCapacity" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Batch" ADD COLUMN "priceCorporateAnnual" DECIMAL(65,30);

-- Registration: candidate id + payment method + waitlist invite timestamp
ALTER TABLE "Registration" ADD COLUMN "candidateId" TEXT;
ALTER TABLE "Registration" ADD COLUMN "paymentMethod" TEXT;
ALTER TABLE "Registration" ADD COLUMN "waitlistInvitedAt" TIMESTAMP(3);
CREATE UNIQUE INDEX "Registration_candidateId_key" ON "Registration"("candidateId");

-- Story CMS
CREATE TABLE "Story" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "subtitle" TEXT,
  "batchName" TEXT,
  "date" TIMESTAMP(3),
  "passage" TEXT NOT NULL,
  "photos" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "status" "PostStatus" NOT NULL DEFAULT 'DRAFT',
  "authorId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Story_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Story_status_idx" ON "Story"("status");

-- Password reset tokens
CREATE TABLE "PasswordResetToken" (
  "id" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "usedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "PasswordResetToken_tokenHash_key" ON "PasswordResetToken"("tokenHash");
CREATE INDEX "PasswordResetToken_userId_idx" ON "PasswordResetToken"("userId");
ALTER TABLE "PasswordResetToken"
  ADD CONSTRAINT "PasswordResetToken_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
