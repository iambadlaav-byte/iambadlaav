# Architecture

How Badlaav is built — the big picture, the backend, the frontend, and the important flows (login, registration, payment).

For the endpoint list, see [API.md](API.md). For environment variables, see [ENVIRONMENT.md](ENVIRONMENT.md).

---

## 1. The big picture

```
                         ┌──────────────────────────┐
   Browser ──────────────▶  Frontend (React + Vite)  │   Vercel
                         │  static SPA, output: dist │
                         └─────────────┬──────────────┘
                                       │  HTTPS  /api/v1/*
                                       ▼
                         ┌──────────────────────────┐
                         │  Backend (Express API)     │   Railway
                         │  /api/v1/* + cron jobs     │
                         └───┬───────┬───────┬────────┘
                             │       │       │
              ┌──────────────┘       │       └───────────────┐
              ▼                      ▼                        ▼
   ┌────────────────┐     ┌──────────────────┐     ┌──────────────────┐
   │ PostgreSQL      │     │ Razorpay          │     │ Brevo (SMTP)      │
   │ (Supabase)      │     │ orders + webhook  │     │ Cloudinary (media)│
   │ via Prisma      │     │                   │     │ Sentry (errors)   │
   └────────────────┘     └──────────────────┘     └──────────────────┘
```

### How the pieces connect

- **Monorepo** — three packages managed by npm workspaces: `frontend`, `backend`, `packages/validators`.
- **Shared validation** — Zod schemas in `packages/validators` (`@dnyanpith/validators`) are used by both the React forms AND the Express endpoints. If a value is rejected in the browser, the server rejects it too.
- **In development** — Vite (port 5173) proxies `/api/*` to Express (port 4000), so there are no CORS issues locally.
- **In production** — the frontend is a static SPA on Vercel, the backend runs on Railway. They talk over HTTPS.

---

## 2. Backend — how it works

Built with Express 4, ESM modules, Prisma 7 (ORM), and Pino (logging).

Entry point: `backend/src/server.js` → builds the app in `backend/src/app.js`.

### Folder structure (`backend/src/`)

| Folder | What's inside |
|---|---|
| `server.js` | HTTP server, port binding, graceful shutdown |
| `app.js` | Express app setup: middleware stack + route mounting |
| `routes/v1/` | Route definitions (one file per resource), mounted at `/api/v1` |
| `controllers/` | Request handlers — parse input, call a service, send response |
| `services/` | Business logic (razorpay, email, invoice, coupon, OTP, cloudinary, audit, CSV) |
| `middleware/` | auth, validation (Zod), rate limiting, request ID, error handler, file upload (multer) |
| `validators/` | Re-exports the shared Zod schemas from `@dnyanpith/validators` |
| `utils/` | JWT, hashing, invoice numbers, financial year helpers |
| `templates/` | Handlebars email templates (`.hbs`) |
| `lib/` | Prisma client singleton, Pino logger, Sentry init |
| `jobs/` | Cron jobs (e.g., failed-payment reminder) |
| `prisma/` | Database schema, migrations, seed script |

### Middleware — what runs on each request (in order)

1. **Request ID** — gives each request a UUID for traceable logs
2. **Helmet** — adds security headers (CSP allows Razorpay, Cloudinary, fonts, YouTube)
3. **CORS** — only allows requests from URLs in `ALLOWED_ORIGINS`
4. **Cookie parser** — reads the refresh-token cookie
5. **Pino HTTP** — logs each request (redacts auth headers for security)
6. **Raw body** for webhook — the Razorpay webhook endpoint needs the exact raw bytes to verify the signature, so this runs BEFORE JSON parsing
7. **JSON parsing** — all other routes (1 MB limit)
8. **API routes** — the `/api/v1/*` endpoints
9. **Error handler** — catches errors and returns clean JSON responses

### Security

| Feature | How it works |
|---|---|
| **Passwords** | Hashed with bcrypt (cost 12). Account locks after 5 failed logins for 30 minutes. |
| **Access tokens** | JWT, 1 hour expiry, sent in the `Authorization` header |
| **Refresh tokens** | JWT, 7 day expiry, stored in httpOnly+secure+sameSite cookie. Rotated on each refresh. Old tokens are invalidated. |
| **OTP** | 6-digit codes, valid for 10 minutes, stored as SHA-256 hashes |
| **Input validation** | Every user-input endpoint validates with Zod schemas + rate limiting |
| **Admin routes** | Protected by `authenticate → requireAuth → requireStaff`; writes layer `requireEditor` / `requireAdmin` per the role matrix (see SECURITY.md) |
| **Webhook** | Razorpay signature verification + replay protection (stores processed event IDs) |
| **Uploads** | MIME type allowlist + magic-byte verification + size limit → uploaded to Cloudinary |

### Database tables

The main tables Badlaav uses:

| Table | What it stores |
|---|---|
| `User` | User accounts with roles. Public tiers: GUEST/REGISTERED/ENROLLED/VOLUNTEER. Staff tiers: SUPERADMIN/ADMIN/CONTRIBUTOR/VIEWER |
| `Batch` | Retreat dates: program, dates, venue, seats, pricing, status |
| `Registration` | Bookings: user, batch, plan type, amount, coupon, payment status, Razorpay IDs, invoice |
| `Coupon` | Discount codes with usage caps, validity dates, programme scoping, and optional per-batch scoping (`applicableBatches`) |
| `RefreshToken` | Hashed refresh tokens for rotation and reuse detection |
| `OTP` | Hashed one-time codes for login |
| `ProcessedWebhook` | Razorpay event IDs already handled (prevents duplicate processing) |
| `InvoiceSequence` | Gap-less invoice numbering per Indian financial year |
| `AuditLog` | Records of admin actions |
| `Enquiry` | Corporate/college enquiry form submissions |

> `Volunteer`, `GalleryItem`, and `Story` back the volunteer application and the gallery/story CMS. `GalleryItem` and `Story` each carry a `category` (programme vertical: `BADLAAV` / `FUTURE_READINESS` / `GENERAL`) that drives the public filters. `Volunteer` is deduped per batch — `@@unique([userId, batchAttended])` — so the same person can re-apply for a different batch. `CommunityMember` backs the community join flow. A few tables (`BlogPost`, `Event`) are carried over from the parent project and aren't surfaced in the current build.

### Dedup guards (duplicate submission protection)

Every public form endpoint rejects duplicate submissions:

| Endpoint | Strategy | What happens on duplicate |
|---|---|---|
| `POST /registrations` | Controller pre-check: `findFirst` for same `userId + batchId + program` | PENDING → returns existing row (Razorpay re-opens). PAID → 409 `ALREADY_REGISTERED` |
| `POST /community/join` | DB unique constraint `@@unique([phone, initiative])` | Prisma `P2002` → 409 `ALREADY_JOINED` + WhatsApp link |
| `POST /enquiries/corporate` | 5-min time-window: same email + type within 5 minutes | 409 `DUPLICATE_ENQUIRY` |
| `POST /enquiries/college` | Same as corporate | 409 `DUPLICATE_ENQUIRY` |
| `POST /messages` | 5-min time-window: same email within 5 minutes | 409 `DUPLICATE_MESSAGE` |

Frontend: `useFormSubmit.js` has a `hasSubmitted` flag (prevents re-submit after success) and an `onDuplicate` callback (handles 409 gracefully).

---

## 3. Frontend — how it works

Built with React 18, Vite, Tailwind CSS, and Framer Motion.

Entry point: `frontend/src/main.jsx` → `App.jsx` → `routes.jsx`.

### Folder structure (`frontend/src/`)

| Folder | What's inside |
|---|---|
| `main.jsx` | Providers: Helmet, Router, Theme, Auth, Toast → mounts `<App/>` |
| `App.jsx` | Renders the routes |
| `routes.jsx` | All routes, wrapped in Layout + motion boundary |
| `pages/public/` | One file per page (HomePage, RetreatPage, PricingPage, etc.) |
| `components/layout/` | Header, Footer, MobileNav, Layout, ScrollToTop, WhatsApp button |
| `components/sections/` | Page sections (Hero, RetreatDays, Pricing3Plans, UpcomingBatches, etc.) |
| `components/forms/` | CorporateEnquiryForm, RegistrationForm (+ wizard steps) |
| `components/ui/` | Button, Input, Select, FormField, SuccessCard, Toast, etc. |
| `components/animations/` | FadeIn, StaggerChildren, FallingLeaves, BreathingPulse |
| `hooks/` | Custom hooks (useReducedMotion, etc.) |
| `context/` | AuthContext, ThemeContext |
| `api/` | Axios client with interceptors |
| `lib/` | Content data, constants, themes, SEO config, utilities |
| `styles/` | CSS with theme variables, base styles, keyframes |

### How the "warm" theme works

The site has one fixed theme (no dark mode or theme switcher):

1. **`tailwind.config.js`** maps color names (like `bg-cream`, `text-ink`, `bg-gold`) to CSS variables.
2. **`lib/themes.js`** defines what those variables look like (the actual color values).
3. **`context/ThemeContext.jsx`** applies them to the page at startup.
4. **`styles/globals.css`** has fallback values and loads the fonts (Cormorant Garamond, DM Sans, DM Mono).

> **To re-skin the entire site**, just change the variable values in `themes.js`. You don't need to edit any components.

### Pages and routes

All public pages: `/` (home), `/retreat`, `/badlaav-experience`, `/pricing`, `/about`, `/gallery`, `/stories`, `/stories/:id`, `/contact`, `/register`, `/payment-success`, `/login`, `/privacy`, `/terms`, `/refund`, and a `*` catch-all 404. The top nav collapses "The Retreat" and "The Badlaav Experience" into a single "Programmes" dropdown and adds a "Stories" link.

Admin pages (lazy-loaded, role-gated): `/admin/dashboard`, `/admin/batches`, `/admin/registrations`, `/admin/coupons`, `/admin/enquiries`, `/admin/volunteers`, `/admin/invoices`, `/admin/reports`, `/admin/stories`, `/admin/gallery`, `/admin/audit`, `/admin/settings`.

### How API calls work

- **`api/client.js`** creates an Axios instance that sends requests to `/api/v1` (dev proxy) or `VITE_API_URL` (production).
- It automatically adds the access token to requests.
- If a request gets a 401 (unauthorized), it tries to refresh the token and retries once.

### How forms work

All forms use React Hook Form + Zod validation with schemas from `@dnyanpith/validators`. They show inline errors, disable the submit button during submission, and show a spinner.

---

## 4. Key flows

### How login works

```
1. User requests an OTP:     POST /auth/otp/request → email with 6-digit code
2. User enters the code:     POST /auth/otp/verify → gets access token + refresh cookie
3. Token refresh:            POST /auth/refresh (cookie) → new access token + new refresh cookie
4. Logout:                   POST /auth/logout → refresh token revoked
```

There's also password login for admins: `POST /auth/login` (email + password).

### How registration + payment works (the main conversion flow)

```
1. User picks a plan on /pricing or /register

2. Frontend sends:   POST /api/v1/registrations {name, email, phone, batch, plan, coupon?}
   → Backend validates everything
   → Creates a PENDING Registration + a Razorpay order
   → Returns { registrationId, razorpayOrderId, amount }

3. Frontend opens the Razorpay Checkout popup

4. After payment:
   → Razorpay sends a webhook: POST /api/v1/payments/webhook
   → Backend verifies the signature
   → Checks it hasn't processed this event before (replay protection)
   → Marks Registration as PAID
   → Generates an invoice
   → Sends confirmation email

5. User lands on /payment-success
```

> A cron job (`jobs/failedPaymentReminder.js`) emails users whose registrations are stuck PENDING for more than ~15 minutes.

### How enquiries & messages work

The `/contact` page has a **Personal / Corporate** toggle (`?type=corporate` deep-links straight to the corporate side):

```
Personal:   POST /api/v1/messages           → Message row + admin "new message" email
Corporate:  POST /api/v1/enquiries/corporate → Enquiry row + admin "new enquiry" email
```

---

## 5. How deployment works

| Component | Where | How |
|---|---|---|
| **Frontend** | **Vercel** | `npm run build` at the repo root → Vite outputs to `dist/` → Vercel serves it as a static SPA with client-side routing |
| **Backend** | **Railway** | Builds from repo root → `prisma generate` → starts Express → `prisma migrate deploy` applies migrations at startup |
| **Database** | **Supabase** | Prisma 7 connects via `@prisma/adapter-pg` driver adapter using the session pooler (port 5432) |

Details and step-by-step instructions: [DEPLOYMENT.md](DEPLOYMENT.md).
