/**
 * admin.audit.controller.js — Audit log viewer.
 *
 * GET /admin/audit
 *   Returns the last N (default 100, max 500) audit rows, joined with actor user.
 *   Filterable by action and actorId.
 *   Read-only — no writes.
 */
import { prisma } from '../lib/prisma.js';

export async function listAudit(req, res, next) {
  try {
    const { action, actorId, limit = 100 } = req.query;

    const where = {};
    if (action)  where.action  = action;
    if (actorId) where.actorId = actorId;

    const rows = await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take:    Math.min(Number(limit) || 100, 500),
      select: {
        id:          true,
        actorId:     true,
        action:      true,
        subjectType: true,
        subjectId:   true,
        meta:        true,
        ipAddress:   true,
        createdAt:   true,
        // Join actor name + email for display in the audit table
        // AuditLog.actorId is a loose string ref (no Prisma relation) — resolve manually
      },
    });

    // Resolve actor names for all unique actorIds in one query
    const actorIds = [...new Set(rows.map(r => r.actorId).filter(Boolean))];
    const actors = actorIds.length > 0
      ? await prisma.user.findMany({
          where:  { id: { in: actorIds } },
          select: { id: true, name: true, email: true },
        })
      : [];

    const actorMap = Object.fromEntries(actors.map(a => [a.id, a]));

    const enriched = rows.map(row => ({
      ...row,
      actor: row.actorId ? (actorMap[row.actorId] ?? { id: row.actorId, name: 'Unknown', email: '' }) : null,
    }));

    return res.json({ rows: enriched });
  } catch (err) {
    next(err);
  }
}
