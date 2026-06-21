# Razorpay Setup — Payments

Razorpay handles online payments. The backend treats the **webhook** as the source of truth for payment status — never the browser callback.

---

## Test vs live keys

- **Test mode** keys start with `rzp_test_…`. Use them on local/staging. No real money moves.
- **Live mode** keys start with `rzp_live_…`. Use them only in production after KYC is approved.

Each mode has its own key pair **and** its own webhook + webhook secret. Switching modes means switching both the keys and the webhook secret.

---

## Where the keys come from

Razorpay Dashboard → Settings → API Keys → Generate Key.

| Value | Env var (backend) | Notes |
|---|---|---|
| Key Id | `RAZORPAY_KEY_ID` | Also goes on the frontend as `VITE_RAZORPAY_KEY_ID` (public). |
| Key Secret | `RAZORPAY_KEY_SECRET` | Shown **once** at generation. Backend only — never expose. |
| Webhook Secret | `RAZORPAY_WEBHOOK_SECRET` | Created when you add the webhook (below). |

### Frontend
Set `VITE_RAZORPAY_KEY_ID` (the **id**, not the secret) on Vercel. The browser uses it to open Razorpay Checkout. The secret stays server-side only.

---

## Configure the webhook

You need the backend's public URL first (see [RAILWAY_DEPLOYMENT.md](RAILWAY_DEPLOYMENT.md)).

1. Razorpay → Settings → Webhooks → Add New Webhook.
2. **Webhook URL:**
   ```
   https://<your-backend-host>/api/v1/payments/webhook
   ```
3. **Secret:** enter a strong random string. Copy the **same** value into `RAZORPAY_WEBHOOK_SECRET` on the backend. The backend verifies every webhook's HMAC signature against this secret.
4. **Active events:** at minimum
   - `payment.captured` — payment succeeded; backend marks the registration PAID, assigns a candidate id, generates the invoice, sends confirmation email.
   - `payment.failed` — payment failed; backend records the failure (and may trigger recovery follow-up).
5. Save.

> Set the webhook in the **same mode** as your keys. A live webhook will not fire for test payments and vice-versa.

---

## How payment status is trusted

- The browser callback (`POST /api/v1/payments/verify`) is **UX only** — it shows the user a success/failure screen but never changes payment state.
- The real state transition happens in the webhook handler, after signature verification. This is why the webhook URL and secret must be correct in production, or paid registrations will stay stuck on PENDING.

### Signature verification + replay protection
- Each webhook delivery is HMAC-verified against `RAZORPAY_WEBHOOK_SECRET`. A bad/missing signature is rejected.
- Every processed event id is recorded in a `ProcessedWebhook` table with a unique constraint on the event id, so a re-delivered (replayed) event is processed at most once.
- The webhook route uses the **raw request body** for signature checking — see the raw-body note in [RAILWAY_DEPLOYMENT.md](RAILWAY_DEPLOYMENT.md). It is intentionally **not** rate-limited.

---

## Quick test

1. With test keys + test webhook configured, complete a registration and pay using a Razorpay test card.
2. Watch the backend logs for the webhook hit and the registration flipping to PAID.
3. If it stays PENDING, check: webhook URL exactly `/api/v1/payments/webhook`, `RAZORPAY_WEBHOOK_SECRET` matches, and no proxy is consuming the raw body. See [TROUBLESHOOTING.md](TROUBLESHOOTING.md).
