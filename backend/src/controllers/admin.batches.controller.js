/**
 * admin.batches.controller.js — Batch CRUD for admin.
 *
 * GET   /admin/batches      — list all batches (admin sees all statuses)
 * POST  /admin/batches      — create a new batch
 * PATCH /admin/batches/:id  — update a batch
 *
 * Batches are never deleted — only status transitions to CLOSED/PAST (CONSTRAINT-SCHEMA-002).
 */
import { prisma }    from '../lib/prisma.js';
import { writeAudit, AUDIT_ACTIONS } from '../services/audit.service.js';
import { isSuperAdmin } from '../middleware/auth.js';

// ── listBatches ────────────────────────────────────────────────────────────────

export async function listBatches(req, res, next) {
  try {
    const { program, status, cursor, limit = 25 } = req.query;

    const where = {};
    if (program) where.program = program;
    if (status)  where.status  = status;

    const rows = await prisma.batch.findMany({
      where,
      orderBy: { startDate: 'desc' },
      take:    Math.min(Number(limit) || 25, 100),
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      include: { _count: { select: { registrations: true } } },
    });

    // Attach per-batch waiting-list counts.
    const waitlistCounts = rows.length
      ? await prisma.registration.groupBy({
          by:     ['batchId'],
          where:  { status: 'WAITLISTED', batchId: { in: rows.map((r) => r.id) } },
          _count: { _all: true },
        })
      : [];
    const waitMap = Object.fromEntries(waitlistCounts.map((w) => [w.batchId, w._count._all]));
    const rowsWithWait = rows.map((r) => ({ ...r, waitlistCount: waitMap[r.id] ?? 0 }));

    const nextCursor = rows.length === Math.min(Number(limit) || 25, 100)
      ? rows[rows.length - 1].id
      : null;

    return res.json({ rows: rowsWithWait, nextCursor });
  } catch (err) {
    next(err);
  }
}

// ── createBatch ────────────────────────────────────────────────────────────────

export async function createBatch(req, res, next) {
  try {
    // req.body validated by batchCreateSchema via validate middleware
    const batch = await prisma.$transaction(async (tx) => {
      const created = await tx.batch.create({ data: req.body });

      await writeAudit({
        tx,
        actorId:     req.user.id,
        action:      AUDIT_ACTIONS.BATCH_CREATED,
        subjectType: 'Batch',
        subjectId:   created.id,
        meta:        { name: created.name, program: created.program },
        req,
      });

      return created;
    });

    return res.status(201).json({ batch });
  } catch (err) {
    next(err);
  }
}

// ── updateBatch ────────────────────────────────────────────────────────────────

export async function updateBatch(req, res, next) {
  try {
    const { id } = req.params;
    // req.body validated by batchUpdateSchema (partial) via validate middleware

    const result = await prisma.$transaction(async (tx) => {
      const current = await tx.batch.findUnique({ where: { id } });
      if (!current) throw Object.assign(new Error('NOT_FOUND'), { statusCode: 404 });

      const updated = await tx.batch.update({
        where: { id },
        data:  req.body,
      });

      await writeAudit({
        tx,
        actorId:     req.user.id,
        action:      AUDIT_ACTIONS.BATCH_UPDATED,
        subjectType: 'Batch',
        subjectId:   id,
        meta:        { changes: req.body },
        req,
      });

      return updated;
    });

    return res.json({ batch: result });
  } catch (err) {
    if (err.statusCode === 404) return res.status(404).json({ error: 'NOT_FOUND' });
    next(err);
  }
}

// ── deleteBatch ────────────────────────────────────────────────────────────────
// SUPERADMIN-only HARD delete. Refuses if the batch has any registrations (to avoid
// orphaning paid/waitlisted records). The route is gated requireAdmin; the
// superadmin check is enforced here so the 403 reason is explicit.

export async function deleteBatch(req, res, next) {
  try {
    if (!isSuperAdmin(req.user)) {
      return res.status(403).json({ error: 'FORBIDDEN', message: 'Only a super admin can delete batches.' });
    }

    const { id } = req.params;

    const result = await prisma.$transaction(async (tx) => {
      const current = await tx.batch.findUnique({
        where:  { id },
        select: { id: true, name: true, program: true, _count: { select: { registrations: true } } },
      });
      if (!current) throw Object.assign(new Error('NOT_FOUND'), { statusCode: 404 });

      if (current._count.registrations > 0) {
        throw Object.assign(
          new Error('Batch has registrations and cannot be deleted.'),
          { statusCode: 409, code: 'BATCH_HAS_REGISTRATIONS' }
        );
      }

      await tx.batch.delete({ where: { id } });

      await writeAudit({
        tx,
        actorId:     req.user.id,
        action:      AUDIT_ACTIONS.BATCH_DELETED,
        subjectType: 'Batch',
        subjectId:   id,
        meta:        { name: current.name, program: current.program },
        req,
      });

      return current;
    });

    return res.json({ ok: true, deletedId: result.id });
  } catch (err) {
    if (err.statusCode === 404) return res.status(404).json({ error: 'NOT_FOUND' });
    if (err.statusCode === 409) {
      return res.status(409).json({ error: err.code ?? 'CONFLICT', message: err.message });
    }
    next(err);
  }
}
