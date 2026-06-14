/**
 * content.js — Zod schemas for public content endpoints (Blog + Events).
 * Shared frontend ↔ backend per CONSTRAINT-CODE-005.
 *
 * Public endpoints force status='published' on the backend regardless of
 * what the client sends (T-03-01 threat mitigation). The schema here
 * defines what the client can validly send; the controller enforces the
 * published-only rule for non-admin callers.
 */
import { z } from 'zod';

/**
 * blogListQuerySchema — query params for GET /api/v1/blog
 * Status is accepted from the client but the controller overrides it
 * to 'published' for non-admin requests (T-03-01).
 */
export const blogListQuerySchema = z.strictObject({
  status: z.enum(['published', 'draft', 'archived']).optional().default('published'),
  category: z.string().max(40).optional(),
  // Limit capped at 50 (T-03-03 DoS mitigation)
  limit: z.coerce.number().int().min(1).max(50).optional().default(12),
  cursor: z.string().optional(),
});

/**
 * eventListQuerySchema — query params for GET /api/v1/events
 */
export const eventListQuerySchema = z.strictObject({
  upcoming: z.coerce.boolean().optional(),
  type: z.string().max(40).optional(),
  // Limit capped at 50 (T-03-03 DoS mitigation)
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
  cursor: z.string().optional(),
});
