# Security Posture

What the Badlaav backend actually implements. Every item below is verified against the code, not aspirational.

---

## HTTP headers — Helmet

`helmet()` is applied first in the middleware stack with an explicit Content-Security-Policy:

- `default-src 'self'`.
- `script-src` allows only self + `checkout.razorpay.com` + `googletagmanager.com`.
- `style-src` self + inline + Google Fonts; `font-src` self + Google Fonts.
- `img-src` self + `data:` + `res.cloudinary.com` + YouTube thumbnails.
- `connect-src` self + `api.razorpay.com` + Sentry ingest.
- `frame-src` YouTube + Google Maps + Razorpay.
- `crossOriginEmbedderPolicy: false` (required for Cloudinary delivery).

`app.set('trust proxy', 1)` is set so `req.ip`, secure-cookie negotiation, and per-IP rate limiting work behind Railway/Vercel/Cloudflare.

## CORS allow-list

CORS is an explicit allow-list from `ALLOWED_ORIGINS` (comma-separated). It is **never** `'*'`. `credentials: true` is set so the httpOnly refresh cookie can be sent. Unset `ALLOWED_ORIGINS` falls back to `http://localhost:5173` only.

## Input validation — Zod everywhere

Every user-input endpoint validates with a Zod schema via the `validate` middleware before the controller runs. Admin write routes validate against shared schemas from `@dnyanpith/validators` (one schema, used by both frontend and backend). Query params are validated too (e.g. reports/reconciliation).

## Rate limiting

`express-rate-limit` with IPv6-safe keying (collapses IPv6 to a /64 so an attacker can't rotate within a /64):

| Limiter | Scope | Limit |
|---|---|---|
| OTP request (per email) | email | 3 / 15 min |
| OTP request (per IP) | IP | 10 / 15 min |
| OTP verify | IP | 10 / 15 min |
| Password login | IP | 5 / 15 min |
| Admin login | IP | 5 / 15 min |
| Form submit | IP | 5 / hour |
| Coupon validate | IP | 20 / min |
| Profile photo upload | user id | 5 / hour |
| Public read | IP | 120 / min |
| Admin refund | IP | 10 / hour |

The Razorpay webhook is intentionally **not** rate-limited (Razorpay retries on non-2xx; the signature check is the gate).

## RBAC on every admin route

Every `/api/v1/admin/*` route inherits `authenticate → requireAuth → requireStaff` (any staff tier may read). Writes layer on:

- `requireEditor` (ADMIN or CONTRIBUTOR) for content/ops writes — enquiries, volunteers, registrations status, stories, gallery, blog, events, invoice resend, waitlist invite.
- `requireAdmin` for money and structure — manual mark-paid/refunded, refunds, batches, coupons, and all staff-user management (create/role/reset-password/anonymize).

Revenue/amounts are additionally gated **inside** controllers via `canSeeFinancials` (ADMIN only) — Contributors and Viewers get counts without money. RBAC is enforced at the route level, never only in the UI.

Role matrix: **ADMIN** = full (financials, batches, users, refunds). **CONTRIBUTOR** = ops/content, no money/batches/users. **VIEWER** = read-only, no financials.

## Passwords — bcrypt cost 12

Passwords are hashed with bcrypt at cost factor **12** (seed + auth paths). Plaintext passwords are never stored or logged.

## Sessions — JWT access + rotating refresh

- **Access token:** HS256 JWT, **1 hour** expiry, payload `{ sub, role }`, signed with `JWT_SECRET`.
- **Refresh token:** opaque random token (not a JWT), **7 day** expiry, stored **hashed** (sha256) at rest, delivered in an httpOnly cookie.
- Cookie flags: `httpOnly: true`, `sameSite: 'strict'`, `secure` in production (`NODE_ENV === 'production'`), `maxAge` 7 days.
- Refresh tokens **rotate** on use; reuse of an old token is treated as compromise and revokes the token family.

## OTP — sha256, short-lived, lockout

- 6-digit code, **10-minute** expiry, single-use (`used` flag).
- Only the **sha256 hash** of the code is stored; the plaintext is emailed and never persisted.
- Auth lockout (shared across OTP and password paths): **5** failed attempts → **30-minute** lock, tracked atomically via `failedLoginAttempts` + `lockedUntil` on the user.

## Razorpay webhook — signature + replay guard

- Every webhook delivery is HMAC-verified against `RAZORPAY_WEBHOOK_SECRET` using the **raw** request body (`express.raw()` mounted on the webhook path before `express.json()`).
- Each event id is recorded in `ProcessedWebhook` with a **unique constraint**, so a replayed/re-delivered event is processed at most once.
- Payment state changes only via the webhook — the browser callback (`/payments/verify`) is UX-only and never mutates payment state.

## File uploads — magic-byte verification

Two-layer defence (`multer` memoryStorage + `file-type`):

1. MIME allow-list at upload (`image/jpeg`, `image/png`, `image/webp`).
2. **2 MB** hard size cap, single file.
3. `verifyMagicBytes` reads the actual file signature and rejects (`415`) if the type can't be determined, isn't allowed, or doesn't match the declared MIME (polyglot / spoof).

Files are kept in memory and never written to disk before verification. Cloudinary's `f_auto` re-encode strips EXIF/GPS on upload.

## Secrets are never logged

Pino is configured to **redact** `Authorization` and `Cookie` headers. The codebase rule is no secrets in logs; services avoid logging keys, buffers, or credentials. Backend uses the Pino logger (no `console.log` in committed code).

## GDPR — anonymize, not delete

Users are **soft-deleted / anonymized**, never hard-deleted (`deletedAt` on the user; admin "anonymize" action). Anonymization also deletes the user's Cloudinary media (right-to-erasure). Sensitive admin actions are recorded in an `AuditLog` table (actor, action, subject, IP, metadata).

---

## Operational hardening checklist (deploy-time)

- [ ] `NODE_ENV=production` so the refresh cookie is `secure`.
- [ ] `JWT_SECRET` and `JWT_REFRESH_SECRET` are long, random, and **different**.
- [ ] `ALLOWED_ORIGINS` lists only the real frontend domains.
- [ ] `RAZORPAY_WEBHOOK_SECRET` matches the Razorpay webhook config.
- [ ] `EMAIL_FROM_ADDRESS` is a verified Brevo sender.
- [ ] `SEED_ADMIN_PASSWORD` was strong and the admin password was changed after first login.
- [ ] Secrets live only in Railway/Vercel variables — never in git.
