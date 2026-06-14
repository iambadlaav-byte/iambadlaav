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
| **Admin** | Must be a User with role `ADMIN` |
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
| POST | `/coupons/validate` ⭐ | Public | Checks if a coupon code is valid and calculates the discount. Rate-limited: 20 per minute per IP. |

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

All admin endpoints require the `ADMIN` role. The admin panel is at `/admin/*` in the frontend (lazy-loaded, role-gated).

### Dashboard & registrations

| Method | Path | What it does |
|---|---|---|
| GET | `/admin/dashboard` | Aggregate stats (total registrations, revenue, etc.) |
| GET | `/admin/registrations` | List all registrations |
| GET | `/admin/registrations/:id` | Get one registration |
| PATCH | `/admin/registrations/:id` | Update a registration's status |
| GET | `/admin/registrations/export.csv` | Download registrations as CSV |
| GET | `/admin/registrations/reconciliation` | Payment reconciliation report |
| POST | `/admin/registrations/:id/resend-email` | Resend confirmation email |

### Batches

| Method | Path | What it does |
|---|---|---|
| GET | `/admin/batches` | List all batches |
| POST | `/admin/batches` | Create a new batch |
| PATCH | `/admin/batches/:id` | Update a batch |

### Invoices

| Method | Path | What it does |
|---|---|---|
| GET | `/admin/invoices` | List all invoices |
| GET | `/admin/invoices/:id` | View one invoice |
| POST | `/admin/invoices/:id/resend` | Resend an invoice email |
| POST | `/admin/invoices/:id/refund` | Issue a refund (rate-limited: 10 per hour) |

### Enquiries

| Method | Path | What it does |
|---|---|---|
| GET | `/admin/enquiries` | List all enquiries |
| PATCH | `/admin/enquiries/:id` | Update an enquiry |

### Other admin endpoints

| Method | Path | What it does |
|---|---|---|
| GET | `/admin/community` | List community members |
| GET | `/admin/community/export.csv` | Export community as CSV |
| GET/POST/PATCH | `/admin/blog/*` | Blog CRUD |
| GET/POST/PATCH | `/admin/events/*` | Events CRUD |
| GET | `/admin/audit` | View audit log |
| POST | `/admin/users/:id/anonymize` | Anonymize a user (GDPR-style) |

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
