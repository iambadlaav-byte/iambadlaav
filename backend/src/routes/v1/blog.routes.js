/**
 * Blog routes — public read-only (Plan 03).
 * Write endpoints (create/update/delete) arrive in Plan 07 (ADMIN-01).
 *
 * GET /api/v1/blog          — list published posts (paginated)
 * GET /api/v1/blog/:slug    — get single post by slug
 */
import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import { publicReadLimit } from '../../middleware/rateLimit.js';
import { listBlog, getBlogBySlug } from '../../controllers/blog.controller.js';
import { blogListQuerySchema } from '@dnyanpith/validators/content';

const router = Router();

/**
 * GET /blog
 * Validates query params via Zod (status, category, limit, cursor).
 * publicReadLimit: 120/min per IP (T-03-06).
 */
router.get('/blog', publicReadLimit, validate(blogListQuerySchema, 'query'), listBlog);

/**
 * GET /blog/:slug
 * Slug validated via route param pattern; no body to validate.
 */
router.get('/blog/:slug', publicReadLimit, getBlogBySlug);

export default router;
