# Troubleshooting

Common problems and the actual fix. Most "bugs" here are configuration, not code.

---

## Emails land in spam (or don't arrive)

**Cause:** `EMAIL_FROM_ADDRESS` is not a Brevo-verified sender, so it fails DMARC. A free `@gmail.com` from-address will always fail.

**Fix:**
1. Verify a sender / authenticate your domain in Brevo (SPF + DKIM + DMARC). See [BREVO_SETUP.md](BREVO_SETUP.md).
2. Set `EMAIL_FROM_ADDRESS` to that verified address (e.g. `noreply@iambadlaav.com`).
3. Keep `EMAIL_REPLY_TO` as your reply inbox (`iambadlaav@gmail.com`).

Note: a green `/api/v1/health` does **not** prove email works (it deliberately skips the SMTP handshake). Send a real test (request an OTP).

---

## Payment succeeds but registration stays PENDING

**Cause:** the Razorpay webhook isn't reaching the backend or fails verification. Payment status is set **only** by the webhook, never the browser.

**Check, in order:**
1. **Webhook URL** is exactly `https://<backend-host>/api/v1/payments/webhook`.
2. **`RAZORPAY_WEBHOOK_SECRET`** on the backend equals the secret set in the Razorpay webhook config.
3. **Mode match** — test keys need a test webhook; live keys need a live webhook.
4. **Raw body intact** — nothing (proxy/middleware) is consuming the request body before the webhook handler. `app.js` mounts `express.raw()` on the webhook path before `express.json()`; don't add anything in front of it.
5. The right **events** are enabled (`payment.captured`, `payment.failed`).

See [RAZORPAY_SETUP.md](RAZORPAY_SETUP.md).

---

## Migrations fail / hang

**Cause:** running migrations against the pooler URL (port 6543). PgBouncer doesn't support the advisory locks Prisma needs.

**Fix:** run migrations against the **direct** URL (`DIRECT_URL`, port 5432):

```bash
# PowerShell
$env:DATABASE_URL="<DIRECT_URL, port 5432>"; npx prisma migrate deploy
```

On Railway this is already handled by `preDeployCommand` (`DATABASE_URL="$DIRECT_URL" npx prisma migrate deploy`). See [SUPABASE_SETUP.md](SUPABASE_SETUP.md).

---

## CORS errors in the browser console

Symptom: `Access-Control-Allow-Origin` errors; API calls fail from the live site.

**Cause:** the site's domain isn't in the backend's `ALLOWED_ORIGINS`.

**Fix:** set `ALLOWED_ORIGINS` (comma-separated, **no spaces**) to include every domain the frontend is served from, then redeploy the backend:

```
ALLOWED_ORIGINS="https://iambadlaav.com,https://www.iambadlaav.com"
```

If unset, the backend only allows `http://localhost:5173`.

---

## Razorpay key missing on the frontend / Checkout won't open

**Cause:** `VITE_RAZORPAY_KEY_ID` isn't set at build time on Vercel.

**Fix:** set `VITE_RAZORPAY_KEY_ID` (the public `rzp_…` **id**, not the secret) in Vercel env vars and **redeploy** — Vite bakes env vars in at build time, so a redeploy is required after changing them.

---

## Frontend can't reach the backend (404s / network errors on API calls)

**Cause:** `VITE_API_URL` is wrong or missing when frontend and backend are on different hosts.

**Fix:** set `VITE_API_URL` to the Railway backend host **without** `/api/v1` (the app appends it). Redeploy. If frontend and backend share an origin/proxy you can leave it blank to use the relative `/api/v1`.

---

## Vercel build succeeds but the site is blank / 404 on refresh

**Two things to check:**
1. **Output dir** — the build outputs to `dist/` at the **repo root**, and `vercel.json` sets `outputDirectory: "dist"`. Don't override it in the dashboard.
2. **SPA routing** — `vercel.json` has a rewrite sending all paths to `/index.html`. If deep links 404 on refresh, that rewrite is missing or overridden.

---

## SMS / WhatsApp not arriving (no error anywhere)

**Cause:** they're off by design until enabled. Both channels no-op silently when disabled or misconfigured.

**Check:**
1. `FEATURE_SMS="true"` and/or `FEATURE_WHATSAPP="true"`.
2. `MSG91_AUTH_KEY` is set (required for either channel).
3. SMS also needs `MSG91_SMS_FLOW_ID` + `MSG91_SENDER_ID`.
4. WhatsApp also needs `MSG91_WA_INTEGRATED_NUMBER` + an **approved** template (`MSG91_WA_CONFIRM_TEMPLATE`, and `MSG91_WA_WAITLIST_TEMPLATE` for waitlist — no fallback).
5. The phone number must be a valid 10-digit Indian mobile (normalised to `91XXXXXXXXXX`).

Logs show `sms.skipped.*` / `whatsapp.skipped.*` telling you which condition failed. See [MSG91_SETUP.md](MSG91_SETUP.md).

---

## Image upload rejected (415)

**Cause:** the file isn't a real JPG/PNG/WEBP, is over 2 MB, or its bytes don't match its claimed type (magic-byte check).

**Fix:** upload a genuine JPG/PNG/WEBP under 2 MB. Renaming a `.gif`/`.pdf` to `.jpg` won't pass — the backend inspects the actual file bytes.

---

## Locked out after failed logins

**Cause:** auth lockout — 5 failed attempts triggers a 30-minute lock per account.

**Fix:** wait out the lockout, or have an Admin reset the password (Settings → reset user password).
