# Badlaav

The website for **Badlaav** — a 3-day residential retreat in Ambajogai for professionals and teams who need a real reset, not another workshop. *"Trip नाही — Turning Point."*

A **Dnyanpith Abhyasika Pvt. Ltd.** initiative. Founder: Arjun Thoratt.

---

## What this is

A full-stack web app:

- **Marketing site** — Home, The Retreat (3-day arc), Pricing, About, Gallery, Contact.
- **Lead capture** — a corporate/team enquiry form.
- **Online registration + payment** — Individual / Couple booking with Razorpay checkout, auto-confirmation email, and a PDF invoice.
- **Admin panel** — dashboard, batches, registrations, invoices, coupons, enquiries management (at `/admin`, role-gated).

It is a **standalone monorepo**. The backend was copied from the parent Dnyanpith ecosystem project; the frontend is a new, warm-premium retreat build.

## Tech stack

| Layer | Tech |
|---|---|
| Frontend | React 18 · Vite · Tailwind CSS · Framer Motion · React Hook Form · Zod · Axios · React Router 6 |
| Backend | Node.js · Express 4 · Prisma · PostgreSQL · JWT · bcrypt · Nodemailer · Razorpay · Cloudinary · Pino |
| Hosting | Vercel (frontend) · Railway (backend) · Supabase (database) · Cloudinary (media) · Sentry (errors) |

## Repository layout

```
badlaav/
├── frontend/             React + Vite app (the new warm-theme site)
├── backend/              Express + Prisma API (copied verbatim)
├── packages/validators/  Shared Zod schemas (@dnyanpith/validators) — used by both
├── docs/                 All documentation (start at docs/README.md)
├── setup.bat             One-time setup (install, prisma generate, scaffold .env)
├── start.bat             Run frontend + backend dev servers
├── stop.bat              Kill dev servers on ports 5173 / 4000 / 5555
├── package.json          Root monorepo (npm workspaces)
├── vercel.json           Frontend deploy config (Vite framework, output = dist/)
├── railway.json          Backend deploy config
└── .env.example          Every environment variable + where to get it
```

---

## Quick start (Windows — the easy way)

> **Do these steps in order. Don't skip any.**

### Step 1 — Install Node.js
- Download and install **Node.js 18 or newer** from [nodejs.org](https://nodejs.org).
- Check it works: open a terminal and type `node --version`. You should see `v18.x.x` or higher.

### Step 2 — Run the setup script
- Double-click **`setup.bat`** in the project folder.
- This will:
  - Install all packages (frontend, backend, shared validators).
  - Generate the Prisma database client.
  - Create `backend/.env` and `frontend/.env` from the templates.

### Step 3 — Fill in your secrets
- Open **`backend/.env`** in a text editor and fill in real values.
- You need at minimum: `DATABASE_URL` (transaction pooler, port 6543 with `?pgbouncer=true&connection_limit=1`), `DIRECT_URL` (session pooler, port 5432), `JWT_SECRET`, `JWT_REFRESH_SECRET`, and `SEED_ADMIN_PASSWORD`.
- See [docs/ENVIRONMENT.md](docs/ENVIRONMENT.md) for what each value means and where to get it.

### Step 4 — Set up the database
- Open a terminal in the project folder and run these commands one by one:
  ```powershell
  cd backend
  npm run migrate:deploy   # applies committed migrations to your Supabase database
  npm run prisma:seed      # creates an admin user + a Badlaav batch + WELCOME500 coupon
  cd ..
  ```

### Step 5 — Start the app
- Double-click **`start.bat`**.
- Open your browser and go to **http://localhost:5173**.
- That's it! The site should load.

---

## Quick start (any OS — manual way)

Run these commands in your terminal, one by one:

```bash
# Step 1: Install all packages
npm install

# Step 2: Create your .env files from the template
cp .env.example backend/.env        # then open it and fill in real values
cp .env.example frontend/.env       # VITE_* values only

# Step 3: Generate the Prisma client
cd backend
npm run prisma:generate

# Step 4: Apply migrations to create the database tables
npm run migrate:deploy

# Step 5: Seed the database with initial data
npm run prisma:seed
cd ..

# Step 6: Start both frontend and backend
npm run dev
```

- Frontend will be at → **http://localhost:5173**
- Backend will be at → **http://localhost:4000**
- The Vite dev server automatically sends `/api/*` requests to the backend.

---

## Available scripts

**From the project root:**
| Command | What it does |
|---|---|
| `npm run dev` | Starts both frontend and backend |
| `npm run dev:fe` | Starts only the frontend |
| `npm run dev:be` | Starts only the backend |
| `npm run build` | Builds the frontend for production (output goes to `dist/` at the root) |

**From inside `backend/`:**
| Command | What it does |
|---|---|
| `npm run dev` | Starts the backend with auto-reload |
| `npm run migrate:deploy` | Applies committed migrations to the database |
| `npm run prisma:migrate -- --name <change>` | Creates a new migration after editing `schema.prisma` |
| `npm run prisma:seed` | Seeds initial data |
| `npm run prisma:studio` | Opens a visual database editor at http://localhost:5555 |

> **Prisma 7 note:** the app uses the `@prisma/adapter-pg` driver adapter. `DATABASE_URL` is the Supabase **transaction pooler** (port 6543, `?pgbouncer=true&connection_limit=1`); `DIRECT_URL` is the **session pooler** (port 5432) and is used for migrations.

---

## Documentation

Everything lives in **[`docs/`](docs/README.md)** — see the index there for the full set.

**Deployment & operations guides** (provision each service step by step):

| Doc | What it covers |
|---|---|
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | The big picture — architecture, provisioning order, how the services connect. Start here. |
| [docs/ENVIRONMENT_VARIABLES.md](docs/ENVIRONMENT_VARIABLES.md) | Every backend + frontend (`VITE_*`) env var: required?, purpose, where to get it, example |
| [docs/VERCEL_DEPLOYMENT.md](docs/VERCEL_DEPLOYMENT.md) | Deploy the frontend (Vite, repo-root `dist/`, SPA routing) |
| [docs/RAILWAY_DEPLOYMENT.md](docs/RAILWAY_DEPLOYMENT.md) | Deploy the backend (migrations via `DIRECT_URL`, health check, webhook raw-body) |
| [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md) | Database — the two connection URLs, migrations, seed |
| [docs/RAZORPAY_SETUP.md](docs/RAZORPAY_SETUP.md) | Payments — keys + the `/api/v1/payments/webhook` endpoint |
| [docs/BREVO_SETUP.md](docs/BREVO_SETUP.md) | Email — SMTP + verified-sender (DMARC) rule |
| [docs/CLOUDINARY_SETUP.md](docs/CLOUDINARY_SETUP.md) | Media — folders, signed invoice URLs, EXIF stripping |
| [docs/MSG91_SETUP.md](docs/MSG91_SETUP.md) | Optional SMS / WhatsApp behind feature flags |
| [docs/ADMIN_GUIDE.md](docs/ADMIN_GUIDE.md) | For non-technical admins — login, role matrix, every admin section |
| [docs/BACKUP_AND_RECOVERY.md](docs/BACKUP_AND_RECOVERY.md) | Backups, restore, rotating secrets |
| [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) | Common issues and their real fixes |
| [docs/SECURITY.md](docs/SECURITY.md) | The implemented security posture |

**Reference docs** (codebase):

| Doc | What it covers |
|---|---|
| [docs/SETUP.md](docs/SETUP.md) | Full local setup from scratch + troubleshooting |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | How frontend + backend fit together, payment flows, data model |
| [docs/API.md](docs/API.md) | Every API endpoint — method, path, auth, purpose |
| [docs/USAGE.md](docs/USAGE.md) | How to operate the site (batches, coupons, registrations, emails) |
| [docs/CONTENT.md](docs/CONTENT.md) | All the marketing copy in one place |
| [CLAUDE.md](CLAUDE.md) | Conventions, brand voice, theme tokens (for developers/AI assistants) |

**New here? Start with [docs/SETUP.md](docs/SETUP.md) to run it locally, then [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) to ship it.**
