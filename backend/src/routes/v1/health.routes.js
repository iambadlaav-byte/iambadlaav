/**
 * GET /api/v1/health — reports DB + Razorpay reachability.
 * Per ARCHITECTURE.md §27.5 and RESEARCH.md "Health endpoint" code example.
 * Path is /api/v1/health (versioned, per CONSTRAINT-API-001 — wins over §27.5 /api/health).
 *
 * Production notes:
 *  - We do NOT call `transporter.verify()` here. Brevo throttles repeated SMTP
 *    handshakes from the same IP — running it on every Railway healthcheck
 *    risks the entire Railway egress IP being blocked.
 *  - Each subcheck is wrapped with a 3s timeout so a slow upstream cannot
 *    blow past Railway's healthcheckTimeout.
 *  - We return HTTP 503 when the database is unreachable so Railway will
 *    correctly mark the deploy as failed instead of serving 500s.
 */
import { Router } from 'express';
import { prisma } from '../../lib/prisma.js';

const router = Router();

const HEALTHCHECK_TIMEOUT_MS = 3000;

function withTimeout(promise, ms, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`${label}.timeout`)), ms),
    ),
  ]);
}

router.get('/health', async (_req, res) => {
  const checks = await Promise.allSettled([
    withTimeout(prisma.$queryRaw`SELECT 1`, HEALTHCHECK_TIMEOUT_MS, 'database'),
    // 401 from Razorpay still counts as "reachable" (the server responded).
    withTimeout(fetch('https://api.razorpay.com/v1/'), HEALTHCHECK_TIMEOUT_MS, 'razorpay'),
  ]);

  const [db, rzp] = checks;
  const dbOk = db.status === 'fulfilled';

  res.status(dbOk ? 200 : 503).json({
    status: dbOk ? 'ok' : 'degraded',
    version: process.env.APP_VERSION || 'dev',
    uptime: process.uptime(),
    database: dbOk ? 'connected' : 'down',
    razorpay: rzp.status === 'fulfilled' ? 'reachable' : 'down',
    timestamp: new Date().toISOString(),
  });
});

export default router;
