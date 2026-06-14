/**
 * admin.controller.js — Admin dashboard stats.
 *
 * GET /api/v1/admin/dashboard
 * Returns 4 stat tiles used by AdminDashboardPage.
 * All reads run in parallel via Promise.all for performance.
 */
import { prisma } from '../lib/prisma.js';

export async function dashboardStats(req, res, next) {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const now = new Date();

    const [pendingEnquiries, registrationsLast30, upcomingEvents, revenueAgg] =
      await Promise.all([
        // Enquiries awaiting action
        prisma.enquiry.count({ where: { status: 'NEW' } }),

        // Paid registrations in the last 30 days
        prisma.registration.count({
          where: {
            paymentStatus: 'PAID',
            createdAt:     { gte: thirtyDaysAgo },
          },
        }),

        // Events starting in the future
        prisma.event.count({
          where: {
            startDate: { gt: now },
            status:    'UPCOMING',
          },
        }),

        // Revenue from paid registrations in last 30 days
        prisma.registration.aggregate({
          _sum: { finalAmount: true },
          where: {
            paymentStatus: 'PAID',
            createdAt:     { gte: thirtyDaysAgo },
          },
        }),
      ]);

    return res.json({
      pendingEnquiries,
      registrationsLast30,
      upcomingEvents,
      // Convert Decimal to number; return 0 if no paid registrations
      revenueLast30: Number(revenueAgg._sum.finalAmount ?? 0),
    });
  } catch (err) {
    next(err);
  }
}
