# Environment Variables

Every variable Badlaav reads, where to get it, and whether it is required.

There are two `.env` files:

- **`backend/.env`** — server secrets (database, JWT, payments, email, media). Never committed. Copy from `backend/.envexample.example`.
- **`frontend/.env`** — only `VITE_*` keys. These are **public** — Vite inlines them into the browser bundle, so never put a secret here.

---

## Backend variables (`backend/.env`)

Sourced verbatim from `backend/.envexample.example`. Required means the app will not start or will fail core flows without it.

| Variable | Required? | Purpose | Where to get it | Example / placeholder |
|---|---|---|---|---|
| `DATABASE_URL` | Yes | Runtime DB connection. Use the Supabase **transaction pooler** (port 6543, `?pgbouncer=true&connection_limit=1`). | Supabase → Project Settings → Database → Connection String → Transaction pooler | `postgresql://postgres.PROJECTREF:PASSWORD@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1` |
| `DIRECT_URL` | Yes | Direct DB connection (port 5432, no PgBouncer) used **for migrations**. PgBouncer cannot run advisory locks. | Supabase → Database → Connection String → Session pooler | `postgresql://postgres.PROJECTREF:PASSWORD@aws-0-ap-south-1.pooler.supabase.com:5432/postgres` |
| `JWT_SECRET` | Yes | Signs access tokens (HS256). 64+ chars, unique per environment. | Generate: `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"` | `REPLACE_WITH_64_CHAR_RANDOM_STRING` |
| `JWT_REFRESH_SECRET` | Yes | Separate secret for refresh-token handling. **Must differ** from `JWT_SECRET`. | Generate a second time (same command). | `REPLACE_WITH_DIFFERENT_64_CHAR_RANDOM_STRING` |
| `BREVO_SMTP_USER` | Yes (for email) | Brevo SMTP login. | Brevo → SMTP & API → SMTP | `your-smtp-user@smtp-brevo.com` |
| `BREVO_SMTP_PASS` | Yes (for email) | Brevo SMTP key. | Brevo → SMTP & API → SMTP | `your-brevo-smtp-key` |
| `EMAIL_FROM_NAME` | Yes (for email) | Display name on outgoing email. | Set it. | `Badlaav` |
| `EMAIL_FROM_ADDRESS` | Yes (for email) | From address. **Must be a Brevo-verified sender** or mail lands in spam (DMARC). A free `@gmail.com` will fail. | Verify a sender on your domain in Brevo → Senders. | `noreply@iambadlaav.com` |
| `EMAIL_REPLY_TO` | Yes (for email) | Where replies route. | Set it. | `iambadlaav@gmail.com` |
| `RAZORPAY_KEY_ID` | Yes (for payments) | Razorpay API key id. `rzp_test_…` in test mode, `rzp_live_…` in live. | Razorpay → Settings → API Keys | `rzp_test_XXXXXXXXXXXXXXXXXX` |
| `RAZORPAY_KEY_SECRET` | Yes (for payments) | Razorpay API key secret. Shown once at generation. | Razorpay → Settings → API Keys | `REPLACE_WITH_RAZORPAY_SECRET` |
| `RAZORPAY_WEBHOOK_SECRET` | Yes (for payments) | Verifies webhook HMAC signatures. | Razorpay → Settings → Webhooks (set when creating the webhook). | `REPLACE_WITH_WEBHOOK_SECRET` |
| `CLOUDINARY_CLOUD_NAME` | Yes (for media) | Cloudinary cloud name. | Cloudinary → Settings → Access Keys | `your-cloud-name` |
| `CLOUDINARY_API_KEY` | Yes (for media) | Cloudinary API key. | Cloudinary → Settings → Access Keys | `your-api-key` |
| `CLOUDINARY_API_SECRET` | Yes (for media) | Cloudinary API secret. | Cloudinary → Settings → Access Keys | `your-api-secret` |
| `SENTRY_DSN_BACKEND` | Optional | Backend error tracking. Errors only go to Sentry when set. | Sentry → create Node project → Client keys (DSN) | `https://XXXX@oXXXX.ingest.sentry.io/XXXX` |
| `NODE_ENV` | Yes | `development` \| `production`. In production the refresh cookie becomes `secure`. | Set it. | `development` |
| `PORT` | Optional | Port Express listens on. Defaults to `4000`. | Set it (Railway injects its own). | `4000` |
| `APP_VERSION` | Optional | Reported by `/api/v1/health`. | Set it. | `dev` |
| `APP_URL` | Yes | Public site URL used in emails/notifications. | Set it. | `https://www.iambadlaav.com` |
| `ADMIN_EMAIL` | Yes | Where admin notifications are sent. | Set it. | `iambadlaav@gmail.com` |
| `ALLOWED_ORIGINS` | Yes | Comma-separated CORS allow-list (no spaces). Falls back to `http://localhost:5173` if unset. | Set it. | `http://localhost:5173,https://iambadlaav.com,https://www.iambadlaav.com` |
| `LOG_LEVEL` | Optional | Pino log level: `trace`\|`debug`\|`info`\|`warn`\|`error`\|`fatal`. Defaults to `info`. | Set it. | `info` |
| `FEATURE_SMS` | Optional (flag) | Master switch for SMS. SMS no-ops until this is `"true"` **and** `MSG91_AUTH_KEY` is set. | Set it. | `false` |
| `FEATURE_WHATSAPP` | Optional (flag) | Master switch for WhatsApp. No-ops until `"true"` **and** `MSG91_AUTH_KEY` set **and** an approved template exists. | Set it. | `false` |
| `MSG91_AUTH_KEY` | If SMS/WA on | MSG91 auth key. | MSG91 dashboard. | _(empty)_ |
| `MSG91_SENDER_ID` | If SMS on | MSG91 SMS sender id. | MSG91 dashboard. | _(empty)_ |
| `MSG91_SMS_FLOW_ID` | If SMS on | Default MSG91 SMS flow id. | MSG91 → Flows. | _(empty)_ |
| `MSG91_WA_INTEGRATED_NUMBER` | If WA on | MSG91 WhatsApp integrated number. | MSG91 → WhatsApp. | _(empty)_ |
| `MSG91_WA_CONFIRM_TEMPLATE` | If WA on | Approved WhatsApp confirmation template name. | MSG91 → WhatsApp → Templates. | _(empty)_ |
| `MSG91_SMS_WAITLIST_FLOW_ID` | Optional | Per-event SMS flow for waitlist invites. Falls back to `MSG91_SMS_FLOW_ID` if unset. | MSG91 → Flows. | _(empty)_ |
| `MSG91_WA_WAITLIST_TEMPLATE` | Optional | Approved WhatsApp template for waitlist invites (no fallback — WA needs its own). | MSG91 → WhatsApp → Templates. | _(empty)_ |
| `SEED_ADMIN_PASSWORD` | Seed only | Password for the seeded admin user (`iambadlaav@gmail.com`). Used only by `prisma db seed`. Change immediately after first deploy. | Set it. | `changeme-on-first-deploy` |

### Feature-flagged behaviour

- **SMS** is live only when `FEATURE_SMS="true"` **and** `MSG91_AUTH_KEY` is present. Otherwise every SMS call logs `sms.skipped` and returns `{ skipped: true }`.
- **WhatsApp** is live only when `FEATURE_WHATSAPP="true"` **and** `MSG91_AUTH_KEY` is present **and** the message uses an MSG91-approved template.
- **Backend Sentry** reports only when `SENTRY_DSN_BACKEND` is set.

---

## Frontend variables (`frontend/.env`)

All frontend env keys must be prefixed `VITE_` or Vite will not expose them. These ship to the browser — never put a secret here.

| Variable | Required? | Purpose | Where to get it | Example / placeholder |
|---|---|---|---|---|
| `VITE_RAZORPAY_KEY_ID` | Yes (for payments) | Public Razorpay key id used to open Checkout in the browser. The **secret never goes here**. | Razorpay → Settings → API Keys (the `rzp_test_…` / `rzp_live_…` **id**). | `rzp_test_XXXXXXXXXXXXXXXXXX` |
| `VITE_API_URL` | Optional | Base URL of the backend API. If unset, the app calls a relative `/api/v1` (same-origin / proxy). Set it when the backend is on a different host (e.g. Railway). The app appends `/api/v1`. | Your Railway backend URL. | `https://badlaav-backend.up.railway.app` |
| `VITE_GA_MEASUREMENT_ID` | Optional | Google Analytics 4 measurement id. Analytics stays off until set. | GA4 → Admin → Data Streams. | `G-XXXXXXXXXX` |

> `VITE_API_URL`: the code does `${VITE_API_URL}/api/v1`, so pass the host **without** the `/api/v1` suffix.
