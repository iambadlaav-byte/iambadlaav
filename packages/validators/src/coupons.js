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
});
