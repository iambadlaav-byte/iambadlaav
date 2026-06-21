# API Reference

All endpoints are under **`/api/v1`**.

- **Local dev:** `http://localhost:4000/api/v1`
- **Production:** `https://<your-api-domain>/api/v1`

In the frontend code, the Vite proxy (dev) or `VITE_API_URL` (prod) handles the base URL automatically. API calls go through `apiClient` in `frontend/src/api/client.js`.

### Auth levels

| Level | What it means |
|---|---|
| **Public** | No login needed |
| **User** | Must send a valid access token: `Authorization: Bearer <token>` |
| **Staff** | Must be a User with a staff role (`SUPERADMIN` / `ADMIN` / `CONTRIBUTOR` / `VIEWER`). Reading the admin panel needs any staff tier; specific writes need a higher tier (see the admin section). |
| **Cookie** | Refresh token sent automatically in an httpOnly cookie |

Endpoints **this frontend actually uses** are marked with ⭐.

---

## Health check

| Method | Path | Auth | What it does |
|---|---|---|---|
| GET | `/health` | Public | Returns server status + database connection status. Used by Railway for health monitoring. |

---

## Public endpoints — content & forms

| Method | Path | Auth | What it does |
|---|---|---|---|
| GET | `/batches` ⭐ | Public | Lists all retreat batches. The frontend filters to show only OPEN Badlaav batches. |
| POST | `/enquiries/corporate` ⭐ | Public | Submits a corporate/team enquiry (the /contact form). Returns **409** if same email submitted within 5 minutes. |
| POST | `/enquiries/college` | Public | College enquiry. Returns **409** if same email submitted within 5 minutes. |
| POST | `/community/join` | Public | Community sign-up. Returns **409** `ALREADY_JOINED` + WhatsApp link if `phone + initiative` already exists. |
| POST | `/messages` | Public | Generic contact message. Returns **409** if same email submitted within 5 minutes. |
| GET | `/stories` ⭐ | Public | Lists **published** stories (paginated). Frontend filters by category on `/stories`. |
| GET | `/stories/:id` ⭐ | Public | One **published** story by id (full read at `/stories/:id`). |
| GET | `/gallery` ⭐ | Public | Lists gallery items; optional `?category=` (BADLAAV / FUTURE_READINESS / GENERAL). |
| GET | `/blog`, `/blog/:slug` | Public | Blog list/post (unused by Badlaav). |
| GET | `/events`, `/events/:id` | Public | Events (unused by Badlaav). |

---

## Registration & payment ⭐

| Method | Path | Auth | What it does |
|---|---|---|---|
| POST | `/registrations` ⭐ | Public | Creates a registration + Razorpay order. Rate-limited: 5/hr/IP. Returns existing row if PENDING (Razorpay re-opens). Returns **409** `ALREADY_REGISTERED` if already PAID for same batch. |
| GET | `/registrations/:id/invoice` | User | Gets the invoice URL for a registration. |
| POST | `/payments/create-order` | User | Re-creates a Razorpay order for an abandoned checkout. |
| POST | `/payments/verify` ⭐ | User | Client-side payment callback (for UX only — does NOT change payment status). |
| POST | `/payments/webhook` | Public* | Razorpay webhook — **the real source of truth** for whether payment succeeded. |
| POST | `/coupons/validate` ⭐ | Public | Checks if a coupon code is valid and calculates the discount. Accepts an optional `batchId` and returns **`NOT_APPLICABLE`** if the coupon is batch-scoped and the batch isn't in scope. Rate-limited: 20 per minute per IP. |

> *The webhook is technically "public" but is protected by Razorpay HMAC **signature verification** + replay protection. It must receive the raw request body (configured in `app.js`).

---

## Authentication

| Method | Path | Auth | What it does |
|---|---|---|---|
| POST | `/auth/otp/request` | Public | Sends a 6-digit login OTP to the user's email. Rate-limited. |
| POST | `/auth/otp/verify` | Public | Verifies the OTP → returns access token + sets refresh cookie. |
| POST | `/auth/login` | Public | Password login (for admin). Returns access token + sets refresh cookie. Locks account after 5 failures. |
| POST | `/auth/refresh` | Cookie | Uses the refresh cookie to issue a new access token. Rotates the refresh token. |
| POST | `/auth/logout` | User | Revokes the refresh token. |

---

## User profile (authenticated)

| Method | Path | Auth | What it does |
|---|---|---|---|
| GET | `/users/me` | User | Returns the user's profile (no secrets). |
| PATCH | `/users/me` | User | Updates profile fields. |
| POST | `/users/me/photo` | User | Uploads a profile photo (verified + sent to Cloudinary). |
| GET | `/users/me/registrations` | User | Lists the user's registrations. |
| GET | `/users/me/community` | User | Lists the user's community memberships. |
| GET | `/users/me/events` | User | Lists upcoming events from paid registrations. |

---

## Admin endpoints (`/admin/*`)

Every `/admin/*` route inherits `authenticate → requireAuth → requireStaff`, so **any staff tier** can read. Write routes layer on a higher gate, shown in the **Gate** column:

- **requireEditor** = Contributor or admin tier (Admin / Superadmin).
- **requireAdmin** = admin tier only (Admin / Superadmin).
- Some endpoints further restrict *inside the controller* — noted in "What it does".

Financial amounts/revenue and contact PII are additionally gated inside controllers (`canSeeFinancials`, `canSeeContact`) — Viewers and Contributors get rows with those columns stripped. CSV exports apply the same stripping. The admin panel is at `/admin/*` in the frontend (lazy-loaded, role-gated).

### Dashboard & registrations

| Method | Path | Gate | What it does |
|---|---|---|---|
| GET | `/admin/dashboard` | staff | Aggregate stats (total registrations, revenue for admin tier, etc.) |
| GET | `/admin/registrations` | staff | List all registrations |
| GET | `/admin/registrations/:id` | staff | Get one registration |
| GET | `/admin/registrations/export.csv` | staff | Download registrations as CSV (auth blob) |
| GET | `/admin/registrations/reconciliation` | staff | Payment reconciliation report |
| PATCH | `/admin/registrations/:id` | editor | Update a registration's status |
| POST | `/admin/registrations/:id/resend-email` | editor | Resend confirmation email |
| POST | `/admin/registrations/:id/waitlist-invite` | editor | Send a waitlisted candidate a payment link |
| POST | `/admin/registrations/:id/mark-paid` | admin | Mark an offline payment as paid |
| POST | `/admin/registrations/:id/mark-refunded` | admin | Mark a payment as refunded manually |
| DELETE | `/admin/registrations/:id` | admin | Delete a registration |

### Batches

| Method | Path | Gate | What it does |
|---|---|---|---|
| GET | `/admin/batches` | staff | List all batches |
| POST | `/admin/batches` | admin | Create a new batch |
| PATCH | `/admin/batches/:id` | admin | Update a batch |
| DELETE | `/admin/batches/:id` | admin | Delete a batch. Controller further restricts to **SUPERADMIN** and refuses (409) if the batch already has registrations. |

### Coupons

| Method | Path | Gate | What it does |
|---|---|---|---|
| GET | `/admin/coupons` | staff | List coupons |
| POST | `/admin/coupons` | admin | Create a coupon (supports `applicableBatches`) |
| PATCH | `/admin/coupons/:id` | admin | Edit a coupon, or deactivate via `{ active: false }` |
| DELETE | `/admin/coupons/:id` | editor | Hard-delete a coupon |

### Invoices

| Method | Path | Gate | What it does |
|---|---|---|---|
| GET | `/admin/invoices` | staff | List all invoices |
| GET | `/admin/invoices/export.csv` | staff | Export invoices as CSV (auth blob) |
| GET | `/admin/invoices/:id` | staff | View one invoice |
| POST | `/admin/invoices/:id/resend` | editor | Resend an invoice email |
| POST | `/admin/invoices/:id/refund` | admin | Issue a refund (rate-limited: 10 per hour) |

### Enquiries

| Method | Path | Gate | What it does |
|---|---|---|---|
| GET | `/admin/enquiries` | staff | List all enquiries |
| GET | `/admin/enquiries/export.csv` | staff | Export enquiries as CSV (auth blob) |
| PATCH | `/admin/enquiries/:id` | editor | Update an enquiry |
| DELETE | `/admin/enquiries/:id` | admin | Delete an enquiry |

### Volunteers

| Method | Path | Gate | What it does |
|---|---|---|---|
| GET | `/admin/volunteers` | staff | List all volunteer applications |
| GET | `/admin/volunteers/export.csv` | staff | Export volunteers as CSV (auth blob) |
| PATCH | `/admin/volunteers/:id` | editor | Approve / reject a volunteer |
| DELETE | `/admin/volunteers/:id` | admin | Delete a volunteer |

### Stories & Gallery (CMS)

| Method | Path | Gate | What it does |
|---|---|---|---|
| GET | `/admin/stories` | staff | List all stories (any status) |
| POST | `/admin/stories` | editor | Create a story (with `category`) |
| POST | `/admin/stories/upload` | editor | Upload a story photo (magic-byte verified) |
| PATCH | `/admin/stories/:id` | editor | Edit a story |
| POST | `/admin/stories/:id/archive` | editor | Archive a story |
| GET | `/admin/gallery` | staff | List all gallery items |
| POST | `/admin/gallery` | editor | Create a gallery item (with `category`) |
| POST | `/admin/gallery/upload` | editor | Upload a gallery image (magic-byte verified) |
| PATCH | `/admin/gallery/:id` | editor | Edit a gallery item |
| DELETE | `/admin/gallery/:id` | editor | Delete a gallery item |

### Reports & other admin endpoints

| Method | Path | Gate | What it does |
|---|---|---|---|
| GET | `/admin/reports` | staff | Summary reports (revenue gated to admin tier) |
| GET | `/admin/reports/export.csv` | staff | Export reports as CSV (auth blob) |
| GET | `/admin/community` | staff | List community members |
| GET | `/admin/community/export.csv` | staff | Export community as CSV |
| GET/POST/PATCH | `/admin/blog/*` | editor (writes) | Blog CRUD |
| GET/POST/PATCH | `/admin/events/*` | editor (writes) | Events CRUD |
| GET | `/admin/audit` | staff | View audit log |

### Staff users (admin tier only)

| Method | Path | Gate | What it does |
|---|---|---|---|
| GET | `/admin/users` | admin | List staff users + login activity |
| POST | `/admin/users` | admin | Create a staff user |
| PATCH | `/admin/users/:id/role` | admin | Change a user's role |
| POST | `/admin/users/:id/reset-password` | admin | Reset another user's password |
| DELETE | `/admin/users/:id` | admin | Soft-delete a staff user. Controller rules: can't delete self, can't delete a SUPERADMIN, only a SUPERADMIN can delete an ADMIN. |
| POST | `/admin/users/:id/anonymize` | admin | Anonymize a user (GDPR-style) |

---

## How requests work — general rules

| Rule | Details |
|---|---|
| **Format** | All requests and responses are JSON |
| **Validation** | Every input is validated with Zod schemas from `@dnyanpith/validators`. Invalid input returns `400` with field-level errors. |
| **Error format** | `{ "error": "message" }` for general errors, `{ "errors": {...} }` for validation errors |
| **HTTP status codes** | `401` = not logged in, `403` = wrong role, `409` = duplicate submission (dedup), `429` = rate limited |
| **Rate limits** | Form submits: 5/hr/IP · Coupon validation: 20/min/IP · OTP: per-email + per-IP · Refunds: 10/hr |
| **Source of truth** | Route definitions are in `backend/src/routes/v1/*.routes.js` |
