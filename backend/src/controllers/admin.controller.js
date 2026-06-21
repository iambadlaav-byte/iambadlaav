/**
 * admin.controller.js — Admin dashboard stats.
 *
 * GET /api/v1/admin/dashboard
 * Returns the headline metrics for AdminDashboardPage. Financial figures
 * (revenue) are Admin-only — Contributor/Viewer never receive them.
 * All reads run in parallel via Promise.all.
 */
import { prisma } from '../lib/prisma.js';
import { canSeeFinancials } from '../middleware/auth.js';

export async function dashboardStats(req, res, next) {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const now = new Date();

    const [
      totalRegistrations,
      paidRegistrations,
      pendingPayments,
      waitlist,
      volunteers,
      upcomingBatches,
      pendingEnquiries,
      registrationsLast30,
      revenueTotalAgg,
      revenue30Agg,
    ] = await Promise.all([
      prisma.registration.count({ where: { status: { in: ['ACTIVE', 'COMPLETED'] } } }),
      prisma.registration.count({ where: { paymentStatus: 'PAID' } }),
      prisma.registration.count({ where: { paymentStatus: 'PENDING', status: 'ACTIVE' } }),
      prisma.registration.count({ where: { status: 'WAITLISTED' } }),
      prisma.volunteer.count(),
      prisma.batch.count({ where: { startDate: { gt: now }, status: 'OPEN' } }),
      prisma.enquiry.count({ where: { status: 'NEW' } }),
      prisma.registration.count({ where: { paymentStatus: 'PAID', createdAt: { gte: thirtyDaysAgo } } }),
      prisma.registration.aggregate({ _sum: { finalAmount: true }, where: { paymentStatus: 'PAID' } }),
      prisma.registration.aggregate({
        _sum: { finalAmount: true },
        where: { paymentStatus: 'PAID', createdAt: { gte: thirtyDaysAgo } },
      }),
    ]);

    const payload = {
      totalRegistrations,
      paidRegistrations,
      pendingPayments,
      waitlist,
      volunteers,
      upcomingBatches,
      pendingEnquiries,
      registrationsLast30,
      // backwards-compat with the existing dashboard tiles
      upcomingEvents: upcomingBatches,
    };

    // Financials are Admin-only.
    if (canSeeFinancials(req.user)) {
      payload.revenueTotal = Number(revenueTotalAgg._sum.finalAmount ?? 0);
      payload.revenueLast30 = Number(revenue30Agg._sum.finalAmount ?? 0);
    }

    return res.json(payload);
  } catch (err) {
    next(err);
  }
}
