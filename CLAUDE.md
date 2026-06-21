# CLAUDE.md — Project Conventions for the Badlaav Website

Claude Code reads this file at the start of every session and treats it as authoritative project rules.

This is the **standalone Badlaav website** — a 3-day residential retreat brand operated by **Dnyanpith Abhyasika Pvt. Ltd.** (Ambajogai, Maharashtra). Founder: Arjun Thoratt. Hero positioning: *"Trip नाही — Turning Point."* and *"You cannot think clearly in a noisy environment."*

The backend was **copied verbatim** from the parent Dnyanpith ecosystem project; the frontend is a **new warm-premium retreat build**, structurally inspired by lifebydesign.in (adapted, not copied). The broader Dnyanpith ecosystem site is a **separate project** — never build its other programs (Mission Udaan, Future Readiness, community circles) here.

---

## TECH STACK (locked — never substitute)

**Frontend:** React 18 + Vite + Tailwind CSS + Framer Motion + React Hook Form + Zod + Axios + React Router 6 + react-helmet-async

**Backend:** Node.js + Express 4 + Prisma + PostgreSQL (Supabase) + JWT + bcrypt + Nodemailer (Brevo SMTP) + Razorpay + Cloudinary + Multer + helmet + express-rate-limit + Pino

**Hosting:** Vercel (frontend) + Railway (backend) + Supabase (database) + Cloudinary (media) + Sentry (errors)

**Node.js:** version 18 or newer. No upper bound — the `engines` field in package.json is `">=18"`.

**Build output:** `npm run build` runs `vite build` in `frontend/`, but outputs to `dist/` at the **repo root** (not `frontend/dist/`). This is required for Vercel deployment.

Do not introduce Next.js, Redux, styled-components, or Mongoose. Ask before substituting any library.

**Shared validators:** Zod schemas live in `packages/validators` (package name `@dnyanpith/validators`, kept for import compatibility) and are imported by both frontend and backend. One schema, two consumers.

---

## BRAND VOICE — non-negotiable

Calm, direct, warm, grounded, "elder-brother" tone. Assumes an intelligent reader.

### Forbidden phrases (never use)
"world-class", "premier institution", "cutting-edge", "synergy", "leverage" (verb), "unlock your potential", "revolutionary", "game-changing", "best-in-class", "transformative" (unless literally), "Lorem ipsum".

### Voice rules
- Short sentences. Direct claims. No hedging.
- Marathi phrases welcome where they land: *"Trip नाही — Turning Point."*, *"Talk to Arjun Dada"*.
- Reference the founder as "I" (his voice) or "Arjun" / "Arjun Dada" — never "Mr. Thoratt".
- The Vipassana atmosphere is implicit — show, don't tell.
- Numbers in body copy: spell out one–nine, numerals from 10. Exceptions: brand stats and proper nouns.

---

## DESIGN — the "Warm" theme

A single fixed theme (no theme switcher). Tailwind color tokens map to CSS variables (see `frontend/tailwind.config.js` + `frontend/src/lib/themes.js`) — **re-theme by changing variable values, never by hardcoding hex in components.**

- **Palette:** warm sand backgrounds (`cream`, `soft`), deep forest-green dark surfaces (`navy`, `ink`), muted antique `gold` CTAs, terracotta `ochre` accent, sage `teal` links, warm `charcoal` text, `pearl` text on dark.
- **Fonts:** `display` = Cormorant Garamond, `sans` = DM Sans, `mono` = DM Mono.
- **Containers:** `max-w-narrow` (700) / `max-w-default` (1160) / `max-w-wide` (1440).
- **Spacing:** sections use `py-[var(--section-y)] px-[var(--section-x)]`.

---

## CODE CONVENTIONS

- **No inline styles** in JSX except fluid `clamp()` font-size via `style={{ fontSize: 'clamp(...)' }}` (existing pattern). Prefer Tailwind classes; use `cn()` from `lib/cn.js` for conditional classes.
- **No magic numbers** — constants live in `frontend/src/lib/constants.js`.
- **No `console.log`** in committed code — backend uses the Pino logger; frontend only `console.error` for unrecoverable errors.
- Comments explain **why**, not what.
- Functional components + hooks only. One component per file, PascalCase filename = export.
- **Animations:** only animate `transform`/`opacity`. Always respect `prefers-reduced-motion` (use `useReducedMotion`). Max 1 ambient + 1 reveal animation per viewport. No animation on form/admin pages.

## FORMS
- React Hook Form + Zod only. Schemas from `@dnyanpith/validators`. Inline errors, never `alert()`. Submit buttons disable + show a spinner during the request.

## BACKEND (copied — keep conventions)
- All routes under `/api/v1/`. Every user-input endpoint validates with Zod and is rate-limited. Data-modifying endpoints have role-based access. Prisma only (no raw SQL unless `Prisma.sql`). Never log secrets (Pino redact).
- Security: bcrypt cost 12; JWT access 1h / refresh 7d (httpOnly+secure+sameSite cookie, rotated); OTP 6-digit sha256, 10-min; Razorpay webhook verifies signature + replay-checks `processed_webhooks`; uploads verify magic bytes.

---

## FILE ORGANIZATION

```
frontend/src/
├── components/{layout,animations,ui,forms,sections,cards}/
├── pages/public/        # one file per public route
├── hooks/  context/  api/  lib/  styles/
backend/src/
├── routes/v1/  controllers/  services/  middleware/  validators/  utils/  templates/  lib/  jobs/
└── prisma/              # schema.prisma + migrations + seed.js
packages/validators/     # shared Zod schemas (@dnyanpith/validators)
```

If a new file doesn't fit clearly, ask before creating it.

---

## SCOPE NOTES (this build)
- First build = **marketing site + online registration with Razorpay + admin panel**.
- Admin panel is live at `/admin/*` (lazy-loaded, role-gated via `AdminProtectedRoute`). Login at `/login` with email + password.
- **Staff role tiers** (RBAC helpers in `backend/src/middleware/auth.js`): `SUPERADMIN` ⊃ `ADMIN` (full: financials, batches, users, refunds, deletes; only SUPERADMIN deletes an ADMIN or a batch) · `CONTRIBUTOR` (ops: registrations/enquiries/volunteers/stories/gallery/coupons — no financial amounts, no batch create, no user management) · `VIEWER` (read-only, no financial figures, no contact PII). `requireAdmin` = admin-tier (`isAdminTier`); `requireEditor` = CONTRIBUTOR + admin-tier; `requireStaff` = any staff. The seeded founder is `SUPERADMIN`. See `docs/SECURITY.md` / `docs/ADMIN_GUIDE.md` for the full matrix.
- The site needs its **own Supabase database** (separate from Dnyanpith).
- Legacy non-Badlaav page files copied from the parent project are **unrouted** — do not link to them; they can be deleted in a cleanup pass.

---

## DEDUP PATTERNS (all form endpoints)

Every public form endpoint has duplicate-submission protection. Follow the same patterns when adding new forms:

- **Registration** (`POST /registrations`): Controller pre-check — `findFirst` for existing PENDING/PAID row for the same `userId + batchId + program`. PENDING → returns existing row so Razorpay re-opens. PAID → 409 `ALREADY_REGISTERED`. Backed by `@@index([userId, batchId, program])`.
- **Community join** (`POST /community/join`): Database-level `@@unique([phone, initiative])`. Controller catches Prisma `P2002` → 409 `ALREADY_JOINED` with WhatsApp group link.
- **Enquiries** (`POST /enquiries/corporate`, `/enquiries/college`): 5-minute time-window dedup by email + type. 409 `DUPLICATE_ENQUIRY`.
- **Messages** (`POST /messages`): 5-minute time-window dedup by email. 409 `DUPLICATE_MESSAGE`.
- **Frontend**: `useFormSubmit.js` has `hasSubmitted` state (blocks re-submit after success) and `onDuplicate` callback (handles 409 gracefully — usually shows the success card).
- **User upsert** (in registration): `update` clause only sets `name` (corrects OTP ghost users). Does NOT overwrite `phone`/`city`/`state` to prevent profile hijacking from unauthenticated forms.
