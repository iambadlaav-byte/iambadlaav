/**
 * admin.users.controller.js — User anonymization.
 *
 * POST /admin/users/:id/anonymize
 *
 * Anonymize-not-delete per ARCH §28.8 and CONSTRAINT-SCHEMA-002:
 *   - Scrubs all PII (name, email, phone, city, state, occupation, age, photoUrl, passwordHash)
 *   - Sets deletedAt (soft-delete marker)
 *   - Revokes all active refresh tokens
 *   - Deletes profile photo from Cloudinary
 *   - Preserves Registration rows + AuditLog rows for 7-year tax-law retention
 *
 * The Zod anonymizeSchema requires `confirm: z.literal('ANONYMIZE')` — this is validated
 * upstream by the validate middleware before this controller runs.
 *
 * T-07-08: typed confirmation + audit row with reason prevents accidental or unauthorised use.
 */
import { prisma }     from '../lib/prisma.js';
import { deleteAsset } from '../services/cloudinary.service.js';
import { writeAudit, AUDIT_ACTIONS } from '../services/audit.service.js';
import { bcryptHash }  from '../utils/hash.js';
import { STAFF_ROLES } from '../middleware/auth.js';

export async function anonymizeUser(req, res, next) {
  try {
    const targetUserId = req.params.id;
    const { reason } = req.body; // confirm: 'ANONYMIZE' already validated by schema

    // Load user to check existence and grab photoUrl before wiping
    const user = await prisma.user.findUnique({
      where:  { id: targetUserId },
      select: { id: true, name: true, photoUrl: true, deletedAt: true },
    });

    if (!user) return res.status(404).json({ error: 'NOT_FOUND' });
    if (user.deletedAt) return res.status(409).json({ error: 'ALREADY_ANONYMIZED' });

    // Perform scrub + token revocation atomically
    await prisma.$transaction(async (tx) => {
      // Scrub PII — all identifying fields nulled or replaced with anonymous markers
      await tx.user.update({
        where: { id: targetUserId },
        data: {
          name:         `Anonymized-${targetUserId.slice(0, 8)}`,
          email:        `anon-${targetUserId.slice(0, 8)}@anonymized.local`,
          phone:        '0000000000',
          city:         null,
          state:        null,
          occupation:   null,
          age:          null,
          photoUrl:     null,
          passwordHash: null,
          deletedAt:    new Date(),
        },
      });

      // Revoke all active refresh tokens so no existing session can be used
      await tx.refreshToken.updateMany({
        where: { userId: targetUserId, revokedAt: null },
        data:  { revokedAt: new Date(), revokeReason: 'user_anonymized' },
      });

      await writeAudit({
        tx,
        actorId:     req.user.id,
        action:      AUDIT_ACTIONS.USER_ANONYMIZED,
        subjectType: 'User',
        subjectId:   targetUserId,
        meta:        { reason, previousName: user.name },
        req,
      });
    });

    // Post-transaction: delete profile photo from Cloudinary.
    // Failure here is non-critical — the PII scrub already happened.
    if (user.photoUrl) {
      try {
        await deleteAsset(`dnyanpith/profile-photos/${targetUserId}`);
      } catch { /* non-critical */ }
    }

    return res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

// ── Staff user management (Settings, Admin-only) ──────────────────────────────

/**
 * GET /admin/users — list staff accounts (Admin/Contributor/Viewer).
 * Never returns passwordHash; exposes hasPassword so the UI can offer a reset.
 */
export async function listStaffUsers(req, res, next) {
  try {
    const rows = await prisma.user.findMany({
      where:   { role: { in: STAFF_ROLES }, deletedAt: null },
      orderBy: { createdAt: 'asc' },
      select:  { id: true, name: true, email: true, role: true, lastLoginAt: true, createdAt: true, passwordHash: true },
    });
    const safe = rows.map(({ passwordHash, ...u }) => ({ ...u, hasPassword: Boolean(passwordHash) }));
    return res.json({ rows: safe });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /admin/users — create a staff account with a role + initial password.
 */
export async function createStaffUser(req, res, next) {
  try {
    const { name, email, role, password } = req.body;
    const normalizedEmail = email.toLowerCase();

    const existing = await prisma.user.findUnique({
      where:  { email: normalizedEmail },
      select: { id: true, deletedAt: true },
    });
    if (existing && !existing.deletedAt) {
      return res.status(409).json({ error: 'EMAIL_TAKEN' });
    }

    const passwordHash = await bcryptHash(password);
    const user = await prisma.user.create({
      data:   { name, email: normalizedEmail, role, passwordHash, emailVerified: true },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    await writeAudit({
      actorId:     req.user.id,
      action:      AUDIT_ACTIONS.USER_CREATED,
      subjectType: 'User',
      subjectId:   user.id,
      meta:        { role, email: normalizedEmail },
      req,
    });

    return res.status(201).json({ user });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /admin/users/:id/role — change a staff member's role.
 * Refuses to strip the last remaining ADMIN (lock-out guard).
 */
export async function updateStaffUserRole(req, res, next) {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const target = await prisma.user.findUnique({
      where:  { id },
      select: { id: true, role: true, deletedAt: true },
    });
    if (!target || target.deletedAt) return res.status(404).json({ error: 'NOT_FOUND' });

    if (target.role === 'ADMIN' && role !== 'ADMIN') {
      const adminCount = await prisma.user.count({ where: { role: 'ADMIN', deletedAt: null } });
      if (adminCount <= 1) return res.status(409).json({ error: 'LAST_ADMIN' });
    }

    const user = await prisma.user.update({
      where:  { id },
      data:   { role },
      select: { id: true, name: true, email: true, role: true },
    });

    await writeAudit({
      actorId:     req.user.id,
      action:      AUDIT_ACTIONS.USER_ROLE_CHANGED,
      subjectType: 'User',
      subjectId:   id,
      meta:        { from: target.role, to: role },
      req,
    });

    return res.json({ user });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /admin/users/:id/reset-password — set a new password + revoke sessions.
 */
export async function resetUserPassword(req, res, next) {
  try {
    const { id } = req.params;
    const { password } = req.body;

    const target = await prisma.user.findUnique({
      where:  { id },
      select: { id: true, deletedAt: true },
    });
    if (!target || target.deletedAt) return res.status(404).json({ error: 'NOT_FOUND' });

    const passwordHash = await bcryptHash(password);
    await prisma.$transaction(async (tx) => {
      await tx.user.update({ where: { id }, data: { passwordHash } });
      await tx.refreshToken.updateMany({
        where: { userId: id, revokedAt: null },
        data:  { revokedAt: new Date(), revokeReason: 'admin_password_reset' },
      });
      await writeAudit({
        tx,
        actorId:     req.user.id,
        action:      AUDIT_ACTIONS.USER_PASSWORD_RESET,
        subjectType: 'User',
        subjectId:   id,
        req,
      });
    });

    return res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}
