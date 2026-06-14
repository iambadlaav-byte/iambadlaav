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
export const API_BASE = '/api/v1';

// ============================================================
// CONTACT / SOCIAL (placeholder until Arjun confirms — Week 9)
// ============================================================
export const WHATSAPP_NUMBER = '+91XXXXXXXXXX';
export const CONTACT_EMAIL = 'hello@dnyanpith.org';
export const CONTACT_ADDRESS = 'Ambajogai, Dist. Beed, Maharashtra 431517';

// ============================================================
// CORS (for dev-only reference — enforced server-side)
// ============================================================
export const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'https://dnyanpith.org',
  'https://www.dnyanpith.org',
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
