/**
 * admin.gallery.controller.js — Gallery CMS management.
 *
 * GET    /admin/gallery         — list all gallery items (optional ?category filter)
 * POST   /admin/gallery         — create a gallery item from an uploaded URL
 * PATCH  /admin/gallery/:id     — update caption / altText / category / sortOrder
 * DELETE /admin/gallery/:id     — remove the row (+ best-effort Cloudinary delete)
 * POST   /admin/gallery/upload  — upload one image → returns { url } (Cloudinary)
 *
 * Photo pipeline (mirrors stories/profile, T-06-07/T-06-09):
 *   multer memoryStorage (field 'image') → verifyMagicBytes → uploadMediaImage →
 *   Cloudinary re-encode (EXIF strip) → secure_url returned, which the client then
 *   POSTs back as the gallery item's `url` together with the mandatory altText.
 */
import { randomUUID } from 'node:crypto';
import { prisma } from '../lib/prisma.js';
import { writeAudit, AUDIT_ACTIONS } from '../services/audit.service.js';
import { uploadMediaImage, deleteAsset } from '../services/cloudinary.service.js';

// ── listGalleryItems ─────────────────────────────────────────────────────────

export async function listGalleryItems(req, res, next) {
  try {
    const { category } = req.query;
    const where = {};
    if (category) where.category = category;

    const rows = await prisma.galleryItem.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      select: {
        id:        true,
        url:       true,
        caption:   true,
        category:  true,
        type:      true,
        altText:   true,
        sortOrder: true,
        createdAt: true,
      },
    });

    return res.json({ rows });
  } catch (err) {
    next(err);
  }
}

// ── createGalleryItem ────────────────────────────────────────────────────────

export async function createGalleryItem(req, res, next) {
  try {
    // req.body validated by galleryCreateSchema
    const item = await prisma.galleryItem.create({ data: req.body });

    await writeAudit({
      actorId:     req.user.id,
      action:      AUDIT_ACTIONS.GALLERY_CREATED,
      subjectType: 'GalleryItem',
      subjectId:   item.id,
      meta:        { category: item.category },
      req,
    });

    return res.status(201).json({ item });
  } catch (err) {
    next(err);
  }
}

// ── updateGalleryItem ────────────────────────────────────────────────────────

export async function updateGalleryItem(req, res, next) {
  try {
    const { id } = req.params;

    const existing = await prisma.galleryItem.findUnique({ where: { id }, select: { id: true } });
    if (!existing) return res.status(404).json({ error: 'NOT_FOUND' });

    // req.body validated by galleryUpdateSchema (partial)
    const item = await prisma.galleryItem.update({ where: { id }, data: req.body });

    await writeAudit({
      actorId:     req.user.id,
      action:      AUDIT_ACTIONS.GALLERY_UPDATED,
      subjectType: 'GalleryItem',
      subjectId:   id,
      meta:        { category: item.category },
      req,
    });

    return res.json({ item });
  } catch (err) {
    next(err);
  }
}

// ── deleteGalleryItem ────────────────────────────────────────────────────────
// Gallery items carry no financial/audit-retention requirement, so a hard delete
// is fine. The Cloudinary asset is removed best-effort (a failure never blocks).

export async function deleteGalleryItem(req, res, next) {
  try {
    const { id } = req.params;

    const item = await prisma.galleryItem.findUnique({
      where:  { id },
      select: { id: true, url: true, category: true },
    });
    if (!item) return res.status(404).json({ error: 'NOT_FOUND' });

    await prisma.galleryItem.delete({ where: { id } });

    // Derive the Cloudinary public_id from the secure URL and remove the asset.
    const publicId = cloudinaryPublicIdFromUrl(item.url);
    if (publicId) {
      try {
        await deleteAsset(publicId, item.type === 'VIDEO' ? 'video' : 'image');
      } catch { /* non-critical — the DB row is already gone */ }
    }

    await writeAudit({
      actorId:     req.user.id,
      action:      AUDIT_ACTIONS.GALLERY_DELETED,
      subjectType: 'GalleryItem',
      subjectId:   id,
      meta:        { category: item.category },
      req,
    });

    return res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

// ── uploadGalleryImage ───────────────────────────────────────────────────────
// Runs AFTER mediaImageUpload + verifyMagicBytes (req.file.buffer is verified).

export async function uploadGalleryImage(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'NO_FILE', message: 'No image provided.' });
    }

    const url = await uploadMediaImage(req.file.buffer, {
      folder:   'badlaav/gallery',
      publicId: randomUUID(),
    });

    return res.status(201).json({ url });
  } catch (err) {
    next(err);
  }
}

/**
 * Extract the Cloudinary public_id (incl. folder, sans extension) from a secure URL.
 * e.g. https://res.cloudinary.com/<cloud>/image/upload/v123/badlaav/gallery/abc.jpg
 *      → badlaav/gallery/abc
 * Returns null if the URL isn't a recognisable Cloudinary upload URL.
 */
function cloudinaryPublicIdFromUrl(url) {
  if (!url) return null;
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)$/);
  if (!match) return null;
  return match[1].replace(/\.[^./]+$/, '');
}
