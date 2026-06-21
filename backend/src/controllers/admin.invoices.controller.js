/**
 * admin.invoices.controller.js — Invoice viewing, resending, and refunds.
 *
 * GET  /admin/invoices           — list paid + refunded registrations
 * GET  /admin/invoices/:id       — single invoice (signed Cloudinary URL)
 * POST /admin/invoices/:id/resend — resend confirmation email
 * POST /admin/invoices/:id/refund — initiate Razorpay refund (rate-limited 10/hr)
 *
 * Refund flow (ARCH §23.8 + T-07-05):
 *   1. Validate paymentStatus === 'PAID' (409 if already refunded)
 *   2. Call razorpayService.refundPayment inside prisma.$transaction
 *   3. Update registration.paymentStatus = 'REFUNDED'
 *   4. Decrement batch.seatsBooked if applicable
 *   5. writeAudit REGISTRATION_REFUNDED with razorpayRefundId in meta
 *   6. Post-tx: send refund-confirmation email to participant
 *
 * Note on double-processing: Plan 05's refund.created webhook also updates paymentStatus.
 * The ProcessedWebhooks table deduplicates; if webhook arrives after admin refund, the
 * status is already REFUNDED so the webhook update is a no-op.
 */
import { prisma }           from '../lib/prisma.js';
import * as razorpayService from '../services/razorpay.service.js';
import { signedInvoiceUrl } from '../services/cloudinary.service.js';
import { sendEmail }        from '../services/email.service.js';
import { writeAudit, AUDIT_ACTIONS } from '../services/audit.service.js';
import { buildInvoicesCsv, streamCsv } from '../services/csvExport.service.js';
import { canSeeFinancials, canSeeContact } from '../middleware/auth.js';

// ── listInvoices ──────────────────────────────────────────────────────────────

export async function listInvoices(req, res, next) {
  try {
    const { paymentStatus, cursor, limit = 25 } = req.query;

    const rows = await prisma.registration.findMany({
      where: {
        paymentStatus: paymentStatus
          ? paymentStatus
          : { in: ['PAID', 'REFUNDED'] },
      },
      select: {
        id:               true,
        invoiceNumber:    true,
        finalAmount:      true,
        paymentStatus:    true,
        createdAt:        true,
        invoiceUrl:       true,
        program:          true,
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take:    Math.min(Number(limit) || 25, 100),
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    const nextCursor = rows.length === Math.min(Number(limit) || 25, 100)
      ? rows[rows.length - 1].id
      : null;

    return res.json({ rows, nextCursor });
  } catch (err) {
    next(err);
  }
}

// ── exportInvoicesCsv ──────────────────────────────────────────────────────────
// Streams a CSV of paid + refunded registrations honouring the paymentStatus
// filter from the list endpoint. Financial / contact columns drop per RBAC.

export async function exportInvoicesCsv(req, res, next) {
  try {
    const { paymentStatus } = req.query;

    const rows = await prisma.registration.findMany({
      where: {
        paymentStatus: paymentStatus
          ? paymentStatus
          : { in: ['PAID', 'REFUNDED'] },
      },
      select: {
        id:            true,
        invoiceNumber: true,
        finalAmount:   true,
        paymentStatus: true,
        createdAt:     true,
        program:       true,
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const { columns, rows: csvRows } = buildInvoicesCsv(rows, {
      showFinancials: canSeeFinancials(req.user),
      showContact:    canSeeContact(req.user),
    });

    await writeAudit({
      actorId:     req.user.id,
      action:      AUDIT_ACTIONS.INVOICES_EXPORTED,
      subjectType: 'Export',
      subjectId:   null,
      meta:        { count: csvRows.length },
      req,
    });

    streamCsv(res, { filename: 'invoices.csv', columns, rows: csvRows });
  } catch (err) {
    next(err);
  }
}

// ── viewInvoice ───────────────────────────────────────────────────────────────

export async function viewInvoice(req, res, next) {
  try {
    const reg = await prisma.registration.findUnique({
      where:  { id: req.params.id },
      select: { id: true, invoiceUrl: true, invoiceNumber: true },
    });

    if (!reg) return res.status(404).json({ error: 'NOT_FOUND' });
    if (!reg.invoiceUrl) return res.status(404).json({ error: 'INVOICE_NOT_FOUND' });

    // Extract public_id from the stored URL and re-sign for admin access
    const match = reg.invoiceUrl.match(/\/upload\/(?:v\d+\/)?(.+)$/);
    if (!match) return res.status(500).json({ error: 'INVALID_INVOICE_URL' });

    const publicId = match[1].replace(/\.[^.]+$/, '');
    const url = signedInvoiceUrl(publicId);

    return res.json({ url, invoiceNumber: reg.invoiceNumber });
  } catch (err) {
    next(err);
  }
}

// ── resendInvoice ─────────────────────────────────────────────────────────────

export async function resendInvoice(req, res, next) {
  try {
    const reg = await prisma.registration.findUnique({
      where:   { id: req.params.id },
      include: { user: true },
    });

    if (!reg) return res.status(404).json({ error: 'NOT_FOUND' });

    let invoiceSignedUrl = '';
    if (reg.invoiceUrl) {
      try {
        const match = reg.invoiceUrl.match(/\/upload\/(?:v\d+\/)?(.+)$/);
        if (match) invoiceSignedUrl = signedInvoiceUrl(match[1].replace(/\.[^.]+$/, ''));
      } catch { /* non-critical */ }
    }

    await sendEmail({
      to:       reg.user.email,
      subject:  `Your registration confirmation — ${reg.program.replace('_', ' ')}`,
      template: 'registration-confirmation',
      data: {
        name:          reg.user.name,
        program:       reg.program,
        invoiceNumber: reg.invoiceNumber ?? '',
        invoiceUrl:    invoiceSignedUrl,
      },
    });

    await writeAudit({
      actorId:     req.user.id,
      action:      AUDIT_ACTIONS.INVOICE_RESENT,
      subjectType: 'Registration',
      subjectId:   reg.id,
      meta:        { userEmail: reg.user.email, invoiceNumber: reg.invoiceNumber },
      req,
    });

    return res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

// ── refundPayment ─────────────────────────────────────────────────────────────

export async function refundPayment(req, res, next) {
  try {
    const { id } = req.params;
    // req.body validated by refundSchema: { amount?: number, reason?: string }
    const { amount: requestedAmount, reason } = req.body;

    const result = await prisma.$transaction(async (tx) => {
      const reg = await tx.registration.findUnique({
        where:   { id },
        include: { user: true },
      });

      if (!reg) throw Object.assign(new Error('NOT_FOUND'), { statusCode: 404 });
      if (reg.paymentStatus !== 'PAID') {
        throw Object.assign(
          new Error('Registration is not in a refundable state.'),
          { statusCode: 409, code: 'NOT_REFUNDABLE' }
        );
      }

      if (!reg.razorpayPaymentId) {
        throw Object.assign(
          new Error('No Razorpay payment ID on this registration.'),
          { statusCode: 409, code: 'NO_PAYMENT_ID' }
        );
      }

      // Amount: use requested amount if provided, otherwise full refund.
      // finalAmount stored in rupees (Decimal) — Razorpay expects paise.
      const refundAmountRupees = requestedAmount ?? Number(reg.finalAmount);
      const refundAmountPaise  = Math.round(refundAmountRupees * 100);

      const rzpRefund = await razorpayService.refundPayment({
        paymentId: reg.razorpayPaymentId,
        amount:    refundAmountPaise,
        notes:     { reason: reason ?? '', adminId: req.user.id },
      });

      // Update registration
      await tx.registration.update({
        where: { id },
        data:  { paymentStatus: 'REFUNDED' },
      });

      // Release seat if batch registration
      if (reg.batchId) {
        await tx.batch.update({
          where: { id: reg.batchId },
          data:  { seatsBooked: { decrement: 1 } },
        });
      }

      await writeAudit({
        tx,
        actorId:     req.user.id,
        action:      AUDIT_ACTIONS.REGISTRATION_REFUNDED,
        subjectType: 'Registration',
        subjectId:   id,
        meta: {
          amount:          refundAmountRupees,
          razorpayRefundId: rzpRefund.id,
          reason:          reason ?? '',
        },
        req,
      });

      return { reg, rzpRefund, refundAmountRupees };
    });

    // Post-transaction: send refund confirmation email to participant.
    // Brand-voice copy: calm, direct, factual. No forbidden phrases.
    try {
      await sendEmail({
        to:       result.reg.user.email,
        subject:  `Refund of ₹${result.refundAmountRupees} processed`,
        template: 'refund-confirmation',
        data: {
          name:   result.reg.user.name,
          amount: result.refundAmountRupees,
          reason: reason ?? '',
        },
      });
    } catch { /* email failure is non-critical */ }

    return res.json({
      ok:              true,
      razorpayRefundId: result.rzpRefund.id,
      amountRefunded:  result.refundAmountRupees,
    });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ error: err.code ?? 'REFUND_FAILED', message: err.message });
    }
    next(err);
  }
}
