-- Add the Retreat questionnaire blob to registrations (additive, nullable).
ALTER TABLE "Registration" ADD COLUMN "questionnaire" JSONB;
