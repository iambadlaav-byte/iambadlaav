# Badlaav Admin Panel — usage guide

This panel lives inside the existing Badlaav frontend at `/admin/*`. It reuses
the same `AuthContext` and `apiClient` used by the public site, so there is one
session, one refresh-token cookie, and one source of truth for who you are.

Phase 1 ships the foundation + the most-used screens. Phase 2 adds coupon CRUD,
refunds, and the audit log viewer once their backend gaps are closed.

---

## Who can access

Only users whose `role === 'ADMIN'` may load any `/admin/*` route. The guard is
defense-in-depth:

| Layer    | Check                                                            |
| -------- | ---------------------------------------------------------------- |
| Frontend | `AdminProtectedRoute` reads `useAuth()`; non-admins → `/`        |
| Backend  | Every `/api/v1/admin/*` route uses `requireAdmin` middleware     |
| Network  | Session token in memory; refresh in httpOnly + sameSite cookie   |

Promoting a user to ADMIN is done directly in the database (Supabase →
`User` table → set `role = 'ADMIN'`). There is no admin self-signup, by design.

---

## Logging in

1. Visit `/login` (shared with the public site).
2. Sign in with email + OTP, or email + password.
3. After auth, the LoginForm and LoginPage both check `user.role`:
   - `ADMIN` → `/admin/dashboard`
   - everyone else → `/account/dashboard`
4. If you hit `/admin/anything` without being signed in, you're redirected to
   `/login?next=/admin/anything`. After login you land back on the requested page.

Session is restored automatically on page load via the httpOnly refresh cookie,
so a hard refresh inside the panel does not log you out.

`/admin/login` is kept as a courtesy URL — it redirects to the shared `/login`
with `next=/admin/dashboard`.

---

## Pages (phase 1)

| Route                          | What it does                                       |
| ------------------------------ | -------------------------------------------------- |
| `/admin/dashboard`             | 4 KPI tiles + 14-day registrations bar chart       |
| `/admin/batches`               | List, filter, search, close, mark full, reopen     |
| `/admin/batches/new`           | Create a new batch                                 |
| `/admin/batches/:id/edit`      | Edit an existing batch                             |
| `/admin/coupons`               | List, filter by active status, create, deactivate  |
| `/admin/coupons/new`           | Opens the create-coupon modal directly             |
| `/admin/registrations`         | List with filters, details modal, resend email, CSV export |
| `/admin/enquiries`             | List, filter, status update, admin-note           |
| `/admin/invoices`              | List paid/refunded, view PDF, resend email         |
| `/admin/settings`              | System health (auto-refresh every 30s)             |

Refund, anonymize, audit log, blog, events, and community admin remain in the
codebase (legacy from the parent Dnyanpith project) but are not linked from the
sidebar — Badlaav doesn't ship them in phase 1.

---

## Security checklist

- Access token kept in React state (memory only — never in `localStorage`).
- Refresh token in an `httpOnly` + `sameSite=lax` cookie set by the server.
- 401 from any admin endpoint triggers a single refresh attempt via the axios
  interceptor in `api/client.js`. If refresh also 401s, the user is signed out.
- `requireAdmin` is enforced **server-side** on every `/admin/*` API route.
  The client guard exists for UX only; bypassing it gains no privilege.
- `<meta name="robots" content="noindex,nofollow">` is set inside `AdminLayout`
  so the admin panel never lands in search results.
- Mutations (close batch, mark full, edit, status change) confirm via a modal
  before firing — no accidental clicks.
- All admin mutations are audit-logged server-side via `writeAudit()` with
  `actorId`, `subjectType`, `subjectId`, and `meta`.
- Refund endpoint is rate-limited to 10 requests/hour per IP.
- The OTP/password login endpoints are rate-limited per email and per IP.

---

## Deployment notes

The admin panel is part of the same `frontend/` bundle. `npm run build` outputs
to `../dist/` (root-level) which Vercel serves. No separate deploy is needed.

Admin routes are **lazy-loaded** (`React.lazy`) so the admin code does not enter
the public bundle. The first hit to `/admin/dashboard` triggers a single chunk
fetch (~70 KB gzipped including recharts).

Environment variables you'll need in production (Railway for the backend):

| Var                    | Purpose                                 |
| ---------------------- | --------------------------------------- |
| `DATABASE_URL`         | Supabase transaction pooler             |
| `DIRECT_URL`           | Supabase session pooler (migrations)    |
| `JWT_SECRET`           | Access-token signing key                |
| `JWT_REFRESH_SECRET`   | Refresh-token signing key (different!)  |
| `RAZORPAY_KEY_ID`      | Live key, format `rzp_live_…`           |
| `RAZORPAY_KEY_SECRET`  | Live secret                             |
| `BREVO_SMTP_USER/PASS` | Brevo SMTP for emails                   |
| `CLOUDINARY_*`         | Invoice PDF storage                     |

Frontend (Vercel): just `VITE_RAZORPAY_KEY_ID` matching the backend live key.

---

## Adding a new admin page (recipe)

1. Create the page in `frontend/src/pages/admin/AdminFooPage.jsx`.
2. Wrap content in `<AdminPageHeader title=…>` and use the shared primitives
   (`DataTable`, `Modal`, `ConfirmDialog`, `StatusBadge`, `StatCard`).
3. Use API wrappers from `frontend/src/api/admin.js` rather than calling
   `apiClient` directly — this keeps server contracts in one place.
4. Register the lazy import + `<Route>` in `frontend/src/routes.jsx` under the
   `/admin` subtree.
5. Add the link to `ADMIN_NAV_ITEMS` in
   `frontend/src/components/admin/AdminSidebar.jsx`.
6. Use `useToast()` for success/error feedback. No `alert()`.

---

## Coupon endpoints (added in this build)

| Method | Path                          | Notes                                   |
| ------ | ----------------------------- | --------------------------------------- |
| GET    | `/api/v1/admin/coupons`       | `?active=true|false&program=BADLAAV…`  |
| POST   | `/api/v1/admin/coupons`       | Body validated by `couponCreateSchema` |
| PATCH  | `/api/v1/admin/coupons/:id`   | Used for edits AND soft-deactivate     |

Schema highlights:
- `code` is uppercase A-Z0-9_- only; `@unique` at DB level + a 409 friendly
  short-circuit in the controller.
- Exactly one of `discountPct` (1-100) or `discountAmount` (₹) must be set —
  enforced by a Zod refine.
- `applicablePrograms` can be empty (= all programs).
- Coupons are never hard-deleted. Deactivate via PATCH `{ active: false }`.
  Public `validateCoupon` already filters `active: true`, so deactivation
  blocks new redemptions immediately.

## What's coming in phase 2

- Refund flow surfaced on `/admin/invoices` with `RefundConfirmDialog`.
- Audit log viewer at `/admin/audit`.
- Per-registration anonymize action (GDPR/DPDP).
- Inline edit of registration status (currently read-only here).
- Dashboard sparklines per program (BADLAAV vs MISSION_UDAAN etc.).
- Coupon edit (currently the UI only supports create + deactivate; backend PATCH
  already accepts arbitrary field updates).
