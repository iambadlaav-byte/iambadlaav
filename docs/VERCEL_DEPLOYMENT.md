# Vercel Deployment — Frontend

Vercel serves the static React (Vite) build. It does **not** run the backend API — that lives on Railway.

The repo ships a `vercel.json` at the root that already sets the right build and routing. You mostly just import the repo and add env vars.

---

## What `vercel.json` already configures

```json
{
  "installCommand": "npm install",
  "buildCommand": "npm --workspace=frontend run build",
  "outputDirectory": "dist",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

- **Build command** — builds the `frontend` workspace via Vite.
- **Output directory** — `dist` at the **repo root** (not `frontend/dist`). The Vite build is configured to emit there.
- **Rewrites** — every path falls back to `index.html`. This is the SPA-routing rule that makes React Router deep links (e.g. `/register`, `/admin`) work on refresh instead of 404ing.

---

## Steps

1. **Import the repo into Vercel**
   - Vercel → Add New → Project → import the GitHub repo.

2. **Framework preset: Vite**
   - Vercel auto-detects Vite. If asked, choose **Vite** as the framework preset.
   - Because `vercel.json` is present, leave Build Command / Output Directory as **inherited from the config** — do not override them in the dashboard, or they will conflict with `vercel.json`.

3. **Set environment variables** (Project → Settings → Environment Variables). Add for Production (and Preview if you use it):

   | Variable | Required? | Value |
   |---|---|---|
   | `VITE_RAZORPAY_KEY_ID` | Yes (payments) | Public Razorpay key id — `rzp_live_…` (or `rzp_test_…` for staging). |
   | `VITE_API_URL` | Yes (split hosting) | The Railway backend host, e.g. `https://badlaav-backend.up.railway.app`. **No** `/api/v1` suffix. |
   | `VITE_GA_MEASUREMENT_ID` | Optional | GA4 id `G-XXXXXXXXXX`. Analytics stays off until set. |

   > `VITE_*` vars are **public** — they are inlined into the browser bundle. Never put a secret (key secret, JWT secret, DB URL) here.

4. **Deploy.** Vercel runs `npm install` then the build, and serves `dist/`.

5. **Wire CORS on the backend.** Add your Vercel domain(s) to `ALLOWED_ORIGINS` on Railway and redeploy the backend, or the browser will block API calls with a CORS error. See [RAILWAY_DEPLOYMENT.md](RAILWAY_DEPLOYMENT.md).

---

## SPA routing

The single `rewrites` rule in `vercel.json` sends every unmatched path to `/index.html`, so the React Router client handles routing. No extra configuration is needed for deep links or the `/admin/*` routes.

---

## Custom domain

- Vercel → Project → Settings → Domains → add `iambadlaav.com` and `www.iambadlaav.com`.
- After the domain is live, make sure both forms are in the backend's `ALLOWED_ORIGINS` and in `APP_URL`.

---

## Redeploys

- Pushing to the connected branch triggers an automatic build.
- Changing a `VITE_*` env var requires a **redeploy** to take effect — Vite bakes env vars in at build time, not at runtime.
