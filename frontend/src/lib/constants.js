/**
 * Application-wide constants (CONSTRAINT: no magic numbers in code).
 * All literal values that appear in multiple places live here.
 */

// ============================================================
// AUTH / OTP
// ============================================================
export const OTP_EXPIRY_MIN = 10;
export const OTP_MAX_FAIL = 5;
export const OTP_LOCKOUT_MIN = 30;

// ============================================================
// FILE UPLOADS
// ============================================================
export const MAX_RESUME_MB = 5;
export const MAX_PHOTO_MB = 2;
export const MAX_GALLERY_MB = 10;

// ============================================================
// RAZORPAY (public key only — secret stays server-side)
// ============================================================
export const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

// ============================================================
// API
// ============================================================
export const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/v1`
  : '/api/v1';

// ============================================================
// UI / LAYOUT
// ============================================================
// Scroll distance (px) past which the sticky header condenses into its
// translucent, blurred state.
export const HEADER_SCROLL_THRESHOLD = 24;

// How long (ms) each word in a rotating hero headline holds before it swaps.
export const HERO_WORD_ROTATE_MS = 2200;

// ============================================================
// CONTACT / SOCIAL
// ============================================================
export const WHATSAPP_NUMBER = '+917409339740';
export const CONTACT_PHONE = '7409339740';
export const CONTACT_EMAIL = 'iambadlaav@gmail.com';
export const CONTACT_ADDRESS = 'Ambajogai, Dist. Beed, Maharashtra 431517';

// Venue location on Google Maps (physical retreat centre near Ambajogai).
export const MAP_LINK =
  'https://www.google.com/maps/place/Dnyanpitt+Abhyasika/@18.7177129,76.3777553,21z/data=!4m6!3m5!1s0x3bc55e6e57308101:0x3b8347cf8562ad45!8m2!3d18.7176969!4d76.3778593!16s%2Fg%2F11c1p9s0nh';

// ============================================================
// PROGRAMMES
// The Prisma Program enum is repurposed: BADLAAV = The Retreat,
// FUTURE_READINESS = The Badlaav Experience. The remaining two are
// future placeholders (no public tab yet). One label map, used by the
// public batch lists and the admin panel so nobody sees raw enum values.
// ============================================================
export const PROGRAM_LABELS = {
  BADLAAV:          'The Retreat',
  FUTURE_READINESS: 'The Badlaav Experience',
  MISSION_UDAAN:    'Future programme 1',
  ANTRANG:          'Future programme 2',
};

// Selectable programmes for admin dropdowns/filters (value + label), live ones first.
export const PROGRAM_OPTIONS = [
  { value: 'BADLAAV',          label: 'The Retreat' },
  { value: 'FUTURE_READINESS', label: 'The Badlaav Experience' },
  { value: 'MISSION_UDAAN',    label: 'Future programme 1' },
  { value: 'ANTRANG',          label: 'Future programme 2' },
];

export const programLabel = (program) =>
  PROGRAM_LABELS[String(program).toUpperCase()] ?? program;

// enum value → the /register slug that opens the matching form.
const PROGRAM_REGISTER_SLUG = {
  BADLAAV:          'badlaav',
  FUTURE_READINESS: 'badlaav-experience',
};

export function programRegisterHref(program, batchId) {
  const slug = PROGRAM_REGISTER_SLUG[String(program).toUpperCase()] ?? 'badlaav';
  return `/register?program=${slug}${batchId ? `&batch=${batchId}` : ''}`;
}

// ============================================================
// CORS (for dev-only reference — enforced server-side)
// ============================================================
export const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'https://iambadlaav.com',
  'https://www.iambadlaav.com',
];

// ============================================================
// MAHARASHTRA DISTRICTS (36 districts)
// Used by mhDistrict Zod enum in packages/validators/src/shared.js
// ============================================================
export const MH_DISTRICTS = [
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
];
