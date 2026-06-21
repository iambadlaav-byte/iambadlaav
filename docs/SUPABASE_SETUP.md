# Supabase Setup — Database

Badlaav uses a Supabase PostgreSQL database. Badlaav needs **its own** Supabase project, separate from any other site.

You will produce two connection strings:

- **`DATABASE_URL`** — the transaction **pooler** (port `6543`, PgBouncer). Used by the running app for queries.
- **`DIRECT_URL`** — the **direct/session** connection (port `5432`, no PgBouncer). Used for migrations only.

---

## 1. Create the project

1. Supabase → New Project.
2. Pick a region close to your users (the example URLs use `ap-south-1` / Mumbai).
3. Set a strong database password — you will paste it into both connection strings. Save it; Supabase does not show it again.

---

## 2. Get the two connection strings

Supabase → Project Settings → Database → Connection String.

### `DATABASE_URL` — Transaction pooler (runtime)
Select **Transaction pooler**. It uses port **6543**. Append the pooler flags:

```
DATABASE_URL="postgresql://postgres.PROJECTREF:PASSWORD@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
```

- `?pgbouncer=true` tells Prisma it is talking to PgBouncer.
- `connection_limit=1` keeps the serverless-friendly pool small.

### `DIRECT_URL` — Session pooler / direct (migrations)
Select **Session pooler** (or the direct connection). It uses port **5432**, no PgBouncer:

```
DIRECT_URL="postgresql://postgres.PROJECTREF:PASSWORD@aws-0-ap-south-1.pooler.supabase.com:5432/postgres"
```

Replace `PROJECTREF` and `PASSWORD` in both. Put both into `backend/.env` (local) and into Railway's variables (production).

> **Why two URLs?** PgBouncer (6543) does not support the advisory locks Prisma uses during migrations, so migrations must run on the direct 5432 connection. Runtime queries use the pooler for connection efficiency.

---

## 3. Apply the migrations

The repo ships these migrations under `backend/prisma/migrations/`:

| Order | Migration | What it does |
|---|---|---|
| 1 | `20260606000000_init` | Initial schema — all base models. |
| 2 | `20260614000000_dedup_registration_community` | Dedup indexes/constraints for registrations + community joins. |
| 3 | `20260614000001_add_registration_optional_fields` | Optional registration fields. |
| 4 | `20260621000000_add_registration_questionnaire` | Registration `questionnaire` JSON column. |
| 5 | `20260621010000_wave2_rbac_batch_waitlist_story` | Wave 2 — staff RBAC roles, batch venue/waitlist fields, Story CMS, etc. |

Apply them against the **direct** URL:

```bash
# Local (PowerShell): override DATABASE_URL with the direct URL for the migrate command
$env:DATABASE_URL="<DIRECT_URL value, port 5432>"; npx --workspace backend prisma migrate deploy
```

On Railway this runs automatically in `preDeployCommand` (`DATABASE_URL="$DIRECT_URL" npx prisma migrate deploy`). See [RAILWAY_DEPLOYMENT.md](RAILWAY_DEPLOYMENT.md).

---

## 4. Seed the initial data

After migrations, seed the admin user and sample content once:

```bash
npm --workspace=backend run prisma:seed
```

This is idempotent (uses upsert). It creates:

- **Admin user** `iambadlaav@gmail.com` (role `ADMIN`) with the password from `SEED_ADMIN_PASSWORD`.
- A sample **batch** (`The Retreat · Aug 2026`) and a second sample batch.
- A **coupon** `WELCOME500`.
- The **InvoiceSequence** row for the current Indian financial year.

Change the admin password immediately after first login (Admin → Settings → change own password).

---

## 5. Verify

- `GET /api/v1/health` on the backend should report `"database": "connected"`.
- `npm --workspace=backend run prisma:studio` opens Prisma Studio (default port 5555) to browse tables.

---

## Notes

- Keep the Supabase password and both URLs out of git — they live only in `.env` / Railway variables.
- See [BACKUP_AND_RECOVERY.md](BACKUP_AND_RECOVERY.md) for Supabase backups and restore.
