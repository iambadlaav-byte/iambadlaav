/**
 * gallery.controller.js — public read-only gallery.
 * Admin write paths live under /api/v1/admin/gallery (admin.gallery.controller.js).
 *
 * All gallery items are public by nature, so there is no status gate — only an
 * optional category filter. Ordered by sortOrder so admins control the layout.
 */
import { prisma } from '../lib/prisma.js';

export async function listPublicGallery(req, res, next) {
  try {
    const { category } = req.query;
    const where = {};
    if (category) where.category = category;

    const rows = await prisma.galleryItem.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      select: {
        url:      true,
        caption:  true,
        category: true,
        type:     true,
        altText:  true,
      },
    });

    return res.json({ rows });
  } catch (err) {
    next(err);
  }
}
