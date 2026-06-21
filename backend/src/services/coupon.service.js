/**
 * coupon.service.js — Server-side coupon validation + atomic redemption.
 *
 * TWO patterns intentionally:
 *
 * 1. validateCoupon() — READ-ONLY pre-flight check.
 *    Called by POST /coupons/validate (UI feedback) and POST /registrations
 *    (pre-create check before Razorpay order).
 *    Returns same {valid, discountAmount, finalAmount} shape on both valid and
 *    invalid paths to prevent trivial timing oracles (RESEARCH Security Domain
 *    "Coupon enumeration" / T-05-06).
 *
 * 2. applyCouponInTx() — WRITE — Prisma-native atomic increment.
 *    Called ONLY from inside the webhook payment.captured handler's
 *    prisma.$transaction({isolationLevel:'Serializable'}).
 *    Uses tx.coupon.updateMany() with optimistic-concurrency predicate — NO $queryRaw,
 *    NO SELECT FOR UPDATE (contrast with invoiceNumber.js which uses FOR UPDATE for
 *    sequence semantics; coupon redemption is guarded by the where-clause predicate).
 *    If another transaction incremented currentUses between our read and update,
 *    updated.count === 0 → CouponConflictError thrown → outer tx rolls back.
 *
 * ARCHITECTURE.md §10 + RESEARCH Pattern 7 + Pitfall 3 + T-05-04 / T-05-05.
 */
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';

// ============================================================
// Error classes
// ============================================================

export class CouponInvalidError extends Error {
  constructor(reason) {
    super(reason);
    this.name = 'CouponInvalidError';
    // reason: 'NOT_FOUND' | 'EXHAUSTED' | 'NOT_APPLICABLE' | 'EXPIRED'
    this.reason = reason;
  }
}

export class CouponConflictError extends Error {
  constructor(reason) {
    super(reason);
    this.name = 'CouponConflictError';
    // reason: 'RETRY' — optimistic-concurrency guard fired; another tx won the race
    this.reason = reason;
  }
}

// ============================================================
// Shared discount computation
// ============================================================

/**
 * Compute discount from a coupon row.
 * discountPct takes precedence over discountAmount.
 * Final amount is clamped at 0.
 *
 * @param {object} coupon - Prisma coupon row
 * @param {number} amount - Baseline amount in INR (integer)
 * @returns {{ discountAmount: number, finalAmount: number }}
 */
function computeDiscount(coupon, amount) {
  let discount = 0;
  if (coupon.discountPct != null) {
    discount = Math.floor(amount * coupon.discountPct / 100);
  } else if (coupon.discountAmount != null) {
    discount = Math.min(Number(coupon.discountAmount), amount);
  }
  return {
    discountAmount: discount,
    finalAmount: Math.max(amount - discount, 0),
  };
}

// ============================================================
// READ-ONLY validator — no writes
// ============================================================

/**
 * Validate a coupon code against a program + baseline amount.
 * Returns same shape on valid and invalid paths (timing-oracle mitigation).
 *
 * @param {{ code: string, program: string, amount: number, batchId?: string }} opts
 * @returns {Promise<{ valid: boolean, reason?: string, discountAmount: number, finalAmount: number }>}
 */
export async function validateCoupon({ code, program, amount, batchId }) {
  try {
    const coupon = await prisma.coupon.findFirst({
      where: { code, active: true },
    });

    if (!coupon) {
      return { valid: false, reason: 'NOT_FOUND', discountAmount: 0, finalAmount: amount };
    }

    if (coupon.validUntil && coupon.validUntil < new Date()) {
      return { valid: false, reason: 'EXPIRED', discountAmount: 0, finalAmount: amount };
    }

    if (coupon.maxUses != null && coupon.currentUses >= coupon.maxUses) {
      return { valid: false, reason: 'EXHAUSTED', discountAmount: 0, finalAmount: amount };
    }

    if (
      coupon.applicablePrograms.length > 0 &&
      !coupon.applicablePrograms.includes(program)
    ) {
      return { valid: false, reason: 'NOT_APPLICABLE', discountAmount: 0, finalAmount: amount };
    }

    // Per-batch scope: empty array = any batch. Otherwise the registration's
    // batchId must be in the list (mirrors the applicablePrograms check above).
    if (
      coupon.applicableBatches.length > 0 &&
      (!batchId || !coupon.applicableBatches.includes(batchId))
    ) {
      return { valid: false, reason: 'NOT_APPLICABLE', discountAmount: 0, finalAmount: amount };
    }

    const { discountAmount, finalAmount } = computeDiscount(coupon, amount);
    return { valid: true, discountAmount, finalAmount };
  } catch (err) {
    logger.error({ err, code }, 'coupon.validate.error');
    // On DB error, return invalid — prevents coupon from being applied on outage
    return { valid: false, reason: 'NOT_FOUND', discountAmount: 0, finalAmount: amount };
  }
}

// ============================================================
// WRITE — Prisma-native atomic increment (webhook time only)
// ============================================================

/**
 * Apply coupon redemption atomically inside a Serializable transaction.
 * Uses Prisma-native tx.coupon.updateMany() with optimistic-concurrency predicate.
 * NO $queryRaw. NO SELECT FOR UPDATE.
 *
 * The where clause `{ id: coupon.id, currentUses: coupon.currentUses, maxUses: { gt: currentUses } }`
 * is the optimistic concurrency guard: if another transaction incremented
 * currentUses between our read and update, updated.count === 0 and we throw
 * CouponConflictError so the outer transaction rolls back.
 *
 * This function does NOT call prisma.$transaction — the CALLER must wrap it in
 * prisma.$transaction({ isolationLevel: 'Serializable' }).
 *
 * @param {{ tx: object, code: string, program: string, amount: number, batchId?: string }} opts
 * @returns {Promise<{ discountAmount: number, finalAmount: number }>}
 * @throws {CouponInvalidError} if coupon not found/expired/exhausted/not applicable
 * @throws {CouponConflictError} if optimistic-concurrency guard fires (concurrent redemption)
 */
export async function applyCouponInTx({ tx, code, program, amount, batchId }) {
  const coupon = await tx.coupon.findFirst({
    where: { code, active: true },
  });

  if (!coupon) {
    throw new CouponInvalidError('NOT_FOUND');
  }

  if (coupon.validUntil && coupon.validUntil < new Date()) {
    throw new CouponInvalidError('EXPIRED');
  }

  if (coupon.maxUses != null && coupon.currentUses >= coupon.maxUses) {
    throw new CouponInvalidError('EXHAUSTED');
  }

  if (
    coupon.applicablePrograms.length > 0 &&
    !coupon.applicablePrograms.includes(program)
  ) {
    throw new CouponInvalidError('NOT_APPLICABLE');
  }

  // Per-batch scope: empty array = any batch (mirrors the program check above).
  if (
    coupon.applicableBatches.length > 0 &&
    (!batchId || !coupon.applicableBatches.includes(batchId))
  ) {
    throw new CouponInvalidError('NOT_APPLICABLE');
  }

  // Prisma-native optimistic-concurrency guard (CONSTRAINT-SCHEMA-001 compliant):
  // update succeeds only if currentUses hasn't changed since our read AND maxUses not hit.
  const updated = await tx.coupon.updateMany({
    where: {
      id: coupon.id,
      currentUses: coupon.currentUses,
      maxUses: { gt: coupon.currentUses },
    },
    data: { currentUses: { increment: 1 } },
  });

  if (updated.count === 0) {
    // Another transaction incremented currentUses between our read and this update.
    // The outer Serializable transaction will roll back.
    throw new CouponConflictError('RETRY');
  }

  return computeDiscount(coupon, amount);
}
