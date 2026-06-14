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
