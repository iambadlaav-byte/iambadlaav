/**
 * Stories routes — public read-only retreat stories.
 * Admin write paths live under /api/v1/admin/stories (admin.routes.js).
 *
 * GET /api/v1/stories       — list published stories (paginated)
 * GET /api/v1/stories/:id   — get single published story by id
 */
import { Router } from 'express';
import { publicReadLimit } from '../../middleware/rateLimit.js';
import { listPublishedStories, getPublishedStory } from '../../controllers/stories.controller.js';

const router = Router();

/**
 * GET /stories
 * publicReadLimit: 120/min per IP (T-03-06).
 */
router.get('/stories', publicReadLimit, listPublishedStories);

/**
 * GET /stories/:id
 */
router.get('/stories/:id', publicReadLimit, getPublishedStory);

export default router;
