/**
 * Admin validators — all admin write/filter schemas.
 * Used by: backend/src/routes/v1/admin.routes.js (server-side validation via validate middleware).
 * Never imported directly on the frontend — admin forms use lighter UX-only schemas inline.
 *
 * All schemas use z.strictObject to reject unknown fields.
 */
import { z } from 'zod';
import { email } from './shared.js';

// ── Program enum (mirrors Prisma) ──────────────────────────────────────────────
const programEnum = z.enum(['BADLAAV', 'MISSION_UDAAN', 'FUTURE_READINESS', 'ANTRANG']);

// ── Content category (programme vertical for Stories + Gallery) ────────────────
// BADLAAV = The Retreat, FUTURE_READINESS = The Badlaav Experience, GENERAL = catch-all.
const contentCategoryEnum = z.enum(['BADLAAV', 'FUTURE_READINESS', 'GENERAL']);

// ── Staff roles (mirrors Prisma UserRole staff tiers) ──────────────────────────
const staffRoleEnum = z.enum(['ADMIN', 'CONTRIBUTOR', 'VIEWER']);

// ── Enquiry ───────────────────────────────────────────────────────────────────

export const enquiryStatusSchema = z.strictObject({
  status:    z.enum(['NEW', 'CONTACTED', 'CONVERTED', 'CLOSED']),
  adminNote: z.string().trim().max(2000).optional(),
});

// ── Registration ──────────────────────────────────────────────────────────────

export const registrationStatusSchema = z.strictObject({
  status: z.enum(['ACTIVE', 'COMPLETED', 'CANCELLED']),
});

// ── Volunteer ─────────────────────────────────────────────────────────────────

export const volunteerStatusSchema = z.strictObject({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']),
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

// ── Story (retreat stories CMS) ────────────────────────────────────────────────
// photos are Cloudinary secure URLs produced by the /admin/stories/upload endpoint.

export const storyCreateSchema = z.strictObject({
  title:     z.string().trim().min(2).max(300),
  subtitle:  z.string().trim().max(300).optional(),
  batchName: z.string().trim().max(200).optional(),
  date:      z.coerce.date().optional(),
  passage:   z.string().trim().min(20).max(20000),
  photos:    z.array(z.string().url()).max(20).optional().default([]),
  category:  contentCategoryEnum.optional().default('GENERAL'),
  status:    z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional().default('DRAFT'),
});

export const storyUpdateSchema = storyCreateSchema.partial();

// ── Gallery ───────────────────────────────────────────────────────────────────
// altText is MANDATORY on create (accessibility, CONSTRAINT-MEDIA-001).

export const galleryCreateSchema = z.strictObject({
  url:       z.string().url(),
  caption:   z.string().trim().max(300).optional(),
  category:  contentCategoryEnum.optional().default('GENERAL'),
  altText:   z.string().trim().min(1, 'Alt text is required.').max(300),
  type:      z.enum(['PHOTO', 'VIDEO']).optional().default('PHOTO'),
  sortOrder: z.coerce.number().int().min(0).optional().default(0),
});

export const galleryUpdateSchema = galleryCreateSchema.partial();

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
  // Optional per-batch scoping (Batch cuids). Empty = all batches.
  applicableBatches:  z.array(z.string().trim().min(1).max(40)).max(50).optional().default([]),
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
  applicableBatches:  z.array(z.string().trim().min(1).max(40)).max(50).optional(),
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

// ── Aggregated registration reports ──────────────────────────────────────────
// ?groupBy=program|batch|location|date|status & optional from/to (ISO) & program.
// from/to are passed to `new Date()` in the controller — a loose ISO-ish check
// is enough here (matches the lightweight reconciliation date handling).

const reportDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}(T.*)?$/, 'date must be ISO (YYYY-MM-DD or full ISO)')
  .optional();

export const reportsQuerySchema = z.strictObject({
  groupBy: z.enum(['program', 'batch', 'location', 'date', 'status']).optional().default('program'),
  from:    reportDate,
  to:      reportDate,
  program: z.string().trim().optional(),
});

// ── Staff user management (Settings) ───────────────────────────────────────────

export const staffUserCreateSchema = z.strictObject({
  name:     z.string().trim().min(2, 'Name is too short.').max(120),
  email,
  role:     staffRoleEnum,
  password: z.string().min(8, 'Password must be at least 8 characters.').max(128),
});

export const staffRoleUpdateSchema = z.strictObject({
  role: staffRoleEnum,
});

export const adminPasswordResetSchema = z.strictObject({
  password: z.string().min(8, 'Password must be at least 8 characters.').max(128),
});
