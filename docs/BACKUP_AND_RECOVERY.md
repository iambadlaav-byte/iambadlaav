# Backup & Recovery

What to back up, how the managed services protect data, and how to restore.

The two stateful stores are **Supabase** (database) and **Cloudinary** (media + invoice PDFs). Everything else (Railway, Vercel) is rebuildable from the repo + env vars.

---

## What to back up

1. **Database** — all registrations, payments, invoices, users, content. Lives in Supabase.
2. **Media + invoice PDFs** — uploaded images and generated invoices. Live in Cloudinary.
3. **Environment variables** — the contents of `backend/.env` (Railway variables) and `frontend/.env` (Vercel variables). Without these you cannot redeploy. Keep an encrypted copy in a password manager / secrets vault, **never** in git.

Code itself is in GitHub; that is your code backup.

---

## Database — Supabase

### Automatic backups
- Supabase takes **automatic daily backups** on paid tiers and offers **Point-in-Time Recovery (PITR)** on higher tiers. Check your project's Database → Backups page for what your plan includes.
- Free-tier projects have limited/no automatic backups — if you are on free tier, take manual backups (below) on a schedule.

### Manual backup (recommended before risky changes)
Use the direct connection (`DIRECT_URL`, port 5432) with `pg_dump`:

```bash
pg_dump "postgresql://postgres.<ref>:<pw>@aws-0-ap-south-1.pooler.supabase.com:5432/postgres" -Fc -f badlaav-backup.dump
```

Store the dump somewhere safe (encrypted). Take one before any schema migration or bulk data operation.

### Restore
- **PITR / dashboard restore:** Supabase → Database → Backups → restore to a timestamp or backup point. This is the simplest path.
- **From a `pg_dump`:** restore with `pg_restore` into a fresh database, then point `DATABASE_URL`/`DIRECT_URL` at it:
  ```bash
  pg_restore --clean --no-owner -d "<DIRECT_URL>" badlaav-backup.dump
  ```
- After any restore, confirm `GET /api/v1/health` reports `"database": "connected"` and spot-check recent registrations.

---

## Media + invoices — Cloudinary

- Cloudinary stores assets durably and serves them over a CDN; they persist until explicitly deleted.
- The app only deletes a user's media during **anonymization** (GDPR erasure). Normal operations never delete media.
- Cloudinary is the system of record for media — there is no second copy in the database (the DB stores only the URLs). If you need an off-site copy, periodically export assets via Cloudinary's admin API or backup add-on.
- Invoice PDFs live in `badlaav/invoices` as authenticated resources; treat them as financial records and include them in any compliance archive.

---

## Rotating secrets

Rotate when a secret may be exposed, when staff with access leave, or on a routine schedule.

1. **Generate the new value** at the source (Supabase password, JWT secret, Razorpay keys, Brevo key, Cloudinary key, MSG91 key).
2. **Update it** in Railway (backend) and/or Vercel (frontend `VITE_*`) variables.
3. **Redeploy** so the new value takes effect.

Notes:
- Rotating **`JWT_SECRET` / `JWT_REFRESH_SECRET`** invalidates existing sessions — users/admins must log in again. Do it deliberately.
- Rotating the **Razorpay webhook secret** requires updating the secret in **both** the Razorpay webhook config and `RAZORPAY_WEBHOOK_SECRET`, or webhooks will fail signature verification.
- Rotating the **Supabase database password** changes both `DATABASE_URL` and `DIRECT_URL` — update both everywhere.
- Generate strong secrets: `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`.

---

## Disaster-recovery drill (high level)

If you had to rebuild from scratch:

1. Restore the Supabase database (PITR or `pg_restore`).
2. Recreate the Railway service from the repo, paste the backend env vars, deploy (migrations run automatically). Re-run the seed **only** if the DB is empty.
3. Recreate the Vercel project from the repo, paste the `VITE_*` vars, deploy.
4. Re-point the Razorpay webhook at the new backend URL and confirm the webhook secret matches.
5. Verify: health check green, a test login works, a test payment flows end to end.

Cloudinary assets and their URLs survive across a rebuild, so media reappears automatically as long as the database (which holds the URLs) is restored.
