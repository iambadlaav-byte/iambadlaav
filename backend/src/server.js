/**
 * server.js — HTTP server entry point.
 * Imports the Express app and starts listening on PORT.
 * Handles SIGTERM for graceful shutdown (Railway stop signal).
 */
import 'dotenv/config';
import { app } from './app.js';
import { prisma } from './lib/prisma.js';
import { logger } from './lib/logger.js';
import { startFailedPaymentReminderCron } from './jobs/failedPaymentReminder.js';

const PORT = parseInt(process.env.PORT || '4000', 10);

const server = app.listen(PORT, () => {
  logger.info({ port: PORT, env: process.env.NODE_ENV }, 'server.started');
  // Start cron jobs after server is live.
  // Gated by RUN_CRONS so that if Railway/k8s ever scales beyond a single
  // instance, only one service fires the failed-payment reminders. On free
  // tier we're always single-instance, but the gate is a safe default.
  if (process.env.RUN_CRONS === 'true') {
    startFailedPaymentReminderCron();
    logger.info('cron.started');
  } else {
    logger.info('cron.skipped { RUN_CRONS !== "true" }');
  }
});

/**
 * Graceful shutdown — triggered by Railway (SIGTERM) or Ctrl+C (SIGINT).
 * Stops accepting new connections, waits for in-flight requests to finish,
 * then disconnects Prisma cleanly.
 */
async function shutdown(signal) {
  logger.info({ signal }, 'server.shutdown.initiated');
  server.close(async () => {
    try {
      await prisma.$disconnect();
      logger.info('server.shutdown.complete');
      process.exit(0);
    } catch (err) {
      logger.error({ err }, 'server.shutdown.error');
      process.exit(1);
    }
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error({ reason }, 'unhandledRejection');
});

process.on('uncaughtException', (err) => {
  logger.error({ err }, 'uncaughtException');
  process.exit(1);
});
