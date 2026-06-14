# Deployment Guide

How to put Badlaav on the internet. Follow these steps **in order**.

You will use three services — **all on free tiers**:
- **Supabase** — PostgreSQL database (free tier, 500 MB)
- **Railway** — runs the backend Express API (free trial credit)
- **Vercel** — hosts the React frontend (Hobby plan)

---

## Before you start

Make sure you have:
- [ ] Your code pushed to a **GitHub repository**
- [ ] The five service accounts from [SETUP.md](SETUP.md) (Supabase, Razorpay, Brevo, Cloudinary, Sentry)
- [ ] The app working locally
- [ ] An **initial migration** committed at `backend/prisma/migrations/` (the repo ships with one; if you change the schema, run `npm run prisma:migrate -- --name <change>` and commit the new folder)

### Push your code to GitHub

```bash
git init
git add .
git commit -m "Badlaav site"
git remote add origin <your-repo-url>
git push -u origin main
```

> ⚠️ Check that `.env` files and `node_modules/` are **NOT** in your commit. The `.gitignore` already covers them.

---

## Step 1 — Set up the production database (Supabase)

1. Go to [supabase.com](https://supabase.com) → create a **new project** for Badlaav (don't reuse your dev project).
2. Pick region **Mumbai (ap-south-1)** for lowest latency to Indian users.
3. Set a strong database password — **save it somewhere**.
4. Get **two** connection strings from **Project Settings → Database → Connect**:
   - **Transaction pooler** (port **6543**) → this becomes your `DATABASE_URL`
   - **Session pooler** (port **5432**) → this becomes your `DIRECT_URL`
5. URL-encode special characters in the password:
   - `@` → `%40`, `#` → `%23`, `:` → `%3A`

> 🆓 **Free-tier note:** `db.<ref>.supabase.co` is **IPv6-only** on the free tier and unreachable from Railway/Vercel. **Always use the pooler hostnames** (`aws-1-ap-south-1.pooler.supabase.com`). That's what the URLs above already point at.

### Apply the schema to your production database

From your local machine (which has the migration files):

```bash
cd backend
DATABASE_URL="<your-prod-DIRECT_URL>" npx prisma migrate deploy
```

> Migrations are now version-controlled in `backend/prisma/migrations/` and applied with `prisma migrate deploy`. **Never use `prisma db push` against production** — it's destructive on schema drift.

Optionally seed initial data (admin user, sample batch, WELCOME500 coupon):

```bash
DATABASE_URL="<your-prod-DIRECT_URL>" SEED_ADMIN_PASSWORD="<strong-password>" npm run prisma:seed
```

---

## Step 2 — Deploy the backend to Railway

1. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**.

2. **Critical settings on the service:**
   - **Root Directory:** leave **empty** (repo root). The `railway.json` + `nixpacks.toml` at the root handle the monorepo. Setting it to `backend/` will break the `@dnyanpith/validators` workspace package.
   - The `railway.json` tells Railway to:
     - Build: `npm install && npm --workspace=backend run prisma:generate`
     - Start: `npm --workspace=backend run migrate:deploy && npm --workspace=backend run start`
     - Healthcheck: `GET /api/v1/health` (returns **503** when the DB is down so Railway correctly fails the deploy)

3. **Set environment variables** in Railway → Service → **Variables**:

   | Variable | Value | Notes |
   |---|---|---|
   | `DATABASE_URL` | Supabase **transaction pooler** URL (port 6543) | Must end with `?pgbouncer=true&connection_limit=1` |
   | `DIRECT_URL` | Supabase **session pooler** URL (port 5432) | Used by `migrate deploy` at startup |
   | `JWT_SECRET` | A fresh 64-char random string | Generate per SETUP.md |
   | `JWT_REFRESH_SECRET` | A **different** 64-char random string | Must differ from `JWT_SECRET` |
   | `BREVO_SMTP_USER` | Brevo SMTP username | |
   | `BREVO_SMTP_PASS` | Brevo SMTP **key** (not your login password) | starts with `xsmtpsib-` |
   | `RAZORPAY_KEY_ID` | Razorpay key (test or live) | |
   | `RAZORPAY_KEY_SECRET` | Razorpay secret | |
   | `RAZORPAY_WEBHOOK_SECRET` | Set this after Step 4c | |
   | `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | |
   | `CLOUDINARY_API_KEY` | Cloudinary API key | |
   | `CLOUDINARY_API_SECRET` | Cloudinary secret | |
   | `SENTRY_DSN_BACKEND` | Sentry DSN (or blank) | |
   | `NODE_ENV` | `production` | |
   | `APP_VERSION` | `1.0.0` (or your version) | |
   | `LOG_LEVEL` | `info` | |
   | `ALLOWED_ORIGINS` | `https://your-vercel-domain.vercel.app` | Set after Step 3 |
   | `RUN_CRONS` | `true` | Set on **exactly one** service — leave at `true` on free tier (single instance) |

   > **Do NOT set `PORT`** — Railway injects it automatically.

4. Click **Deploy**. Watch the build logs.
5. Note your Railway public URL (e.g. `https://badlaav-api.up.railway.app`).
6. Test it: open `https://<your-railway-url>/api/v1/health`. You should see:
   ```json
   { "status": "ok", "database": "connected", "razorpay": "reachable" }
   ```
   A 503 with `"database": "down"` means `DATABASE_URL` is wrong or Supabase is paused (free tier pauses after 7 days of inactivity — open the Supabase dashboard to wake it).

### How the Railway build works

- `nixpacks.toml` pins **Node 20 LTS** so Prisma 7 has a known runtime.
- `npm install` from the repo root installs all workspaces and links the shared `@dnyanpith/validators` package.
- `prisma generate` runs **inside the backend workspace** so the Prisma client and the pg driver adapter are emitted before app start.
- `migrate deploy` runs once at container start, applies any new migrations, and exits. Then `node src/server.js` boots.

---

## Step 3 — Deploy the frontend to Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project** → **Import** your GitHub repo.

2. **Critical settings on the import screen:**

   | Setting | What to choose |
   |---|---|
   | **Root Directory** | Leave empty / `.` (repo root). Do **NOT** set to `frontend/`. |
   | **Framework Preset** | **Vite** (not Next.js) |
   | **Build Command** | Leave default — `vercel.json` handles it |
   | **Output Directory** | Leave default — `vercel.json` handles it |
   | **Install Command** | Leave default — `vercel.json` handles it |

   > ⚠️ The project is a monorepo with shared packages. Setting root directory to `frontend/` makes `@dnyanpith/validators` unresolvable and the build will fail.

3. **Set environment variables** in Vercel → Project → Settings → Environment Variables (apply to **Production** environment):

   | Variable | Value |
   |---|---|
   | `VITE_API_URL` | Your Railway backend URL (e.g. `https://badlaav-api.up.railway.app`) |
   | `VITE_RAZORPAY_KEY_ID` | Public Razorpay key (test or live) |
   | `VITE_CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name |
   | `VITE_SENTRY_DSN` | Sentry React DSN (or blank) |
   | `VITE_SENTRY_ENVIRONMENT` | `production` |

   > ⚠️ `VITE_*` values are **baked into the bundle at build time**. If you change `VITE_API_URL` you must **redeploy** Vercel — restarting the runtime doesn't pick it up.

4. Click **Deploy**.
5. (Optional) add a custom domain in Settings → Domains.

### How the Vercel build works

`vercel.json` tells Vercel:
- Install: `npm install` from the repo root → all workspaces install, validators link.
- Build: `npm run build` → which runs `vite build` inside `frontend/`.
- Output: `dist/` at the **repo root** (Vite's `outDir: ../dist`).
- All routes rewrite to `/index.html` so React Router controls navigation.

---

## Step 4 — Wire everything together

### 4a. Tell the backend about the frontend (CORS)
In **Railway** → Variables → update `ALLOWED_ORIGINS`:
```
https://yourdomain.com,https://www.yourdomain.com,https://<your-vercel-preview>.vercel.app
```
No spaces between entries. Redeploy the backend.

### 4b. Tell the frontend about the backend
In **Vercel** → Settings → Environment Variables → confirm `VITE_API_URL` is your Railway URL. **Redeploy** if you changed it (env-var changes only apply on the next build).

### 4c. Set up the Razorpay webhook
1. **Razorpay Dashboard → Settings → Webhooks** → **Add New Webhook**.
2. URL: `https://<your-railway-url>/api/v1/payments/webhook`
3. Pick events: `payment.captured`, `payment.failed`, `order.paid`.
4. Set a webhook secret → save it.
5. In **Railway** → Variables → set `RAZORPAY_WEBHOOK_SECRET`.
6. Redeploy the backend.

### 4d. Switch to live Razorpay keys (when ready)
- Complete Razorpay KYC.
- Replace `rzp_test_` with `rzp_live_` keys in **both** Railway and Vercel.
- Redeploy both.

---

## Step 5 — Smoke test

| # | What to check | Expected |
|---|---|---|
| 1 | `https://<your-api>/api/v1/health` | `200 OK`, JSON `"status": "ok"`, `"database": "connected"` |
| 2 | Open your frontend domain | Site loads, Network tab shows API calls to your Railway URL, **no CORS errors** |
| 3 | Submit the contact form | Success message, new row in the database |
| 4 | Test registration with a [Razorpay test card](https://razorpay.com/docs/payments/payments/test-card-details/) | Registration becomes `PAID`, webhook fires, confirmation email + invoice arrive |

---

## Step 6 — Ongoing operations

| Topic | What to know |
|---|---|
| **Schema changes** | Locally: edit `schema.prisma`, then `npx prisma migrate dev --name <change>`. Commit the new `migrations/` folder. Railway runs `migrate deploy` automatically on next deploy. |
| **Rolling back a migration** | Restore the previous schema and create a forward migration. Never edit applied migration SQL — write a new migration that undoes it. |
| **Rate limiting** | In-memory; resets on restart. For multi-instance use, add Redis (Upstash free tier). |
| **Rotating secrets** | Change in Railway/Vercel dashboards. Never commit. |
| **Sentry** | Captures backend + frontend errors if DSNs are set. |
| **Bundle size** | One JS chunk (~215 KB gzip). Lazy-load routes with `React.lazy` to shrink. |

---

## Free-tier gotchas (read before launch)

| Service | Constraint | What it means |
|---|---|---|
| **Supabase free** | Project **pauses** after 7 days of inactivity | First request after a pause takes ~30s while the project boots. Health check returns 503 until then. **Open the Supabase dashboard once a week.** |
| **Supabase free** | `db.<ref>.supabase.co` is **IPv6-only** | Railway can't reach it. **Always use the pooler hostname** (`*.pooler.supabase.com`). The example URLs in `.env.example` already do. |
| **Supabase free** | 500 MB storage, 2 GB egress / month | Audit logs and images add up. Plan to migrate or upgrade before launch. |
| **Railway free trial** | $5 credit, no recurring free tier | Once credit is used, the service stops. Set up a payment method or migrate. |
| **Railway** | Single instance (no autoscale on free) | Cron jobs run on the one instance. `RUN_CRONS=true` is safe. |
| **Vercel Hobby** | Non-commercial use | Fine for the marketing site / launch. Upgrade to Pro for paid traffic. |
| **Vercel Hobby** | 100 GB bandwidth / month | Heavy images? Serve them via Cloudinary, not from the Vercel bundle. |
| **Brevo free** | 300 emails/day | Adequate for early traffic. Watch the cap during launch campaigns. |
| **Cloudinary free** | 25 GB storage, 25 GB bandwidth | Compress + use `f_auto,q_auto` URL transforms. |

---

## Troubleshooting production-only issues

| Symptom | Most likely cause | Fix |
|---|---|---|
| `/api/v1/health` returns 503 with `"database": "down"` | Supabase paused (free tier) or wrong `DATABASE_URL` | Open Supabase dashboard → unpause; verify URL uses port 6543 + `?pgbouncer=true&connection_limit=1` |
| Frontend can't reach API: **CORS error** | `ALLOWED_ORIGINS` doesn't include the Vercel domain | Update Railway env, redeploy |
| Frontend hits `localhost:4000` in production | `VITE_API_URL` not set in Vercel before build | Set it, then **redeploy** (rebuild required) |
| `prisma migrate deploy` fails at boot: `relation already exists` | The schema was pushed via `db push` before migrations existed | Run once locally: `DATABASE_URL="$DIRECT_URL" npx prisma migrate resolve --applied 20260606000000_init` to mark the initial migration as already applied |
| Webhook signature verification fails | Wrong `RAZORPAY_WEBHOOK_SECRET` or the webhook URL is HTTPS but Railway hasn't issued the cert yet | Re-copy the secret from Razorpay; wait for Railway HTTPS to propagate |
| `prepared statement "s0" already exists` | `DATABASE_URL` missing `?pgbouncer=true&connection_limit=1` | Add the params; redeploy |
| Backend boots but rate-limiter blocks everyone or no-one | `trust proxy` not picked up | Confirm `app.set('trust proxy', 1)` is in `app.js` and `NODE_ENV=production` |
| Login works, but the user is logged out on refresh | Secure cookie dropped because `trust proxy` was off | Same fix as above |
| Duplicate failed-payment emails | `RUN_CRONS=true` set on multiple Railway services | Set it on exactly one |

---

## Quick reference: what goes where

| Service | What it does | Dashboard |
|---|---|---|
| **GitHub** | Source code | [github.com](https://github.com) |
| **Supabase** | PostgreSQL | [supabase.com](https://supabase.com) |
| **Railway** | Backend (Express) | [railway.app](https://railway.app) |
| **Vercel** | Frontend (React SPA) | [vercel.com](https://vercel.com) |
| **Razorpay** | Payments | [razorpay.com](https://razorpay.com) |
| **Brevo** | SMTP email | [brevo.com](https://brevo.com) |
| **Cloudinary** | Image hosting | [cloudinary.com](https://cloudinary.com) |
| **Sentry** | Error tracking | [sentry.io](https://sentry.io) |

See [ARCHITECTURE.md](ARCHITECTURE.md) for how the pieces fit together, [ENVIRONMENT.md](ENVIRONMENT.md) for every env var, and [API.md](API.md) for endpoints.
