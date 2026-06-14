# Usage & Operations

How visitors use the site, and how you (the operator) manage it day to day.

Since this build has **no admin UI yet**, you'll use **Prisma Studio** (a visual database editor) or the admin API for management tasks.

---

## Part A — What visitors see and do

| Page | URL | What happens |
|---|---|---|
| **Home** | `/` | Visitor sees the retreat concept, 3-day arc, who it's for, pricing, upcoming batches, FAQ |
| **The Retreat** | `/retreat` | Detailed day-by-day breakdown, what's included, the location |
| **Pricing** | `/pricing` | Compare Individual / Couple / Corporate plans, see refund terms |
| **About** | `/about` | Learn about Arjun and the philosophy |
| **Gallery** | `/gallery` | Photos from past batches |
| **Contact** | `/contact` | Submit a corporate/team enquiry, or reach out by email/WhatsApp |
| **Register** | `/register?program=badlaav&plan=…` | Book a seat and pay via Razorpay |
| **Payment success** | `/payment-success` | Confirmation page; email + invoice sent automatically |

### Two ways visitors convert

1. **Enquiry (teams/corporates):**
   - Visitor fills out the Contact form
   - You get an email notification + an `Enquiry` row in the database
   - You follow up manually

2. **Self-serve registration (individuals/couples):**
   - Visitor goes to `/register`
   - Pays via Razorpay
   - Automatically gets a confirmation email + invoice

---

## Part B — How to manage the site (operator tasks)

### Open Prisma Studio (your visual database editor)

```bash
cd backend
npm run prisma:studio
```

This opens a spreadsheet-like editor at **http://localhost:5555** where you can view and edit all your data.

> To view production data, run the command with your production `DATABASE_URL`:
> ```bash
> DATABASE_URL="<your-prod-url>" npx prisma studio
> ```

---

### How to add a new retreat batch

The home page shows batches where `program = BADLAAV` AND `status = OPEN`.

**Step by step:**

1. Open Prisma Studio → click on the **Batch** table → **Add record**
2. Fill in these fields:
   | Field | What to enter |
   |---|---|
   | `program` | `BADLAAV` |
   | `name` | e.g., "Badlaav · Aug 2026" |
   | `startDate` | The start date |
   | `endDate` | The end date |
   | `venue` | Location name |
   | `totalSeats` | e.g., 20 |
   | `seatsBooked` | `0` |
   | `priceIndividual` | e.g., 18000 |
   | `priceCouple` | e.g., 30000 |
   | `priceCorporate` | e.g., 0 (custom quote) |
   | `status` | `OPEN` |
3. Click **Save**
4. The batch will appear on the site immediately (the home page fetches `/api/v1/batches`)

> **Note:** The prices displayed on the marketing pages come from `frontend/src/lib/content.js` (the `PLANS` object). If you change batch pricing, update that file too to keep them in sync.

---

### How to create or manage a coupon

1. Open Prisma Studio → click on the **Coupon** table → **Add record**
2. Fill in:
   | Field | What to enter |
   |---|---|
   | `code` | e.g., `EARLYBIRD20` |
   | `discountPct` | Percentage off (e.g., 20) — OR use `discountAmount` for a fixed amount |
   | `applicablePrograms` | Include `BADLAAV` |
   | `maxUses` | How many times it can be used |
   | `validUntil` | Expiry date |
   | `active` | `true` |
3. Save → visitors can now enter this code during registration

> The database seed already creates a `WELCOME500` coupon.

---

### How to see registrations and payments

**Option 1 — Prisma Studio:**
- Open the **Registration** table
- Check: `paymentStatus`, `finalAmount`, `razorpayPaymentId`, `invoiceNumber`, `status`

**Option 2 — Admin API:**
1. Log in as admin: `POST /api/v1/auth/login` with the admin email + password → get an access token
2. Call: `GET /api/v1/admin/registrations` with `Authorization: Bearer <token>`
3. For CSV export: `GET /api/v1/admin/registrations/export.csv`

---

### How to read enquiries

**Option 1 — Prisma Studio:**
Open the **Enquiry** table.

**Option 2 — Admin API:**
Call `GET /api/v1/admin/enquiries` with an admin token.

You also get an email notification for each new enquiry.

---

### Using the admin API (until a UI is built)

1. **Log in:**
   ```bash
   curl -X POST http://localhost:4000/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email": "arjun@dnyanpith.org", "password": "<your-seed-password>"}'
   ```
   → Copy the access token from the response

2. **Call any admin endpoint:**
   ```bash
   curl http://localhost:4000/api/v1/admin/registrations \
     -H "Authorization: Bearer <your-token>"
   ```

See [API.md](API.md) for the full list of admin endpoints.

---

## Part C — How to edit site content

| What you want to change | Where to edit |
|---|---|
| Headlines, paragraphs, 3-day text, FAQ, testimonials, pricing display | `frontend/src/lib/content.js` (mirrors [CONTENT.md](CONTENT.md)) |
| Contact email, WhatsApp number, address | `frontend/src/lib/constants.js` |
| Colors and fonts (whole-site theme) | `frontend/src/lib/themes.js` (+ `styles/globals.css`) |
| Page structure and section order | `frontend/src/pages/public/*.jsx` and `components/sections/*` |
| SEO titles and descriptions | `frontend/src/lib/seo.js` |
| Images | `frontend/public/images/` (replace the placeholder hero/gallery photos) |
| Nav links and footer | `frontend/src/components/layout/Header.jsx`, `Footer.jsx`, `MobileNav.jsx` |

After editing, run `npm run dev` to preview your changes, or `npm run build` to create a production build.

> **Brand voice reminder:** Keep the tone calm, direct, and warm — like an elder brother talking to you. See [../CLAUDE.md](../CLAUDE.md) for the full voice guide and forbidden phrases.

---

## Part D — Emails the system sends

All emails are sent via Brevo SMTP. Templates are in `backend/src/templates/`.

| Email | Who receives it | When |
|---|---|---|
| Registration confirmation | The person who registered | After successful payment |
| Account welcome | New users | After first registration |
| Failed payment reminder | The person who registered | ~15 minutes after a PENDING payment (sent by cron job) |
| New registration alert | Admin | After each successful registration |
| New enquiry alert | Admin | After each enquiry form submission |
| New message alert | Admin | After each contact message |

> If emails aren't arriving: check Brevo credentials in `backend/.env` and make sure the sender is verified in Brevo. See [SETUP.md](SETUP.md) troubleshooting.

---

## Part E — Quick answers

| Question | Answer |
|---|---|
| **How do I add a new batch/date?** | Prisma Studio → Batch table (see Part B above) |
| **How do I change a price on the site?** | Edit `content.js` `PLANS` (what's displayed) + the Batch record (what's charged) |
| **How do I change the hero line / tagline?** | Edit `content.js` → `SITE.tagline` / `SITE.oneLiner` |
| **How do I re-skin the colors?** | Change values in `themes.js` — every component follows automatically |
| **How do I build an admin dashboard?** | Build pages under `frontend/src/pages/` against the existing `/admin/*` API |
| **How do I refund a payment?** | `POST /api/v1/admin/invoices/:id/refund` (admin token), or via the Razorpay dashboard |
