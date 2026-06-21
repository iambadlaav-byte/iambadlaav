# Brevo Setup — Email

Badlaav sends transactional email (OTP, payment confirmations, invoices, password resets) over Brevo SMTP.

---

## Get SMTP credentials

Brevo Dashboard → SMTP & API → SMTP.

| Value | Env var |
|---|---|
| SMTP login | `BREVO_SMTP_USER` (looks like `your-user@smtp-brevo.com`) |
| SMTP key | `BREVO_SMTP_PASS` |

The backend connects over STARTTLS (not SSL) — no extra config needed.

---

## CRITICAL: the From address must be a verified Brevo sender

`EMAIL_FROM_ADDRESS` **must** be a sender you have verified in Brevo. If you use an unverified address — especially a free `@gmail.com` — mail will fail DMARC and land in spam or be rejected outright.

```
EMAIL_FROM_NAME="Badlaav"
EMAIL_FROM_ADDRESS="noreply@iambadlaav.com"   # must be Brevo-verified
EMAIL_REPLY_TO="iambadlaav@gmail.com"
```

- `EMAIL_FROM_NAME` — the display name recipients see. Use `Badlaav`.
- `EMAIL_FROM_ADDRESS` — the verified sender. Replies do **not** go here.
- `EMAIL_REPLY_TO` — where replies actually route. `iambadlaav@gmail.com` is fine as a reply-to even though it would fail as a from-address.

---

## Verify a sender (do this before going live)

### Option A — single sender (quick)
1. Brevo → Senders, Domains & Dedicated IPs → Senders → Add a Sender.
2. Enter the address you will use as `EMAIL_FROM_ADDRESS` (e.g. `noreply@iambadlaav.com`).
3. Click the verification link Brevo emails to that address.

### Option B — verify the whole domain (recommended for production)
1. Brevo → Domains → Add a Domain → `iambadlaav.com`.
2. Add the DNS records Brevo gives you (SPF, DKIM, and a DMARC record) at your DNS provider.
3. Wait for Brevo to show the domain as authenticated.

Domain authentication (SPF + DKIM + DMARC) is what keeps Badlaav email out of spam. A free Gmail/Outlook from-address cannot pass this and should never be used as `EMAIL_FROM_ADDRESS`.

---

## Health-check note

The backend deliberately does **not** call `transporter.verify()` on the health check. Brevo throttles repeated SMTP handshakes from the same IP, and doing it on every Railway health probe could get the egress IP blocked. So a green `/api/v1/health` does **not** prove email works — send a real test (e.g. trigger an OTP) to confirm.

---

## Quick test

1. Set the four `EMAIL_*` vars + `BREVO_SMTP_USER`/`BREVO_SMTP_PASS`.
2. Trigger an email flow (request an OTP, or complete a test registration).
3. Check the inbox **and** the spam folder. If it landed in spam, your sender/domain is not properly verified — fix that, not the code. See [TROUBLESHOOTING.md](TROUBLESHOOTING.md).
