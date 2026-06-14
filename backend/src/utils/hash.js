/**
 * Cryptographic hash utilities.
 *
 * bcrypt: password hashing at cost factor 12 (CONSTRAINT-SEC-002).
 * Uses `bcrypt` (native binaries). If Railway's native-module build fails
 * with "node-pre-gyp ERR! could not find binding", swap:
 *   import bcrypt from 'bcryptjs';  // identical API, pure JS fallback
 * See RESEARCH.md Pitfall 7 for details.
 *
 * sha256: used for OTP storage (stored as hash, never plaintext per
 * CONSTRAINT-SEC-003) and refresh token storage (Pattern 3).
 */
import bcrypt from 'bcrypt';
import crypto from 'node:crypto';

const BCRYPT_COST = 12; // CONSTRAINT-SEC-002 — never less than 12

/**
 * Hash a plain-text password for storage.
 */
export async function bcryptHash(plain) {
  return bcrypt.hash(plain, BCRYPT_COST);
}

/**
 * Compare a plain-text password against a stored bcrypt hash.
 * Returns true if they match, false otherwise.
 */
export async function bcryptCompare(plain, hash) {
  return bcrypt.compare(plain, hash);
}

/**
 * Compute SHA-256 hex digest.
 * Used for:
 * - OTP codes: storeOtp(email, sha256(code)); verifyOtp(email, sha256(presentedCode))
 * - Refresh tokens: stored as sha256(opaqueToken) in RefreshToken table
 */
export function sha256(s) {
  return crypto.createHash('sha256').update(s).digest('hex');
}
