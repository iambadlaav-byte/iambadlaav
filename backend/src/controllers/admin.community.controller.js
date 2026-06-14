/**
 * admin.community.controller.js — Community database management.
 *
 * GET /admin/community            — list, filterable by initiative + city
 * GET /admin/community/export.csv — CSV download with whatsappLink column
 */
import { prisma }    from '../lib/prisma.js';
import { buildCommunityCsv, streamCsv } from '../services/csvExport.service.js';

// ── listCommunity ──────────────────────────────────────────────────────────────

export async function listCommunity(req, res, next) {
  try {
    const { initiative, city, cursor, limit = 25 } = req.query;

    const where = {};
    if (initiative) where.initiative = initiative;
    if (city)       where.city       = { contains: city, mode: 'insensitive' };

    const rows = await prisma.communityMember.findMany({
      where,
      orderBy: { joinedAt: 'desc' },
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

// ── exportCommunityCsv ────────────────────────────────────────────────────────

export async function exportCommunityCsv(req, res, next) {
  try {
    const { initiative, city } = req.query;

    const where = {};
    if (initiative) where.initiative = initiative;
    if (city)       where.city       = { contains: city, mode: 'insensitive' };

    const members = await prisma.communityMember.findMany({
      where,
      orderBy: { joinedAt: 'asc' },
    });

    const { columns, rows } = buildCommunityCsv(members);
    streamCsv(res, { filename: 'community.csv', columns, rows });
  } catch (err) {
    next(err);
  }
}
