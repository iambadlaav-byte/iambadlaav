/**
 * notification.service.js — multi-channel notifications (email / SMS / WhatsApp).
 *
 * Email reuses the existing Brevo service. SMS + WhatsApp go through MSG91 and are
 * FEATURE-FLAGGED: they no-op (and log) unless the relevant env vars are set, so the
 * app ships dark and nothing breaks until you provide credentials.
 *
 * Enable by setting (in backend/.env):
 *   FEATURE_SMS=true       MSG91_AUTH_KEY=...  MSG91_SMS_FLOW_ID=...  MSG91_SENDER_ID=...
 *   FEATURE_WHATSAPP=true  MSG91_AUTH_KEY=...  MSG91_WA_INTEGRATED_NUMBER=...
 * WhatsApp additionally requires MSG91-approved message templates.
 */
import { logger } from '../lib/logger.js';
import { sendEmail } from './email.service.js';

const SMS_ENABLED = process.env.FEATURE_SMS === 'true' && Boolean(process.env.MSG91_AUTH_KEY);
const WA_ENABLED  = process.env.FEATURE_WHATSAPP === 'true' && Boolean(process.env.MSG91_AUTH_KEY);

export function smsEnabled() { return SMS_ENABLED; }
export function whatsappEnabled() { return WA_ENABLED; }

/** Normalise to MSG91's `91XXXXXXXXXX` form, or null if it doesn't look valid. */
function normalizeIndianMobile(raw) {
  if (!raw) return null;
  const digits = String(raw).replace(/\D/g, '');
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return digits;
  return null;
}

/**
 * Transactional SMS via MSG91 Flow API. No-ops (logs) when disabled/misconfigured.
 * @param {{ to: string, flowId?: string, vars?: Record<string,string> }} opts
 */
export async function sendSms({ to, flowId, vars = {} }) {
  if (!SMS_ENABLED) { logger.debug({ to }, 'sms.skipped.disabled'); return { skipped: true }; }
  const flow = flowId || process.env.MSG91_SMS_FLOW_ID;
  const recipient = normalizeIndianMobile(to);
  if (!flow || !recipient) { logger.warn({ to, hasFlow: Boolean(flow) }, 'sms.skipped.config'); return { skipped: true }; }
  try {
    const res = await fetch('https://control.msg91.com/api/v5/flow/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', authkey: process.env.MSG91_AUTH_KEY },
      body: JSON.stringify({
        flow_id: flow,
        sender: process.env.MSG91_SENDER_ID,
        recipients: [{ mobiles: recipient, ...vars }],
      }),
    });
    if (!res.ok) { logger.warn({ status: res.status }, 'sms.failed'); return { ok: false }; }
    return { ok: true };
  } catch (err) {
    logger.warn({ err }, 'sms.error');
    return { ok: false };
  }
}

/**
 * WhatsApp template message via MSG91. Requires an approved template. No-ops when disabled.
 * @param {{ to: string, templateName: string, components?: object }} opts
 */
export async function sendWhatsApp({ to, templateName, components = {} }) {
  if (!WA_ENABLED) { logger.debug({ to }, 'whatsapp.skipped.disabled'); return { skipped: true }; }
  const recipient = normalizeIndianMobile(to);
  if (!recipient || !process.env.MSG91_WA_INTEGRATED_NUMBER || !templateName) {
    logger.warn({ to }, 'whatsapp.skipped.config');
    return { skipped: true };
  }
  try {
    const res = await fetch('https://control.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', authkey: process.env.MSG91_AUTH_KEY },
      body: JSON.stringify({
        integrated_number: process.env.MSG91_WA_INTEGRATED_NUMBER,
        content_type: 'template',
        payload: { to: recipient, type: 'template', template: { name: templateName, ...components } },
      }),
    });
    if (!res.ok) { logger.warn({ status: res.status }, 'whatsapp.failed'); return { ok: false }; }
    return { ok: true };
  } catch (err) {
    logger.warn({ err }, 'whatsapp.error');
    return { ok: false };
  }
}

export { sendEmail };
