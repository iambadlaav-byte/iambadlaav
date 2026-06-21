/**
 * Gallery routes — public read-only gallery items.
 * Admin write paths live under /api/v1/admin/gallery (admin.routes.js).
 *
 * GET /api/v1/gallery            — list all gallery items (optional ?category)
 */
import { Router } from 'express';
import { publicReadLimit } from '../../middleware/rateLimit.js';
import { listPublicGallery } from '../../controllers/gallery.controller.js';

const router = Router();

// GET /gallery — publicReadLimit: 120/min per IP (T-03-06).
router.get('/gallery', publicReadLimit, listPublicGallery);

export default router;
