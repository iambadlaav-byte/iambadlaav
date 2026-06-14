/**
 * Community schemas — FORM-04 (Community Join).
 * Single shared component CommunityJoinForm renders all 4 initiative variants
 * by reading the URL slug and pre-filling the hidden initiative field.
 */
import { z } from 'zod';
import { indianPhone, email } from './shared.js';

/**
 * Canonical initiative enum values (match Prisma schema Initiative enum).
 */
export const INITIATIVES = ['VACHAN_VARI', 'ANTRANG', 'FIVE_AM_CLUB', 'GET_TOGETHER'];

/**
 * URL slug → Initiative enum value.
 * Used by CommunityJoinForm to resolve the page slug to the hidden field value.
 */
export const SLUG_TO_INITIATIVE = {
  'vachan-vari':  'VACHAN_VARI',
  'antrang':      'ANTRANG',
  '5am-club':     'FIVE_AM_CLUB',
  'get-together': 'GET_TOGETHER',
};

/**
 * Initiative enum value → URL slug.
 * Used for success card WhatsApp link construction.
 */
export const INITIATIVE_TO_SLUG = Object.fromEntries(
  Object.entries(SLUG_TO_INITIATIVE).map(([slug, initiative]) => [initiative, slug])
);

/**
 * Human-readable initiative display names.
 * Used by success card and admin table.
 */
export const INITIATIVE_DISPLAY_NAMES = {
  VACHAN_VARI:  'Vachan Vari',
  ANTRANG:      'Antrang',
  FIVE_AM_CLUB: '5am Club',
  GET_TOGETHER: 'Get Together',
};

/**
 * FORM-04 — Community Join
 * POST /api/v1/community/join
 * Writes to community_members table with the correct initiative value.
 * Max 3 required visible fields per ARCH §9.4 low-friction design.
 */
export const communityJoinSchema = z.strictObject({
  name:       z.string().trim().min(2, 'Name is too short.').max(120, 'Name must be 120 characters or fewer.'),
  whatsapp:   indianPhone,
  city:       z.string().trim().min(2, 'City is too short.').max(80, 'City must be 80 characters or fewer.'),
  initiative: z.enum(INITIATIVES, {
    errorMap: () => ({ message: 'Select a valid initiative.' }),
  }),
  email:      email.optional(),
  occupation: z.string().trim().max(80, 'Occupation must be 80 characters or fewer.').optional(),
});
