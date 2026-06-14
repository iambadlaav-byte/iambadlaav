/**
 * /api/v1/users routes — authenticated user profile + dashboard data.
 *
 * All routes are behind authenticate + requireAuth (CONSTRAINT-API-004).
 * Threat coverage: T-06-05 (select excludes sensitive columns), T-06-07 (magic-byte upload),
 * T-06-08 (per-user photo rate limit), T-06-13 (strictObject strips role from PATCH).
 */
import { Router } from 'express';
import { authenticate, requireAuth } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { profilePhotoUpload, verifyMagicBytes } from '../../middleware/upload.js';
import { formSubmitLimit, photoUploadLimit } from '../../middleware/rateLimit.js';
import { profileUpdateSchema } from '@dnyanpith/validators';
import {
  getMe,
  updateMe,
  uploadProfilePhoto,
  getMyRegistrations,
  getMyCommunity,
  getMyUpcomingEvents,
} from '../../controllers/users.controller.js';

const router = Router();

// All users routes require authentication
router.use(authenticate, requireAuth);

/**
 * GET /users/me
 * Returns the authenticated user's safe profile (no passwordHash, lockedUntil, etc.).
 */
router.get('/users/me', getMe);

/**
 * PATCH /users/me
 * Update mutable profile fields. Validated by profileUpdateSchema (strictObject).
 * Rate-limited: 5 updates/IP/hour.
 */
router.patch('/users/me', formSubmitLimit, validate(profileUpdateSchema), updateMe);

/**
 * POST /users/me/photo
 * Profile photo upload pipeline:
 *   1. profilePhotoUpload (multer memoryStorage + MIME filter + 2MB cap)
 *   2. verifyMagicBytes (file-type magic-byte check)
 *   3. photoUploadLimit (5 uploads/user/hour)
 *   4. uploadProfilePhoto (Cloudinary upload + DB update)
 */
router.post(
  '/users/me/photo',
  profilePhotoUpload,
  verifyMagicBytes,
  photoUploadLimit,
  uploadProfilePhoto
);

/**
 * GET /users/me/registrations
 * All registrations for the authenticated user, newest first.
 */
router.get('/users/me/registrations', getMyRegistrations);

/**
 * GET /users/me/community
 * Community memberships linked to this user (by userId OR email for pre-account joins).
 */
router.get('/users/me/community', getMyCommunity);

/**
 * GET /users/me/events
 * Upcoming events: paid registrations with future batch dates.
 */
router.get('/users/me/events', getMyUpcomingEvents);

export default router;
