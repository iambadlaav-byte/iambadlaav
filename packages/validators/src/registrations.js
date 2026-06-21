/**
 * registrations.js — FORM-02 Universal Registration schema.
 * Shared between frontend (RHF resolver) and backend (validate middleware).
 * ARCHITECTURE.md §9.2 field-by-field spec.
 */
import { z } from 'zod';
import { businessEmail, indianPhone } from './shared.js';

export const registrationCreateSchema = z
  .strictObject({
    regType: z.enum(['INDIVIDUAL', 'COUPLE', 'CORPORATE']),
    fullName: z.string().trim().min(2, 'Full name is required.').max(120),
    partner2Name: z
      .string()
      .trim()
      .min(2, "Partner's name is required for couple registration.")
      .max(120)
      .optional()
      .nullable(),
    // Accept any real email — personal, corporate, or organization domains.
    // businessEmail still blocks known throwaway/temp domains (anti-dummy).
    email: businessEmail,
    phone: indianPhone,
    city: z.string().trim().min(2, 'City is required.').max(80),
    state: z.string().trim().min(2).max(80).optional().nullable(),
    program: z.enum(['BADLAAV', 'MISSION_UDAAN', 'FUTURE_READINESS', 'ANTRANG']),
    // batchId is normally a Prisma CUID, but seeded/legacy ids (e.g. "seed-badlaav-aug-2026")
    // use human-readable strings — so we accept any non-empty short string here and let the
    // controller validate FK existence with a 400 "Batch not found." if the row is missing.
    batchId: z.string().trim().min(1).max(64).optional().nullable(),
    plan: z.string().trim().min(2).max(40),
    age: z.coerce.number().int().min(13).max(99).optional().nullable(),
    occupation: z.string().trim().max(80).optional().nullable(),
    dietaryNote: z.string().trim().max(280).optional().nullable(),
    couponCode: z.string().trim().toUpperCase().max(40).optional().nullable(),
    consent: z.literal(true, {
      errorMap: () => ({ message: 'You must agree to the terms to proceed.' }),
    }),
    // The Retreat questionnaire (psychographic answers) — stored as JSON on the
    // registration. Free-form object; the form shapes it, admin reads it back.
    questionnaire: z.any().optional().nullable(),
  })
  .refine(
    (d) =>
      d.regType !== 'COUPLE' || (d.partner2Name && d.partner2Name.length >= 2),
    {
      message: 'Partner name required when registering as a couple.',
      path: ['partner2Name'],
    }
  );
