/**
 * Admin validators — all admin write/filter schemas.
 * Used by: backend/src/routes/v1/admin.routes.js (server-side validation via validate middleware).
 * Never imported directly on the frontend — admin forms use lighter UX-only schemas inline.
 *
 * All schemas use z.strictObject to reject unknown fields.
 */
import { z } from 'zod';

// ── Program enum (mirrors Prisma) ──────────────────────────────────────────────
const programEnum = z.enum(['BADLAAV', 'MISSION_UDAAN', 'FUTURE_READINESS', 'ANTRANG']);

// ── Enquiry ───────────────────────────────────────────────────────────────────

export const enquiryStatusSchema = z.strictObject({
  status:    z.enum(['NEW', 'CONTACTED', 'CONVERTED', 'CLOSED']),
  adminNote: z.string().trim().max(2000).optional(),
});

// ── Registration ──────────────────────────────────────────────────────────────

export const registrationStatusSchema = z.strictObject({
  status: z.enum(['ACTIVE', 'COMPLETED', 'CANCELLED']),
});

// ── Batch ─────────────────────────────────────────────────────────────────────

export const batchCreateSchema = z.strictObject({
  program:              programEnum,
  name:                 z.string().trim().min(2).max(200),
  startDate:            z.coerce.date(),
  endDate:              z.coerce.date(),
  venue:                z.string().trim().min(2).max(200),
  address:              z.string().trim().max(300).optional(),
  mapLink:              z.string().trim().max(1000).optional(),
  totalSeats:           z.coerce.number().int().min(1).max(500),
  waitlistCapacity:     z.coerce.number().int().min(0).max(1000).optional().default(0),
  priceIndividual:      z.coerce.number().int().min(0),
  priceCouple:          z.coerce.number().int().min(0).optional(),
  priceCorporate:       z.coerce.number().int().min(0).optional(),
  priceCorporateAnnual: z.coerce.number().int().min(0).optional(),
  status:               z.enum(['OPEN', 'FULL', 'CLOSED', 'PAST']).optional().default('OPEN'),
});

export const batchUpdateSchema = batchCreateSchema.partial();

// ── Blog ──────────────────────────────────────────────────────────────────────

export const blogCreateSchema = z.strictObject({
  title:       z.string().trim().min(2).max(300),
  slug:        z.string().trim().regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers and hyphens only.'),
  excerpt:     z.string().trim().max(500).optional(),
  content:     z.string().trim().min(20).max(50000),
  coverImage:  z.string().url().optional(),
  category:    z.string().trim().min(1).max(100),
  tags:        z.array(z.string().trim().max(50)).max(10).optional().default([]),
  status:      z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional().default('DRAFT'),
  publishedAt: z.coerce.date().optional(),
});

export const blogUpdateSchema = blogCreateSchema.partial();

// ── Event ─────────────────────────────────────────────────────────────────────

export const eventCreateSchema = z.strictObject({
  title:       z.string().trim().min(2).max(300),
  description: z.string().trim().min(10).max(5000),
  startDate:   z.coerce.date(),
  endDate:     z.coerce.date().optional(),
  location:    z.string().trim().min(2).max(300),
  city:        z.string().trim().min(2).max(100),
  type:        z.enum(['badlaav', 'antrang', 'meetup', 'workshop', 'community']),
  totalSeats:  z.coerce.number().int().min(1).max(10000).optional(),
  price:       z.coerce.number().int().min(0).optional(),
  coverImage:  z.string().url().optional(),
  status:      z.enum(['UPCOMING', 'PAST', 'CANCELLED']).optional().default('UPCOMING'),
});

export const eventUpdateSchema = eventCreateSchema.partial();

// ── Coupons (admin CRUD) ─────────────────────────────────────────────────────
//
// Why a refine: Prisma stores discountPct and discountAmount as separate optional
// columns. Exactly one must be present per row — both null is meaningless, both
// set is ambiguous. We enforce that at the schema layer so the controller never
// has to deal with bad shape.

export const couponCreateSchema = z.strictObject({
  code:               z.string().trim().toUpperCase().min(2).max(40)
                       .regex(/^[A-Z0-9_-]+$/, 'Use uppercase letters, numbers, underscore, or hyphen.'),
  discountPct:        z.coerce.number().int().min(1).max(100).optional().nullable(),
  discountAmount:     z.coerce.number().int().min(1).optional().nullable(),
  applicablePrograms: z.array(programEnum).max(4).optional().default([]),
  maxUses:            z.coerce.number().int().min(1).optional().nullable(),
  validUntil:         z.coerce.date().optional().nullable(),
  active:             z.boolean().optional().default(true),
}).refine(
  (d) => (d.discountPct != null) !== (d.discountAmount != null),
  { message: 'Exactly one of discountPct or discountAmount must be set.', path: ['discountPct'] }
);

// Partial update — only enforces the XOR when both keys appear in the patch.
export const couponUpdateSchema = z.strictObject({
  discountPct:        z.coerce.number().int().min(1).max(100).optional().nullable(),
  discountAmount:     z.coerce.number().int().min(1).optional().nullable(),
  applicablePrograms: z.array(programEnum).max(4).optional(),
  maxUses:            z.coerce.number().int().min(1).optional().nullable(),
  validUntil:         z.coerce.date().optional().nullable(),
  active:             z.boolean().optional(),
}).refine(
  (d) => {
    if (d.discountPct === undefined || d.discountAmount === undefined) return true;
    return (d.discountPct != null) !== (d.discountAmount != null);
  },
  { message: 'discountPct and discountAmount cannot both be set.', path: ['discountPct'] }
);

// ── Invoice / Refund ──────────────────────────────────────────────────────────

export const refundSchema = z.strictObject({
  // amount in rupees (integer). If absent, full refund is issued.
  amount: z.coerce.number().int().positive().optional(),
  reason: z.string().trim().max(280).optional(),
});

// ── User anonymize ────────────────────────────────────────────────────────────
// Server requires the admin to type the literal string 'ANONYMIZE' — prevents accidental
// invocation and matches the frontend AnonymizeConfirmDialog typed-input UX.

export const anonymizeSchema = z.strictObject({
  confirm: z.literal('ANONYMIZE'),
  reason:  z.string().trim().min(2).max(280),
});

// ── Pagination (cursor-based) ─────────────────────────────────────────────────

export const paginationSchema = z.strictObject({
  limit:  z.coerce.number().int().min(1).max(100).optional().default(25),
  cursor: z.string().cuid().optional(),
});

// ── Monthly reconciliation export (PAY-01 requirement) ───────────────────────
// ?month=YYYY-MM — optional, defaults to current month if absent.

export const reconciliationQuerySchema = z.strictObject({
  month: z
    .string()
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'month must be in YYYY-MM format')
    .optional(),
});
