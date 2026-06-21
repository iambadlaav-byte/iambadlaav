/**
 * admin.volunteers.controller.js
 *
 * Endpoints:
 *   GET    /admin/volunteers       — list with optional status + batch filters + counts
 *   GET    /admin/volunteers/:id   — single application detail
 *   PATCH  /admin/volunteers/:id   — change status (PENDING | APPROVED | REJECTED)
 *
 * On APPROVED/REJECTED the applicant is notified across email + SMS + WhatsApp,
 * all best-effort (a channel failure never fails the request). PENDING is silent.
 */
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import { sendEmail } from '../services/email.service.js';
import { sendSms, sendWhatsApp } from '../services/notification.service.js';
import { writeAudit, AUDIT_ACTIONS } from '../services/audit.service.js';

const VOLUNTEER_USER_SELECT = { id: true, name: true, email: true, phone: true, city: true };

// ── listVolunteers ──────────────────────────────────────────────────────────

export async function listVolunteers(req, res, next) {
  try {
    const { status, batch } = req.query;

    const where = {};
    if (status) where.status = status;
    if (batch)  where.batchAttended = { contains: batch, mode: 'insensitive' };

    const rows = await prisma.volunteer.findMany({
      where,
      include: { user: { select: VOLUNTEER_USER_SELECT } },
      orderBy: { createdAt: 'desc' },
    });

    // Per-status counts (unfiltered totals so the filter chips show real numbers).
    const statusGroups = await prisma.volunteer.groupBy({
      by:     ['status'],
      _count: { _all: true },
    });
    const counts = { pending: 0, approved: 0, rejected: 0 };
    for (const g of statusGroups) {
      if (g.status === 'PENDING')  counts.pending  = g._count._all;
      if (g.status === 'APPROVED') counts.approved = g._count._all;
      if (g.status === 'REJECTED') counts.rejected = g._count._all;
    }

    // Per-batch counts.
    const batchGroups = await prisma.volunteer.groupBy({
      by:     ['batchAttended'],
      _count: { _all: true },
    });
    const byBatch = batchGroups
      .map((g) => ({ batch: g.batchAttended, count: g._count._all }))
      .sort((a, b) => b.count - a.count);

    return res.json({ rows, counts, byBatch });
  } catch (err) {
    next(err);
  }
}

// ── getVolunteer ────────────────────────────────────────────────────────────

export async function getVolunteer(req, res, next) {
  try {
    const volunteer = await prisma.volunteer.findUnique({
      where:   { id: req.params.id },
      include: { user: { select: VOLUNTEER_USER_SELECT } },
    });

    if (!volunteer) return res.status(404).json({ error: 'NOT_FOUND' });

    return res.json({ volunteer });
  } catch (err) {
    next(err);
  }
}

// ── updateVolunteerStatus ────────────────────────────────────────────────────

const STATUS_LABELS = {
  PENDING:  'Pending review',
  APPROVED: 'Approved',
  REJECTED: 'Not selected',
};

export async function updateVolunteerStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status: newStatus } = req.body; // validated by volunteerStatusSchema

    const current = await prisma.volunteer.findUnique({
      where:   { id },
      include: { user: { select: VOLUNTEER_USER_SELECT } },
    });
    if (!current) return res.status(404).json({ error: 'NOT_FOUND' });

    const updated = await prisma.volunteer.update({
      where: { id },
      data: {
        status:     newStatus,
        approvedBy: newStatus === 'APPROVED' ? req.user.id : null,
        approvedAt: newStatus === 'APPROVED' ? new Date()  : null,
      },
      include: { user: { select: VOLUNTEER_USER_SELECT } },
    });

    await writeAudit({
      actorId:     req.user.id,
      action:      AUDIT_ACTIONS.VOLUNTEER_STATUS_CHANGED,
      subjectType: 'Volunteer',
      subjectId:   id,
      meta:        { previousStatus: current.status, newStatus },
      req,
    });

    // Notify the applicant on a decision only — never on a reset to PENDING.
    // Every channel is best-effort: a failure here must not fail the request.
    if (newStatus === 'APPROVED' || newStatus === 'REJECTED') {
      const { name, email, phone } = updated.user;
      const approved = newStatus === 'APPROVED';

      sendEmail({
        to:       email,
        subject:  approved
          ? 'You\'re in — welcome to the Badlaav volunteer team'
          : 'About your Badlaav volunteer application',
        template: 'volunteer-status',
        data: {
          name,
          statusLabel: STATUS_LABELS[newStatus],
          approved,
          batch:       updated.batchAttended,
        },
      }).catch((err) => logger.warn({ err, volunteerId: id }, 'volunteer.notify.email.failed'));

      sendSms({
        to:     phone,
        flowId: process.env.MSG91_SMS_VOLUNTEER_FLOW_ID,
        vars:   { name, status: newStatus },
      }).catch((err) => logger.warn({ err, volunteerId: id }, 'volunteer.notify.sms.failed'));

      sendWhatsApp({
        to:           phone,
        templateName: process.env.MSG91_WA_VOLUNTEER_TEMPLATE,
      }).catch((err) => logger.warn({ err, volunteerId: id }, 'volunteer.notify.whatsapp.failed'));
    }

    return res.json({ volunteer: updated });
  } catch (err) {
    next(err);
  }
}
