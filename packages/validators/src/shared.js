/**
 * Shared primitive Zod schemas used across all validators.
 * Consumed by both frontend (via @validators alias) and backend (via workspace symlink).
 */
import { z } from 'zod';

/**
 * Indian mobile phone number: 10 digits, starting with 6-9.
 * Matches WhatsApp-eligible numbers.
 */
export const indianPhone = z.string()
  .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit WhatsApp number (starting with 6-9).');

/**
 * RFC 5321 email, max 254 chars per spec.
 */
export const email = z.string()
  .email('Email format looks off.')
  .max(254, 'Email must be 254 characters or fewer.');

/**
 * Email anti-abuse lists.
 *
 * `POPULAR_EMAIL_DOMAINS` — well-known consumer mailbox providers. Used where we
 * want a real personal inbox (retreat sign-ups, volunteer, personal contact).
 * `DISPOSABLE_EMAIL_DOMAINS` — throwaway/temp-mail + obvious dummy domains. Blocked
 * everywhere, including business/corporate forms that otherwise accept any domain.
 */
export const POPULAR_EMAIL_DOMAINS = new Set([
  'gmail.com', 'googlemail.com',
  'yahoo.com', 'yahoo.in', 'yahoo.co.in', 'yahoo.co.uk', 'ymail.com', 'rocketmail.com',
  'outlook.com', 'outlook.in', 'hotmail.com', 'hotmail.co.uk', 'live.com', 'live.in', 'msn.com',
  'icloud.com', 'me.com', 'mac.com',
  'proton.me', 'protonmail.com', 'pm.me',
  'rediffmail.com', 'rediff.com',
  'zoho.com', 'zoho.in', 'zohomail.in',
  'gmx.com', 'aol.com', 'yandex.com', 'mail.com',
]);

export const DISPOSABLE_EMAIL_DOMAINS = new Set([
  'mailinator.com', 'yopmail.com', 'guerrillamail.com', 'guerrillamail.info', 'sharklasers.com',
  '10minutemail.com', '1secmail.com', 'temp-mail.org', 'tempmail.com', 'tempmail.net', 'tempmailo.com',
  'throwawaymail.com', 'trashmail.com', 'getnada.com', 'dispostable.com', 'fakeinbox.com',
  'maildrop.cc', 'maildrop.cc', 'moakt.com', 'mohmal.com', 'emailondeck.com', 'mintemail.com',
  'spamgourmet.com', 'mytemp.email', 'tempr.email', 'discard.email', 'fakemail.net',
  'example.com', 'example.org', 'test.com', 'test.in',
]);

const emailDomain = (value) => String(value).trim().toLowerCase().split('@')[1] ?? '';

/**
 * Personal email from a recognised provider. Rejects dummy/temp + unknown domains.
 * Use for retreat registration, volunteer, and personal contact.
 */
export const popularEmail = email.refine(
  (v) => POPULAR_EMAIL_DOMAINS.has(emailDomain(v)),
  'Use a personal email from a common provider (Gmail, Yahoo, Outlook, iCloud, etc.).',
);

/**
 * Any genuine, non-temporary email. Business/work domains are allowed; only
 * disposable/dummy domains are rejected. Use for corporate / college enquiries.
 */
export const businessEmail = email.refine(
  (v) => !DISPOSABLE_EMAIL_DOMAINS.has(emailDomain(v)),
  'Use a valid, non-temporary email address.',
);

/**
 * All 36 Maharashtra districts.
 * Full list sourced from Government of Maharashtra district list.
 */
export const mhDistrict = z.enum([
  'Ahmednagar',
  'Akola',
  'Amravati',
  'Aurangabad',
  'Beed',
  'Bhandara',
  'Buldhana',
  'Chandrapur',
  'Dhule',
  'Gadchiroli',
  'Gondia',
  'Hingoli',
  'Jalgaon',
  'Jalna',
  'Kolhapur',
  'Latur',
  'Mumbai City',
  'Mumbai Suburban',
  'Nagpur',
  'Nanded',
  'Nandurbar',
  'Nashik',
  'Osmanabad',
  'Palghar',
  'Parbhani',
  'Pune',
  'Raigad',
  'Ratnagiri',
  'Sangli',
  'Satara',
  'Sindhudurg',
  'Solapur',
  'Thane',
  'Wardha',
  'Washim',
  'Yavatmal',
], {
  errorMap: () => ({ message: 'Select a valid Maharashtra district.' }),
});
