/**
 * Events controller — public read-only endpoints (Plan 03).
 * Admin write paths (create/edit/delete events) arrive in Plan 07 (ADMIN-01).
 *
 * Security:
 * - T-03-03: query limit capped to 50 via Zod schema (content.js).
 * - T-03-04: Prisma parametrised queries prevent SQL injection.
 * - T-03-05: seat counts are a public feature — accepted.
 * - T-03-06: publicReadLimit applied in route (120/min per IP).
 */
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import { MOCK_EVENTS } from '../lib/mockData.js';

/**
 * listEvents — GET /api/v1/events
 * Supports ?upcoming=true and ?type=RETREAT|WORKSHOP|SESSION|COMMUNITY.
 * Returns cursor-based pagination with nextCursor.
 * Ordered by startDate ascending (nearest event first).
 */
export async function listEvents(req, res, next) {
  try {
    const upcoming = req.query.upcoming === true || req.query.upcoming === 'true';
    const type = req.query.type;
    const limit = Number(req.query.limit) || 20;
    const cursor = req.query.cursor;

    const where = {
      ...(upcoming ? { startDate: { gte: new Date() } } : {}),
      ...(type ? { type } : {}),
    };

    let events;
    try {
      events = await prisma.event.findMany({
        where,
        orderBy: { startDate: 'asc' },
        take: limit + 1,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
        // CONSTRAINT-SCHEMA-001: select only needed fields
        select: {
          id: true,
          title: true,
          description: true,
          startDate: true,
          endDate: true,
          location: true,
          type: true,
          totalSeats: true,
          seatsBooked: true,
          status: true,
          coverImage: true,
          createdAt: true,
        },
      });
    } catch (dbErr) {
      logger.warn({ err: dbErr }, 'DB query failed for events list, falling back to mock data');
      let filteredMock = MOCK_EVENTS;
      if (upcoming) {
        filteredMock = filteredMock.filter((e) => new Date(e.startDate) >= new Date());
      }
      if (type) {
        filteredMock = filteredMock.filter((e) => e.type === type);
      }
      filteredMock.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
      if (cursor) {
        const cursorIndex = filteredMock.findIndex((e) => e.id === cursor);
        if (cursorIndex !== -1) {
          filteredMock = filteredMock.slice(cursorIndex + 1);
        }
      }
      events = filteredMock.slice(0, limit + 1);
    }

    const hasMore = events.length > limit;
    const results = hasMore ? events.slice(0, limit) : events;
    const nextCursor = hasMore ? results[results.length - 1].id : null;

    return res.json({
      events: results,
      nextCursor,
    });
  } catch (err) {
    logger.error({ err }, 'listEvents error');
    next(err);
  }
}

/**
 * getEvent — GET /api/v1/events/:id
 * Returns a single event by ID.
 */
export async function getEvent(req, res, next) {
  try {
    const { id } = req.params;

    let event;
    try {
      event = await prisma.event.findUnique({
        where: { id },
        select: {
          id: true,
          title: true,
          description: true,
          startDate: true,
          endDate: true,
          location: true,
          type: true,
          totalSeats: true,
          seatsBooked: true,
          status: true,
          coverImage: true,
          createdAt: true,
        },
      });
    } catch (dbErr) {
      logger.warn({ err: dbErr, id }, 'DB query failed for event details, falling back to mock data');
      event = MOCK_EVENTS.find((e) => e.id === id);
    }

    if (!event) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Event not found.' });
    }

    return res.json(event);
  } catch (err) {
    logger.error({ err }, 'getEvent error');
    next(err);
  }
}
