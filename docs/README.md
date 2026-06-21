# Badlaav — Documentation

All docs for the Badlaav website live here.

---

## Setup, deployment & operations guides

| Document | What you'll learn |
|---|---|
| **[ENVIRONMENT_VARIABLES.md](ENVIRONMENT_VARIABLES.md)** | Every backend and frontend (`VITE_*`) env var: required?, purpose, where to get it, example. |
| **[DEPLOYMENT.md](DEPLOYMENT.md)** | The big picture — architecture, provisioning order, and how the services connect. Start here. |
| **[VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md)** | Deploy the frontend: Vite preset, build command, repo-root `dist/`, SPA routing, `VITE_*` vars. |
| **[RAILWAY_DEPLOYMENT.md](RAILWAY_DEPLOYMENT.md)** | Deploy the backend: env vars, `prisma migrate deploy` (via `DIRECT_URL`), health check, webhook raw-body. |
| **[SUPABASE_SETUP.md](SUPABASE_SETUP.md)** | Create the database, the two connection URLs (6543 pooler vs 5432 direct), apply migrations + seed. |
| **[RAZORPAY_SETUP.md](RAZORPAY_SETUP.md)** | Test vs live keys, configure the `/api/v1/payments/webhook` endpoint, signature + replay protection. |
| **[BREVO_SETUP.md](BREVO_SETUP.md)** | SMTP creds and the critical verified-sender / DMARC rule for deliverable email. |
| **[CLOUDINARY_SETUP.md](CLOUDINARY_SETUP.md)** | Media credentials, folders, signed invoice URLs, EXIF stripping, upload limits. |
| **[MSG91_SETUP.md](MSG91_SETUP.md)** | Optional SMS + WhatsApp behind feature flags; the `MSG91_*` vars and approved templates. |
| **[ADMIN_GUIDE.md](ADMIN_GUIDE.md)** | For non-technical admins: logging in, the role matrix, and every admin section. |
| **[BACKUP_AND_RECOVERY.md](BACKUP_AND_RECOVERY.md)** | What to back up, restoring Supabase + Cloudinary, rotating secrets. |
| **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** | Common issues and their real fixes (email spam, webhook, migrations, CORS, build output, SMS). |
| **[SECURITY.md](SECURITY.md)** | The implemented security posture — Helmet, CORS, RBAC, rate limits, JWT/OTP, webhook, uploads. |

---

## Reference docs (codebase)

| Document | What you'll learn |
|---|---|
| **[SETUP.md](SETUP.md)** | Run it on your machine: install, configure, database, troubleshoot. |
| **[ENVIRONMENT.md](ENVIRONMENT.md)** | Per-variable reference (see also ENVIRONMENT_VARIABLES.md). |
| **[ARCHITECTURE.md](ARCHITECTURE.md)** | How frontend + backend fit together, payment flows, data model. |
| **[API.md](API.md)** | Every API endpoint: method, URL, auth level, what it does. |
| **[USAGE.md](USAGE.md)** | Operate the site: batches, coupons, enquiries, content. |
| **[CONTENT.md](CONTENT.md)** | The marketing copy in one place. |

Also see **[../README.md](../README.md)** (project overview) and **[../CLAUDE.md](../CLAUDE.md)** (conventions, brand voice, theme tokens).

---

## Quick lookup — "I want to…"

| I want to… | Go to |
|---|---|
| Understand how everything connects | [DEPLOYMENT.md](DEPLOYMENT.md) |
| Know what a variable means / where to get a key | [ENVIRONMENT_VARIABLES.md](ENVIRONMENT_VARIABLES.md) |
| Deploy the frontend | [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md) |
| Deploy the backend | [RAILWAY_DEPLOYMENT.md](RAILWAY_DEPLOYMENT.md) |
| Set up the database | [SUPABASE_SETUP.md](SUPABASE_SETUP.md) |
| Make payments work | [RAZORPAY_SETUP.md](RAZORPAY_SETUP.md) |
| Make email deliver | [BREVO_SETUP.md](BREVO_SETUP.md) |
| Run the admin panel | [ADMIN_GUIDE.md](ADMIN_GUIDE.md) |
| Fix something broken | [TROUBLESHOOTING.md](TROUBLESHOOTING.md) |
| Understand the security model | [SECURITY.md](SECURITY.md) |

---

## Project facts

- **Stack:** React + Vite + Tailwind · Node + Express + Prisma · PostgreSQL (Supabase) · Razorpay · Cloudinary · Brevo · Sentry
- **Hosting:** Vercel (frontend) · Railway (backend) · Supabase (database) · Cloudinary (media) · Sentry (errors)
- **Layout:** npm-workspaces monorepo — `frontend/`, `backend/`, `packages/validators/`
- **Ports (dev):** frontend `5173`, backend `4000`, Prisma Studio `5555`
- **Build output:** `dist/` at the repo root (Vite builds from `frontend/` but outputs to root, per `vercel.json`)
- **Scope of this build:** marketing site + online registration/payment with Razorpay + a live admin panel at `/admin/*`.
- **Entity:** Badlaav is operated by Dnyanpith Abhyasika Pvt. Ltd., Ambajogai, Maharashtra. Founder: Arjun Thoratt.
