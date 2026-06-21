/**
 * Volunteer schemas — VOL-01 (Volunteer Application).
 * Shared between frontend (RHF resolver) and backend (validate middleware).
 *
 * Guest path: no auth. The applicant's identity fields (name/email/phone/city)
 * feed a User upsert in the controller; the rest persist on the Volunteer row.
 * Reuses the canonical `email` + `indianPhone` primitives from shared.js so the
 * volunteer form validates phone numbers exactly like registration.
 */
import { z } from 'zod';
import { popularEmail, indianPhone } from './shared.js';

export const volunteerCreateSchema = z.strictObject({
  name:           z.string().trim().min(2, 'Name is too short.').max(120),
  email:          popularEmail,
  phone:          indianPhone,
  city:           z.string().trim().min(2, 'City is required.').max(120),
  // "which Badlaav batch have you attended / are interested in"
  batchAttended:  z.string().trim().min(1, 'Tell us which batch.').max(200),
  skills:         z.array(z.string().trim().min(1)).min(1, 'Add at least one skill.').max(20),
  availability:   z.array(z.string().trim().min(1)).min(1, 'Add at least one availability window.').max(20),
  canTravel:      z.boolean(),
  whyVolunteer:   z.string().trim().min(10, 'Tell us a little more.').max(2000),
  messageToArjun: z.string().trim().max(2000).optional().or(z.literal('')),
});
