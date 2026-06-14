/**
 * payments.routes.js
 *
 * POST /api/v1/payments/webhook      — Razorpay webhook (NO rate limit, raw body)
 * POST /api/v1/payments/create-order — re-create order for abandoned checkout (auth)
 * POST /api/v1/payments/verify       — client callback verify UX-only (auth)
 *
 * CRITICAL: The webhook route must NOT have express.json() upstream.
 * express.raw({ type: 'application/json' }) is registered in app.js on this
 * exact path BEFORE the global express.json() — see RESEARCH Pattern 1 / Pitfall 2.
 *
 * NO rate-limit on webhook: Razorpay retries on non-2xx; signature check (T-05-01)
 * is the gate against abuse.
 */
import { Router } from 'express';
import { authenticate, requireAuth } from '../../middleware/auth.js';
import {
  handleWebhook,
  createOrderForExisting,
  verifyPayment,
} from '../../controllers/payments.controller.js';

const router = Router();

// Webhook — no middleware except what app.js already mounted (express.raw + helmet)
router.post('/payments/webhook', handleWebhook);

// Re-create Razorpay order for existing PENDING registration
router.post('/payments/create-order', authenticate, requireAuth, createOrderForExisting);

// Client callback verify — UX-only; never updates payment state (T-05-13)
router.post('/payments/verify', authenticate, requireAuth, verifyPayment);

export default router;
