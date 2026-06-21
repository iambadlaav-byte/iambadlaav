# Setup Guide

Everything you need to get Badlaav running on your computer. Follow each step in order.

- **If you already have the third-party accounts:** ~20 minutes.
- **If you need to create them:** ~45 minutes.

---

## Step 1 — Check prerequisites

Make sure you have these installed on your computer:

| Tool | How to check | Where to get it |
|---|---|---|
| **Node.js** (v18 or newer) | Open a terminal, type `node --version` | [nodejs.org](https://nodejs.org) — download the LTS version |
| **npm** (v9 or newer) | `npm --version` | Comes with Node.js automatically |
| **Git** | `git --version` | [git-scm.com](https://git-scm.com) |

> **Tip:** If you're not sure which Node version to pick, use **Node 20 LTS**. Any version 18 or above works.

---

## Step 2 — Create the third-party accounts

Badlaav needs five online services. All have **free tiers** that work for development. Create them first and save the keys somewhere — you'll paste them into your `.env` file later.

### 2a. Supabase (required — this is your database)

1. Go to [supabase.com](https://supabase.com) and sign up.
2. Click **New project** → pick region **Mumbai (ap-south-1)** → set a strong database password → **save this password somewhere!**
3. After the project is created, go to **Project Settings → Database → Connect**.
4. You need **two** connection strings:
   - **Transaction pooler** (port **6543**) → this becomes your `DATABASE_URL`
     - Append `?pgbouncer=true&connection_limit=1` to the end. **Required** — Prisma fails through PgBouncer without it.
   - **Session pooler** (port **5432**) → this becomes your `DIRECT_URL`
5. **Important:** if your password has special characters like `@` or `#`, replace them:
   - `@` becomes `%40`
   - `#` becomes `%23`
   - `:` becomes `%3A`

> 🆓 **Free-tier gotcha:** `db.<ref>.supabase.co` is **IPv6-only** on Supabase free and unreachable from most platforms. **Always use the pooler hostname** (`*.pooler.supabase.com`) for both URLs.

> ⚠️ **Use a brand-new Supabase project for Badlaav** — don't reuse an existing database.

### 2b. Razorpay (required — for accepting payments)

1. Go to [razorpay.com](https://razorpay.com) and create an account.
2. Go to **Dashboard → Settings → API Keys** → generate a **test mode** key pair.
3. Save the `Key ID` (starts with `rzp_test_`) and the `Key Secret`.
4. You'll set up the webhook secret later during deployment.

### 2c. Brevo (required — for sending emails)

1. Go to [brevo.com](https://brevo.com) and sign up.
2. Go to **SMTP & API** → find your SMTP credentials.
3. Save the `SMTP User` and `SMTP Key` (this is the password, not your login password).
4. **Important:** verify a sender email/domain in Brevo, or your emails will be rejected.

### 2d. Cloudinary (required — for image uploads)

1. Go to [cloudinary.com](https://cloudinary.com) and sign up.
2. On your dashboard, find **Account Details**.
3. Save the `Cloud Name`, `API Key`, and `API Secret`.

### 2e. Sentry (optional — for error tracking)

1. Go to [sentry.io](https://sentry.io) and sign up.
2. Create a **Node.js** project → copy the DSN for the backend.
3. Create a **React** project → copy the DSN for the frontend.
4. If you skip this, leave the Sentry fields blank — everything else still works.

### 2f. Generate JWT secrets

Open a terminal and run this command **twice** (you need two different secrets):

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

- First result → `JWT_SECRET`
- Second result → `JWT_REFRESH_SECRET`
- **They must be different from each other.**

---

## Step 3 — Install everything

### Windows (easiest way):
Double-click **`setup.bat`** in the project folder. It will:
- Install all packages (frontend, backend, shared validators)
- Generate the Prisma database client
- Create `backend/.env` and `frontend/.env` from the templates

### Any OS (manual way):
```bash
npm install
cp .env.example backend/.env
cp .env.example frontend/.env
cd backend && npx prisma generate && cd ..
```

`npm install` installs all three workspaces (`frontend`, `backend`, `packages/validators`) and links the shared validators package.

---

## Step 4 — Fill in your environment variables

### 4a. Backend secrets

Open **`backend/.env`** in a text editor and fill in every value using the keys you saved in Step 2.

**At minimum, you need these to start:**
- `DATABASE_URL` — Supabase **transaction pooler** (port 6543) with `?pgbouncer=true&connection_limit=1`
- `DIRECT_URL` — Supabase **session pooler** (port 5432) — used by migrations / seed
- `JWT_SECRET` — the first random string you generated
- `JWT_REFRESH_SECRET` — the second random string you generated
- `SEED_ADMIN_PASSWORD` — pick any strong password for the admin account

See [ENVIRONMENT.md](ENVIRONMENT.md) for a complete list with examples.

### 4b. Frontend variables

Open **`frontend/.env`** and set:
- `VITE_RAZORPAY_KEY_ID` — your Razorpay **test** key (the public one, starts with `rzp_test_`)
- `VITE_API_URL=http://localhost:4000` — this should already be correct for local dev

> ⚠️ **Never commit `.env` files.** The `.gitignore` already excludes them. The `VITE_*` values are visible in the browser, so **never put secrets there**.

---

## Step 5 — Set up the database

This project uses **Prisma 7** with a driver adapter. Here's what you need to know:
- Migrations live in `backend/prisma/migrations/` and are applied with `prisma migrate deploy`.
- The migration commands route through `DIRECT_URL` automatically (configured in `prisma.config.ts`).
- The runtime app uses `DATABASE_URL` (the pooled URL with `?pgbouncer=true&connection_limit=1`).

Run these commands one by one:

```bash
cd backend
npm run prisma:generate     # generate the database client (setup.bat already did this)
npm run migrate:deploy      # apply all committed migrations to your Supabase database
npm run prisma:seed         # add initial data: admin user + a batch + WELCOME500 coupon
```

> 🛠️ **Making a schema change?** Edit `backend/prisma/schema.prisma`, then run
> `npm run prisma:migrate -- --name <short_description>` to generate a new migration
> file. Commit the new folder under `prisma/migrations/`. On the next Railway
> deploy, `migrate deploy` will apply it.
>
> Supabase free tier doesn't support shadow databases, so if `prisma migrate dev`
> errors out, fall back to:
> `npx prisma migrate diff --from-schema-datasource ./prisma/schema.prisma --to-schema ./prisma/schema.prisma --script`
> and write the SQL into a new `prisma/migrations/<timestamp>_<name>/migration.sql`.

**What the seed creates:**
- An **admin user** with email `iambadlaav@gmail.com` and the password you set as `SEED_ADMIN_PASSWORD`
- One **Badlaav batch** with pricing
- A `WELCOME500` **coupon code**
- The invoice numbering sequence

**To see your data visually:**
```bash
npm run prisma:studio       # opens a visual editor at http://localhost:5555
```

---

## Step 6 — Run the app

### Windows:
Double-click **`start.bat`**.

### Any OS:
```bash
npm run dev
```

This starts both servers:
- **Frontend** → http://localhost:5173
- **Backend** → http://localhost:4000

To stop: run `stop.bat` (Windows) or press `Ctrl+C`.

---

## Step 7 — Verify everything works

Go through this checklist to make sure everything is set up correctly:

| # | What to check | Expected result |
|---|---|---|
| 1 | Open http://localhost:5173 | The warm-themed home page loads with sections |
| 2 | Open http://localhost:4000/api/v1/health | JSON with `"database": "connected"` |
| 3 | Go to `/contact` and submit the form | Success message appears, new row in Prisma Studio → `Enquiry` |
| 4 | Go to `/register`, complete a booking with a [Razorpay test card](https://razorpay.com/docs/payments/payments/test-card-details/) | Registration becomes `PAID`, confirmation email is sent |

---

## Step 8 — Troubleshooting

If something goes wrong, find your problem below:

| Problem | What to do |
|---|---|
| **"Cannot resolve environment variable: DATABASE_URL"** | Your `backend/.env` file is missing or empty. Make sure it exists and has a real `DATABASE_URL` value. |
| **"PrismaClient requires either adapter or accelerateUrl"** | Run `npm install` to make sure `@prisma/adapter-pg` and `pg` are installed. |
| **"password authentication failed"** | Your database password probably has special characters. URL-encode them: `@` → `%40`, `#` → `%23`. Also make sure `DIRECT_URL` uses the session pooler (port 5432) for migrations. |
| **`prepared statement "s0" already exists`** | `DATABASE_URL` is missing `?pgbouncer=true&connection_limit=1`. Add the params and restart. |
| **`prisma migrate dev` fails: "shadow database"** | Supabase free tier blocks shadow DBs. Use `migrate deploy` against committed migrations, or `prisma migrate diff` to author a new migration manually. |
| **Backend crashes on boot** | The `DATABASE_URL` is still a placeholder. Put your real Supabase connection string in `backend/.env`. |
| **"Port 5173 / 4000 already in use"** | Run `stop.bat`, or manually kill whatever process is using that port. |
| **Frontend loads but API calls fail (CORS error)** | `ALLOWED_ORIGINS` in `backend/.env` must include `http://localhost:5173`. |
| **Emails don't send** | Check your Brevo SMTP credentials in `backend/.env`. Make sure the sender is verified in Brevo. |
| **Razorpay checkout doesn't open** | `VITE_RAZORPAY_KEY_ID` is not set in `frontend/.env`. After editing `.env`, restart the dev server. |
| **"Upcoming batches" shows "dates announced soon"** | This happens when no OPEN Badlaav batch exists. Run `npm run prisma:seed` or add one in Prisma Studio. |
| **Images are broken** | Some images under `frontend/public/images/` are placeholders. Replace them with real photos. |

---

## What to read next

- [ENVIRONMENT.md](ENVIRONMENT.md) — full list of every environment variable with examples
- [DEPLOYMENT.md](DEPLOYMENT.md) — how to put the site on the internet
