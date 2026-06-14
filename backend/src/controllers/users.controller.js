/**
 * Users controller — authenticated user profile + dashboard data endpoints.
 * All handlers require authenticate + requireAuth (enforced at route level).
 *
 * Security:
 *   - getMe / updateMe select NEVER include passwordHash, failedLoginAttempts,
 *     lockedUntil, or deletedAt (T-06-05 information disclosure prevention).
 *   - profileUpdateSchema uses z.strictObject, so role/email sent by client are
 *     stripped at the validate middleware before reaching updateMe (T-06-13).
 *   - uploadProfilePhoto runs AFTER multer + verifyMagicBytes middlewares (T-06-07).
 *
 * No hard-deletes anywhere (CONSTRAINT-SCHEMA-002).
 */
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import { uploadProfilePhoto as uploadToCloudinary } from '../services/cloudinary.service.js';

/**
 * Safe user select — used in both getMe and updateMe.
 * Explicitly excludes sensitive columns (T-06-05).
 */
const SAFE_USER_SELECT = {
  id:               true,
  name:             true,
  email:            true,
  phone:            true,
  city:             true,
  state:            true,
  occupation:       true,
  age:              true,
  photoUrl:         true,
  role:             true,
  coursesCompleted: true,
  emailVerified:    true,
  createdAt:        true,
  // EXCLUDED: passwordHash, failedLoginAttempts, lockedUntil, deletedAt
};

/**
 * GET /api/v1/users/me
 * Returns the authenticated user's profile (safe columns only).
 */
export async function getMe(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where:  { id: req.user.id },
      select: SAFE_USER_SELECT,
    });

    if (!user) {
      return res.status(404).json({ error: 'USER_NOT_FOUND' });
    }

    res.json(user);
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/v1/users/me
 * Updates mutable profile fields. Validated by profileUpdateSchema (strictObject).
 * Email and role are NOT updatable here — email changes are Phase 2, role is admin-only.
 */
export async function updateMe(req, res, next) {
  try {
    const updated = await prisma.user.update({
      where:  { id: req.user.id },
      data:   req.body, // already validated + stripped by validate(profileUpdateSchema)
      select: SAFE_USER_SELECT,
    });

    logger.info({ userId: req.user.id }, 'users.profile.updated');
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/users/me/photo
 * Profile photo upload pipeline.
 * Runs after: profilePhotoUpload (multer) → verifyMagicBytes → authenticate → requireAuth
 * Rate-limited: 5 uploads/user/hour (photoUploadLimit).
 *
 * On success: stores Cloudinary secure_url in users.photoUrl, returns { photoUrl }.
 */
export async function uploadProfilePhoto(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No photo provided. Send a JPG, PNG, or WEBP file in the "photo" field.' });
    }

    // Upload to Cloudinary — EXIF stripped by f_auto transformation (T-06-09)
    const secureUrl = await uploadToCloudinary(req.file.buffer, req.user.id);

    // Persist URL to DB
    await prisma.user.update({
      where: { id: req.user.id },
      data:  { photoUrl: secureUrl },
    });

    logger.info({ userId: req.user.id }, 'users.profile_photo.saved');
    res.json({ photoUrl: secureUrl });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/users/me/registrations
 * Returns all registrations for the authenticated user, newest first.
 * Includes batch details for display in the dashboard table.
 */
export async function getMyRegistrations(req, res, next) {
  try {
    const registrations = await prisma.registration.findMany({
      where:   { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id:             true,
        program:        true,
        plan:           true,
        regType:        true,
        amount:         true,
        discountAmount: true,
        finalAmount:    true,
        couponCode:     true,
        paymentStatus:  true,
        status:         true,
        invoiceUrl:     true,
        invoiceNumber:  true,
        createdAt:      true,
        completedAt:    true,
        batch: {
          select: {
            id:        true,
            name:      true,
            startDate: true,
            endDate:   true,
            venue:     true,
          },
        },
      },
    });

    res.json(registrations);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/users/me/community
 * Returns community memberships for this user.
 *
 * OR clause: links pre-account community sign-ups (email match) once user logs in.
 * This means a user who joined a community circle before creating an account will
 * see those memberships once authenticated.
 */
export async function getMyCommunity(req, res, next) {
  try {
    const memberships = await prisma.communityMember.findMany({
      where: {
        OR: [
          { userId: req.user.id },
          { email: req.user.email },
        ],
      },
      select: {
        id:         true,
        name:       true,
        city:       true,
        initiative: true,
        joinedAt:   true,
      },
      orderBy: { joinedAt: 'desc' },
    });

    res.json(memberships);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/users/me/events
 * Returns upcoming events: registrations where the linked batch's startDate >= now.
 * Phase 1 simplification — sourced from Registration rows with future batch dates.
 */
export async function getMyUpcomingEvents(req, res, next) {
  try {
    const now = new Date();

    const upcoming = await prisma.registration.findMany({
      where: {
        userId:        req.user.id,
        paymentStatus: 'PAID',
        batch: {
          startDate: { gte: now },
        },
      },
      orderBy: {
        batch: { startDate: 'asc' },
      },
      select: {
        id:      true,
        program: true,
        status:  true,
        batch: {
          select: {
            id:        true,
            name:      true,
            startDate: true,
            endDate:   true,
            venue:     true,
          },
        },
      },
    });

    res.json(upcoming);
  } catch (err) {
    next(err);
  }
}
