/**
 * OTP service — generate, store, and verify 6-digit codes.
 * Per CONSTRAINT-SEC-003: 6-digit, 10-min expiry, sha256-hashed at rest, used flag.
 *
 * Security design:
 * - Code is generated with crypto.randomInt (cryptographic RNG, not Math.random)
 * - Only the sha256 HASH is stored in the database; the plaintext is emailed to the user
 * - verifyOtp uses updateMany with the code predicate — atomic read+write prevents
 *   TOCTOU race conditions where two concurrent requests both "verify" the same OTP
 */
import crypto from 'node:crypto';
import { prisma } from '../lib/prisma.js';
import { sha256 } from '../utils/hash.js';
import { OTP_EXPIRY_MIN } from './otp.constants.js';

/**
 * Generate a cryptographically random 6-digit OTP.
 * Returns a zero-padded string (e.g. "042817").
 * crypto.randomInt(100000, 1000000) produces 100000–999999 inclusive.
 */
export function generateOtp() {
  const code = crypto.randomInt(100000, 1000000);
  return String(code).padStart(6, '0');
}

/**
 * Store an OTP for the given email address.
 * Stores the sha256 HASH of the code, never the plaintext.
 * Each call creates a new row — old rows are not deleted but will
 * expire naturally via expiresAt and the used flag check in verifyOtp.
 */
export async function storeOtp(email, code) {
  return prisma.oTP.create({
    data: {
      email: email.toLowerCase(),
      code: sha256(code), // store HASH only
      expiresAt: new Date(Date.now() + OTP_EXPIRY_MIN * 60 * 1000),
      used: false,
    },
  });
}

/**
 * Verify an OTP for the given email address.
 * Atomic: uses updateMany with the code predicate so there is no
 * read-then-write race. Returns true if a matching unused, unexpired
 * OTP was found and marked used.
 */
export async function verifyOtp(email, code) {
  const result = await prisma.oTP.updateMany({
    where: {
      email: email.toLowerCase(),
      code: sha256(code),  // compare hash against stored hash
      used: false,
      expiresAt: { gt: new Date() },
    },
    data: {
      used: true,
    },
  });

  return result.count > 0;
}
