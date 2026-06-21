/**
 * Routes v1 aggregator — all /api/v1/* routes.
 * Import new route files here as plans 03-07 add them.
 */
import { Router } from 'express';
import healthRoutes from './health.routes.js';
import authRoutes from './auth.routes.js';
import blogRoutes from './blog.routes.js';
import eventsRoutes from './events.routes.js';
import storiesRoutes from './stories.routes.js';
import galleryRoutes from './gallery.routes.js';
import enquiriesRoutes from './enquiries.routes.js';
import communityRoutes from './community.routes.js';
import volunteersRoutes from './volunteers.routes.js';
import messagesRoutes from './messages.routes.js';
import registrationsRoutes from './registrations.routes.js';
import paymentsRoutes from './payments.routes.js';
import couponsRoutes from './coupons.routes.js';
import batchesRoutes from './batches.routes.js';
import usersRoutes from './users.routes.js';
import adminRoutes from './admin.routes.js';

const router = Router();

// Health check endpoint
router.use(healthRoutes);

// Authentication endpoints
router.use(authRoutes);

// Public read-only content endpoints (Plan 03)
router.use(blogRoutes);
router.use(eventsRoutes);
router.use(storiesRoutes);     // GET /stories, GET /stories/:id (published only)
router.use(galleryRoutes);     // GET /gallery (public gallery items)

// Form submission endpoints (Plan 04)
router.use(enquiriesRoutes);   // POST /enquiries/corporate, POST /enquiries/college
router.use(communityRoutes);   // POST /community/join
router.use(volunteersRoutes);  // POST /volunteers
router.use(messagesRoutes);    // POST /messages

// Registration + Payment + Coupon + Batch endpoints (Plan 05)
router.use(registrationsRoutes);  // POST /registrations, GET /registrations/:id/invoice
router.use(paymentsRoutes);       // POST /payments/webhook, /create-order, /verify
router.use(couponsRoutes);        // POST /coupons/validate
router.use(batchesRoutes);        // GET /batches

// Plan 06: authenticated user routes
router.use(usersRoutes);

// Plan 07: admin panel routes (all gated by requireAdmin)
router.use('/admin', adminRoutes);

export default router;
