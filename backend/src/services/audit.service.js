/**
 * Audit service — structured audit log writer.
 *
 * Every sensitive admin action calls writeAudit. Per DECISION-020 and CONSTRAINT-SEC-007.
 * AuditLog rows are NEVER hard-deleted — 7-year retention per CONSTRAINT-SCHEMA-002.
 *
 * Usage:
 *   await writeAudit({ tx, actorId: req.user.id, action: AUDIT_ACTIONS.BLOG_PUBLISHED,
 *                       subjectType: 'BlogPost', subjectId: post.id, meta: {}, req });
 *
 * If `tx` is provided, the insert runs inside that transaction (atomic with the business write).
 * If `tx` is absent, the insert runs on the global prisma client.
 *
 * NEVER hand-roll a raw INSERT — always call writeAudit so the action enum stays consistent.
 */
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';

// ── Audit action enum ─────────────────────────────────────────────────────────
// All string values follow the pattern: entity.verb (snake_case).
// Add new actions here — never inline string literals in controllers.

export const AUDIT_ACTIONS = Object.freeze({
  // Enquiries
  ENQUIRY_STATUS_CHANGED:   'enquiry.status_changed',
  ENQUIRY_DELETED:          'enquiry.deleted',

  // Registrations
  REGISTRATION_COMPLETED:   'registration.completed',
  REGISTRATION_CANCELLED:   'registration.cancelled',
  REGISTRATION_REFUNDED:    'registration.refunded',
  RECONCILIATION_EXPORTED:  'registration.reconciliation_exported',

  // Volunteers
  VOLUNTEER_STATUS_CHANGED: 'volunteer.status_changed',
  VOLUNTEER_DELETED:        'volunteer.deleted',

  // Batches
  BATCH_CREATED:            'batch.created',
  BATCH_UPDATED:            'batch.updated',
  BATCH_DELETED:            'batch.deleted',

  // Coupons
  COUPON_DELETED:           'coupon.deleted',

  // Exports
  ENQUIRIES_EXPORTED:       'enquiry.csv_exported',
  VOLUNTEERS_EXPORTED:      'volunteer.csv_exported',
  INVOICES_EXPORTED:        'invoice.csv_exported',

  // Blog
  BLOG_PUBLISHED:           'blog.published',
  BLOG_UNPUBLISHED:         'blog.unpublished',
  BLOG_ARCHIVED:            'blog.archived',

  // Stories
  STORY_CREATED:            'story.created',
  STORY_UPDATED:            'story.updated',
  STORY_PUBLISHED:          'story.published',
  STORY_ARCHIVED:           'story.archived',

  // Gallery
  GALLERY_CREATED:          'gallery.created',
  GALLERY_UPDATED:          'gallery.updated',
  GALLERY_DELETED:          'gallery.deleted',

  // Events
  EVENT_CREATED:            'event.created',
  EVENT_UPDATED:            'event.updated',
  EVENT_CANCELLED:          'event.cancelled',

  // Invoices
  INVOICE_RESENT:           'invoice.resent',

  // Users
  USER_ANONYMIZED:          'user.anonymized',
  USER_CREATED:             'user.created',
  USER_ROLE_CHANGED:        'user.role_changed',
  USER_PASSWORD_RESET:      'user.password_reset',
  USER_PASSWORD_CHANGED:    'user.password_changed',
  USER_DELETED:             'user.deleted',

  // Auth
  ADMIN_LOGIN_SUCCESS:      'admin.login.success',
  ADMIN_LOGIN_FAILED:       'admin.login.failed',
});

// ── writeAudit ────────────────────────────────────────────────────────────────

/**
 * Write a structured audit log row.
 *
 * @param {object} opts
 * @param {object}  [opts.tx]          — Prisma transaction client (use if inside $transaction)
 * @param {string}  [opts.actorId]     — ID of the admin performing the action (null = system)
 * @param {string}  opts.action        — One of AUDIT_ACTIONS values
 * @param {string}  [opts.subjectType] — Model name, e.g. 'Registration', 'BlogPost'
 * @param {string}  [opts.subjectId]   — ID of the affected record
 * @param {object}  [opts.meta]        — Arbitrary JSON context (before/after values etc.)
 * @param {object}  [opts.req]         — Express req (used to extract ipAddress)
 */
export async function writeAudit({ tx, actorId, action, subjectType, subjectId, meta, req }) {
  const db = tx ?? prisma;
  try {
    await db.auditLog.create({
      data: {
        actorId:     actorId ?? null,
        action,
        subjectType: subjectType ?? null,
        subjectId:   subjectId ?? null,
        meta:        meta ?? null,
        ipAddress:   req?.ip ?? null,
      },
    });
  } catch (err) {
    // Audit write failure must never break the primary operation.
    // Log the failure but do not rethrow.
    logger.error({ err, action, subjectType, subjectId }, 'audit.write.failed');
  }
}
