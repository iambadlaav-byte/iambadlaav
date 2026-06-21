# Admin Guide

For the people who run Badlaav day to day. No coding needed — this is how to use the admin panel.

---

## Logging in

1. Go to **`/login`** on the live site (e.g. `https://www.iambadlaav.com/login`).
2. Enter your **email and password**. (Admin login is password-only — there is no OTP step for staff.)
3. You land on the admin panel at **`/admin/dashboard`**.

The whole `/admin/*` area is protected. If you are not logged in (or not staff), you are redirected to the login page.

Your password was given to you by an Admin. Change it after first login — see **Settings** below.

---

## Who can do what (roles)

There are three staff roles. Your role decides which buttons you see and which actions succeed.

| Capability | ADMIN | CONTRIBUTOR | VIEWER |
|---|:---:|:---:|:---:|
| View the admin panel (read) | Yes | Yes | Yes |
| See money — revenue, amounts, refunds, invoices totals | Yes | No | No |
| Manage registrations (status, resend email, waitlist invite) | Yes | Yes | No |
| Mark a payment paid / refunded manually | Yes | No | No |
| Issue a refund | Yes | No | No |
| Create / edit batches | Yes | No | No |
| Create / edit coupons | Yes | No | No |
| Manage staff users + reset passwords | Yes | No | No |
| Approve / reject volunteers | Yes | Yes | No |
| Stories CMS, Gallery CMS, Blog, Events | Yes | Yes | No |
| Update enquiry status | Yes | Yes | No |

In short:
- **ADMIN** — full control, including all financials, batches, users, and refunds.
- **CONTRIBUTOR** — runs operations and content, but **cannot** see money, create batches, or manage users.
- **VIEWER** — read-only, and **cannot** see financial figures.

---

## The sections

### Dashboard (`/admin/dashboard`)
At-a-glance numbers: registrations, batches, enquiries, and (for Admins) revenue. Start here each day.

### Batches (`/admin/batches`) — *Admin only to create/edit*
- Create a batch with name, program, start/end dates, **venue**, full **address**, **Google Maps link**, total seats, **waitlist capacity**, and prices (individual / couple / corporate).
- Edit an existing batch.
- Set status (Open / Full / Closed / Past).
- Waitlist capacity `0` means an unlimited waiting list.

### Registrations (`/admin/registrations`)
- See every registration with its **candidate id** (assigned on payment), plan, amount, and payment status.
- **Mark paid manually** (Admin) — for offline/bank-transfer payments. Assigns a candidate id and triggers the confirmation.
- **Mark refunded manually** (Admin).
- **Resend confirmation email** (Contributor/Admin).
- **Waitlist invite** (Contributor/Admin) — sends a waitlisted candidate a payment link so they can pay and convert their seat.
- Export to **CSV**.

### Reports (`/admin/reports`)
- Summary reports across batches and date ranges.
- **Revenue figures are gated** — only Admins see money columns; Contributors/Viewers see counts without amounts.
- Export to **CSV**.

### Enquiries (`/admin/enquiries`)
- Read corporate/college/partner enquiries.
- Update status (New → Contacted → Converted / Closed). (Contributor/Admin.)

### Volunteers (`/admin/volunteers`)
- Review volunteer applications.
- **Approve / reject** (Contributor/Admin).

### Invoices (`/admin/invoices`) — *financials, Admin sees full detail*
- List generated invoices.
- View an invoice (opens via a short-lived signed link).
- **Resend** an invoice email (Contributor/Admin).
- **Refund** a payment (Admin only; rate-limited to 10/hour for safety).

### Coupons (`/admin/coupons`) — *Admin only to create/edit*
- Create discount coupons (percentage or fixed amount), set applicable programs, max uses, and expiry.
- Deactivate a coupon by editing it (`active: false`) — there is no hard-delete, so history is preserved.

### Stories CMS (`/admin/stories`)
- Write and publish "stories" (title, subtitle, batch label, date, passage, photos).
- Upload story photos (JPG/PNG/WEBP, max 2 MB; EXIF is stripped automatically).
- Draft / Published / Archived states.

### Gallery CMS (`/admin/gallery`)
- Add gallery images with caption, category, and alt text (alt text is required for accessibility).
- Reorder, edit, or remove items.

### Settings (`/admin/settings`)
- **Add a staff user** (Admin only) — create a CONTRIBUTOR / VIEWER / ADMIN account.
- **Change a user's role** (Admin only).
- **Reset another user's password** (Admin only).
- **Change your own password** (any logged-in staff).
- Review **login activity** — recent sign-ins, for spotting anything unusual.

---

## Everyday tasks, quickly

- **Add a new retreat date** → Batches → New (Admin).
- **Someone paid by bank transfer** → Registrations → find them → Mark paid (Admin).
- **Fill an empty seat from the waitlist** → Registrations → waitlisted candidate → Waitlist invite (sends a pay link).
- **Process a refund** → Invoices → find the payment → Refund (Admin).
- **Publish a story** → Stories → new → set status Published.
- **Onboard a new staff member** → Settings → Add user (Admin), then share their login.

If a button is missing or an action is refused, it is almost certainly your **role** — Contributors and Viewers cannot touch money, batches, or users. Ask an Admin.
