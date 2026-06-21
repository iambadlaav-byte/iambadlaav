/**
 * volunteers.controller.js — VOL-01 Volunteer Application (guest path, no auth).
 *
 * applyVolunteer (POST /api/v1/volunteers):
 *   1. Upsert shell user by email (mirrors registrations: update sets name ONLY,
 *      so an unauthenticated form can't overwrite an existing user's profile).
 *   2. Create the Volunteer row (status PENDING).
 *   3. Dedup: Volunteer has a composite @@unique([userId, batchAttended]) → a second
 *      application for the SAME batch throws Prisma P2002 → 409 ALREADY_APPLIED.
 *      A different batch is allowed (volunteers can help with more than one batch).
 *   4. Best-effort admin notification email (never fails the request).
 */
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import { sendEmail } from '../services/email.service.js';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'iambadlaav@gmail.com';

/**
 * Create a volunteer application.
 * Body validated by volunteerCreateSchema before reaching this handler.
 */
export async function applyVolunteer(req, res, next) {
  const log = req.log ?? logger;
  try {
    const {
      name, email, phone, city,
      batchAttended, skills, availability, canTravel, whyVolunteer, messageToArjun,
    } = req.body;

    // ── 1. Upsert shell user ──────────────────────────────────────────────────
    // update: name only — corrects OTP ghost names without letting an unauthenticated
    // form silently rewrite phone/city on an existing profile (Issue 6 parity).
    const user = await prisma.user.upsert({
      where:  { email },
      update: { name },
      create: {
        email,
        name,
        phone,
        city:          city ?? null,
        role:          'REGISTERED',
        emailVerified: false,
        passwordHash:  null,
      },
    });

    // ── 2. Create the Volunteer application ───────────────────────────────────
    let volunteer;
    try {
      volunteer = await prisma.volunteer.create({
        data: {
          userId:         user.id,
          batchAttended,
          whyVolunteer,
          skills,
          availability,
          canTravel,
          messageToArjun: messageToArjun || null,
          status:         'PENDING',
        },
      });
    } catch (dbErr) {
      // ── Duplicate application ───────────────────────────────────────────────
      // Composite unique (userId, batchAttended) — P2002 means this person already
      // applied for THIS batch. Applying for a different batch is allowed.
      if (dbErr.code === 'P2002') {
        log.info({ userId: user.id, batchAttended }, 'volunteer.apply.duplicate_skipped');
        return res.status(409).json({
          error:   'ALREADY_APPLIED',
          message: "You've already applied to volunteer for this batch. To help with a different batch, apply again and pick that one.",
        });
      }
      throw dbErr;
    }

    log.info({ formType: 'VOLUNTEER', volunteerId: volunteer.id }, 'form.submit');

    // ── 3. Best-effort admin notification ─────────────────────────────────────
    sendEmail({
      to:       ADMIN_EMAIL,
      subject:  `New Volunteer Application — ${name} (${city})`,
      template: 'admin-new-volunteer',
      data: {
        name,
        email,
        phone,
        city,
        batchAttended,
        skills:         skills.join(', '),
        availability:   availability.join(', '),
        canTravel:      canTravel ? 'Yes' : 'No',
        whyVolunteer,
        messageToArjun: messageToArjun || '—',
      },
    }).catch((err) => log.error({ err, volunteerId: volunteer.id }, 'email.admin.failed'));

    return res.status(201).json({ volunteerId: volunteer.id });
  } catch (err) {
    next(err);
  }
}
