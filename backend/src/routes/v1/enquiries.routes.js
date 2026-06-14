/**
 * Enquiry routes — FORM-01 (Corporate) + FORM-06 (College).
 * Both endpoints: rate-limited + Zod-validated before hitting the controller.
 */
import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import { formSubmitLimit } from '../../middleware/rateLimit.js';
import { corporateEnquirySchema, collegeAssociationSchema } from '@dnyanpith/validators';
import { createCorporateEnquiry, createCollegeEnquiry } from '../../controllers/enquiries.controller.js';

const router = Router();

/**
 * POST /api/v1/enquiries/corporate
 * FORM-01 — Corporate Enquiry from /badlaav#enquiry
 */
router.post(
  '/enquiries/corporate',
  formSubmitLimit,
  validate(corporateEnquirySchema),
  createCorporateEnquiry
);

/**
 * POST /api/v1/enquiries/college
 * FORM-06 — College Association from /join-us?tab=college
 */
router.post(
  '/enquiries/college',
  formSubmitLimit,
  validate(collegeAssociationSchema),
  createCollegeEnquiry
);

export default router;
