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
