/**
 * Auth controller — OTP request/verify, password login, refresh, logout.
 *
 * CRITICAL SECURITY INVARIANT:
 * OTP path and password path have IDENTICAL lockout behaviour (5/30).
 * A failed OTP verify increments failedLoginAttempts just like a failed
 * password compare. There is no soft belly via OTP.
 *
 * Lockout flow (both paths):
 * 1. On every request: check lockedUntil FIRST. If locked → 423, Retry-After header.
 * 2. On wrong code/password: atomic increment of failedLoginAttempts (Pitfall 8 — no race).
 *    If counter reaches OTP_MAX_FAIL (5): set lockedUntil = now + 30min AND reset counter to 0.
 *    Return 401 (NOT 423 — the 423 fires on the NEXT attempt after the lock is set).
 * 3. On correct code/password: reset failedLoginAttempts = 0 AND lockedUntil = null.
 */
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import { generateOtp, storeOtp, verifyOtp as checkOtp } from '../services/otp.service.js';
import { OTP_MAX_FAIL, OTP_LOCKOUT_MIN, OTP_EXPIRY_MIN } from '../services/otp.constants.js';
import { sendEmail } from '../services/email.service.js';
import { signAccessToken, issueRefreshToken, rotateRefreshToken, AuthError } from '../utils/jwt.js';
import { bcryptCompare } from '../utils/hash.js';

// Cookie options for the httpOnly refresh token (CONSTRAINT-SEC-001)
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/api/v1/auth',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
};

// ============================================================
// Helper: set refresh cookie + return access token response
// ============================================================
function sendAuthResponse(res, user, accessToken, refreshToken) {
  res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);
  return res.json({
    accessToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
}

// ============================================================
// requestOtp — POST /api/v1/auth/otp/request
// ============================================================
export async function requestOtp(req, res, next) {
  try {
    const { email } = req.body;

    // Generate and store OTP (sha256-hashed at rest)
    const code = generateOtp();
    await storeOtp(email, code);

    // Send OTP email — best effort (don't fail the request if email fails)
    // Look up user name for personalisation; fall back to null (template handles it)
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase(), deletedAt: null },
      select: { name: true },
    });

    sendEmail({
      to: email,
      subject: 'Your Dnyanpith sign-in code',
      template: 'otp',
      data: {
        name: user?.name || null,
        code,
        expiryMinutes: OTP_EXPIRY_MIN,
      },
    }).catch(err => logger.error({ err, email }, 'otp.email.failed'));

    // Always respond 200 regardless of whether user exists — prevents email enumeration
    return res.json({ message: 'OTP sent if account exists' });
  } catch (err) {
    next(err);
  }
}

// ============================================================
// verifyOtpHandler — POST /api/v1/auth/otp/verify
// ============================================================
export async function verifyOtpHandler(req, res, next) {
  try {
    const { email, code } = req.body;
    const now = new Date();

    // Step 1 — Check lockout FIRST (before OTP verification)
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase(), deletedAt: null },
      select: {
        id: true, name: true, email: true, role: true,
        failedLoginAttempts: true, lockedUntil: true,
      },
    });

    if (user?.lockedUntil && user.lockedUntil > now) {
      const retryAfterMs = user.lockedUntil.getTime() - now.getTime();
      const retryAfterSec = Math.ceil(retryAfterMs / 1000);
      res.setHeader('Retry-After', String(retryAfterSec));
      return res.status(423).json({
        error: 'ACCOUNT_LOCKED',
        retryAfter: user.lockedUntil.toISOString(),
      });
    }

    // Step 2 — Verify OTP (atomic updateMany)
    const otpValid = await checkOtp(email, code);

    if (!otpValid) {
      // Wrong / expired / already-used OTP
      if (user) {
        // Atomic increment (Pitfall 8 — avoids read-then-write race)
        const updated = await prisma.user.update({
          where: { id: user.id },
          data: { failedLoginAttempts: { increment: 1 } },
          select: { failedLoginAttempts: true },
        });

        // Check if this increment hit the threshold
        if (updated.failedLoginAttempts >= OTP_MAX_FAIL) {
          // Set lockout AND reset counter to 0 in the same atomic update
          await prisma.user.update({
            where: { id: user.id },
            data: {
              lockedUntil: new Date(Date.now() + OTP_LOCKOUT_MIN * 60 * 1000),
              failedLoginAttempts: 0,
            },
          });
          logger.warn({ userId: user.id, email }, 'auth.account.locked_after_otp_failures');
        }
      }

      return res.status(401).json({ error: 'INVALID_OTP' });
    }

    // Step 3 — OTP valid: upsert user (auto-account creation foundation for Plan 05)
    const authedUser = await prisma.user.upsert({
      where: { email: email.toLowerCase() },
      update: {
        // Reset lockout on successful login
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
        emailVerified: true,
      },
      create: {
        email: email.toLowerCase(),
        name: email.split('@')[0], // placeholder name; user updates in Plan 06
        role: 'REGISTERED',
        emailVerified: true,
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
      },
      select: { id: true, name: true, email: true, role: true },
    });

    // Issue tokens
    const accessToken = signAccessToken(authedUser);
    const refreshToken = await issueRefreshToken(authedUser.id);

    logger.info({ userId: authedUser.id, email }, 'auth.otp.verified');
    return sendAuthResponse(res, authedUser, accessToken, refreshToken);
  } catch (err) {
    next(err);
  }
}

// ============================================================
// loginPassword — POST /api/v1/auth/login
// ============================================================
export async function loginPassword(req, res, next) {
  try {
    const { email, password } = req.body;
    const now = new Date();

    // Fetch user (must exist for password login)
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase(), deletedAt: null },
      select: {
        id: true, name: true, email: true, role: true,
        passwordHash: true, failedLoginAttempts: true, lockedUntil: true,
      },
    });

    if (!user || !user.passwordHash) {
      // Generic error — don't reveal whether user exists or has no password set
      return res.status(401).json({ error: 'INVALID_CREDENTIALS' });
    }

    // Check lockout (same check as OTP path — parity)
    if (user.lockedUntil && user.lockedUntil > now) {
      const retryAfterSec = Math.ceil((user.lockedUntil.getTime() - now.getTime()) / 1000);
      res.setHeader('Retry-After', String(retryAfterSec));
      return res.status(423).json({
        error: 'ACCOUNT_LOCKED',
        retryAfter: user.lockedUntil.toISOString(),
      });
    }

    // Compare password
    const passwordMatch = await bcryptCompare(password, user.passwordHash);

    if (!passwordMatch) {
      // Atomic increment (Pitfall 8)
      const updated = await prisma.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: { increment: 1 } },
        select: { failedLoginAttempts: true },
      });

      if (updated.failedLoginAttempts >= OTP_MAX_FAIL) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            lockedUntil: new Date(Date.now() + OTP_LOCKOUT_MIN * 60 * 1000),
            failedLoginAttempts: 0,
          },
        });
        logger.warn({ userId: user.id, email }, 'auth.account.locked_after_password_failures');
      }

      return res.status(401).json({ error: 'INVALID_CREDENTIALS' });
    }

    // Password valid — reset lockout
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
        emailVerified: true,
      },
    });

    const accessToken = signAccessToken(user);
    const refreshToken = await issueRefreshToken(user.id);

    logger.info({ userId: user.id, email }, 'auth.password.login');
    return sendAuthResponse(res, user, accessToken, refreshToken);
  } catch (err) {
    next(err);
  }
}

// ============================================================
// refresh — POST /api/v1/auth/refresh
// ============================================================
export async function refresh(req, res, next) {
  try {
    const oldToken = req.cookies.refreshToken;

    const oldRecord = await rotateRefreshToken(oldToken);

    // Fetch current user data for the new access token
    const user = await prisma.user.findUnique({
      where: { id: oldRecord.userId, deletedAt: null },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!user) {
      res.clearCookie('refreshToken', { path: '/api/v1/auth' });
      return res.status(401).json({ error: 'USER_NOT_FOUND' });
    }

    const newRefreshToken = await issueRefreshToken(user.id);
    const accessToken = signAccessToken(user);

    logger.info({ userId: user.id }, 'auth.refresh.rotated');
    return sendAuthResponse(res, user, accessToken, newRefreshToken);
  } catch (err) {
    if (err instanceof AuthError && (
      err.code === 'REFRESH_REUSE_DETECTED' ||
      err.code === 'REFRESH_EXPIRED' ||
      err.code === 'UNKNOWN_REFRESH_TOKEN' ||
      err.code === 'MISSING_REFRESH_TOKEN'
    )) {
      // Clear the invalid cookie
      res.clearCookie('refreshToken', { path: '/api/v1/auth' });
      return res.status(401).json({ error: err.code });
    }
    next(err);
  }
}

// ============================================================
// logout — POST /api/v1/auth/logout
// ============================================================
export async function logout(req, res, next) {
  try {
    const token = req.cookies.refreshToken;

    if (token) {
      const { sha256 } = await import('../utils/hash.js');
      const tokenHash = sha256(token);

      // Mark the refresh token as revoked
      await prisma.refreshToken.updateMany({
        where: { tokenHash, revokedAt: null },
        data: { revokedAt: new Date(), revokeReason: 'logout' },
      });
    }

    res.clearCookie('refreshToken', { path: '/api/v1/auth' });
    return res.json({ message: 'Logged out.' });
  } catch (err) {
    next(err);
  }
}
