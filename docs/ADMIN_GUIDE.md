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

There are four staff roles. Your role decides which buttons you see and which actions succeed. Your role is shown as a badge in the sidebar.

| Capability | SUPERADMIN | ADMIN | CONTRIBUTOR | VIEWER |
|---|:---:|:---:|:---:|:---:|
| View the admin panel (read) | Yes | Yes | Yes | Yes |
| See money — revenue, amounts, refunds, invoice totals | Yes | Yes | No | No |
| See contact details (email / phone / address) | Yes | Yes | Yes | No |
| Manage registrations (status, resend email, waitlist invite) | Yes | Yes | Yes | No |
| Mark a payment paid / refunded manually | Yes | Yes | No | No |
| Issue a refund | Yes | Yes | No | No |
| Create / edit batches | Yes | Yes | No | No |
| Delete a batch | Yes | No | No | No |
| Create / edit / delete coupons | Yes | Yes | Coupon delete only | No |
| Manage staff users + reset passwords | Yes | Yes | No | No |
| Delete another ADMIN | Yes | No | No | No |
| Approve / reject volunteers | Yes | Yes | Yes | No |
| Stories CMS, Gallery CMS, Blog, Events | Yes | Yes | Yes | No |
| Update / delete enquiries · delete volunteers | Yes | Yes | Status update only | No |

In short:
- **SUPERADMIN** — everything ADMIN can do, plus deleting another ADMIN and deleting a batch. The founder account (`iambadlaav@gmail.com`) is the SUPERADMIN.
- **ADMIN** — full control, including all financials, batches, users, and refunds.
- **CONTRIBUTOR** — runs operations and content, but **cannot** see money, create batches, or manage users.
- **VIEWER** — read-only, and **cannot** see financial figures **or** contact details.

---

## The sections

### Dashboard (`/admin/dashboard`)
At-a-glance numbers: registrations, batches, enquiries, and (for Admins) revenue. Start here each day.

### Batches (`/admin/batches`) — *Admin only to create/edit*
- Create a batch with name, program, start/end dates, **venue**, full **address**, **Google Maps link**, total seats, **waitlist capacity**, and prices (individual / couple / corporate).
- Edit an existing batch.
- Set status (Open / Full / Closed / Past).
- Waitlist capacity `0` means an unlimited waiting list.
- **Delete a batch** — **SUPERADMIN only**. A batch that already has registrations cannot be deleted (the system refuses it to protect history).

### Registrations (`/admin/registrations`)
- See every registration with its **candidate id** (assigned on payment), plan, amount, and payment status.
- **Mark paid manually** (Admin) — for offline/bank-transfer payments. Assigns a candidate id and triggers the confirmation.
- **Mark refunded manually** (Admin).
- **Resend confirmation email** (Contributor/Admin).
- **Waitlist invite** (Contributor/Admin) — sends a waitlisted candidate a payment link so they can pay and convert their seat.
- Export to **CSV**.

### Reports (`/admin/reports`)
- Summary reports across batches and date ranges.
- **Revenue figures are gated** — only the admin tier (Admin / Superadmin) sees money columns; Contributors/Viewers see counts without amounts.
- Export to **CSV**.

### Enquiries (`/admin/enquiries`)
- Read corporate/college/partner enquiries.
- Update status (New → Contacted → Converted / Closed). (Contributor/Admin.)
- **Delete an enquiry** (Admin tier).
- Export to **CSV**.

### Volunteers (`/admin/volunteers`)
- Review volunteer applications.
- **Approve / reject** (Contributor/Admin).
- **Delete a volunteer** (Admin tier).
- Export to **CSV**.
- A volunteer who attended more than one batch can apply again for a different batch — applications are de-duplicated per batch, not per person.

### Invoices (`/admin/invoices`) — *financials, Admin sees full detail*
- List generated invoices (programmes shown with friendly labels, not raw enum names).
- View an invoice (opens via a short-lived signed link).
- **Download** a single invoice, or tick checkboxes and **Download selected** to grab several at once.
- **Resend** an invoice email (Contributor/Admin).
- **Refund** a payment (Admin tier; rate-limited to 10/hour for safety).
- **Delete** the underlying registration for an invoice row (Admin tier).

### Coupons (`/admin/coupons`) — *Admin only to create/edit*
- Create discount coupons (percentage or fixed amount), set applicable programmes (shown with friendly labels), max uses, and expiry.
- Scope a coupon to **specific batches** with the batch multi-select — leave it empty to allow the coupon on every batch. A coupon used on a batch it isn't scoped to is rejected at checkout.
- **Deactivate** a coupon by editing it (`active: false`) — keeps history, blocks new redemptions immediately.
- **Delete** a coupon outright (Contributor/Admin) — a hard-delete, distinct from deactivate.

### Stories CMS (`/admin/stories`)
- Write and publish "stories" (title, subtitle, batch label, date, passage, photos).
- Set a **category** — the programme vertical the story belongs to: *The Retreat*, *The Badlaav Experience*, or *General*. This drives the filter on the public Stories page.
- Upload story photos (JPG/PNG/WEBP, max 2 MB; EXIF is stripped automatically).
- Draft / Published / Archived states. Only **published** stories appear on the public `/stories` page.

### Gallery CMS (`/admin/gallery`)
- Add gallery images with caption, **category**, and alt text (alt text is required for accessibility).
- The category uses the same programme vocabulary as stories — *The Retreat*, *The Badlaav Experience*, *General* — and drives the filter on the public Gallery page.
- Reorder, edit, or remove items.

### Settings (`/admin/settings`)
Three sections:
- **System health** — a live probe of the API/health endpoint with connection status, the API base URL, build mode, and your current role/session.
- **Team** (Admin tier only) — add/edit/delete staff users, change roles, reset passwords, and review **login activity** (recent sign-ins, for spotting anything unusual). SUPERADMIN rules apply: you can't delete yourself, you can't delete a SUPERADMIN, and only a SUPERADMIN can delete an ADMIN. Deleted staff are soft-deleted.
- **Your account** — edit your profile and change your own password (any logged-in staff).

---

## Everyday tasks, quickly

- **Add a new retreat date** → Batches → New (Admin).
- **Someone paid by bank transfer** → Registrations → find them → Mark paid (Admin).
- **Fill an empty seat from the waitlist** → Registrations → waitlisted candidate → Waitlist invite (sends a pay link).
- **Process a refund** → Invoices → find the payment → Refund (Admin).
- **Publish a story** → Stories → new → set status Published.
- **Onboard a new staff member** → Settings → Team → Add user (Admin), then share their login.

If a button is missing or an action is refused, it is almost certainly your **role** — Contributors and Viewers cannot touch money, batches, or users. Ask an Admin.
