/**
 * Generic contact schema — FORM-09.
 * Writes to messages table (separate from enquiries per REQ-form-09 + ARCH §9.9).
 */
import { z } from 'zod';
import { indianPhone, popularEmail } from './shared.js';

export const GENERIC_CONTACT_TYPES = [
  'GENERAL',
  'BADLAAV',
  'MISSION_UDAAN',
  'FUTURE_READINESS',
  'COMMUNITY',
  'PRESS',
  'PARTNERSHIP',
];

/**
 * FORM-09 — Generic Contact
 * POST /api/v1/messages
 * Writes to messages table. Never to enquiries table.
 */
export const genericContactSchema = z.strictObject({
  name:        z.string().trim().min(2, 'Name is too short.').max(120, 'Name must be 120 characters or fewer.'),
  email:       popularEmail,
  enquiryType: z.enum(GENERIC_CONTACT_TYPES, {
    errorMap: () => ({ message: 'Select an enquiry type.' }),
  }),
  message:     z.string().trim().min(10, 'Message must be at least 10 characters.').max(2000, 'Message must be 2000 characters or fewer.'),
  phone:       indianPhone.optional(),
});
