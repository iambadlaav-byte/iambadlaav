# Badlaav — Documentation

All docs for the Badlaav website live here. **Start with SETUP.md.**

---

## Read in this order

| # | Document | What you'll learn |
|---|---|---|
| 1 | **[SETUP.md](SETUP.md)** | Get it running on your computer: install, configure, database, run, troubleshoot |
| 2 | **[ENVIRONMENT.md](ENVIRONMENT.md)** | Every environment variable: what it is, where to get it, example value |
| 3 | **[ARCHITECTURE.md](ARCHITECTURE.md)** | How frontend + backend fit together, payment flows, data model |
| 4 | **[API.md](API.md)** | Every API endpoint: method, URL, auth level, what it does |
| 5 | **[DEPLOYMENT.md](DEPLOYMENT.md)** | Put it on the internet: Supabase + Railway + Vercel, step by step |
| 6 | **[USAGE.md](USAGE.md)** | Operate the site: add batches, manage coupons, read enquiries, edit content |
| 7 | **[CONTENT.md](CONTENT.md)** | All the marketing copy in one place |

Also see:
- **[../README.md](../README.md)** — project overview + quick start
- **[../CLAUDE.md](../CLAUDE.md)** — conventions, brand voice, theme tokens (for developers / AI assistants)

---

## Quick lookup — "I want to…"

| I want to… | Go to |
|---|---|
| Run it on my machine | [SETUP.md](SETUP.md) |
| Know what a variable means / where to get a key | [ENVIRONMENT.md](ENVIRONMENT.md) |
| Understand how front + back fit together | [ARCHITECTURE.md](ARCHITECTURE.md) |
| Call or extend the API | [API.md](API.md) |
| Put it on the internet | [DEPLOYMENT.md](DEPLOYMENT.md) |
| Add a batch / coupon, read enquiries, edit copy | [USAGE.md](USAGE.md) |
| Change the words on the site | [CONTENT.md](CONTENT.md) |

---

## Project facts

- **Stack:** React + Vite + Tailwind · Node + Express + Prisma · PostgreSQL (Supabase) · Razorpay · Cloudinary · Brevo · Sentry
- **Layout:** npm-workspaces monorepo — `frontend/`, `backend/`, `packages/validators/`
- **Ports (dev):** frontend `5173`, backend `4000`, Prisma Studio `5555`
- **Build output:** `dist/` at the repo root (Vite builds from `frontend/` but outputs to root)
- **Scope of this build:** marketing site + online registration/payment. Backend admin APIs exist; no admin UI yet.
- **Entity:** Badlaav is a programme of Dnyanpith Abhyasika Pvt. Ltd., Ambajogai, Maharashtra.
