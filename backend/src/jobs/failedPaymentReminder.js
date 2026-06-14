/**
 * failedPaymentReminder.js — Failed-payment recovery cron.
 *
 * Runs every 5 minutes. Queries for PENDING registrations older than 15 minutes
 * that have not yet received a reminder (reminderSentAt is null).
 * Sends one email per registration and marks reminderSentAt to prevent duplicates.
 *
 * Per REQUIREMENTS.md PAY-01 (revised 2026-05-19) and DECISION-009:
 * Phase 1 ships full-payment retries only.
 * 50% advance for corporate Badlaav is in-scope for Phase 2 (founder-approved deferral).
 *
 * ARCHITECTURE.md §23.6 + RESEARCH Pitfall 5 + T-05-11 (DoS mitigation: take:50 per run).
 */
import cron from 'node-cron';
import { prisma } from '../lib/prisma.js';
import { sendEmail } from '../services/email.service.js';
import { logger } from '../lib/logger.js';

const FIFTEEN_MINUTES = 15 * 60 * 1000;

async function runFailedPaymentReminder() {
  try {
    const cutoff = new Date(Date.now() - FIFTEEN_MINUTES);

    // Find PENDING registrations older than 15 min with no reminder sent yet
    const pending = await prisma.registration.findMany({
      where: {
        paymentStatus:   'PENDING',
        createdAt:       { lt: cutoff },
        reminderSentAt:  null,
      },
      take: 50, // T-05-11: DoS mitigation — process max 50 per run
      include: {
        user:  { select: { name: true, email: true } },
        batch: { select: { name: true } },
      },
    });

    if (pending.length === 0) return;

    logger.info({ count: pending.length }, 'cron.failedPaymentReminder.start');

    for (const reg of pending) {
      try {
        const programDisplayName = programDisplay(reg.program);
        const retryUrl = process.env.APP_URL
          ? `${process.env.APP_URL}/register?program=${reg.program.toLowerCase()}`
          : `https://dnyanpith.org/register?program=${reg.program.toLowerCase()}`;

        await sendEmail({
          to:       reg.user.email,
          template: 'payment-failed-reminder',
          data: {
            name:               reg.user.name,
            programDisplayName,
            batchName:          reg.batch?.name ?? '',
            retryUrl,
          },
        });

        // Mark reminder sent — prevents duplicate emails (T-05-11)
        await prisma.registration.update({
          where: { id: reg.id },
          data:  { reminderSentAt: new Date() },
        });

        logger.info({ registrationId: reg.id }, 'cron.failedPaymentReminder.sent');
      } catch (itemErr) {
        // Log per-item error without halting the whole batch
        logger.error({ err: itemErr, registrationId: reg.id }, 'cron.failedPaymentReminder.item.error');
      }
    }
  } catch (err) {
    logger.error({ err }, 'cron.failedPaymentReminder.error');
  }
}

/**
 * Start the cron job. Call once from server.js after the Express app starts.
 */
export function startFailedPaymentReminderCron() {
  // Every 5 minutes
  cron.schedule('*/5 * * * *', runFailedPaymentReminder);
  logger.info('cron.failedPaymentReminder.registered (*/5 * * * *)');
}

// ── Helper ────────────────────────────────────────────────────────────────────

function programDisplay(program) {
  const map = {
    BADLAAV:          'Badlaav Corporate Retreat',
    MISSION_UDAAN:    'Mission Udaan',
    FUTURE_READINESS: 'Future Readiness',
    ANTRANG:          'Antrang',
  };
  return map[program] ?? program;
}
