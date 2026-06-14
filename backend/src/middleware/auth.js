/**
 * RBAC middleware chain (CONSTRAINT-API-004 / ARCHITECTURE.md §22.2).
 * Applied at ROUTE level, never inside controllers.
 *
 * Chain order: authenticate → requireAuth → [requireAdmin | requireEnrolled | requireVolunteerEligible]
 *
 * authenticate:             Verifies JWT from Authorization header; attaches req.user.
 *                           Does NOT reject on missing/invalid token (use requireAuth for that).
 * requireAuth:              401 if no req.user (guest).
 * requireAdmin:             403 if req.user.role !== 'ADMIN'.
 * requireEnrolled:          403 if no paid Registration for req.user.
 * requireVolunteerEligible: 403 if req.user.coursesCompleted < 1.
 */
import { verifyAccessToken, AuthError } from '../utils/jwt.js';
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';

/**
 * authenticate — optional auth.
 * Reads `Authorization: Bearer <token>` header.
 * On valid token: attaches req.user = { id, role }.
 * On missing or invalid token: req.user = null (does NOT reject).
 */
export async function authenticate(req, _res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.slice(7);
    const payload = verifyAccessToken(token);

    // Fetch user to ensure they still exist and aren't deleted
    const user = await prisma.user.findUnique({
      where: { id: payload.sub, deletedAt: null },
      select: { id: true, role: true, email: true, coursesCompleted: true },
    });

    req.user = user || null;
    next();
  } catch (err) {
    // JWT invalid/expired — treat as anonymous
    logger.debug({ err }, 'auth.token.invalid');
    req.user = null;
    next();
  }
}

/**
 * requireAuth — must be used AFTER authenticate.
 * Returns 401 if req.user is null (not authenticated).
 */
export function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'UNAUTHENTICATED' });
  }
  next();
}

/**
 * requireAdmin — must be used AFTER authenticate + requireAuth.
 * Returns 403 if req.user.role !== 'ADMIN'.
 */
export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'FORBIDDEN' });
  }
  next();
}

/**
 * requireEnrolled — must be used AFTER authenticate + requireAuth.
 * Returns 403 if the user has no Registration with paymentStatus='PAID'.
 * Used to gate access to enrolled-student-only content.
 */
export async function requireEnrolled(req, res, next) {
  try {
    const paidCount = await prisma.registration.count({
      where: {
        userId: req.user.id,
        paymentStatus: 'PAID',
      },
    });

    if (paidCount === 0) {
      return res.status(403).json({ error: 'ENROLLMENT_REQUIRED' });
    }

    next();
  } catch (err) {
    next(err);
  }
}

/**
 * requireVolunteerEligible — must be used AFTER authenticate + requireAuth.
 * Returns 403 if req.user.coursesCompleted < 1.
 * Guards the volunteer application form/page.
 */
export function requireVolunteerEligible(req, res, next) {
  if (!req.user || req.user.coursesCompleted < 1) {
    return res.status(403).json({ error: 'VOLUNTEER_ELIGIBILITY_REQUIRED' });
  }
  next();
}
