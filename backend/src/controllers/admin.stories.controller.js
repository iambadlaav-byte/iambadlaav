/**
 * admin.stories.controller.js — Retreat Story CMS management.
 *
 * GET   /admin/stories          — list all stories (any status, optional ?status filter)
 * POST  /admin/stories          — create story (author = req.user.id)
 * PATCH /admin/stories/:id      — update story (audits status transitions)
 * POST  /admin/stories/:id/archive — soft-archive (status = ARCHIVED, never hard-delete)
 * POST  /admin/stories/upload   — upload one photo → returns { url } (Cloudinary secure_url)
 *
 * SOFT-DELETE (CONSTRAINT-SCHEMA-002): stories are never hard-deleted — archive only.
 *
 * Photo pipeline (mirrors profile photo, T-06-07/T-06-09):
 *   multer memoryStorage (field 'image') → verifyMagicBytes → uploadMediaImage →
 *   Cloudinary re-encode (EXIF strip) → secure_url returned to client, which pushes
 *   the URL into the story's photos[] array before saving.
 */
import { randomUUID } from 'node:crypto';
import { prisma } from '../lib/prisma.js';
import { writeAudit, AUDIT_ACTIONS } from '../services/audit.service.js';
import { uploadMediaImage } from '../services/cloudinary.service.js';

// ── listStories ─────────────────────────────────────────────────────────────────

export async function listStories(req, res, next) {
  try {
    const { status, cursor, limit = 25 } = req.query;

    const where = {};
    if (status) where.status = status;

    const take = Math.min(Number(limit) || 25, 100);

    const rows = await prisma.story.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      select: {
        id:        true,
        title:     true,
        subtitle:  true,
        batchName: true,
        date:      true,
        passage:   true,
        photos:    true,
        category:  true,
        status:    true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const nextCursor = rows.length === take ? rows[rows.length - 1].id : null;

    return res.json({ rows, nextCursor });
  } catch (err) {
    next(err);
  }
}

// ── createStory ──────────────────────────────────────────────────────────────────

export async function createStory(req, res, next) {
  try {
    // req.body validated by storyCreateSchema
    const { status = 'DRAFT', ...rest } = req.body;

    const story = await prisma.$transaction(async (tx) => {
      const created = await tx.story.create({
        data: {
          ...rest,
          status,
          authorId: req.user.id,
        },
      });

      await writeAudit({
        tx,
        actorId:     req.user.id,
        action:      AUDIT_ACTIONS.STORY_CREATED,
        subjectType: 'Story',
        subjectId:   created.id,
        meta:        { title: created.title, status: created.status },
        req,
      });

      if (status === 'PUBLISHED') {
        await writeAudit({
          tx,
          actorId:     req.user.id,
          action:      AUDIT_ACTIONS.STORY_PUBLISHED,
          subjectType: 'Story',
          subjectId:   created.id,
          meta:        { title: created.title },
          req,
        });
      }

      return created;
    });

    return res.status(201).json({ story });
  } catch (err) {
    next(err);
  }
}

// ── updateStory ──────────────────────────────────────────────────────────────────

export async function updateStory(req, res, next) {
  try {
    const { id } = req.params;
    // req.body validated by storyUpdateSchema (partial)
    const { status, ...rest } = req.body;

    const story = await prisma.$transaction(async (tx) => {
      const current = await tx.story.findUnique({
        where:  { id },
        select: { id: true, status: true, title: true },
      });
      if (!current) throw Object.assign(new Error('NOT_FOUND'), { statusCode: 404 });

      const updateData = { ...rest };
      if (status !== undefined) updateData.status = status;

      const updated = await tx.story.update({
        where: { id },
        data:  updateData,
      });

      await writeAudit({
        tx,
        actorId:     req.user.id,
        action:      AUDIT_ACTIONS.STORY_UPDATED,
        subjectType: 'Story',
        subjectId:   id,
        meta:        { title: updated.title },
        req,
      });

      // Audit a fresh PUBLISHED transition explicitly
      if (status === 'PUBLISHED' && current.status !== 'PUBLISHED') {
        await writeAudit({
          tx,
          actorId:     req.user.id,
          action:      AUDIT_ACTIONS.STORY_PUBLISHED,
          subjectType: 'Story',
          subjectId:   id,
          meta:        { previousStatus: current.status },
          req,
        });
      }

      return updated;
    });

    return res.json({ story });
  } catch (err) {
    if (err.statusCode === 404) return res.status(404).json({ error: 'NOT_FOUND' });
    next(err);
  }
}

// ── archiveStory ─────────────────────────────────────────────────────────────────

export async function archiveStory(req, res, next) {
  try {
    const { id } = req.params;

    const story = await prisma.$transaction(async (tx) => {
      const current = await tx.story.findUnique({
        where:  { id },
        select: { id: true, status: true, title: true },
      });
      if (!current) throw Object.assign(new Error('NOT_FOUND'), { statusCode: 404 });

      // Soft-archive only — NEVER hard-delete (CONSTRAINT-SCHEMA-002)
      const archived = await tx.story.update({
        where: { id },
        data:  { status: 'ARCHIVED' },
      });

      await writeAudit({
        tx,
        actorId:     req.user.id,
        action:      AUDIT_ACTIONS.STORY_ARCHIVED,
        subjectType: 'Story',
        subjectId:   id,
        meta:        { previousStatus: current.status, title: current.title },
        req,
      });

      return archived;
    });

    return res.json({ story });
  } catch (err) {
    if (err.statusCode === 404) return res.status(404).json({ error: 'NOT_FOUND' });
    next(err);
  }
}

// ── uploadStoryPhoto ─────────────────────────────────────────────────────────────
// Runs AFTER mediaImageUpload + verifyMagicBytes (req.file.buffer is verified).

export async function uploadStoryPhoto(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'NO_FILE', message: 'No image provided.' });
    }

    const url = await uploadMediaImage(req.file.buffer, {
      folder:   'badlaav/stories',
      publicId: randomUUID(),
    });

    return res.status(201).json({ url });
  } catch (err) {
    next(err);
  }
}
