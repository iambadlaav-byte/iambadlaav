/**
 * Sentry error tracking initialisation (ARCHITECTURE.md §27.3).
 * No-op stub when SENTRY_DSN_BACKEND is not set (local dev).
 * Strips cookies from events before sending to prevent PII leakage.
 */
import * as Sentry from '@sentry/node';

const dsn = process.env.SENTRY_DSN_BACKEND;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV || 'development',
    // 10% of transactions sampled for performance monitoring
    tracesSampleRate: 0.1,
    // Strip cookies from every event before sending — privacy first
    beforeSend(event) {
      if (event.request?.cookies) {
        delete event.request.cookies;
      }
      if (event.request?.headers?.cookie) {
        delete event.request.headers.cookie;
      }
      return event;
    },
  });
}

export { Sentry };
