/**
 * admin.enquiries.controller.js — Enquiries inbox management.
 *
 * GET    /admin/enquiries            — list with filters (status, type, date range, cursor)
 * GET    /admin/enquiries/export.csv — CSV export (contact columns gated)
 * GET    /admin/enquiries/:id        — single enquiry detail
 * PATCH  /admin/enquiries/:id        — update status + adminNote; audit-logged
 * DELETE /admin/enquiries/:id        — hard delete; admin-tier; audit-logged
 */
import { prisma }    from '../lib/prisma.js';
import { writeAudit, AUDIT_ACTIONS } from '../services/audit.service.js';
import { buildEnquiriesCsv, streamCsv } from '../services/csvExport.service.js';
import { canSeeContact } from '../middleware/auth.js';

// ── listEnquiries ──────────────────────────────────────────────────────────────

export async function listEnquiries(req, res, next) {
  try {
    const { status, type, from, to, cursor, limit = 25 } = req.query;

    const where = {};
    if (status) where.status = status;
    if (type)   where.type   = type;
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to)   where.createdAt.lte = new Date(to);
    }

    const rows = await prisma.enquiry.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take:    Math.min(Number(limit) || 25, 100),
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    const nextCursor = rows.length === Math.min(Number(limit) || 25, 100)
      ? rows[rows.length - 1].id
      : null;

    return res.json({ rows, nextCursor });
  } catch (err) {
    next(err);
  }
}

// ── getEnquiry ────────────────────────────────────────────────────────────────

export async function getEnquiry(req, res, next) {
  try {
    const enquiry = await prisma.enquiry.findUnique({
      where: { id: req.params.id },
    });

    if (!enquiry) return res.status(404).json({ error: 'NOT_FOUND' });
    return res.json({ enquiry });
  } catch (err) {
    next(err);
  }
}

// ── updateEnquiryStatus ───────────────────────────────────────────────────────

export async function updateEnquiryStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status: newStatus, adminNote } = req.body; // validated by enquiryStatusSchema

    const result = await prisma.$transaction(async (tx) => {
      const current = await tx.enquiry.findUnique({
        where:  { id },
        select: { id: true, status: true },
      });
      if (!current) throw Object.assign(new Error('NOT_FOUND'), { statusCode: 404 });

      const updated = await tx.enquiry.update({
        where: { id },
        data:  {
          status:    newStatus,
          adminNote: adminNote ?? undefined,
        },
      });

      await writeAudit({
        tx,
        actorId:     req.user.id,
        action:      AUDIT_ACTIONS.ENQUIRY_STATUS_CHANGED,
        subjectType: 'Enquiry',
        subjectId:   id,
        meta:        { oldStatus: current.status, newStatus, adminNote },
        req,
      });

      return updated;
    });

    return res.json({ enquiry: result });
  } catch (err) {
    if (err.statusCode === 404) return res.status(404).json({ error: 'NOT_FOUND' });
    next(err);
  }
}

// ── exportEnquiriesCsv ─────────────────────────────────────────────────────────
// Streams a CSV of enquiries honouring the same status/type/date filters as the
// list endpoint. Contact columns (email / phone) drop for non-contact-eligible staff.

export async function exportEnquiriesCsv(req, res, next) {
  try {
    const { status, type, from, to } = req.query;

    const where = {};
    if (status) where.status = status;
    if (type)   where.type   = type;
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to)   where.createdAt.lte = new Date(to);
    }

    const enquiries = await prisma.enquiry.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    const { columns, rows } = buildEnquiriesCsv(enquiries, { showContact: canSeeContact(req.user) });

    await writeAudit({
      actorId:     req.user.id,
      action:      AUDIT_ACTIONS.ENQUIRIES_EXPORTED,
      subjectType: 'Export',
      subjectId:   null,
      meta:        { count: rows.length },
      req,
    });

    streamCsv(res, { filename: 'enquiries.csv', columns, rows });
  } catch (err) {
    next(err);
  }
}

// ── deleteEnquiry ──────────────────────────────────────────────────────────────
// Admin-tier HARD delete. Audit row keeps a loose subjectId ref so the deletion
// stays on the trail even though the enquiry row is gone.

export async function deleteEnquiry(req, res, next) {
  try {
    const { id } = req.params;

    await prisma.$transaction(async (tx) => {
      const current = await tx.enquiry.findUnique({
        where:  { id },
        select: { id: true, type: true, email: true },
      });
      if (!current) throw Object.assign(new Error('NOT_FOUND'), { statusCode: 404 });

      await tx.enquiry.delete({ where: { id } });

      await writeAudit({
        tx,
        actorId:     req.user.id,
        action:      AUDIT_ACTIONS.ENQUIRY_DELETED,
        subjectType: 'Enquiry',
        subjectId:   id,
        meta:        { type: current.type, email: current.email },
        req,
      });
    });

    return res.json({ ok: true });
  } catch (err) {
    if (err.statusCode === 404) return res.status(404).json({ error: 'NOT_FOUND' });
    next(err);
  }
}
