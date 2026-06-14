/**
 * Rate limiters (CONSTRAINT-API-003 / RESEARCH Open Question 6).
 * Uses express-rate-limit with in-memory store (Phase 1 single-instance).
 * Phase 2: swap to ioredis + rate-limit-redis for multi-instance deploy.
 *
 * OTP request: per-email (3/15min) AND per-IP (10/15min) — BOTH chained.
 * Per-email prevents a single inbox from being flooded.
 * Per-IP prevents enumeration across many email addresses from one attacker.
 */
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

// Helper: consistent 429 response shape
const handler = (req, res) => {
  res.status(429).json({
    error: 'TOO_MANY_REQUESTS',
    retryAfter: Math.ceil(res.getHeader('Retry-After') || 60),
  });
};

// IPv6-safe IP key. The bare `req.ip` for an IPv6 client is unique per address,
// so an attacker can rotate through a /64 to bypass per-IP limits.
// `ipKeyGenerator` collapses IPv6 to a stable /64 prefix.
const ipKey = (req) => ipKeyGenerator(req);

// ============================================================
// AUTH RATE LIMITERS
// ============================================================

/**
 * OTP request — per EMAIL.
 * 3 OTP sends per email address per 15 minutes.
 * Key: email from request body (falls back to IP if missing).
 */
export const otpRequestLimitByEmail = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  keyGenerator: (req) => `email:${req.body?.email?.toLowerCase() || ipKey(req)}`,
  handler,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
});

/**
 * OTP request — per IP.
 * 10 OTP sends per IP per 15 minutes (prevents email enumeration).
 */
export const otpRequestLimitByIp = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  keyGenerator: (req) => `ip:${ipKey(req)}`,
  handler,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
});

/**
 * OTP verify — per IP.
 * 10 verify attempts per IP per 15 minutes.
 * Per-user brute-force protection is handled separately via
 * failedLoginAttempts + lockedUntil in the controller.
 */
export const otpVerifyLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  keyGenerator: (req) => `ip:${ipKey(req)}`,
  handler,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
});

/**
 * Password login — per IP.
 * 5 attempts per IP per 15 minutes (CONSTRAINT-SEC-004).
 */
export const loginLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  keyGenerator: (req) => `ip:${ipKey(req)}`,
  handler,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
});

/**
 * Admin login — per IP.
 * 5 attempts per IP per 15 minutes (CONSTRAINT-SEC-004).
 */
export const adminLoginLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  keyGenerator: (req) => `ip:${ipKey(req)}`,
  handler,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
});

/**
 * Form submission — per IP.
 * 5 form submits per IP per hour (FORM-01, FORM-05, FORM-06, FORM-09).
 * Used by Plan 04 route handlers.
 */
export const formSubmitLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  keyGenerator: (req) => `ip:${ipKey(req)}`,
  handler,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
});

/**
 * Coupon validation — per IP.
 * 20 coupon checks per IP per minute (used by Plan 05).
 */
export const couponValidateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  keyGenerator: (req) => `ip:${ipKey(req)}`,
  handler,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
});

/**
 * Profile photo upload — per USER ID.
 * 5 uploads per user per hour (T-06-08 DoS mitigation).
 * Key: user ID from req.user (set by authenticate middleware).
 */
export const photoUploadLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  keyGenerator: (req) => `user:${req.user?.id || ipKey(req)}`,
  handler,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
});

/**
 * Public read endpoints — per IP.
 * 120 requests per minute (T-03-06 DoS mitigation, Plan 03 blog/events).
 */
export const publicReadLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  keyGenerator: (req) => `ip:${ipKey(req)}`,
  handler,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
});
