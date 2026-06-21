# Badlaav Admin Panel — usage guide

This panel lives inside the existing Badlaav frontend at `/admin/*`. It reuses
the same `AuthContext` and `apiClient` used by the public site, so there is one
session, one refresh-token cookie, and one source of truth for who you are.

The panel ships the full operations surface: batches, registrations, coupons,
enquiries, volunteers, invoices/refunds, reports, stories/gallery CMS, the audit
log, and staff-user management.

---

## Who can access

Any **staff tier** may load `/admin/*` — `SUPERADMIN`, `ADMIN`, `CONTRIBUTOR`, or
`VIEWER`. What each can *do* is governed by the role matrix (see
[ADMIN_GUIDE.md](ADMIN_GUIDE.md)). The guard is defense-in-depth:

| Layer    | Check                                                            |
| -------- | ---------------------------------------------------------------- |
| Frontend | `AdminProtectedRoute` reads `useAuth()`; non-staff → `/`         |
| Backend  | Every `/api/v1/admin/*` route uses `requireStaff` (reads); write routes layer `requireEditor` / `requireAdmin` |
| Network  | Session token in memory; refresh in httpOnly + sameSite cookie   |

Staff accounts are created from **Settings → Team** by an Admin-tier user (or, for
the very first account, seeded in the database). There is no admin self-signup, by
design. The seeded founder account is a `SUPERADMIN`.

---

## Logging in

1. Visit `/login` (shared with the public site).
2. Sign in with email + OTP, or email + password.
3. After auth, the LoginForm and LoginPage both check `user.role`:
   - any staff tier (`SUPERADMIN` / `ADMIN` / `CONTRIBUTOR` / `VIEWER`) → `/admin/dashboard`
   - everyone else → `/account/dashboard`
4. If you hit `/admin/anything` without being signed in, you're redirected to
   `/login?next=/admin/anything`. After login you land back on the requested page.

Session is restored automatically on page load via the httpOnly refresh cookie,
so a hard refresh inside the panel does not log you out.

`/admin/login` is kept as a courtesy URL — it redirects to the shared `/login`
with `next=/admin/dashboard`.

---

## Pages

| Route                          | What it does                                       |
| ------------------------------ | -------------------------------------------------- |
| `/admin/dashboard`             | 4 KPI tiles + 14-day registrations bar chart       |
| `/admin/batches`               | List, filter, search, close, mark full, reopen; delete (SUPERADMIN) |
| `/admin/batches/new`           | Create a new batch                                 |
| `/admin/batches/:id/edit`      | Edit an existing batch                             |
| `/admin/coupons`               | List, filter by active status, create, edit, deactivate, delete; per-batch scoping |
| `/admin/coupons/new`           | Opens the create-coupon modal directly             |
| `/admin/registrations`         | List with filters, details modal, resend email, status update, delete, CSV export |
| `/admin/enquiries`             | List, filter, status update, admin-note, delete, CSV export |
| `/admin/volunteers`            | List, approve/reject, delete, CSV export           |
| `/admin/invoices`              | List paid/refunded, view PDF, resend email, refund, download (single + bulk), delete registration |
| `/admin/reports`              | Summary reports; revenue gated to admin tier; CSV export |
| `/admin/stories`               | Stories CMS — write/publish, set category, upload photos |
| `/admin/gallery`               | Gallery CMS — upload, set category, caption, alt text |
| `/admin/audit`                 | Audit log viewer                                   |
| `/admin/settings`              | System health, Team (staff CRUD), Your account     |

The sidebar shows the signed-in staff member's role as a badge. Some legacy admin
screens (blog, events, community) remain in the codebase, carried over from the
parent project, but are not all linked from the sidebar.

---

## Security checklist

- Access token kept in React state (memory only — never in `localStorage`).
- Refresh token in an `httpOnly` + `sameSite=lax` cookie set by the server.
- 401 from any admin endpoint triggers a single refresh attempt via the axios
  interceptor in `api/client.js`. If refresh also 401s, the user is signed out.
- RBAC is enforced **server-side** on every `/admin/*` API route: a base
  `requireStaff` chain for reads, then `requireEditor` (Admin/Contributor) or
  `requireAdmin` (admin tier) on writes. The client guard exists for UX only;
  bypassing it gains no privilege.
- CSV exports download as an **authenticated blob** (`downloadCsv` in
  `frontend/src/api/admin.js`) so the `Authorization` header is sent — a plain
  `<a href>` would drop it and 401.
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

## Coupon endpoints

| Method | Path                          | Gate          | Notes                              |
| ------ | ----------------------------- | ------------- | ---------------------------------- |
| GET    | `/api/v1/admin/coupons`       | requireStaff  | `?active=true|false&program=BADLAAV…` |
| POST   | `/api/v1/admin/coupons`       | requireAdmin  | Body validated by `couponCreateSchema` |
| PATCH  | `/api/v1/admin/coupons/:id`   | requireAdmin  | Used for edits AND soft-deactivate |
| DELETE | `/api/v1/admin/coupons/:id`   | requireEditor | Hard-delete (Contributor + admin tier) |

Schema highlights:
- `code` is uppercase A-Z0-9_- only; `@unique` at DB level + a 409 friendly
  short-circuit in the controller.
- Exactly one of `discountPct` (1-100) or `discountAmount` (₹) must be set —
  enforced by a Zod refine.
- `applicablePrograms` can be empty (= all programmes).
- `applicableBatches` (`String[]`, batch ids) scopes a coupon to specific
  batches; empty = every batch. `validateCoupon` / `applyCouponInTx` take a
  `batchId` and reject with `NOT_APPLICABLE` when the batch isn't in scope. The
  registration coupon check and the payment webhook both pass `batchId`.
- Two ways to remove a coupon: **deactivate** via PATCH `{ active: false }`
  (keeps history; public `validateCoupon` already filters `active: true`, so it
  blocks new redemptions immediately) or **hard-delete** via DELETE.

## Live coupon preview on the registration form

The registration forms now have a working **Apply** button (`CouponField`
component). It calls `POST /coupons/validate` with the code, programme, amount,
and `batchId`, then shows the discounted total before the user pays.
