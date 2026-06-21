/**
 * payments.controller.js — Razorpay webhook handler + order re-creation + callback verify.
 *
 * handleWebhook (POST /api/v1/payments/webhook):
 *   SECURITY CRITICAL — implements RESEARCH Pattern 2 exactly:
 *   1. Verify HMAC-SHA256 signature (timingSafeEqual) over raw body Buffer
 *   2. Check processed_webhooks for replay (P2002 unique violation → 200 already_processed)
 *   3. Switch on event type → onPaymentCaptured / onPaymentFailed / onRefundCreated
 *   4. Return 200 to Razorpay always (never 5xx — Razorpay retries on non-2xx)
 *
 * onPaymentCaptured:
 *   - Amount tampering check (T-05-03)
 *   - Prisma Serializable transaction: registration paid + seat increment +
 *     coupon atomic increment (Prisma-native) + invoice number generation (FOR UPDATE)
 *   - Post-tx: PDF generation + Cloudinary upload (slow IO outside the row lock)
 *   - Auto-account welcome email for shell users (Pitfall 5)
 *   - Confirmation email + admin notification
 *
 * verifyClientCallback (POST /api/v1/payments/verify):
 *   UX-ONLY — does NOT update payment state (T-05-13: webhook is authoritative).
 *
 * ARCHITECTURE.md §23 + RESEARCH Pattern 2 + Pitfall 2 + T-05-01 to T-05-15.
 */
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import * as razorpayService from '../services/razorpay.service.js';
const { verifyWebhookSignature, verifyClientCallback: rzpVerifyCallback } = razorpayService;
import { generateInvoicePdf } from '../services/invoice.service.js';
import { applyCouponInTx, CouponInvalidError, CouponConflictError } from '../services/coupon.service.js';
import { nextInvoiceNumber } from '../utils/invoiceNumber.js';
import { sendEmail } from '../services/email.service.js';
import { sendSms, sendWhatsApp } from '../services/notification.service.js';

// ============================================================
// Webhook handler — the authoritative payment confirmation channel
// ============================================================

/**
 * POST /api/v1/payments/webhook
 * req.body is a Buffer (express.raw middleware registered in app.js BEFORE express.json)
 */
export async function handleWebhook(req, res) {
  // ── 1. Signature verification — FIRST, before any DB access ────────────────
  const ok = verifyWebhookSignature(req.body, req.headers['x-razorpay-signature']);
  if (!ok) {
    // T-05-01: forged webhook rejected before any side-effect
    logger.warn({ ip: req.ip }, 'webhook.signature.invalid');
    return res.status(400).json({ error: 'Invalid signature' });
  }

  // ── 2. Parse payload ────────────────────────────────────────────────────────
  let payload;
  try {
    payload = JSON.parse(req.body.toString('utf-8'));
  } catch {
    logger.warn({ ip: req.ip }, 'webhook.json.parse.failed');
    return res.status(400).json({ error: 'Invalid JSON payload' });
  }

  // Pino redact config covers sensitive paths; log only safe metadata (T-05-14)
  const eventId   = payload.id;
  const eventType = payload.event;
  logger.info({ eventId, eventType }, 'webhook.received');

  // ── 3. Replay protection — unique insert on processed_webhooks (T-05-02) ───
  try {
    await prisma.processedWebhook.create({
      data: { eventId, eventType, receivedAt: new Date() },
    });
  } catch (e) {
    if (e.code === 'P2002') {
      // Duplicate delivery — idempotent 200, no side-effects
      logger.info({ eventId }, 'webhook.replay.ignored');
      return res.status(200).json({ already_processed: true });
    }
    // Unexpected DB error — still return 200 to prevent Razorpay from halting
    logger.error({ err: e, eventId }, 'webhook.processedWebhook.insert.error');
    return res.status(200).json({ ok: true });
  }

  // ── 4. Dispatch by event type ───────────────────────────────────────────────
  try {
    switch (eventType) {
      case 'payment.captured':
        await onPaymentCaptured(payload);
        break;
      case 'payment.failed':
        await onPaymentFailed(payload);
        break;
      case 'refund.created':
        await onRefundCreated(payload);
        break;
      default:
        logger.info({ eventType }, 'webhook.ignored.event');
    }
  } catch (err) {
    // Log but still return 200 — Razorpay must not retry infinitely on app errors
    logger.error({ err, eventId, eventType }, 'webhook.handler.error');
  }

  return res.status(200).json({ ok: true });
}

// ============================================================
// payment.captured handler
// ============================================================

async function onPaymentCaptured(payload) {
  const entity     = payload.payload?.payment?.entity ?? {};
  const paymentId  = entity.id;
  const orderId    = entity.order_id;
  const amountPaise = entity.amount; // paise from Razorpay

  logger.info({ paymentId, orderId, amountPaise }, 'webhook.payment.captured');

  // Lookup registration by Razorpay order ID
  const registration = await prisma.registration.findFirst({
    where: { razorpayOrderId: orderId },
    include: { user: true, batch: true },
  });

  if (!registration) {
    // Payment for an order we don't recognise — log for manual reconciliation
    logger.error({ orderId, paymentId }, 'webhook.captured.unknown_order');
    return;
  }

  if (registration.paymentStatus === 'PAID') {
    // Already processed (e.g. two delivery attempts) — idempotent
    logger.info({ registrationId: registration.id }, 'webhook.captured.already_paid');
    return;
  }

  // ── Amount tampering check (T-05-03) ───────────────────────────────────────
  // Razorpay amount (paise) must equal our finalAmount × 100
  const expectedPaise = Math.round(Number(registration.finalAmount) * 100);
  if (amountPaise !== expectedPaise) {
    logger.error(
      { paymentId, orderId, amountPaise, expectedPaise },
      'webhook.amount_tamper_detected: registration NOT marked paid; manual reconciliation required'
    );
    await prisma.auditLog.create({
      data: {
        actorId:     null,
        action:      'PAYMENT_AMOUNT_TAMPER',
        subjectType: 'Registration',
        subjectId:   registration.id,
        meta:        { paymentId, amountPaise, expectedPaise },
      },
    });
    return;
  }

  // ── Serializable transaction: registration + seat + coupon + invoice number ─
  let invoiceNumber;
  let candidateId = null;

  try {
    await prisma.$transaction(async (tx) => {
      // Mark registration paid
      await tx.registration.update({
        where: { id: registration.id },
        data: {
          paymentStatus:    'PAID',
          razorpayPaymentId: paymentId,
          status:           'ACTIVE',
        },
      });

      // Seat increment (anti-pattern: never outside the transaction — RESEARCH §Anti-Patterns).
      // The returned seatsBooked is the participant's number within the batch; Serializable
      // isolation makes this collision-free, so we derive the candidate ID from it.
      if (registration.batchId) {
        const updatedBatch = await tx.batch.update({
          where: { id: registration.batchId },
          data: { seatsBooked: { increment: 1 } },
        });
        const prefix = registration.program === 'FUTURE_READINESS' ? 'EXP'
          : registration.program === 'BADLAAV' ? 'RET' : 'BAD';
        candidateId = `${prefix}-${registration.batchId.slice(-4)}-${String(updatedBatch.seatsBooked).padStart(3, '0')}`;
      }

      // Prisma-native coupon atomic increment (FIX B — T-05-05)
      if (registration.couponCode) {
        try {
          await applyCouponInTx({
            tx,
            code:    registration.couponCode,
            program: registration.program,
            amount:  Number(registration.amount),
          });
        } catch (couponErr) {
          if (couponErr instanceof CouponInvalidError || couponErr instanceof CouponConflictError) {
            // Coupon exhausted/expired between pre-check and webhook.
            // Abort the whole transaction — admin must handle manually (refund + reconcile).
            await prisma.auditLog.create({
              data: {
                actorId:     null,
                action:      'PAYMENT_COUPON_CONFLICT',
                subjectType: 'Registration',
                subjectId:   registration.id,
                meta:        { paymentId, couponCode: registration.couponCode, reason: couponErr.reason },
              },
            });
            logger.error(
              { registrationId: registration.id, couponCode: registration.couponCode, reason: couponErr.reason },
              'webhook.coupon_conflict: payment captured but coupon exhausted; manual refund required'
            );
            throw couponErr; // abort tx
          }
          throw couponErr;
        }
      }

      // Row-locked invoice number (Pattern 7 — SELECT FOR UPDATE documented exception)
      invoiceNumber = await nextInvoiceNumber(tx);

      // Write invoice number + candidate ID + payment method (invoiceUrl updated after tx)
      await tx.registration.update({
        where: { id: registration.id },
        data: { invoiceNumber, candidateId, paymentMethod: 'RAZORPAY' },
      });

      // Auto-account: flip emailVerified for shell users (Pitfall 5 — no temp password; OTP-only)
      if (!registration.user.passwordHash && !registration.user.emailVerified) {
        await tx.user.update({
          where: { id: registration.user.id },
          data:  { emailVerified: true },
        });
      }

      // Audit log inside transaction
      await tx.auditLog.create({
        data: {
          actorId:     registration.user.id,
          action:      'PAYMENT_CAPTURED',
          subjectType: 'Registration',
          subjectId:   registration.id,
          meta:        { amountPaise, paymentId, invoiceNumber },
        },
      });
    }, { isolationLevel: 'Serializable' });
  } catch (txErr) {
    logger.error({ err: txErr, registrationId: registration.id }, 'webhook.transaction.failed');
    return;
  }

  // ── Post-transaction: PDF generation + Cloudinary + email ─────────────────
  // PDF gen is slow I/O — done OUTSIDE the row lock to avoid holding it too long.
  // If it fails, registration is already PAID and invoiceNumber is set; admin can regen.
  try {
    const { invoiceUrl, pdfBuffer } = await generateInvoicePdf({
      registration,
      user:          registration.user,
      batch:         registration.batch,
      invoiceNumber,
      paymentDetails: { paymentId, capturedAt: new Date() },
    });

    if (invoiceUrl) {
      await prisma.registration.update({
        where: { id: registration.id },
        data: { invoiceUrl },
      });
    }

    // Auto-account welcome email (shell users — OTP login instructions)
    if (!registration.user.passwordHash) {
      await sendEmail({
        to:       registration.user.email,
        template: 'auto-account-welcome',
        data: {
          name:     registration.user.name,
          loginUrl: process.env.APP_URL
            ? `${process.env.APP_URL}/login`
            : 'https://www.iambadlaav.com/login',
        },
      }).catch((err) => logger.warn({ err }, 'email.auto_account_welcome.failed'));
    }

    // Registration confirmation email with invoice attachment
    await sendEmail({
      to:       registration.user.email,
      template: 'registration-confirmation',
      data: {
        name:             registration.user.name,
        programDisplayName: programDisplay(registration.program),
        batchName:        registration.batch?.name ?? '',
        invoiceNumber,
      },
      attachments: pdfBuffer
        ? [{ filename: `${invoiceNumber.replace(/\//g, '-')}.pdf`, content: pdfBuffer }]
        : [],
    }).catch((err) => logger.warn({ err }, 'email.registration_confirmation.failed'));

    // Admin notification
    await sendEmail({
      to:       process.env.ADMIN_EMAIL ?? 'iambadlaav@gmail.com',
      template: 'admin-new-registration',
      data: {
        program:     registration.program,
        plan:        registration.plan,
        batchName:   registration.batch?.name ?? 'N/A',
        userName:    registration.user.name,
        userEmail:   registration.user.email,
        amount:      Number(registration.finalAmount),
        couponCode:  registration.couponCode ?? 'None',
        regId:       registration.id,
        invoiceNumber,
        adminUrl:    process.env.APP_URL
          ? `${process.env.APP_URL}/admin/registrations/${registration.id}`
          : `/admin/registrations/${registration.id}`,
      },
    }).catch((err) => logger.warn({ err }, 'email.admin_new_registration.failed'));

    // SMS + WhatsApp — feature-flagged, best-effort (no-op without MSG91 keys).
    sendSms({
      to:   registration.user.phone,
      vars: { name: registration.user.name, candidate: candidateId ?? '', batch: registration.batch?.name ?? '' },
    }).catch(() => { /* logged by service */ });
    sendWhatsApp({
      to:           registration.user.phone,
      templateName: process.env.MSG91_WA_CONFIRM_TEMPLATE,
    }).catch(() => { /* logged by service */ });
  } catch (postTxErr) {
    logger.error({ err: postTxErr, registrationId: registration.id }, 'webhook.post_tx.failed');
  }
}

// ============================================================
// payment.failed handler
// ============================================================

async function onPaymentFailed(payload) {
  const entity    = payload.payload?.payment?.entity ?? {};
  const paymentId = entity.id;
  const orderId   = entity.order_id;

  logger.info({ paymentId, orderId }, 'webhook.payment.failed');

  const registration = await prisma.registration.findFirst({
    where: { razorpayOrderId: orderId },
  });

  if (!registration) {
    logger.warn({ orderId }, 'webhook.failed.unknown_order');
    return;
  }

  await prisma.registration.update({
    where: { id: registration.id },
    data: { paymentStatus: 'FAILED' },
  });

  await prisma.auditLog.create({
    data: {
      actorId:     registration.userId,
      action:      'PAYMENT_FAILED',
      subjectType: 'Registration',
      subjectId:   registration.id,
      meta:        { paymentId, orderId },
    },
  });
  // Recovery reminder email handled by the failed-payment cron (15-min mark)
}

// ============================================================
// refund.created handler
// ============================================================

async function onRefundCreated(payload) {
  const entity       = payload.payload?.refund?.entity ?? {};
  const paymentId    = entity.payment_id;
  const refundId     = entity.id;

  logger.info({ paymentId, refundId }, 'webhook.refund.created');

  const registration = await prisma.registration.findFirst({
    where: { razorpayPaymentId: paymentId },
  });

  if (!registration) {
    logger.warn({ paymentId }, 'webhook.refund.unknown_payment');
    return;
  }

  await prisma.registration.update({
    where: { id: registration.id },
    data: { paymentStatus: 'REFUNDED' },
  });

  await prisma.auditLog.create({
    data: {
      actorId:     null,
      action:      'REFUND_CREATED',
      subjectType: 'Registration',
      subjectId:   registration.id,
      meta:        { refundId, paymentId },
    },
  });
}

// ============================================================
// Re-create order for abandoned checkout
// ============================================================

/**
 * POST /api/v1/payments/create-order
 * Idempotent — re-creates Razorpay order for an existing PENDING registration.
 * Used by the frontend when the user re-opens the checkout after closing it.
 */
export async function createOrderForExisting(req, res, next) {
  try {
    const { registrationId } = req.body;
    if (!registrationId) {
      return res.status(400).json({ error: 'registrationId required.' });
    }

    const registration = await prisma.registration.findUnique({
      where: { id: registrationId },
    });

    if (!registration) {
      return res.status(404).json({ error: 'Registration not found.' });
    }

    // Ownership check
    if (req.user?.role !== 'ADMIN' && registration.userId !== req.user?.id) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    if (registration.paymentStatus === 'PAID') {
      return res.status(409).json({ error: 'Already paid.' });
    }

    const order = await razorpayService.createOrder({
      amount:    Math.round(Number(registration.finalAmount) * 100),
      currency:  'INR',
      receiptId: registration.id,
      notes:     { program: registration.program, plan: registration.plan },
    });

    await prisma.registration.update({
      where: { id: registration.id },
      data: { razorpayOrderId: order.id },
    });

    return res.status(200).json({
      razorpayOrderId: order.id,
      amount:          Number(registration.finalAmount),
      key:             process.env.RAZORPAY_KEY_ID ?? null,
    });
  } catch (err) {
    next(err);
  }
}

// ============================================================
// Client callback verify — UX-only (T-05-13)
// ============================================================

/**
 * POST /api/v1/payments/verify
 * Verifies the Razorpay client callback signature — for redirect UX only.
 * NEVER updates payment state. Webhook is the authoritative channel.
 */
export async function verifyPayment(req, res, next) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, registrationId } = req.body;

    // T-05-13: this endpoint is intentionally read-only — it MUST NOT update
    // registration.paymentStatus. Webhook is the authoritative confirmation channel.
    const verified = rzpVerifyCallback({
      orderId:   razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    });

    logger.info({ registrationId, verified }, 'payment.verify.callback');
    return res.status(200).json({ verified });
  } catch (err) {
    next(err);
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function programDisplay(program) {
  const map = {
    BADLAAV:          'The Retreat',
    FUTURE_READINESS: 'The Badlaav Experience',
    MISSION_UDAAN:    'Future programme 1',
    ANTRANG:          'Future programme 2',
  };
  return map[program] ?? program;
}
