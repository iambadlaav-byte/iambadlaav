/**
 * Messages routes — FORM-09 (Generic Contact).
 * Writes to messages table, separate from enquiries.
 */
import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import { formSubmitLimit } from '../../middleware/rateLimit.js';
import { genericContactSchema } from '@dnyanpith/validators';
import { createMessage } from '../../controllers/messages.controller.js';

const router = Router();

/**
 * POST /api/v1/messages
 * FORM-09 — Generic Contact from /contact
 */
router.post(
  '/messages',
  formSubmitLimit,
  validate(genericContactSchema),
  createMessage
);

export default router;
