/**
 * coupons.js — Coupon validation schema.
 * Shared between frontend (CouponInput component) and backend (validate middleware).
 * ARCHITECTURE.md §10 Pricing & Coupons.
 */
import { z } from 'zod';

export const couponValidateSchema = z.strictObject({
  code: z.string().trim().toUpperCase().min(2, 'Enter a coupon code.').max(40),
  program: z.enum(['BADLAAV', 'MISSION_UDAAN', 'FUTURE_READINESS', 'ANTRANG']),
  // Baseline amount in INR (before discount) — used to compute finalAmount server-side
  amount: z.coerce.number().int().positive('Amount must be a positive integer.'),
  // Optional batch the user is registering for — checked against the coupon's
  // applicableBatches scope (empty scope = applies to any batch).
  batchId: z.string().trim().min(1).max(40).optional(),
});
