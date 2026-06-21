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
