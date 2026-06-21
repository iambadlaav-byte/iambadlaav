/**
 * admin.coupons.controller.js — Coupon CRUD for admin.
 *
 * GET    /admin/coupons        — list with filters (active, program)
 * POST   /admin/coupons        — create a new coupon (unique code)
 * PATCH  /admin/coupons/:id    — update fields (incl. active → soft-deactivate)
 *
 * Coupons are NEVER hard-deleted. Soft-deactivation (active=false) preserves
 * audit history and keeps currentUses for analytics. The public coupon
 * validator already filters on { active: true } so deactivating one immediately
 * blocks new redemptions.
 *
 * Mutations write to the AuditLog table with the COUPON_* action set so the
 * audit page can render a full timeline.
 */
import { prisma } from '../lib/prisma.js';
import { writeAudit, AUDIT_ACTIONS } from '../services/audit.service.js';

// Use the existing AUDIT_ACTIONS catalogue if it includes coupon actions;
// fall back to inline string constants otherwise. Keeping the codes inline here
// means we don't need to widen the action enum in the audit service.
const COUPON_CREATED     = AUDIT_ACTIONS.COUPON_CREATED     ?? 'COUPON_CREATED';
const COUPON_UPDATED     = AUDIT_ACTIONS.COUPON_UPDATED     ?? 'COUPON_UPDATED';
const COUPON_DEACTIVATED = AUDIT_ACTIONS.COUPON_DEACTIVATED ?? 'COUPON_DEACTIVATED';
const COUPON_DELETED     = AUDIT_ACTIONS.COUPON_DELETED     ?? 'coupon.deleted';

// ── listCoupons ──────────────────────────────────────────────────────────────

export async function listCoupons(req, res, next) {
  try {
    const { active, program, cursor, limit = 50 } = req.query;

    const where = {};
    if (active === 'true')  where.active = true;
    if (active === 'false') where.active = false;
    if (program) where.applicablePrograms = { has: program };

    const rows = await prisma.coupon.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: Math.min(Number(limit) || 50, 100),
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    const nextCursor = rows.length === Math.min(Number(limit) || 50, 100)
      ? rows[rows.length - 1].id
      : null;

    // Serialise Decimal → number so the frontend doesn't have to.
    const serialized = rows.map((c) => ({
      ...c,
      discountAmount: c.discountAmount != null ? Number(c.discountAmount) : null,
      remainingUses:  c.maxUses != null ? Math.max(c.maxUses - c.currentUses, 0) : null,
    }));

    return res.json({ rows: serialized, nextCursor });
  } catch (err) {
    next(err);
  }
}

// ── createCoupon ─────────────────────────────────────────────────────────────

export async function createCoupon(req, res, next) {
  try {
    // req.body validated by couponCreateSchema. Code is already trimmed + uppercased.
    const result = await prisma.$transaction(async (tx) => {
      // Defensive uniqueness check — Prisma's @unique would also catch this and
      // throw P2002, but a clean 409 is friendlier than parsing Prisma errors.
      const existing = await tx.coupon.findUnique({ where: { code: req.body.code } });
      if (existing) {
        throw Object.assign(new Error('CODE_EXISTS'), { statusCode: 409 });
      }

      const created = await tx.coupon.create({
        data: {
          code:               req.body.code,
          discountPct:        req.body.discountPct ?? null,
          discountAmount:     req.body.discountAmount ?? null,
          applicablePrograms: req.body.applicablePrograms ?? [],
          applicableBatches:  req.body.applicableBatches ?? [],
          maxUses:            req.body.maxUses ?? null,
          validUntil:         req.body.validUntil ?? null,
          active:             req.body.active ?? true,
        },
      });

      await writeAudit({
        tx,
        actorId:     req.user.id,
        action:      COUPON_CREATED,
        subjectType: 'Coupon',
        subjectId:   created.id,
        meta:        { code: created.code },
        req,
      });

      return created;
    });

    return res.status(201).json({
      coupon: {
        ...result,
        discountAmount: result.discountAmount != null ? Number(result.discountAmount) : null,
        remainingUses:  result.maxUses != null ? result.maxUses - result.currentUses : null,
      },
    });
  } catch (err) {
    if (err.statusCode === 409) {
      return res.status(409).json({ error: 'A coupon with that code already exists.' });
    }
    next(err);
  }
}

// ── updateCoupon ─────────────────────────────────────────────────────────────

export async function updateCoupon(req, res, next) {
  try {
    const { id } = req.params;

    const result = await prisma.$transaction(async (tx) => {
      const current = await tx.coupon.findUnique({ where: { id } });
      if (!current) throw Object.assign(new Error('NOT_FOUND'), { statusCode: 404 });

      const updated = await tx.coupon.update({ where: { id }, data: req.body });

      const action = (req.body.active === false && current.active === true)
        ? COUPON_DEACTIVATED
        : COUPON_UPDATED;

      await writeAudit({
        tx,
        actorId:     req.user.id,
        action,
        subjectType: 'Coupon',
        subjectId:   id,
        meta:        { changes: req.body, previousActive: current.active },
        req,
      });

      return updated;
    });

    return res.json({
      coupon: {
        ...result,
        discountAmount: result.discountAmount != null ? Number(result.discountAmount) : null,
        remainingUses:  result.maxUses != null ? Math.max(result.maxUses - result.currentUses, 0) : null,
      },
    });
  } catch (err) {
    if (err.statusCode === 404) return res.status(404).json({ error: 'Coupon not found.' });
    next(err);
  }
}

// ── deleteCoupon ─────────────────────────────────────────────────────────────
// HARD delete (Editor tier: Admin/Contributor/Superadmin). Distinct from the
// soft-deactivate PATCH — a deleted coupon's code can be reused for a new code.
// Audit row keeps a loose subjectId ref so the deletion stays on the trail.

export async function deleteCoupon(req, res, next) {
  try {
    const { id } = req.params;

    await prisma.$transaction(async (tx) => {
      const current = await tx.coupon.findUnique({
        where:  { id },
        select: { id: true, code: true, currentUses: true },
      });
      if (!current) throw Object.assign(new Error('NOT_FOUND'), { statusCode: 404 });

      await tx.coupon.delete({ where: { id } });

      await writeAudit({
        tx,
        actorId:     req.user.id,
        action:      COUPON_DELETED,
        subjectType: 'Coupon',
        subjectId:   id,
        meta:        { code: current.code, currentUses: current.currentUses },
        req,
      });
    });

    return res.json({ ok: true });
  } catch (err) {
    if (err.statusCode === 404) return res.status(404).json({ error: 'Coupon not found.' });
    next(err);
  }
}
