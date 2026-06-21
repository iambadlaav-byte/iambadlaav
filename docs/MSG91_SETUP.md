# MSG91 Setup — SMS & WhatsApp (optional)

SMS and WhatsApp notifications go through MSG91. Both are **feature-flagged and off by default** — the app ships dark and nothing breaks until you turn them on.

A channel is live only when **both** its flag is `"true"` **and** `MSG91_AUTH_KEY` is set. Until then, every send call logs that it was skipped and returns `{ skipped: true }`. No errors, no email/payment impact.

---

## Environment variables

| Variable | Channel | Purpose |
|---|---|---|
| `FEATURE_SMS` | SMS | Master switch. Must be `"true"`. |
| `FEATURE_WHATSAPP` | WhatsApp | Master switch. Must be `"true"`. |
| `MSG91_AUTH_KEY` | both | MSG91 auth key. Required for either channel. |
| `MSG91_SENDER_ID` | SMS | Approved 6-char sender id. |
| `MSG91_SMS_FLOW_ID` | SMS | Default SMS Flow id. |
| `MSG91_WA_INTEGRATED_NUMBER` | WhatsApp | Your MSG91 WhatsApp integrated number. |
| `MSG91_WA_CONFIRM_TEMPLATE` | WhatsApp | Approved template name for the confirmation message. |
| `MSG91_SMS_WAITLIST_FLOW_ID` | SMS (optional) | SMS Flow for waitlist invites. **Falls back** to `MSG91_SMS_FLOW_ID` if unset. |
| `MSG91_WA_WAITLIST_TEMPLATE` | WhatsApp (optional) | Approved template for waitlist invites. **No fallback** — WhatsApp always needs its own approved template. |

---

## Enable SMS

1. Get your `MSG91_AUTH_KEY` from the MSG91 dashboard.
2. Create an SMS **Flow** (MSG91 → Flows) and note its Flow id → `MSG91_SMS_FLOW_ID`.
3. Get an approved `MSG91_SENDER_ID`.
4. Set:
   ```
   FEATURE_SMS="true"
   MSG91_AUTH_KEY="..."
   MSG91_SENDER_ID="..."
   MSG91_SMS_FLOW_ID="..."
   ```
5. (Optional) For a separate waitlist-invite SMS, set `MSG91_SMS_WAITLIST_FLOW_ID`. If you leave it blank, waitlist SMS reuses `MSG91_SMS_FLOW_ID`.

SMS sends via the MSG91 Flow API. Recipient numbers are normalised to `91XXXXXXXXXX`; numbers that don't look like a valid 10-digit Indian mobile are skipped.

---

## Enable WhatsApp

WhatsApp messages **must** use an MSG91-approved template — you cannot send free-form text.

1. Set up WhatsApp in MSG91 and note your integrated number → `MSG91_WA_INTEGRATED_NUMBER`.
2. Submit and get approval for your message templates in MSG91 → WhatsApp → Templates:
   - a **confirmation** template → `MSG91_WA_CONFIRM_TEMPLATE`
   - a **waitlist-invite** template → `MSG91_WA_WAITLIST_TEMPLATE`
3. Set:
   ```
   FEATURE_WHATSAPP="true"
   MSG91_AUTH_KEY="..."
   MSG91_WA_INTEGRATED_NUMBER="..."
   MSG91_WA_CONFIRM_TEMPLATE="..."
   MSG91_WA_WAITLIST_TEMPLATE="..."   # no fallback — required for waitlist WhatsApp
   ```

WhatsApp sends via the MSG91 WhatsApp bulk-outbound API with `content_type: "template"`.

---

## How "off" behaves

- If a flag is `"false"` or `MSG91_AUTH_KEY` is empty, the channel no-ops and logs `sms.skipped.disabled` / `whatsapp.skipped.disabled`.
- If a flag is on but a required value (flow id, template, integrated number, or a parseable mobile) is missing, the send is skipped with a `…skipped.config` warning. Nothing throws.

This means you can turn SMS/WhatsApp on and off purely via env vars + a redeploy, with no code change. If notifications are silently not arriving, check the flags and keys first. See [TROUBLESHOOTING.md](TROUBLESHOOTING.md).
