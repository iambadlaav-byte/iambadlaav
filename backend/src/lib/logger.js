/**
 * Pino structured logger with PII redaction (CONSTRAINT-OBS-001).
 * All sensitive fields are censored to '[REDACTED]' before logs are written.
 * pino-pretty transport is used in development only.
 */
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  redact: {
    paths: [
      // Auth credentials
      'password',
      'newPassword',
      'oldPassword',
      'passwordHash',
      // OTP / codes
      'otp',
      'otpCode',
      'code',
      // Tokens
      'token',
      'accessToken',
      'refreshToken',
      'authorization',
      // HTTP headers
      'req.headers.authorization',
      'req.headers.cookie',
      'res.headers["set-cookie"]',
      // External service secrets
      'razorpay.key_secret',
      'BREVO_SMTP_PASS',
      'JWT_SECRET',
      'JWT_REFRESH_SECRET',
      // Payment card data (extra safety)
      'cardNumber',
      'cvv',
    ],
    censor: '[REDACTED]',
  },
  formatters: {
    level: (label) => ({ level: label }),
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  base: {
    service: 'dnyanpith-api',
    env: process.env.NODE_ENV || 'development',
  },
  // pino-pretty for human-readable output in development only
  ...(process.env.NODE_ENV !== 'production' && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname,service,env',
      },
    },
  }),
});
