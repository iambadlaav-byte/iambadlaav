/**
 * OTP configuration constants.
 * Extracted to a separate file so they can be imported by both
 * otp.service.js and auth.controller.js without a circular dependency.
 */
export const OTP_EXPIRY_MIN = 10;
export const OTP_MAX_FAIL = 5;
export const OTP_LOCKOUT_MIN = 30;
