/**
 * Auth routes — OTP request/verify, password login, refresh, logout.
 * All final URLs are under /api/v1/auth/* (mounted in routes/v1/index.js).
 *
 * Rate limiting strategy (RESEARCH Open Question 6):
 * - OTP request: per-email (3/15min) AND per-IP (10/15min), both chained
 * - OTP verify: per-IP (10/15min) + per-user lockout in controller
 * - Password login: per-IP (5/15min) + per-user lockout in controller
 * - Refresh: no rate-limit (users may legitimately refresh frequently)
 * - Logout: no rate-limit
 */
import { Router } from 'express';
import {
  otpRequestLimitByEmail,
  otpRequestLimitByIp,
  otpVerifyLimit,
  loginLimit,
} from '../../middleware/rateLimit.js';
import { validate } from '../../middleware/validate.js';
import { authenticate, requireAuth } from '../../middleware/auth.js';
import { otpRequestSchema, otpVerifySchema, loginPasswordSchema, changePasswordSchema } from '../../validators/index.js';
import {
  requestOtp,
  verifyOtpHandler,
  loginPassword,
  changePassword,
  refresh,
  logout,
} from '../../controllers/auth.controller.js';

const router = Router();

// POST /api/v1/auth/otp/request
// Rate limited by both email AND IP (chained)
router.post(
  '/auth/otp/request',
  otpRequestLimitByEmail,
  otpRequestLimitByIp,
  validate(otpRequestSchema),
  requestOtp
);

// POST /api/v1/auth/otp/verify
router.post(
  '/auth/otp/verify',
  otpVerifyLimit,
  validate(otpVerifySchema),
  verifyOtpHandler
);

// POST /api/v1/auth/login (password fallback)
router.post(
  '/auth/login',
  loginLimit,
  validate(loginPasswordSchema),
  loginPassword
);

// POST /api/v1/auth/password/change — authenticated; change own password
router.post(
  '/auth/password/change',
  authenticate,
  requireAuth,
  validate(changePasswordSchema),
  changePassword
);

// POST /api/v1/auth/refresh — no rate-limit
router.post('/auth/refresh', refresh);

// POST /api/v1/auth/logout
router.post('/auth/logout', logout);

export default router;
