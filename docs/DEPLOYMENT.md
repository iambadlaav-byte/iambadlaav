# Deployment Overview

How the Badlaav website goes from a repo to a running site, and how the pieces connect.

This is the map. Each service has its own step-by-step guide:

- [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md) — frontend
- [RAILWAY_DEPLOYMENT.md](RAILWAY_DEPLOYMENT.md) — backend API
- [SUPABASE_SETUP.md](SUPABASE_SETUP.md) — database
- [RAZORPAY_SETUP.md](RAZORPAY_SETUP.md) — payments
- [BREVO_SETUP.md](BREVO_SETUP.md) — email
- [CLOUDINARY_SETUP.md](CLOUDINARY_SETUP.md) — media
- [MSG91_SETUP.md](MSG91_SETUP.md) — SMS / WhatsApp (optional)

---

## Architecture

```
                 ┌──────────────┐
   Browser  ───▶ │   Vercel     │   React SPA (static)
                 │  (frontend)  │   build → repo-root /dist
                 └──────┬───────┘
                        │  HTTPS  /api/v1/*   (VITE_API_URL)
                        ▼
                 ┌──────────────┐
                 │   Railway    │   Node + Express API
                 │  (backend)   │   /api/v1/*
                 └──┬────┬───┬──┘
                    │    │   │
        ┌───────────┘    │   └──────────────┐
        ▼                ▼                  ▼
 ┌────────────┐  ┌──────────────┐   ┌──────────────┐
 │  Supabase  │  │  Cloudinary  │   │   Razorpay   │
 │ PostgreSQL │  │  media/PDFs  │   │   payments   │
 └────────────┘  └──────────────┘   └──────┬───────┘
                                            │ webhook
                                            ▼  POST /api/v1/payments/webhook
                                       (Railway backend)

 Email:  backend ──SMTP──▶ Brevo
 Errors: frontend & backend ──▶ Sentry (optional)
 SMS/WA: backend ──▶ MSG91 (optional, feature-flagged)
```

- **Vercel** serves the static React build. It does not run the API.
- **Railway** runs the Express API and is the only thing that talks to the database.
- **Supabase** is the PostgreSQL database (the only stateful store besides Cloudinary).
- **Cloudinary** holds uploaded media and generated invoice PDFs.
- **Razorpay** processes payments and calls back to the backend via webhook.
- **Brevo** sends transactional email over SMTP.
- **Sentry** (optional) collects errors from frontend and backend.
- **MSG91** (optional) sends SMS / WhatsApp, off by default.

---

## Provision in this order

Do them in sequence — later steps need values produced by earlier ones.

1. **Supabase** — create the project, get `DATABASE_URL` (pooler, 6543) and `DIRECT_URL` (direct, 5432). See [SUPABASE_SETUP.md](SUPABASE_SETUP.md).
2. **Cloudinary** — get cloud name + API key/secret. See [CLOUDINARY_SETUP.md](CLOUDINARY_SETUP.md).
3. **Brevo** — verify a sender, get SMTP creds. See [BREVO_SETUP.md](BREVO_SETUP.md).
4. **Razorpay** — get key id/secret (the webhook secret comes after the backend URL exists). See [RAZORPAY_SETUP.md](RAZORPAY_SETUP.md).
5. **Railway (backend)** — set all backend env vars, deploy. Migrations run automatically (`preDeployCommand`). Note the backend URL. See [RAILWAY_DEPLOYMENT.md](RAILWAY_DEPLOYMENT.md).
6. **Razorpay webhook** — now that the backend URL exists, create the webhook pointing at `…/api/v1/payments/webhook` and copy its signing secret into `RAZORPAY_WEBHOOK_SECRET` on Railway.
7. **Vercel (frontend)** — set `VITE_*` vars (including `VITE_API_URL` = the Railway URL), deploy. See [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md).
8. **Wire CORS** — add the Vercel domain(s) to `ALLOWED_ORIGINS` on Railway and redeploy the backend.

---

## How the pieces connect

### CORS — `ALLOWED_ORIGINS`
The backend reads `ALLOWED_ORIGINS` (comma-separated, no spaces) and rejects any browser origin not on the list. It **must** include every domain the frontend is served from, e.g.:

```
ALLOWED_ORIGINS="https://iambadlaav.com,https://www.iambadlaav.com"
```

Include the Vercel production URL too if you use it directly. If a domain is missing, the browser console shows a CORS error and API calls fail. If `ALLOWED_ORIGINS` is unset, the backend falls back to `http://localhost:5173` only.

### Frontend → backend — `VITE_API_URL`
The frontend builds API URLs as `${VITE_API_URL}/api/v1`. Set `VITE_API_URL` to the Railway backend host (no `/api/v1` suffix). If left blank, the frontend calls a same-origin relative `/api/v1`, which only works behind a shared proxy.

### Emails — `APP_URL`
Links inside transactional emails (payment confirmations, invoices, password resets) are built from `APP_URL`. Set it to the public site URL, e.g. `https://www.iambadlaav.com`.

### Razorpay webhook
Razorpay must call **`https://<backend-host>/api/v1/payments/webhook`**. Payment status is trusted only from this webhook (signature-verified), never from the browser callback. The webhook secret you set in Razorpay must equal `RAZORPAY_WEBHOOK_SECRET` on the backend.

---

## Build output note

`npm run build` (root) runs `vite build` in `frontend/` but **outputs to `dist/` at the repo root**, not `frontend/dist/`. This is required by the Vercel config (`outputDirectory: "dist"` in `vercel.json`). If you change the output path, update `vercel.json` to match.

---

## Health check

The backend exposes `GET /api/v1/health`. It returns `200` with `{ status: "ok", database: "connected", razorpay: "reachable" }` when healthy, and `503` when the database is unreachable. Railway uses this path (`healthcheckPath` in `railway.json`) to gate deploys.
