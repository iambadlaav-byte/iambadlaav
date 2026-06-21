/**
 * admin.reports.controller.js
 *
 * Aggregated registration reports for the admin panel.
 *
 * Endpoints:
 *   GET /admin/reports             — JSON: counts (+ revenue) grouped by a dimension
 *   GET /admin/reports/export.csv  — same aggregation streamed as CSV
 *
 * Grouping dimensions (groupBy): program | batch | location | date | status
 *
 * Revenue gating (RBAC matrix): money is Admin-only. When canSeeFinancials(req.user)
 * is false, `revenue` is stripped from every row AND from totals, and the response
 * carries financialsVisible:false so the frontend hides the column.
 */
import { prisma }              from '../lib/prisma.js';
import { streamCsv }           from '../services/csvExport.service.js';
import { canSeeFinancials }    from '../middleware/auth.js';

// Program enum → display label. Mirrors admin.registrations.controller.js:
// BADLAAV = The Retreat, FUTURE_READINESS = The Badlaav Experience.
function programDisplay(program) {
  const map = {
    BADLAAV:          'The Retreat',
    FUTURE_READINESS: 'The Badlaav Experience',
    MISSION_UDAAN:    'Future Programme',
    ANTRANG:          'Future Programme',
  };
  return map[program] ?? program;
}

// Derive a single bucketed status from the two status columns.
function derivedStatus(reg) {
  if (reg.paymentStatus === 'PAID') return 'PAID';
  if (reg.status === 'WAITLISTED')  return 'WAITLISTED';
  return 'PENDING';
}

// Resolve the {key, label} pair for a registration under the chosen dimension.
function dimensionFor(reg, groupBy) {
  switch (groupBy) {
    case 'batch': {
      const key = reg.batchId ?? 'no-batch';
      return { key, label: reg.batch?.name ?? 'No batch' };
    }
    case 'location': {
      const loc = reg.batch?.venue || reg.batch?.address || 'Unspecified';
      return { key: loc, label: loc };
    }
    case 'date': {
      const ym = new Date(reg.createdAt).toISOString().slice(0, 7); // YYYY-MM
      return { key: ym, label: ym };
    }
    case 'status': {
      const s = derivedStatus(reg);
      return { key: s, label: s };
    }
    case 'program':
    default:
      return { key: reg.program, label: programDisplay(reg.program) };
  }
}

/**
 * Shared aggregation. Reads validated query, fetches the filtered registrations,
 * and folds them into grouped rows + a totals object.
 *
 * @returns {{ groupBy, from, to, rows, totals, financialsVisible }}
 */
async function aggregateReports(req) {
  const { groupBy = 'program', from, to, program } = req.query;

  const where = {};
  if (program) where.program = program;
  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = new Date(from);
    if (to)   where.createdAt.lte = new Date(to);
  }

  const registrations = await prisma.registration.findMany({
    where,
    select: {
      id:            true,
      program:       true,
      batchId:       true,
      status:        true,
      paymentStatus: true,
      finalAmount:   true,
      createdAt:     true,
      batch: { select: { name: true, venue: true, address: true } },
    },
  });

  const map = new Map();
  const totals = { total: 0, paid: 0, pending: 0, waitlisted: 0, revenue: 0 };

  for (const reg of registrations) {
    const { key, label } = dimensionFor(reg, groupBy);
    let row = map.get(key);
    if (!row) {
      row = { key, label, total: 0, paid: 0, pending: 0, waitlisted: 0, revenue: 0 };
      map.set(key, row);
    }

    row.total  += 1;
    totals.total += 1;

    if (reg.paymentStatus === 'PAID') {
      row.paid    += 1;
      totals.paid += 1;
      const amount = Number(reg.finalAmount) || 0;
      row.revenue    += amount;
      totals.revenue += amount;
    } else if (reg.status === 'WAITLISTED') {
      row.waitlisted    += 1;
      totals.waitlisted += 1;
    } else {
      row.pending    += 1;
      totals.pending += 1;
    }
  }

  let rows = [...map.values()].sort((a, b) => b.total - a.total);

  const financialsVisible = canSeeFinancials(req.user);
  if (!financialsVisible) {
    rows = rows.map(({ revenue, ...rest }) => rest);
    delete totals.revenue;
  }

  return {
    groupBy,
    from: from ?? null,
    to:   to ?? null,
    rows,
    totals,
    financialsVisible,
  };
}

// ── getReports ────────────────────────────────────────────────────────────────

export async function getReports(req, res, next) {
  try {
    const result = await aggregateReports(req);
    return res.json(result);
  } catch (err) {
    next(err);
  }
}

// ── exportReportsCsv ──────────────────────────────────────────────────────────

export async function exportReportsCsv(req, res, next) {
  try {
    const { groupBy, rows, financialsVisible } = await aggregateReports(req);

    const columns = [
      'group',
      'total',
      'paid',
      'pending',
      'waitlisted',
      ...(financialsVisible ? ['revenue'] : []),
    ];

    const csvRows = rows.map((r) => ({
      group:      r.label,
      total:      r.total,
      paid:       r.paid,
      pending:    r.pending,
      waitlisted: r.waitlisted,
      ...(financialsVisible ? { revenue: r.revenue } : {}),
    }));

    streamCsv(res, { filename: `report-${groupBy}.csv`, columns, rows: csvRows });
  } catch (err) {
    next(err);
  }
}
