/**
 * admin.routes.js — All admin API routes under /api/v1/admin/*.
 *
 * Security chain (CONSTRAINT-API-004 / ARCH §22.2):
 *   router.use(authenticate, requireAuth, requireAdmin)
 *   Every route in this file inherits the full chain — no exceptions.
 *
 * Rate-limiting on refund: 10 requests/hour per IP to slow abuse (T-07-09).
 */
import { Router } from 'express';
import rateLimit  from 'express-rate-limit';
import { authenticate, requireAuth, requireStaff, requireEditor, requireAdmin } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import {
  enquiryStatusSchema,
  registrationStatusSchema,
  batchCreateSchema,
  batchUpdateSchema,
  blogCreateSchema,
  blogUpdateSchema,
  eventCreateSchema,
  eventUpdateSchema,
  refundSchema,
  anonymizeSchema,
  reconciliationQuerySchema,
  couponCreateSchema,
  couponUpdateSchema,
} from '@dnyanpith/validators';

// Controllers — Task 1a (core)
import { dashboardStats }            from '../../controllers/admin.controller.js';
import {
  listRegistrations,
  getRegistration,
  updateRegistrationStatus,
  exportRegistrationsCsv,
  getReconciliation,
  resendConfirmationEmail,
} from '../../controllers/admin.registrations.controller.js';
import { anonymizeUser } from '../../controllers/admin.users.controller.js';

// Controllers — Task 1b (content + ops)
import {
  listEnquiries,
  getEnquiry,
  updateEnquiryStatus,
} from '../../controllers/admin.enquiries.controller.js';
import {
  listBatches,
  createBatch,
  updateBatch,
} from '../../controllers/admin.batches.controller.js';
import {
  listCoupons,
  createCoupon,
  updateCoupon,
} from '../../controllers/admin.coupons.controller.js';
import {
  listCommunity,
  exportCommunityCsv,
} from '../../controllers/admin.community.controller.js';
import {
  listInvoices,
  viewInvoice,
  resendInvoice,
  refundPayment,
} from '../../controllers/admin.invoices.controller.js';
import {
  listBlog,
  createBlog,
  updateBlog,
  archiveBlog,
} from '../../controllers/admin.blog.controller.js';
import {
  listEvents,
  createEvent,
  updateEvent,
  cancelEvent,
} from '../../controllers/admin.events.controller.js';
import { listAudit } from '../../controllers/admin.audit.controller.js';

const router = Router();

// ── RBAC chain ────────────────────────────────────────────────────────────────
// Base: any staff tier may READ. Write routes add requireEditor (Admin/Contributor)
// or requireAdmin (financials, batches, coupons, refunds, users) per the matrix.
router.use(authenticate, requireAuth, requireStaff);

// ── Rate limiter for the refund endpoint ──────────────────────────────────────
// 10 refund requests per hour per IP — slows abuse without blocking legitimate use (T-07-09)
const refundLimiter = rateLimit({
  windowMs:         60 * 60 * 1000, // 1 hour
  max:              10,
  standardHeaders:  true,
  legacyHeaders:    false,
  message:          { error: 'Too many refund requests. Try again in an hour.' },
});

// ── Dashboard ─────────────────────────────────────────────────────────────────
router.get('/dashboard', dashboardStats);

// ── Enquiries ─────────────────────────────────────────────────────────────────
router.get('/enquiries',       listEnquiries);
router.get('/enquiries/:id',   getEnquiry);
router.patch('/enquiries/:id', requireEditor, validate(enquiryStatusSchema), updateEnquiryStatus);

// ── Registrations ─────────────────────────────────────────────────────────────
// NOTE: static sub-paths (export.csv, reconciliation) must come BEFORE /:id
router.get('/registrations/export.csv',     exportRegistrationsCsv);
router.get('/registrations/reconciliation', validate(reconciliationQuerySchema, 'query'), getReconciliation);
router.get('/registrations',                listRegistrations);
router.get('/registrations/:id',            getRegistration);
router.patch('/registrations/:id',          requireEditor, validate(registrationStatusSchema), updateRegistrationStatus);
router.post('/registrations/:id/resend-email', requireEditor, resendConfirmationEmail);

// ── Batches ───────────────────────────────────────────────────────────────────
router.get('/batches',        listBatches);
router.post('/batches',       requireAdmin, validate(batchCreateSchema), createBatch);
router.patch('/batches/:id',  requireAdmin, validate(batchUpdateSchema), updateBatch);

// ── Coupons ───────────────────────────────────────────────────────────────────
// PATCH supports both updating fields and deactivating (active: false) — no
// hard-delete route to preserve audit history. Soft-delete is a one-field PATCH.
router.get('/coupons',        listCoupons);
router.post('/coupons',       requireAdmin, validate(couponCreateSchema), createCoupon);
router.patch('/coupons/:id',  requireAdmin, validate(couponUpdateSchema), updateCoupon);

// ── Community ─────────────────────────────────────────────────────────────────
router.get('/community',            listCommunity);
router.get('/community/export.csv', exportCommunityCsv);

// ── Invoices ──────────────────────────────────────────────────────────────────
router.get('/invoices',              listInvoices);
router.get('/invoices/:id',          viewInvoice);
router.post('/invoices/:id/resend',  requireEditor, resendInvoice);
router.post('/invoices/:id/refund',  requireAdmin, refundLimiter, validate(refundSchema), refundPayment);

// ── Blog ──────────────────────────────────────────────────────────────────────
router.get('/blog',             listBlog);
router.post('/blog',            requireEditor, validate(blogCreateSchema), createBlog);
router.patch('/blog/:id',       requireEditor, validate(blogUpdateSchema), updateBlog);
router.post('/blog/:id/archive', requireEditor, archiveBlog);

// ── Events ────────────────────────────────────────────────────────────────────
router.get('/events',             listEvents);
router.post('/events',            requireEditor, validate(eventCreateSchema), createEvent);
router.patch('/events/:id',       requireEditor, validate(eventUpdateSchema), updateEvent);
router.post('/events/:id/cancel', requireEditor, cancelEvent);

// ── Audit log ─────────────────────────────────────────────────────────────────
router.get('/audit', listAudit);

// ── Users ─────────────────────────────────────────────────────────────────────
router.post('/users/:id/anonymize', requireAdmin, validate(anonymizeSchema), anonymizeUser);

export default router;
