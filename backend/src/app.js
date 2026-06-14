/**
 * Express application — middleware stack + route registration.
 * CRITICAL: Middleware ORDER matters. See RESEARCH.md Pattern 1.
 * The webhook raw-body capture must precede express.json() globally.
 */
import 'dotenv/config';
// MUST come before any route is imported: monkey-patches Express to forward
// async/Promise rejections from route handlers into the global errorHandler.
// Without this, Express 4 silently hangs on async errors until the client times out.
import 'express-async-errors';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import pinoHttp from 'pino-http';
import { logger } from './lib/logger.js';
import { requestId } from './middleware/requestId.js';
import { errorHandler } from './middleware/errorHandler.js';
import routesV1 from './routes/v1/index.js';

export const app = express();

// ============================================================
// 0. Trust the platform proxy (Railway / Vercel / Cloudflare)
//    Required for: correct req.ip, secure-cookie negotiation,
//    and per-IP rate limiting. Without this, every request looks
//    like it comes from Railway's internal load balancer.
// ============================================================
app.set('trust proxy', 1);

// ============================================================
// 1. Request ID — attach crypto.randomUUID() to req.id
//    for distributed tracing across log lines
// ============================================================
app.use(requestId);

// ============================================================
// 2. Helmet — HTTP security headers (ARCHITECTURE.md §22.4)
//    CSP configured to allow Razorpay checkout, Cloudinary CDN, YouTube embeds.
//    crossOriginEmbedderPolicy: false required for Cloudinary compat.
// ============================================================
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        'https://checkout.razorpay.com',
        'https://www.googletagmanager.com',
      ],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc:  ["'self'", 'https://fonts.gstatic.com'],
      imgSrc:   ["'self'", 'data:', 'https://res.cloudinary.com', 'https://i.ytimg.com'],
      connectSrc: [
        "'self'",
        'https://api.razorpay.com',
        'https://*.ingest.sentry.io',
      ],
      frameSrc: [
        'https://www.youtube.com',
        'https://www.google.com',       // Maps embed
        'https://api.razorpay.com',
      ],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// ============================================================
// 3. CORS — whitelist per CONSTRAINT-SEC-007
//    Never use '*'. Reads ALLOWED_ORIGINS from env.
// ============================================================
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map(o => o.trim());

app.use(cors({
  origin: allowedOrigins,
  credentials: true, // required for httpOnly refresh cookie
}));

// ============================================================
// 4. Cookie parser — needed to read httpOnly refresh token cookie
// ============================================================
app.use(cookieParser());

// ============================================================
// 5. HTTP request logging (Pino)
//    Redacts Authorization + Cookie headers before logging
// ============================================================
app.use(pinoHttp({
  logger,
  customLogLevel: (_req, res, err) =>
    err || res.statusCode >= 500 ? 'error' : 'info',
  redact: ['req.headers.authorization', 'req.headers.cookie'],
  // Attach request ID from req.id (set in step 1)
  customProps: (req) => ({ requestId: req.id }),
}));

// ============================================================
// 6. RAW BODY CAPTURE for Razorpay webhook — MUST be before express.json()
//    Without this, express.json() will consume the body stream and the
//    HMAC signature verification will fail (RESEARCH Pitfall 2 / Pattern 1).
//    Plan 05 implements the actual route handler; we reserve it here so
//    migrations and middleware order stay clean.
// ============================================================
app.use(
  '/api/v1/payments/webhook',
  express.raw({ type: 'application/json' })
);

// ============================================================
// 7. JSON body parser — all other routes
// ============================================================
app.use(express.json({ limit: '1mb' }));

// ============================================================
// 8. API routes under /api/v1/
// ============================================================
app.use('/api/v1', routesV1);

// ============================================================
// 9. Global error handler — must be last middleware
// ============================================================
app.use(errorHandler);
