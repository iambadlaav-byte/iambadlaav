/**
 * coupons.routes.js — POST /api/v1/coupons/validate
 * Rate-limited per CONSTRAINT-API-003 (couponValidateLimit: 20/min per IP).
 */
import { Router } from 'express';
import { couponValidateLimit } from '../../middleware/rateLimit.js';
import { validate } from '../../middleware/validate.js';
import { couponValidateSchema } from '@dnyanpith/validators';
import { validateCouponEndpoint } from '../../controllers/coupons.controller.js';

const router = Router();

router.post('/coupons/validate',
  couponValidateLimit,
  validate(couponValidateSchema),
  validateCouponEndpoint
);

export default router;
