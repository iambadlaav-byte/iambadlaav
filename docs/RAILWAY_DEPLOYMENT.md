# Railway Deployment — Backend

Railway runs the Express API. It is the only service that talks to the database, and the target of the Razorpay webhook.

The repo ships a `railway.json` at the root that defines the build, migration, start, and health-check behaviour.

---

## What `railway.json` already configures

```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install && npm --workspace=backend run prisma:generate"
  },
  "deploy": {
    "preDeployCommand": "cd backend && DATABASE_URL=\"$DIRECT_URL\" npx prisma migrate deploy",
    "startCommand": "npm --workspace=backend run start",
    "healthcheckPath": "/api/v1/health",
    "healthcheckTimeout": 30,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 5
  }
}
```

- **Build** — installs deps and runs `prisma generate` (generates the Prisma client).
- **preDeployCommand** — runs migrations **before** the new version goes live, using `DIRECT_URL` (see below).
- **startCommand** — `node src/server.js` via the backend workspace.
- **healthcheckPath** — `/api/v1/health`. Railway waits for `200` here before routing traffic; a `503` (DB down) marks the deploy failed.

---

## Requirements

- **Node** — `>=18.18` (declared in `package.json` `engines`). Railway/Nixpacks picks a compatible version automatically.
- A provisioned Supabase database (see [SUPABASE_SETUP.md](SUPABASE_SETUP.md)).

---

## Steps

1. **Create the service**
   - Railway → New Project → Deploy from GitHub repo → pick this repo.
   - Railway reads `railway.json` automatically.

2. **Set environment variables** (service → Variables). Add every backend var. See [ENVIRONMENT_VARIABLES.md](ENVIRONMENT_VARIABLES.md) for the full list. At minimum:

   ```
   DATABASE_URL="postgresql://postgres.<ref>:<pw>@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
   DIRECT_URL="postgresql://postgres.<ref>:<pw>@aws-0-ap-south-1.pooler.supabase.com:5432/postgres"
   JWT_SECRET="<64+ char random>"
   JWT_REFRESH_SECRET="<different 64+ char random>"
   BREVO_SMTP_USER="..."   BREVO_SMTP_PASS="..."
   EMAIL_FROM_NAME="Badlaav"
   EMAIL_FROM_ADDRESS="noreply@iambadlaav.com"   # Brevo-verified sender
   EMAIL_REPLY_TO="iambadlaav@gmail.com"
   RAZORPAY_KEY_ID="..."   RAZORPAY_KEY_SECRET="..."   RAZORPAY_WEBHOOK_SECRET="..."
   CLOUDINARY_CLOUD_NAME="..."   CLOUDINARY_API_KEY="..."   CLOUDINARY_API_SECRET="..."
   NODE_ENV="production"
   APP_URL="https://www.iambadlaav.com"
   ADMIN_EMAIL="iambadlaav@gmail.com"
   ALLOWED_ORIGINS="https://iambadlaav.com,https://www.iambadlaav.com"
   SEED_ADMIN_PASSWORD="<strong password>"
   ```

   Both `DATABASE_URL` and `DIRECT_URL` are required: the running app uses the pooler URL, migrations use the direct URL.

3. **Deploy.** On each deploy Railway:
   - builds + runs `prisma generate`,
   - runs `prisma migrate deploy` against `DIRECT_URL` (preDeploy),
   - starts the server,
   - waits for `GET /api/v1/health` to return `200`.

4. **Seed the admin user (first deploy only).** Migrations create the tables but do not seed data. Run the seed once:
   - From a Railway one-off shell / `railway run`, or locally pointed at the prod DB:
   ```bash
   npm --workspace=backend run prisma:seed
   ```
   This upserts the admin user `iambadlaav@gmail.com` with the password from `SEED_ADMIN_PASSWORD`, a sample batch, a `WELCOME500` coupon, and the current-FY invoice sequence. **Log in and change the admin password immediately.**

5. **Note the backend URL** (e.g. `https://badlaav-backend.up.railway.app`). You need it for:
   - the Razorpay webhook URL (`…/api/v1/payments/webhook`),
   - the frontend's `VITE_API_URL`.

---

## Migrations and the `DIRECT_URL` rule

Prisma 7 in this project no longer uses `directUrl` in the schema. Migrations must run against the **direct** connection (port 5432) because PgBouncer (the pooler on 6543) does not support the advisory locks Prisma needs. Railway handles this in `preDeployCommand`:

```
DATABASE_URL="$DIRECT_URL" npx prisma migrate deploy
```

If you ever run migrations manually, do the same override:

```bash
# PowerShell
$env:DATABASE_URL="<direct-url-5432>"; npx prisma migrate deploy
```

Running `migrate deploy` against the pooler URL will hang or error on the advisory lock.

---

## Webhook raw-body note

The route `POST /api/v1/payments/webhook` requires the **raw** request body for HMAC signature verification. In `app.js`, `express.raw({ type: 'application/json' })` is registered on that exact path **before** the global `express.json()`. Do not add a body parser, proxy, or middleware in front of the webhook that consumes the body — signature verification will fail and Razorpay will keep retrying. The webhook is intentionally **not** rate-limited (Razorpay retries on non-2xx; the signature check is the gate).

---

## Health check

`GET /api/v1/health` returns:

```json
{ "status": "ok", "version": "...", "uptime": 123, "database": "connected", "razorpay": "reachable", "timestamp": "..." }
```

`200` when the DB query succeeds, `503` when it does not. Each sub-check has a 3s timeout so a slow upstream cannot blow past Railway's 30s health timeout.
