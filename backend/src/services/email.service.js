/**
 * Email service — Brevo SMTP transport via Nodemailer.
 * Per RESEARCH.md "Brevo SMTP transport singleton" code example.
 * Singleton transport pool is reused across requests for efficiency.
 */
import nodemailer from 'nodemailer';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import handlebars from 'handlebars';
import { logger } from '../lib/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ============================================================
// Transport singleton
// ============================================================
export const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,       // STARTTLS (not SSL)
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_PASS,
  },
  pool: true,          // connection pooling for performance
  maxConnections: 5,
  maxMessages: 100,
});

// ============================================================
// Template cache
// ============================================================
const tplCache = new Map();

async function loadTemplate(name) {
  if (tplCache.has(name)) return tplCache.get(name);

  const tplPath = path.join(__dirname, '..', 'templates', `${name}.hbs`);
  const src = await fs.readFile(tplPath, 'utf-8');
  const compiled = handlebars.compile(src);
  tplCache.set(name, compiled);
  return compiled;
}

// ============================================================
// sendEmail
// ============================================================

/**
 * Send a transactional email using a Handlebars template.
 *
 * @param {object} opts
 * @param {string}   opts.to          — recipient email
 * @param {string}   opts.subject     — email subject
 * @param {string}   opts.template    — template name (without .hbs extension)
 * @param {object}   opts.data        — template variables
 * @param {object[]} [opts.attachments] — nodemailer attachments array
 */
export async function sendEmail({ to, subject, template, data, attachments }) {
  const render = await loadTemplate(template);
  const html = render(data);

  const info = await transporter.sendMail({
    from: '"Dnyanpith" <hello@dnyanpith.org>',
    to,
    subject,
    html,
    attachments,
  });

  logger.info({ messageId: info.messageId, to, template }, 'email.sent');
  return info;
}
