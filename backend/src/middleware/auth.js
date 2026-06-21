/**
 * RBAC middleware chain (CONSTRAINT-API-004 / ARCHITECTURE.md §22.2).
 * Applied at ROUTE level, never inside controllers.
 *
 * Chain order: authenticate → requireAuth → [requireAdmin | requireEnrolled | requireVolunteerEligible]
 *
 * authenticate:             Verifies JWT from Authorization header; attaches req.user.
 *                           Does NOT reject on missing/invalid token (use requireAuth for that).
 * requireAuth:              401 if no req.user (guest).
 * requireAdmin:             403 unless req.user is ADMIN-tier (ADMIN or SUPERADMIN).
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
 * Returns 403 unless req.user is ADMIN-tier (ADMIN or SUPERADMIN). See isAdminTier.
 */
export function requireAdmin(req, res, next) {
  if (!isAdminTier(req.user)) {
    return res.status(403).json({ error: 'FORBIDDEN' });
  }
  next();
}

// ── Wave 2 staff RBAC ─────────────────────────────────────────────────────────
// Matrix (locked): ADMIN = full (financials, batches, users, refunds);
// CONTRIBUTOR = ops (registrations/enquiries/volunteers/stories/gallery) but NO
// payment amounts/revenue, NO batch creation, NO user management;
// VIEWER = read-only, NO financials.
export const STAFF_ROLES = ['SUPERADMIN', 'ADMIN', 'CONTRIBUTOR', 'VIEWER'];

// SUPERADMIN is a superset of ADMIN (everything ADMIN can do, plus deleting ADMINs).
export function isAdminTier(user) {
  return user?.role === 'ADMIN' || user?.role === 'SUPERADMIN';
}
export function isSuperAdmin(user) {
  return user?.role === 'SUPERADMIN';
}

export function isStaff(user) {
  return Boolean(user) && STAFF_ROLES.includes(user.role);
}
export function canSeeFinancials(user) {
  return isAdminTier(user);
}
/** Contact PII (email / phone / address) — Admin tier + Contributor; hidden from Viewer. */
export function canSeeContact(user) {
  return isAdminTier(user) || user?.role === 'CONTRIBUTOR';
}
export function canEdit(user) {
  return isAdminTier(user) || user?.role === 'CONTRIBUTOR';
}
export function canManageBatches(user) {
  return isAdminTier(user);
}
export function canManageUsers(user) {
  return isAdminTier(user);
}

/** requireStaff — any staff tier (read access to the admin panel). */
export function requireStaff(req, res, next) {
  if (!isStaff(req.user)) {
    return res.status(403).json({ error: 'FORBIDDEN' });
  }
  next();
}

/** requireEditor — ADMIN or CONTRIBUTOR (write access; VIEWER is read-only). */
export function requireEditor(req, res, next) {
  if (!canEdit(req.user)) {
    return res.status(403).json({ error: 'FORBIDDEN' });
  }
  next();
}

/** requireRole — factory gating to an explicit set of roles. */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'FORBIDDEN' });
    }
    next();
  };
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
