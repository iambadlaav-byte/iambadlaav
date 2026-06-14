/**
 * JWT utilities — access token + rotating opaque refresh token.
 * Per RESEARCH.md Pattern 3 (JWT access + rotating refresh in httpOnly cookie).
 *
 * Access token:  1h HS256 JWT, payload {sub, role}
 * Refresh token: opaque random bytes (NOT a JWT), sha256-hashed at rest in RefreshToken table.
 *                Reuse detection: if a rotated token is presented again, revoke the entire
 *                user family (Pitfall 4 — silent account takeover mitigation).
 */
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { prisma } from '../lib/prisma.js';
import { sha256 } from './hash.js';

/**
 * Custom error class for auth-specific failures.
 * Controllers catch this and return 401/403 with a structured response.
 */
export class AuthError extends Error {
  constructor(code, message) {
    super(message || code);
    this.name = 'AuthError';
    this.code = code;
  }
}

// ============================================================
// ACCESS TOKEN
// ============================================================

/**
 * Sign a 1-hour HS256 JWT access token.
 * Payload: { sub: user.id, role: user.role }
 * Algorithm pinned to HS256 to prevent alg=none downgrade attack
 * (RESEARCH "Don't Hand-Roll" JWT row).
 */
export function signAccessToken(user) {
  return jwt.sign(
    { sub: user.id, role: user.role },
    process.env.JWT_SECRET,
    { algorithm: 'HS256', expiresIn: '1h' }
  );
}

/**
 * Verify a JWT access token. Throws JsonWebTokenError on invalid/expired.
 * Algorithm list explicit — prevents alg=none attack.
 */
export function verifyAccessToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET, {
    algorithms: ['HS256'],
  });
}

// ============================================================
// REFRESH TOKEN
// ============================================================

/**
 * Issue a new opaque refresh token for a user.
 * - Generates 48 random bytes encoded as base64url (URL-safe, no padding)
 * - Stores sha256 hash in RefreshToken table (never store plaintext)
 * - Returns plaintext token — caller sets it in httpOnly cookie
 *
 * Cookie attributes are set by the controller, not here (separation of concerns).
 */
export async function issueRefreshToken(userId) {
  const token = crypto.randomBytes(48).toString('base64url');
  const tokenHash = sha256(token);

  await prisma.refreshToken.create({
    data: {
      tokenHash,
      userId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });

  return token;
}

/**
 * Rotate a refresh token.
 * Runs inside a Prisma transaction to prevent TOCTOU races.
 *
 * Flow:
 * 1. Look up the hash of the presented token.
 * 2. If already revoked → REUSE DETECTED → revoke entire family → throw.
 * 3. If expired → throw REFRESH_EXPIRED.
 * 4. Mark this token as rotated (revokedAt = now, revokeReason = 'rotated').
 * 5. Return the record (caller uses userId to issue new pair).
 */
export async function rotateRefreshToken(presentedToken) {
  if (!presentedToken) {
    throw new AuthError('MISSING_REFRESH_TOKEN');
  }

  const presentedHash = sha256(presentedToken);

  return prisma.$transaction(async (tx) => {
    const existing = await tx.refreshToken.findUnique({
      where: { tokenHash: presentedHash },
    });

    if (!existing) {
      throw new AuthError('UNKNOWN_REFRESH_TOKEN');
    }

    if (existing.revokedAt) {
      // REUSE DETECTED — potential token theft.
      // Revoke every active token for this user so an attacker can't continue.
      await tx.refreshToken.updateMany({
        where: { userId: existing.userId, revokedAt: null },
        data: { revokedAt: new Date(), revokeReason: 'reuse_detected' },
      });
      throw new AuthError('REFRESH_REUSE_DETECTED');
    }

    if (existing.expiresAt < new Date()) {
      throw new AuthError('REFRESH_EXPIRED');
    }

    // Mark this token as consumed (rotated)
    await tx.refreshToken.update({
      where: { tokenHash: presentedHash },
      data: { revokedAt: new Date(), revokeReason: 'rotated' },
    });

    return existing;
  });
}
