/**
 * Community routes — FORM-04 (Community Join).
 * Guest path: no authentication required.
 */
import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import { formSubmitLimit } from '../../middleware/rateLimit.js';
import { communityJoinSchema } from '@dnyanpith/validators';
import { joinCommunity } from '../../controllers/community.controller.js';

const router = Router();

/**
 * POST /api/v1/community/join
 * FORM-04 — Community Join from /community/:slug#join
 * No auth required — open to guests.
 */
router.post(
  '/community/join',
  formSubmitLimit,
  validate(communityJoinSchema),
  joinCommunity
);

export default router;
