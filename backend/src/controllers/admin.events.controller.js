/**
 * admin.events.controller.js — Event CRUD for admin.
 *
 * GET   /admin/events           — list all events (any status)
 * POST  /admin/events           — create event
 * PATCH /admin/events/:id       — update event
 * POST  /admin/events/:id/cancel — cancel event (status = CANCELLED, never delete)
 *
 * Events are never hard-deleted (CONSTRAINT-SCHEMA-002).
 */
import { prisma }    from '../lib/prisma.js';
import { writeAudit, AUDIT_ACTIONS } from '../services/audit.service.js';

// ── listEvents ────────────────────────────────────────────────────────────────

export async function listEvents(req, res, next) {
  try {
    const { status, type, cursor, limit = 25 } = req.query;

    const where = {};
    if (status) where.status = status;
    if (type)   where.type   = type;

    const rows = await prisma.event.findMany({
      where,
      orderBy: { startDate: 'desc' },
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

// ── createEvent ───────────────────────────────────────────────────────────────

export async function createEvent(req, res, next) {
  try {
    // req.body validated by eventCreateSchema
    const event = await prisma.$transaction(async (tx) => {
      const created = await tx.event.create({ data: req.body });

      await writeAudit({
        tx,
        actorId:     req.user.id,
        action:      AUDIT_ACTIONS.EVENT_CREATED,
        subjectType: 'Event',
        subjectId:   created.id,
        meta:        { title: created.title, startDate: created.startDate },
        req,
      });

      return created;
    });

    return res.status(201).json({ event });
  } catch (err) {
    next(err);
  }
}

// ── updateEvent ───────────────────────────────────────────────────────────────

export async function updateEvent(req, res, next) {
  try {
    const { id } = req.params;
    // req.body validated by eventUpdateSchema (partial)

    const event = await prisma.$transaction(async (tx) => {
      const current = await tx.event.findUnique({ where: { id } });
      if (!current) throw Object.assign(new Error('NOT_FOUND'), { statusCode: 404 });

      const updated = await tx.event.update({
        where: { id },
        data:  req.body,
      });

      await writeAudit({
        tx,
        actorId:     req.user.id,
        action:      AUDIT_ACTIONS.EVENT_UPDATED,
        subjectType: 'Event',
        subjectId:   id,
        meta:        { changes: req.body },
        req,
      });

      return updated;
    });

    return res.json({ event });
  } catch (err) {
    if (err.statusCode === 404) return res.status(404).json({ error: 'NOT_FOUND' });
    next(err);
  }
}

// ── cancelEvent ───────────────────────────────────────────────────────────────

export async function cancelEvent(req, res, next) {
  try {
    const { id } = req.params;

    const event = await prisma.$transaction(async (tx) => {
      const current = await tx.event.findUnique({ where: { id } });
      if (!current) throw Object.assign(new Error('NOT_FOUND'), { statusCode: 404 });
      if (current.status === 'CANCELLED') {
        throw Object.assign(new Error('Event is already cancelled.'), { statusCode: 409, code: 'ALREADY_CANCELLED' });
      }

      // Soft-cancel only — NEVER hard-delete (CONSTRAINT-SCHEMA-002)
      const cancelled = await tx.event.update({
        where: { id },
        data:  { status: 'CANCELLED' },
      });

      await writeAudit({
        tx,
        actorId:     req.user.id,
        action:      AUDIT_ACTIONS.EVENT_CANCELLED,
        subjectType: 'Event',
        subjectId:   id,
        meta:        { title: current.title, previousStatus: current.status },
        req,
      });

      return cancelled;
    });

    return res.json({ event });
  } catch (err) {
    if (err.statusCode === 404) return res.status(404).json({ error: 'NOT_FOUND' });
    if (err.statusCode === 409) return res.status(409).json({ error: err.code, message: err.message });
    next(err);
  }
}
