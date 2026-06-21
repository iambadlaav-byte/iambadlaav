/**
 * admin.registrations.controller.js
 *
 * Endpoints:
 *   GET    /admin/registrations           — list with filters
 *   GET    /admin/registrations/:id       — single registration detail
 *   PATCH  /admin/registrations/:id       — update status (ACTIVE | COMPLETED | CANCELLED)
 *   GET    /admin/registrations/export.csv
 *   GET    /admin/registrations/reconciliation  — PAY-01 monthly CSV
 *   POST   /admin/registrations/:id/resend-email
 *
 * Volunteer-unlock (ARCH §11.4):
 *   Marking COMPLETED atomically increments user.coursesCompleted and sends
 *   the volunteer-unlock email. Previous-status guard prevents double-increment.
 *
 * PAY-01 reconciliation (REQUIREMENTS.md):
 *   GET /admin/registrations/reconciliation?month=YYYY-MM
 *   Validated by reconciliationQuerySchema. Streams CSV with 10 columns.
 *   Audit-logged via RECONCILIATION_EXPORTED.
 */
import { prisma }      from '../lib/prisma.js';
import { logger }      from '../lib/logger.js';
import { sendEmail }   from '../services/email.service.js';
import { writeAudit, AUDIT_ACTIONS } from '../services/audit.service.js';
import { buildRegistrationsCsv, buildReconciliationCsv, streamCsv } from '../services/csvExport.service.js';
import { signedInvoiceUrl } from '../services/cloudinary.service.js';
import { generateInvoicePdf, generateRegistrationPass } from '../services/invoice.service.js';
import { canSeeFinancials } from '../middleware/auth.js';
import { nextInvoiceNumber } from '../utils/invoiceNumber.js';

// Program enum → display label. Enum values are repurposed (see schema notes):
// BADLAAV = The Retreat, FUTURE_READINESS = The Badlaav Experience.
function programDisplay(program) {
  const map = {
    BADLAAV:          'The Retreat',
    FUTURE_READINESS: 'The Badlaav Experience',
    MISSION_UDAAN:    'Future Programme',
    ANTRANG:          'Future Programme',
  };
  return map[program] ?? program;
}

// ── Registration select (shared by list + detail) ─────────────────────────────
const REGISTRATION_SELECT = {
  id:               true,
  createdAt:        true,
  program:          true,
  plan:             true,
  regType:          true,
  partner2Name:     true,
  candidateId:      true,
  paymentMethod:    true,
  amount:           true,
  discountAmount:   true,
  finalAmount:      true,
  couponCode:       true,
  paymentStatus:    true,
  razorpayOrderId:  true,
  razorpayPaymentId: true,
  invoiceUrl:       true,
  invoiceNumber:    true,
  status:           true,
  waitlistInvitedAt: true,
  completedAt:      true,
  age:              true,
  occupation:       true,
  dietaryNote:      true,
  questionnaire:    true,
  user: { select: { id: true, name: true, email: true, phone: true, city: true, state: true, coursesCompleted: true } },
  batch: { select: { id: true, name: true, startDate: true, venue: true } },
};

// Hide money from Contributor/Viewer (RBAC matrix).
function gateFinancials(reg, user) {
  if (!reg || canSeeFinancials(user)) return reg;
  const { amount, discountAmount, finalAmount, couponCode, ...rest } = reg;
  return rest;
}

// ── listRegistrations ─────────────────────────────────────────────────────────

export async function listRegistrations(req, res, next) {
  try {
    const { program, batchId, paymentStatus, status, from, to, cursor, limit = 25 } = req.query;

    const where = {};
    if (program)       where.program       = program;
    if (batchId)       where.batchId       = batchId;
    if (paymentStatus) where.paymentStatus = paymentStatus;
    if (status)        where.status        = status;
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to)   where.createdAt.lte = new Date(to);
    }

    const rows = await prisma.registration.findMany({
      where,
      select:  REGISTRATION_SELECT,
      orderBy: { createdAt: 'desc' },
      take:    Math.min(Number(limit) || 25, 100),
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    const nextCursor = rows.length === Math.min(Number(limit) || 25, 100)
      ? rows[rows.length - 1].id
      : null;

    return res.json({ rows: rows.map((r) => gateFinancials(r, req.user)), nextCursor });
  } catch (err) {
    next(err);
  }
}

// ── getRegistration ───────────────────────────────────────────────────────────

export async function getRegistration(req, res, next) {
  try {
    const reg = await prisma.registration.findUnique({
      where:  { id: req.params.id },
      select: REGISTRATION_SELECT,
    });

    if (!reg) return res.status(404).json({ error: 'NOT_FOUND' });

    // Re-sign invoice URL if present so admin can view the PDF
    let invoiceSignedUrl = null;
    if (reg.invoiceUrl) {
      try {
        // Extract the public_id portion from the stored URL
        const match = reg.invoiceUrl.match(/\/upload\/(?:v\d+\/)?(.+)$/);
        if (match) invoiceSignedUrl = signedInvoiceUrl(match[1].replace(/\.[^.]+$/, ''));
      } catch { /* non-critical */ }
    }

    // Last 5 audit rows for context
    const auditRows = await prisma.auditLog.findMany({
      where:   { subjectId: reg.id, subjectType: 'Registration' },
      orderBy: { createdAt: 'desc' },
      take:    5,
    });

    return res.json({ registration: gateFinancials(reg, req.user), invoiceSignedUrl, auditRows });
  } catch (err) {
    next(err);
  }
}

// ── updateRegistrationStatus ──────────────────────────────────────────────────

export async function updateRegistrationStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status: newStatus } = req.body; // validated by registrationStatusSchema

    const result = await prisma.$transaction(async (tx) => {
      const current = await tx.registration.findUnique({
        where:  { id },
        select: { id: true, status: true, batchId: true, userId: true,
                  user: { select: { name: true, email: true } } },
      });

      if (!current) throw Object.assign(new Error('NOT_FOUND'), { statusCode: 404 });

      const oldStatus = current.status;

      // Update registration status
      const updated = await tx.registration.update({
        where: { id },
        data:  {
          status:      newStatus,
          completedAt: newStatus === 'COMPLETED' ? new Date() : undefined,
        },
        select: REGISTRATION_SELECT,
      });

      // Volunteer-unlock (ARCH §11.4): atomic increment — only on first completion
      if (newStatus === 'COMPLETED' && oldStatus !== 'COMPLETED') {
        await tx.user.update({
          where: { id: current.userId },
          data:  { coursesCompleted: { increment: 1 } },
        });
      }

      // Release seat when cancelling a batch registration
      if (newStatus === 'CANCELLED' && current.batchId) {
        await tx.batch.update({
          where: { id: current.batchId },
          data:  { seatsBooked: { decrement: 1 } },
        });
      }

      await writeAudit({
        tx,
        actorId:     req.user.id,
        action:      newStatus === 'COMPLETED' ? AUDIT_ACTIONS.REGISTRATION_COMPLETED
                   : newStatus === 'CANCELLED' ? AUDIT_ACTIONS.REGISTRATION_CANCELLED
                   : 'registration.status_changed',
        subjectType: 'Registration',
        subjectId:   id,
        meta:        { previousStatus: oldStatus, newStatus },
        req,
      });

      return { updated, oldStatus, current };
    });

    // Post-transaction: send volunteer-unlock email (outside tx — email failure
    // must not roll back the DB write)
    if (newStatus === 'COMPLETED' && result.oldStatus !== 'COMPLETED') {
      try {
        await sendEmail({
          to:       result.current.user.email,
          subject:  'Your Badlaav journey is complete — apply as a Volunteer',
          template: 'volunteer-unlock',
          data:     { name: result.current.user.name },
        });
      } catch { /* email failure is non-critical; audit row already written */ }
    }

    return res.json({ registration: result.updated });
  } catch (err) {
    if (err.statusCode === 404) return res.status(404).json({ error: 'NOT_FOUND' });
    next(err);
  }
}

// ── exportRegistrationsCsv ────────────────────────────────────────────────────

export async function exportRegistrationsCsv(req, res, next) {
  try {
    const rows = await prisma.registration.findMany({
      include: { user: true, batch: true },
      orderBy: { createdAt: 'desc' },
    });

    const { columns, rows: csvRows } = buildRegistrationsCsv(rows);

    await writeAudit({
      actorId:     req.user.id,
      action:      'registration.csv_exported',
      subjectType: 'Export',
      subjectId:   null,
      meta:        { count: rows.length },
      req,
    });

    streamCsv(res, { filename: 'registrations.csv', columns, rows: csvRows });
  } catch (err) {
    next(err);
  }
}

// ── getReconciliation (PAY-01) ────────────────────────────────────────────────

export async function getReconciliation(req, res, next) {
  try {
    // month validated upstream by reconciliationQuerySchema
    const rawMonth = req.query.month;

    // Determine month string (YYYY-MM); default to current month
    const month = rawMonth && /^\d{4}-(0[1-9]|1[0-2])$/.test(rawMonth)
      ? rawMonth
      : new Date().toISOString().slice(0, 7); // e.g. '2026-05'

    const [year, mon] = month.split('-').map(Number);
    const firstDay  = new Date(Date.UTC(year, mon - 1, 1));
    const nextMonth = new Date(Date.UTC(year, mon, 1)); // exclusive upper bound

    const registrations = await prisma.registration.findMany({
      where: {
        paymentStatus: { in: ['PAID', 'REFUNDED'] },
        createdAt:     { gte: firstDay, lt: nextMonth },
      },
      select: {
        id:               true,
        invoiceNumber:    true,
        program:          true,
        plan:             true,
        regType:          true,
        finalAmount:      true,
        razorpayPaymentId: true,
        createdAt:        true,
        paymentStatus:    true,
        user:  { select: { name: true, email: true } },
        batch: { select: { name: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    const { columns, rows } = buildReconciliationCsv(registrations);

    // Audit-log the export (RECONCILIATION_EXPORTED)
    await writeAudit({
      actorId:     req.user.id,
      action:      AUDIT_ACTIONS.RECONCILIATION_EXPORTED,
      subjectType: 'Month',
      subjectId:   month,
      meta:        { month, rowCount: rows.length },
      req,
    });

    streamCsv(res, { filename: `reconciliation-${month}.csv`, columns, rows });
  } catch (err) {
    next(err);
  }
}

// ── resendConfirmationEmail ───────────────────────────────────────────────────

export async function resendConfirmationEmail(req, res, next) {
  try {
    const reg = await prisma.registration.findUnique({
      where:   { id: req.params.id },
      include: { user: true, batch: true },
    });

    if (!reg) return res.status(404).json({ error: 'NOT_FOUND' });

    // Regenerate the pass + invoice so the resend carries the same attachments as
    // the original confirmation. Each is best-effort: a failure just drops that file.
    const attachments = [];
    try {
      const passBuffer = await generateRegistrationPass({
        registration: reg, user: reg.user, batch: reg.batch, candidateId: reg.candidateId,
      });
      const passName = reg.candidateId ? `Badlaav-Pass-${reg.candidateId}` : 'Badlaav-Registration-Pass';
      attachments.push({ filename: `${passName}.pdf`, content: passBuffer });
    } catch (passErr) {
      logger.warn({ err: passErr, registrationId: reg.id }, 'resend.pass.failed');
    }
    if (reg.invoiceNumber) {
      try {
        const { pdfBuffer } = await generateInvoicePdf({
          registration: reg, user: reg.user, batch: reg.batch,
          invoiceNumber: reg.invoiceNumber,
          paymentDetails: { paymentId: reg.razorpayPaymentId ?? 'MANUAL', capturedAt: reg.createdAt },
        });
        if (pdfBuffer) attachments.push({ filename: `${reg.invoiceNumber.replace(/\//g, '-')}.pdf`, content: pdfBuffer });
      } catch (invErr) {
        logger.warn({ err: invErr, registrationId: reg.id }, 'resend.invoice.failed');
      }
    }

    await sendEmail({
      to:       reg.user.email,
      subject:  `Your Badlaav registration — ${programDisplay(reg.program)}`,
      template: 'registration-confirmation',
      data: {
        name:               reg.user.name,
        programDisplayName: programDisplay(reg.program),
        batchName:          reg.batch?.name ?? '',
        candidateId:        reg.candidateId,
        invoiceNumber:      reg.invoiceNumber ?? '',
      },
      attachments,
    });

    await writeAudit({
      actorId:     req.user.id,
      action:      AUDIT_ACTIONS.INVOICE_RESENT,
      subjectType: 'Registration',
      subjectId:   reg.id,
      meta:        { userEmail: reg.user.email },
      req,
    });

    return res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

// ── inviteFromWaitlist ──────────────────────────────────────────────────────
// Invites a WAITLISTED participant to complete their registration. Records the
// invite + emails a register link (best-effort). Promotion to a paid candidate
// happens through the normal payment flow (webhook assigns the candidate ID).
export async function inviteFromWaitlist(req, res, next) {
  try {
    const { id } = req.params;
    const reg = await prisma.registration.findUnique({
      where:   { id },
      include: { user: true, batch: true },
    });
    if (!reg) return res.status(404).json({ error: 'NOT_FOUND' });
    if (reg.status !== 'WAITLISTED') {
      return res.status(400).json({ error: 'Registration is not on the waiting list.' });
    }

    const updated = await prisma.registration.update({
      where:  { id },
      data:   { waitlistInvitedAt: new Date() },
      select: { id: true, waitlistInvitedAt: true },
    });

    const base = process.env.APP_URL || 'https://www.iambadlaav.com';
    const slug = reg.program === 'FUTURE_READINESS' ? 'badlaav-experience' : 'badlaav';
    const link = `${base}/register?program=${slug}`;

    // Best-effort — the endpoint succeeds even if email delivery fails.
    sendEmail({
      to:       reg.user.email,
      subject:  'A seat has opened — complete your Badlaav registration',
      template: 'waitlist-invite',
      data:     { name: reg.user.name, batchName: reg.batch?.name ?? 'your batch', link },
    }).catch(() => { /* logged by the email service */ });

    await writeAudit({
      actorId:     req.user.id,
      action:      'registration.waitlist_invited',
      subjectType: 'Registration',
      subjectId:   id,
      meta:        { userEmail: reg.user.email },
      req,
    });

    return res.json({ ok: true, waitlistInvitedAt: updated.waitlistInvitedAt });
  } catch (err) {
    next(err);
  }
}

// ── markPaidManually ────────────────────────────────────────────────────────
// Admin records an off-Razorpay payment (cash/bank/UPI). Mirrors the webhook:
// marks PAID, increments the seat, assigns a candidate ID + invoice number.
export async function markPaidManually(req, res, next) {
  try {
    const { id } = req.params;
    const reg = await prisma.registration.findUnique({ where: { id }, include: { user: true, batch: true } });
    if (!reg) return res.status(404).json({ error: 'NOT_FOUND' });
    if (reg.paymentStatus === 'PAID') return res.status(409).json({ error: 'Already paid.' });

    // Hoisted out of the tx so the post-commit PDF/email step can use them.
    let invoiceNumber = reg.invoiceNumber ?? null;
    let candidateId   = reg.candidateId ?? null;

    const updated = await prisma.$transaction(async (tx) => {
      if (reg.batchId) {
        const b = await tx.batch.update({ where: { id: reg.batchId }, data: { seatsBooked: { increment: 1 } } });
        if (!candidateId) {
          const prefix = reg.program === 'FUTURE_READINESS' ? 'EXP' : reg.program === 'BADLAAV' ? 'RET' : 'BAD';
          candidateId = `${prefix}-${reg.batchId.slice(-4)}-${String(b.seatsBooked).padStart(3, '0')}`;
        }
      }
      if (!invoiceNumber) invoiceNumber = await nextInvoiceNumber(tx);
      const row = await tx.registration.update({
        where: { id },
        data:  { paymentStatus: 'PAID', status: 'ACTIVE', paymentMethod: 'MANUAL', candidateId, invoiceNumber },
        select: REGISTRATION_SELECT,
      });
      await writeAudit({
        tx, actorId: req.user.id, action: 'registration.manual_paid',
        subjectType: 'Registration', subjectId: id, meta: { invoiceNumber, candidateId }, req,
      });
      return row;
    });

    // PDFs + confirmation email — best-effort, outside the tx (slow I/O). A failure
    // here must not undo the payment: the row is already PAID and admin can resend.
    try {
      const regForPdf = { ...reg, candidateId, invoiceNumber };
      const { invoiceUrl, pdfBuffer } = await generateInvoicePdf({
        registration:   regForPdf,
        user:           reg.user,
        batch:          reg.batch,
        invoiceNumber,
        paymentDetails: { paymentId: 'MANUAL', capturedAt: new Date() },
      });
      if (invoiceUrl) {
        await prisma.registration.update({ where: { id }, data: { invoiceUrl } });
      }

      let passBuffer = null;
      try {
        passBuffer = await generateRegistrationPass({ registration: regForPdf, user: reg.user, batch: reg.batch, candidateId });
      } catch (passErr) {
        logger.warn({ err: passErr, registrationId: id }, 'registration_pass.generate.failed');
      }

      const attachments = [];
      if (passBuffer) {
        const passName = candidateId ? `Badlaav-Pass-${candidateId}` : 'Badlaav-Registration-Pass';
        attachments.push({ filename: `${passName}.pdf`, content: passBuffer });
      }
      if (pdfBuffer) attachments.push({ filename: `${invoiceNumber.replace(/\//g, '-')}.pdf`, content: pdfBuffer });

      await sendEmail({
        to:       reg.user.email,
        subject:  'Your Badlaav registration is confirmed',
        template: 'registration-confirmation',
        data: {
          name:               reg.user.name,
          programDisplayName: programDisplay(reg.program),
          batchName:          reg.batch?.name ?? '',
          candidateId,
          invoiceNumber,
        },
        attachments,
      });
    } catch (mailErr) {
      logger.warn({ err: mailErr, registrationId: id }, 'manual_paid.notify.failed');
    }

    return res.json({ registration: gateFinancials(updated, req.user) });
  } catch (err) {
    next(err);
  }
}

// ── markRefundedManually ────────────────────────────────────────────────────
// Admin records an off-Razorpay refund. Marks REFUNDED + releases the seat.
export async function markRefundedManually(req, res, next) {
  try {
    const { id } = req.params;
    const reg = await prisma.registration.findUnique({ where: { id }, include: { user: true } });
    if (!reg) return res.status(404).json({ error: 'NOT_FOUND' });
    if (reg.paymentStatus !== 'PAID') return res.status(400).json({ error: 'Only PAID registrations can be refunded.' });

    const updated = await prisma.$transaction(async (tx) => {
      const row = await tx.registration.update({
        where: { id },
        data:  { paymentStatus: 'REFUNDED', status: 'CANCELLED' },
        select: REGISTRATION_SELECT,
      });
      if (reg.batchId) {
        await tx.batch.update({ where: { id: reg.batchId }, data: { seatsBooked: { decrement: 1 } } });
      }
      await writeAudit({
        tx, actorId: req.user.id, action: 'registration.manual_refunded',
        subjectType: 'Registration', subjectId: id, meta: { reason: req.body?.reason ?? null }, req,
      });
      return row;
    });

    return res.json({ registration: gateFinancials(updated, req.user) });
  } catch (err) {
    next(err);
  }
}
