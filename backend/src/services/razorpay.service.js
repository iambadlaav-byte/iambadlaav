/**
 * razorpay.service.js — Razorpay SDK wrapper.
 *
 * Exports:
 *   createOrder            — create a Razorpay order (amount in paise)
 *   verifyWebhookSignature — HMAC-SHA256 over raw Buffer, timingSafeEqual (Pattern 2)
 *   verifyClientCallback   — HMAC over orderId|paymentId for client-side callback UX
 *   refundPayment          — initiate a refund (used by Plan 07 admin)
 *
 * SECURITY: verifyWebhookSignature MUST receive req.body as Buffer (from express.raw).
 * Never call with JSON.stringify(req.body) — see RESEARCH Pitfall 2 + Anti-Patterns.
 *
 * ARCHITECTURE.md §23 + RESEARCH Pattern 2.
 */
import Razorpay from 'razorpay';
import crypto from 'crypto';

// Singleton client — lazily initialised so missing env vars don't crash at import time.
// The first actual call to createOrder/refundPayment will throw if keys are absent.
let _rzp = null;

function getRzpClient() {
  if (!_rzp) {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error(
        'Razorpay not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in backend/.env'
      );
    }
    _rzp = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return _rzp;
}

/**
 * Create a Razorpay order.
 *
 * @param {{ amount: number, currency?: string, receiptId: string, notes?: object }} opts
 *   amount  — in paise (INR × 100). Caller multiplies.
 * @returns {Promise<object>} Razorpay order object
 */
export async function createOrder({ amount, currency = 'INR', receiptId, notes = {} }) {
  const rzp = getRzpClient();
  return rzp.orders.create({
    amount,       // paise
    currency,
    receipt: receiptId.slice(0, 40), // Razorpay receipt max 40 chars
    notes,
  });
}

/**
 * Verify Razorpay webhook signature.
 * Uses crypto.timingSafeEqual — constant-time comparison prevents timing attacks.
 *
 * rawBody MUST be a Buffer (from express.raw middleware on the webhook route).
 * Do NOT pass JSON.stringify(req.body) — key ordering differs from what Razorpay signed.
 *
 * @param {Buffer} rawBody     — req.body from express.raw({ type: 'application/json' })
 * @param {string} sigHeader   — req.headers['x-razorpay-signature']
 * @returns {boolean}
 */
export function verifyWebhookSignature(rawBody, sigHeader) {
  if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
    throw new Error('RAZORPAY_WEBHOOK_SECRET not set in backend/.env');
  }
  if (!sigHeader || !Buffer.isBuffer(rawBody)) return false;

  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody) // Buffer — exactly what Razorpay signed
    .digest('hex');

  // Constant-time compare (T-05-01 timing-attack mitigation)
  const sigBuf = Buffer.from(sigHeader, 'hex');
  const expBuf = Buffer.from(expected, 'hex');

  if (sigBuf.length !== expBuf.length) return false;
  return crypto.timingSafeEqual(sigBuf, expBuf);
}

/**
 * Verify Razorpay client-side payment callback.
 * UX-only — NEVER updates payment state (T-05-13 — webhook is authoritative).
 *
 * @param {{ orderId: string, paymentId: string, signature: string }} opts
 * @returns {boolean}
 */
export function verifyClientCallback({ orderId, paymentId, signature }) {
  if (!process.env.RAZORPAY_KEY_SECRET) return false;

  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  const sigBuf = Buffer.from(signature || '', 'hex');
  const expBuf = Buffer.from(expected, 'hex');
  if (sigBuf.length !== expBuf.length) return false;
  return crypto.timingSafeEqual(sigBuf, expBuf);
}

/**
 * Initiate a refund.
 * Used by Plan 07 admin panel.
 *
 * @param {{ paymentId: string, amount: number, notes?: object }} opts
 *   amount — paise
 * @returns {Promise<object>} Razorpay refund object
 */
export async function refundPayment({ paymentId, amount, notes = {} }) {
  const rzp = getRzpClient();
  return rzp.payments.refund(paymentId, { amount, notes });
}
