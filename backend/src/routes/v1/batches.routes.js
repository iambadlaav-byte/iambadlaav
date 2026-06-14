/**
 * batches.routes.js — GET /api/v1/batches
 * Public read-only. Rate-limited by publicReadLimit.
 */
import { Router } from 'express';
import { publicReadLimit } from '../../middleware/rateLimit.js';
import { listBatches } from '../../controllers/batches.controller.js';

const router = Router();

router.get('/batches', publicReadLimit, listBatches);

export default router;
