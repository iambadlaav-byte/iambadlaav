/**
 * registrations.controller.js — FORM-02 Universal Registration + Invoice endpoint.
 *
 * createRegistration (POST /api/v1/registrations):
 *   1. Validate batch exists + is OPEN + program matches (if batchId provided)
 *   2. Compute baseline amount from batch pricing or MU_PLAN_PRICING constants
 *   3. Server-side coupon pre-check BEFORE Razorpay order (Pitfall 3 — FIX)
 *   4. Upsert shell user (Issue 5 FIX: always updates name; Issue 6 FIX: does not overwrite profile)
 *   5. Duplicate registration guard — PENDING returns existing row; PAID returns 409
 *   6. Insert Registration with paymentStatus=PENDING
 *   7. Create Razorpay order (amount = finalAmount * 100 paise)
 *   8. Return { registrationId, razorpayOrderId, amount, key }
 *
 * getRegistrationInvoice (GET /api/v1/registrations/:id/invoice):
 *   Auth-scoped: user can only fetch their own; admin can fetch any.
 *
 * ARCHITECTURE.md §9.2 + §23 + RESEARCH Pitfall 3 + T-05-04.
 */
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import { validateCoupon } from '../services/coupon.service.js';
import * as razorpayService from '../services/razorpay.service.js';

// ── Mission Udaan plan pricing constants ──────────────────────────────────────
// Arjun to confirm exact figures. These are defaults until the first batch row
// exists in the DB. Override via environment variables in production.
const MU_PLAN_PRICING = {
  MONTHLY:   parseInt(process.env.MU_PRICE_MONTHLY   ?? '2000',  10),
  QUARTERLY: parseInt(process.env.MU_PRICE_QUARTERLY ?? '5500',  10),
  ANNUAL:    parseInt(process.env.MU_PRICE_ANNUAL    ?? '20000', 10),
};

// Future Readiness default (single plan)
const FR_PLAN_PRICING = {
  INDIVIDUAL: parseInt(process.env.FR_PRICE_INDIVIDUAL ?? '3500', 10),
};

/**
 * Create a new registration + Razorpay order.
 * Body validated by registrationCreateSchema before reaching this handler.
 */
export async function createRegistration(req, res, next) {
  try {
    const {
      regType, fullName, partner2Name, email, phone, city, state,
      program, batchId, plan, age, occupation, dietaryNote, couponCode, consent,
      questionnaire,
    } = req.body;

    // ── 1. Batch validation (if batchId provided) ─────────────────────────────
    let batch = null;
    let isWaitlist = false;
    if (batchId) {
      batch = await prisma.batch.findUnique({ where: { id: batchId } });
      if (!batch) {
        return res.status(400).json({ error: 'Batch not found.' });
      }
      if (batch.status !== 'OPEN') {
        return res.status(400).json({ error: 'This batch is no longer open for registration.' });
      }
      if (batch.program !== program) {
        return res.status(400).json({ error: 'Batch program does not match registration program.' });
      }
      // Full batch → route to the waiting list instead of payment (handled below).
      if (batch.seatsBooked >= batch.totalSeats) {
        isWaitlist = true;
      }
    }

    // ── 2. Compute baseline amount ────────────────────────────────────────────
    let baselineAmount = 0;

    if (batch) {
      const planKey = plan.toUpperCase();
      if (planKey === 'INDIVIDUAL')       baselineAmount = Number(batch.priceIndividual);
      else if (planKey === 'COUPLE')      baselineAmount = Number(batch.priceCouple ?? batch.priceIndividual);
      else if (planKey === 'CORPORATE')   baselineAmount = Number(batch.priceCorporate ?? batch.priceIndividual);
      else                                baselineAmount = Number(batch.priceIndividual);
    } else if (program === 'MISSION_UDAAN') {
      const planKey = plan.toUpperCase();
      baselineAmount = MU_PLAN_PRICING[planKey] ?? MU_PLAN_PRICING.ANNUAL;
    } else if (program === 'FUTURE_READINESS') {
      baselineAmount = FR_PLAN_PRICING.INDIVIDUAL;
    } else {
      // ANTRANG or unknown — free or TBD; require batch for paid programs
      baselineAmount = 0;
    }

    // ── 3. Coupon pre-check (server-side, BEFORE Razorpay order) ─────────────
    // Pitfall 3: coupon MUST be validated before order creation.
    // The actual atomic increment happens in the webhook handler via applyCouponInTx.
    let discountAmount = 0;
    let finalAmount = baselineAmount;

    if (couponCode) {
      const couponResult = await validateCoupon({
        code: couponCode,
        program,
        amount: baselineAmount,
      });
      if (!couponResult.valid) {
        const reasonMap = {
          NOT_FOUND:      "That code isn't valid for this program.",
          EXPIRED:        'That code has expired.',
          EXHAUSTED:      'This code has reached its limit.',
          NOT_APPLICABLE: "That code isn't valid for this program.",
        };
        return res.status(400).json({
          errors: [{ field: 'couponCode', message: reasonMap[couponResult.reason] ?? 'Invalid coupon.' }],
        });
      }
      discountAmount = couponResult.discountAmount;
      finalAmount    = couponResult.finalAmount;
    }

    // ── 4. Upsert shell user ──────────────────────────────────────────────────
    // Issue 5 FIX: always update name from the form so OTP-created ghost users
    // (email-prefix placeholder name) get corrected on first registration.
    // Issue 6 FIX: do NOT update phone/city/state on update — unauthenticated
    // form fields must not silently overwrite an existing user's profile data.
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        name: fullName, // correct placeholder name set by OTP auto-account path
      },
      create: {
        email,
        name: fullName,
        phone,
        city: city ?? null,
        state: state ?? null,
        role: 'REGISTERED',
        emailVerified: false,
        passwordHash: null,
      },
    });

    // ── 5. Duplicate registration guard (Issue 1) ─────────────────────────────
    // Prevents the same user from accumulating multiple PENDING/PAID registrations
    // for the same batch+program (e.g. re-submitting the form after closing Razorpay).
    // PENDING case: return the existing row so the frontend can re-open checkout.
    // PAID case: hard 409 — do not allow a second payment.
    const existingReg = await prisma.registration.findFirst({
      where: {
        userId:        user.id,
        program,
        batchId:       batchId ?? null,
        paymentStatus: { in: ['PENDING', 'PAID'] },
        status:        'ACTIVE',
      },
      select: {
        id: true,
        paymentStatus: true,
        razorpayOrderId: true,
        finalAmount: true,
      },
    });

    if (existingReg) {
      if (existingReg.paymentStatus === 'PAID') {
        return res.status(409).json({
          error: 'ALREADY_REGISTERED',
          message: 'You are already registered for this batch. Check your email for the confirmation.',
        });
      }
      // PENDING — return the existing registration so the frontend re-opens Razorpay
      logger.info(
        { userId: user.id, registrationId: existingReg.id },
        'registration.duplicate.pending_reused'
      );
      return res.status(200).json({
        registrationId:  existingReg.id,
        razorpayOrderId: existingReg.razorpayOrderId,
        amount:          Number(existingReg.finalAmount),
        key:             process.env.RAZORPAY_KEY_ID ?? null,
      });
    }

    // ── 5b. Waiting list: batch full → create a WAITLISTED row, no payment. ────
    if (isWaitlist) {
      const existingWait = await prisma.registration.findFirst({
        where: { userId: user.id, program, batchId: batchId ?? null, status: 'WAITLISTED' },
        select: { id: true },
      });
      const waitReg = existingWait ?? await prisma.registration.create({
        data: {
          userId:        user.id,
          program,
          batchId:       batchId ?? null,
          regType,
          partner2Name:  partner2Name ?? null,
          plan,
          amount:        baselineAmount,
          couponCode:    couponCode ?? null,
          discountAmount,
          finalAmount,
          age:           age ?? null,
          occupation:    occupation ?? null,
          dietaryNote:   dietaryNote ?? null,
          questionnaire: questionnaire ?? null,
          paymentStatus: 'PENDING',
          status:        'WAITLISTED',
        },
      });
      logger.info({ userId: user.id, registrationId: waitReg.id, batchId }, 'registration.waitlisted');
      return res.status(201).json({
        waitlisted:     true,
        registrationId: waitReg.id,
        message:        "This batch is full — you're on the waiting list. We'll email you the moment a seat opens.",
      });
    }

    // ── 6. Create registration row with PENDING status ────────────────────────
    const registration = await prisma.registration.create({
      data: {
        userId:        user.id,
        program,
        batchId:       batchId ?? null,
        regType,
        partner2Name:  partner2Name ?? null,
        plan,
        amount:        baselineAmount,
        couponCode:    couponCode ?? null,
        discountAmount,
        finalAmount,
        age:           age ?? null,
        occupation:    occupation ?? null,
        dietaryNote:   dietaryNote ?? null,
        questionnaire: questionnaire ?? null,
        paymentStatus: 'PENDING',
      },
    });

    // ── 7. Create Razorpay order (amount in paise) ────────────────────────────
    // Razorpay sees finalAmount only — the discounted price is what the user pays.
    let razorpayOrderId = null;
    let rzpKey = process.env.RAZORPAY_KEY_ID ?? null;

    try {
      const order = await razorpayService.createOrder({
        amount:    Math.round(finalAmount * 100), // paise
        currency:  'INR',
        receiptId: registration.id,
        notes:     { program, plan, regType, userId: user.id },
      });
      razorpayOrderId = order.id;

      await prisma.registration.update({
        where: { id: registration.id },
        data:  { razorpayOrderId },
      });
    } catch (rzpErr) {
      // Razorpay not configured (test/local without keys) — return gracefully.
      // Frontend will show inline error on Pay button click.
      logger.warn({ err: rzpErr, registrationId: registration.id }, 'razorpay.order.create.failed');
    }

    // ── 8. Respond ────────────────────────────────────────────────────────────
    return res.status(201).json({
      registrationId:  registration.id,
      razorpayOrderId: razorpayOrderId,
      amount:          finalAmount,
      key:             rzpKey,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/registrations/:id/invoice
 * Returns the Cloudinary signed URL for the invoice PDF.
 * Auth-scoped: user can only access their own registration; admin can access any.
 */
export async function getRegistrationInvoice(req, res, next) {
  try {
    const { id } = req.params;
    const registration = await prisma.registration.findUnique({
      where: { id },
      select: { id: true, userId: true, invoiceUrl: true, invoiceNumber: true, paymentStatus: true },
    });

    if (!registration) {
      return res.status(404).json({ error: 'Registration not found.' });
    }

    // Ownership check — admin bypasses
    const requestingUser = req.user;
    if (requestingUser?.role !== 'ADMIN' && registration.userId !== requestingUser?.id) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    if (registration.paymentStatus !== 'PAID') {
      return res.status(400).json({ error: 'Invoice only available for paid registrations.' });
    }

    return res.status(200).json({
      invoiceUrl:    registration.invoiceUrl,
      invoiceNumber: registration.invoiceNumber,
    });
  } catch (err) {
    next(err);
  }
}
