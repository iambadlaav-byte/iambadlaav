/**
 * stories.controller.js — public read-only endpoints for retreat stories.
 *
 * GET /api/v1/stories       — list PUBLISHED stories (newest first)
 * GET /api/v1/stories/:id   — single story, only if PUBLISHED (else 404)
 *
 * Security:
 * - status is hard-coded to PUBLISHED — DRAFT/ARCHIVED are never exposed publicly.
 * - select-only fields; never SELECT * (CONSTRAINT-SCHEMA-001).
 */
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';

/**
 * listPublishedStories — GET /api/v1/stories
 * Ordered by story date (falls back to createdAt when date is null), newest first.
 */
export async function listPublishedStories(req, res, next) {
  try {
    const limit = Math.min(Number(req.query.limit) || 24, 50);
    const cursor = req.query.cursor;

    const stories = await prisma.story.findMany({
      where:   { status: 'PUBLISHED' },
      // date-then-createdAt so dated stories sort by their event date, undated by creation
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
      take:    limit + 1, // fetch one extra to detect next page
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
        createdAt: true,
      },
    });

    const hasMore = stories.length > limit;
    const results = hasMore ? stories.slice(0, limit) : stories;
    const nextCursor = hasMore ? results[results.length - 1].id : null;

    return res.json({ stories: results, nextCursor });
  } catch (err) {
    logger.error({ err }, 'listPublishedStories error');
    next(err);
  }
}

/**
 * getPublishedStory — GET /api/v1/stories/:id
 * Returns 404 for non-existent or non-PUBLISHED stories.
 */
export async function getPublishedStory(req, res, next) {
  try {
    const { id } = req.params;

    const story = await prisma.story.findUnique({
      where: { id },
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
      },
    });

    if (!story || story.status !== 'PUBLISHED') {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Story not found.' });
    }

    // Don't leak the status field on the public payload
    const { status: _status, ...publicStory } = story;
    return res.json(publicStory);
  } catch (err) {
    logger.error({ err }, 'getPublishedStory error');
    next(err);
  }
}
