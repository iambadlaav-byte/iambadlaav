/**
 * csvExport.service.js — CSV streaming helpers using csv-stringify.
 *
 * streamCsv sets the correct headers and writes the CSV to the Express response.
 * buildXxxCsv helpers transform Prisma rows into typed column maps for each export.
 *
 * All exports go through /api/v1/admin/* routes which require ADMIN role —
 * PII in CSVs never reaches unauthenticated callers (T-07-07).
 *
 * Phase 1: synchronous stringify (small datasets — < 10K rows). Phase 3 can switch
 * to streaming if the community table grows significantly.
 */
import { stringify } from 'csv-stringify/sync';

/**
 * Stream a CSV to an Express response.
 *
 * @param {object} res       — Express response object
 * @param {object} opts
 * @param {string} opts.filename  — filename for Content-Disposition header
 * @param {string[]} opts.columns — ordered column headers
 * @param {Array<object>} opts.rows — data rows (keys match columns)
 */
export function streamCsv(res, { filename, columns, rows }) {
  const csv = stringify(rows, {
    header: true,
    columns,
    cast: {
      // Stringify Dates to ISO strings so they're always readable
      date: (value) => value.toISOString(),
    },
  });

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(csv);
}

// ── Registration export ───────────────────────────────────────────────────────

/**
 * Build CSV payload for general registrations export.
 * @param {Array} registrations — Prisma registration rows (with user + batch included)
 */
export function buildRegistrationsCsv(registrations) {
  const columns = [
    'registrationId',
    'createdAt',
    'userEmail',
    'userName',
    'program',
    'plan',
    'regType',
    'batchName',
    'amount',
    'discountAmount',
    'finalAmount',
    'couponCode',
    'paymentStatus',
    'status',
    'invoiceNumber',
  ];

  const rows = registrations.map((r) => ({
    registrationId: r.id,
    createdAt:      r.createdAt,
    userEmail:      r.user?.email ?? '',
    userName:       r.user?.name ?? '',
    program:        r.program,
    plan:           r.plan,
    regType:        r.regType,
    batchName:      r.batch?.name ?? '',
    amount:         Number(r.amount),
    discountAmount: Number(r.discountAmount ?? 0),
    finalAmount:    Number(r.finalAmount),
    couponCode:     r.couponCode ?? '',
    paymentStatus:  r.paymentStatus,
    status:         r.status,
    invoiceNumber:  r.invoiceNumber ?? '',
  }));

  return { columns, rows };
}

// ── Community export ──────────────────────────────────────────────────────────

/**
 * Build CSV payload for community members export.
 * Includes a whatsappLink column derived from the member's phone number.
 * @param {Array} members — Prisma CommunityMember rows
 */
export function buildCommunityCsv(members) {
  const columns = [
    'id',
    'name',
    'phone',
    'city',
    'email',
    'initiative',
    'joinedAt',
    'whatsappLink',
  ];

  const rows = members.map((m) => ({
    id:           m.id,
    name:         m.name,
    phone:        m.phone,
    city:         m.city,
    email:        m.email ?? '',
    initiative:   m.initiative,
    joinedAt:     m.joinedAt,
    whatsappLink: `https://wa.me/91${m.phone}`,
  }));

  return { columns, rows };
}

// ── Monthly reconciliation export (PAY-01) ────────────────────────────────────

/**
 * Build CSV payload for monthly payment reconciliation.
 * Columns match the PAY-01 requirement from REQUIREMENTS.md.
 *
 * amountPaid is converted from paise (Decimal in DB) to rupees for human readability.
 * refundStatus derives from paymentStatus: 'REFUNDED' if refunded, else 'NONE'.
 *
 * @param {Array} registrations — Prisma registration rows filtered by month + paymentStatus
 */
export function buildReconciliationCsv(registrations) {
  const columns = [
    'registrationId',
    'invoiceNumber',
    'userName',
    'userEmail',
    'program',
    'batchOrPlan',
    'amountPaid',
    'razorpayPaymentId',
    'paidAt',
    'refundStatus',
  ];

  const rows = registrations.map((r) => ({
    registrationId:    r.id,
    invoiceNumber:     r.invoiceNumber ?? '',
    userName:          r.user?.name ?? '',
    userEmail:         r.user?.email ?? '',
    program:           r.program,
    // Prefer batch name; fall back to plan string (e.g. 'individual', 'couple')
    batchOrPlan:       r.batch?.name ?? r.plan,
    // finalAmount is stored as Decimal in rupees (not paise) — convert to number
    amountPaid:        Number(r.finalAmount),
    razorpayPaymentId: r.razorpayPaymentId ?? '',
    paidAt:            r.paidAt ?? r.createdAt,
    refundStatus:      r.paymentStatus === 'REFUNDED' ? 'REFUNDED' : 'NONE',
  }));

  return { columns, rows };
}
