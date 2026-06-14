/**
 * registrations.routes.js
 *
 * POST /api/v1/registrations          — create registration + Razorpay order (public)
 * GET  /api/v1/registrations/:id/invoice — fetch invoice URL (authenticated)
 *
 * Rate limit: formSubmitLimit (5/hr per IP) on POST.
 * Auth:       authenticate + requireAuth on GET invoice.
 */
import { Router } from 'express';
import { formSubmitLimit } from '../../middleware/rateLimit.js';
import { validate } from '../../middleware/validate.js';
import { authenticate, requireAuth } from '../../middleware/auth.js';
import { registrationCreateSchema } from '@dnyanpith/validators';
import {
  createRegistration,
  getRegistrationInvoice,
} from '../../controllers/registrations.controller.js';

const router = Router();

router.post(
  '/registrations',
  formSubmitLimit,
  validate(registrationCreateSchema),
  createRegistration
);

router.get(
  '/registrations/:id/invoice',
  authenticate,
  requireAuth,
  getRegistrationInvoice
);

export default router;
