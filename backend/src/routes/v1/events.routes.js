/**
 * Events routes — public read-only (Plan 03).
 * Write endpoints (create/edit/delete events) arrive in Plan 07 (ADMIN-01).
 *
 * GET /api/v1/events          — list events (upcoming filter, type filter)
 * GET /api/v1/events/:id      — get single event by ID
 */
import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import { publicReadLimit } from '../../middleware/rateLimit.js';
import { listEvents, getEvent } from '../../controllers/events.controller.js';
import { eventListQuerySchema } from '@dnyanpith/validators/content';

const router = Router();

/**
 * GET /events
 * Validates query params via Zod (upcoming, type, limit, cursor).
 * publicReadLimit: 120/min per IP (T-03-06).
 */
router.get('/events', publicReadLimit, validate(eventListQuerySchema, 'query'), listEvents);

/**
 * GET /events/:id
 */
router.get('/events/:id', publicReadLimit, getEvent);

export default router;
