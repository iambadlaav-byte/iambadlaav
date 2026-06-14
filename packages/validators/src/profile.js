/**
 * Profile update schema — shared between frontend form and backend PATCH /users/me.
 * Per CONSTRAINT-CODE-005: one schema, two consumers.
 *
 * Uses z.strictObject so unknown keys (e.g. `role`, `email`) are stripped server-side
 * even if a client sends them — threat T-06-13.
 */
import { z } from 'zod';
import { indianPhone } from './shared.js';

export const profileUpdateSchema = z.strictObject({
  name:       z.string().trim().min(2, 'Name must be at least 2 characters.').max(120, 'Name must be 120 characters or fewer.').optional(),
  phone:      indianPhone.optional(),
  city:       z.string().trim().min(2, 'City must be at least 2 characters.').max(80, 'City must be 80 characters or fewer.').optional(),
  state:      z.string().trim().min(2, 'State must be at least 2 characters.').max(80, 'State must be 80 characters or fewer.').optional(),
  occupation: z.string().trim().max(80, 'Occupation must be 80 characters or fewer.').optional(),
  age:        z.coerce.number().int().min(13, 'Age must be at least 13.').max(99, 'Age must be 99 or below.').optional(),
}).refine(
  (d) => Object.keys(d).length > 0,
  { message: 'At least one field must change.' }
);
