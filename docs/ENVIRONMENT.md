# Environment Variables

Every variable the project uses, what it does, where to get it, and an example value.

The template with all these variables is [`.env.example`](../.env.example) at the repo root.

---

## How it works

There are **two** `.env` files:

| File | What's in it | Who sees it |
|---|---|---|
| `backend/.env` | Server secrets (database, API keys, JWT) | Only the server — never the browser |
| `frontend/.env` | Only `VITE_*` values (public keys) | **Visible in the browser** — never put secrets here |

> ⚠️ After editing either `.env` file, you must **restart the dev server** for changes to take effect. In production, `VITE_*` values are baked in at **build time** — Vercel must **rebuild** to pick them up.

---

## Backend variables (`backend/.env`)

### Database — Supabase (required)

You need **two** URLs from the Supabase dashboard (**Project Settings → Database → Connect**):

| Variable | What it is | Where to get it | Port |
|---|---|---|---|
| `DATABASE_URL` | Runtime queries. Used by every Prisma call from Express. | **Transaction pooler** | **6543** |
| `DIRECT_URL` | Schema operations (`prisma migrate deploy`, `prisma db push`, seed). | **Session pooler** | **5432** |

**Example:**
```bash
DATABASE_URL="postgresql://postgres.PROJECTREF:PASSWORD@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres.PROJECTREF:PASSWORD@aws-1-ap-south-1.pooler.supabase.com:5432/postgres"
```

> 🆓 **Free-tier note:** `db.<ref>.supabase.co` is **IPv6-only** on Supabase free and unreachable from Railway/Vercel. **Always use the pooler hostname** (`*.pooler.supabase.com`).

> ⚠️ **`DATABASE_URL` MUST end with `?pgbouncer=true&connection_limit=1`.** Without these params Prisma will try to use prepared statements through PgBouncer's transaction pooler and crash with `prepared statement "s0" already exists`.

> ⚠️ **URL-encode special characters in your password:**
> - `@` → `%40`
> - `#` → `%23`
> - `:` → `%3A`
>
> An unencoded `@` is the **#1 cause** of "password authentication failed" errors.

---

### Auth secrets (required)

| Variable | What it is | How to generate it | Example |
|---|---|---|---|
| `JWT_SECRET` | Signs 1-hour access tokens | Run: `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"` | `kQ8...` (64+ chars) |
| `JWT_REFRESH_SECRET` | Signs 7-day refresh tokens. **Must be different from JWT_SECRET.** | Run the same command again | `9rT...` (64+ chars) |

> Generate **fresh** secrets for each environment (dev/staging/prod). Never reuse them.

---

### Email — Brevo SMTP (required for emails)

| Variable | What it is | Where to get it | Example |
|---|---|---|---|
| `BREVO_SMTP_USER` | Your Brevo SMTP username | Brevo → SMTP & API → SMTP | `name@smtp-brevo.com` |
| `BREVO_SMTP_PASS` | Your Brevo SMTP **key** (NOT your account login password!) | Same place | `xsmtpsib-...` |

> ⚠️ You must verify a sender identity/domain in Brevo, or your emails will be rejected.
> 🆓 **Free tier:** 300 emails / day.

---

### Payments — Razorpay (required for registration)

| Variable | What it is | Where to get it | Example |
|---|---|---|---|
| `RAZORPAY_KEY_ID` | Razorpay API key. Use **test** keys during development. | Dashboard → Settings → API Keys | `rzp_test_ABC123` |
| `RAZORPAY_KEY_SECRET` | Razorpay secret key. **Backend only.** | Generated alongside the key ID | `xxxxxxxx` |
| `RAZORPAY_WEBHOOK_SECRET` | Secret you set when creating the Razorpay webhook. Required in production. | Dashboard → Settings → Webhooks → the secret you set | `whsec_...` |

---

### Media — Cloudinary (required for uploads)

| Variable | What it is | Where to get it | Example |
|---|---|---|---|
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name (public) | Cloudinary → Account Details | `dnyanpith` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Same place | `123456789012345` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret. **Backend only.** | Same place | `xxxxxxxx` |

---

### Error tracking — Sentry (optional)

| Variable | What it is | Where to get it | Example |
|---|---|---|---|
| `SENTRY_DSN_BACKEND` | Sentry DSN for the backend. Leave blank to disable. | Sentry → create a **Node.js** project → Client Keys (DSN) | `https://...@oXX.ingest.sentry.io/XX` |

---

### App configuration

| Variable | What it is | Example |
|---|---|---|
| `NODE_ENV` | `development` for local, `production` for deployed | `development` |
| `PORT` | Backend port. In Railway, **Railway sets this automatically — do not set it yourself.** | `4000` |
| `APP_VERSION` | Shown in the health endpoint payload | `dev` |
| `ALLOWED_ORIGINS` | Which frontend URLs may call the API. Comma-separated, **no spaces**. | `http://localhost:5173,https://badlaav.dnyanpith.org` |
| `LOG_LEVEL` | Pino log level: `trace`, `debug`, `info`, `warn`, `error`, `fatal` | `info` |
| `RUN_CRONS` | Set to `"true"` on exactly **one** Railway service. Other instances skip cron startup to avoid duplicate emails. | `true` |
| `SEED_ADMIN_PASSWORD` | Password for the admin user created by `prisma:seed` | `change-me` |

---

## Frontend variables (`frontend/.env`) — all `VITE_*`

These values are **baked into the JavaScript bundle at build time** and visible in the browser. Never put secrets here.

| Variable | What it is | Example |
|---|---|---|
| `VITE_API_URL` | Backend URL. Local dev: `http://localhost:4000`. Production: your Railway URL. | `http://localhost:4000` |
| `VITE_RAZORPAY_KEY_ID` | **Public** Razorpay key (same value as `RAZORPAY_KEY_ID`). Never the secret. | `rzp_test_ABC123` |
| `VITE_CLOUDINARY_CLOUD_NAME` | Public cloud name, used for building image URLs. | `dnyanpith` |
| `VITE_SENTRY_DSN` | Sentry DSN for the **React** frontend (different from the backend one). Blank to disable. | `https://...@oXX.ingest.sentry.io/YY` |
| `VITE_SENTRY_ENVIRONMENT` | Tag for Sentry events. | `development` |

> ⚠️ Changing a `VITE_*` value in Vercel requires a **redeploy** — the values are compiled into the bundle. Restarting the runtime does nothing.

---

## Security checklist

Before deploying, make sure:

- [x] `.env` files are git-ignored — never commit them
- [x] Secrets (`*_SECRET`, `*_PASS`, `JWT_*`, `DATABASE_URL`) are **only** in `backend/.env` or host dashboards — never in `frontend/.env`, never in `.env.example`
- [x] Production uses **different** secrets from dev (don't reuse JWT secrets across envs)
- [x] **Live** Razorpay keys (`rzp_live_…`) are only used at launch after KYC is complete
- [x] In production, all variables are set in the **Railway** (backend) and **Vercel** (frontend) dashboards, not in files
- [x] If a secret ever leaks into git history (including `.env.example`), **rotate it immediately** — git history is forever

See [DEPLOYMENT.md](DEPLOYMENT.md) for how to set these in production.
