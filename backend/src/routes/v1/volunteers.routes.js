/**
 * Volunteer routes — VOL-01 (Volunteer Application).
 * Guest path: no authentication required.
 */
import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import { formSubmitLimit } from '../../middleware/rateLimit.js';
import { volunteerCreateSchema } from '@dnyanpith/validators';
import { applyVolunteer } from '../../controllers/volunteers.controller.js';

const router = Router();

/**
 * POST /api/v1/volunteers
 * VOL-01 — Volunteer application. No auth required — open to guests.
 */
router.post(
  '/volunteers',
  formSubmitLimit,
  validate(volunteerCreateSchema),
  applyVolunteer
);

export default router;
