/**
 * Global Express error handler — last middleware in app.js.
 * Maps known error types to appropriate HTTP responses.
 * All errors are logged via Pino and reported to Sentry.
 */
import { logger } from '../lib/logger.js';
import { Sentry } from '../lib/sentry.js';
import { AuthError } from '../utils/jwt.js';

// Mapping of AuthError codes to HTTP status codes
const AUTH_ERROR_STATUS = {
  UNAUTHENTICATED:         401,
  MISSING_REFRESH_TOKEN:   401,
  UNKNOWN_REFRESH_TOKEN:   401,
  REFRESH_EXPIRED:         401,
  REFRESH_REUSE_DETECTED:  401,
  FORBIDDEN:               403,
};

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, _next) {
  const requestId = req.id;

  // Report to Sentry (strips cookies via beforeSend in sentry.js)
  Sentry.captureException(err, {
    tags: { requestId },
    extra: { method: req.method, url: req.url },
  });

  // AuthError (JWT issues, refresh token problems)
  if (err instanceof AuthError) {
    const status = AUTH_ERROR_STATUS[err.code] || 401;
    logger.warn({ err, requestId }, `auth.error.${err.code}`);
    return res.status(status).json({ error: err.code });
  }

  // Zod validation error (should not reach here — validate middleware handles it,
  // but belt-and-suspenders)
  if (err.name === 'ZodError') {
    logger.warn({ err, requestId }, 'validation.error');
    const fieldErrors = err.issues?.map(i => ({
      field: i.path.join('.'),
      message: i.message,
    })) || [];
    return res.status(400).json({ errors: fieldErrors });
  }

  // Prisma unique constraint violation → 409 Conflict
  if (err.code === 'P2002') {
    logger.warn({ err, requestId }, 'database.unique_constraint');
    return res.status(409).json({ error: 'ALREADY_EXISTS' });
  }

  // Prisma record not found
  if (err.code === 'P2025') {
    logger.warn({ err, requestId }, 'database.not_found');
    return res.status(404).json({ error: 'NOT_FOUND' });
  }

  // Default: 500 Internal Server Error
  logger.error({ err, requestId }, 'server.error');
  return res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
}
