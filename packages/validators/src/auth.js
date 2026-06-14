/**
 * Auth schemas — OTP request/verify and password login.
 * Shared between frontend (RHF resolver) and backend (validate middleware).
 */
import { z } from 'zod';
import { email } from './shared.js';

/**
 * POST /api/v1/auth/otp/request
 */
export const otpRequestSchema = z.strictObject({
  email,
});

/**
 * POST /api/v1/auth/otp/verify
 */
export const otpVerifySchema = z.strictObject({
  email,
  code: z.string().regex(/^\d{6}$/, 'Enter the 6-digit code from your email.'),
});

/**
 * POST /api/v1/auth/login (password fallback)
 */
export const loginPasswordSchema = z.strictObject({
  email,
  password: z.string()
    .min(8, 'Password must be at least 8 characters.')
    .max(128, 'Password must be 128 characters or fewer.'),
});
