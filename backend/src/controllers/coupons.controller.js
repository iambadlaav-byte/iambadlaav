/**
 * coupons.controller.js — Coupon validation endpoint.
 * Route: POST /api/v1/coupons/validate
 *
 * Returns 200 with { valid, discountAmount, finalAmount } on BOTH valid and invalid
 * cases — 4xx is not used for business-rule rejection (the request itself succeeded).
 * UI uses the valid flag + reason to render the sage/danger badge per UI-SPEC §FORM-02.
 *
 * Reason strings (for UI copy mapping):
 *   NOT_FOUND      → "That code isn't valid for this program."
 *   EXPIRED        → "That code has expired."
 *   EXHAUSTED      → "This code has reached its limit."
 *   NOT_APPLICABLE → "That code isn't valid for this program."
 */
import { validateCoupon } from '../services/coupon.service.js';

export async function validateCouponEndpoint(req, res, next) {
  try {
    const { code, program, amount } = req.body;
    const result = await validateCoupon({ code, program, amount });
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}
