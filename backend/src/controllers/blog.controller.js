/**
 * Blog controller — public read-only endpoints (Plan 03).
 * Admin write paths (create/update/delete) arrive in Plan 07 (ADMIN-01).
 *
 * Security:
 * - T-03-01: listBlog() hard-codes status='PUBLISHED' for non-admin callers
 *   regardless of what ?status= query param the client sends.
 * - T-03-02: content is sanitized at save-time in Plan 07; client runs
 *   DOMPurify defense-in-depth at render (CONSTRAINT-SEC-007).
 * - T-03-03: query limit capped to 50 via Zod schema (content.js).
 * - T-03-04: Prisma parametrised queries prevent SQL injection.
 */
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import { MOCK_BLOG_POSTS } from '../lib/mockData.js';

/**
 * listBlog — GET /api/v1/blog
 * Cursor-based pagination. Returns nextCursor when more results exist.
 *
 * Non-admin callers: status is ALWAYS forced to PUBLISHED.
 * Admin callers (req.user.role === 'ADMIN') may pass ?status=draft|archived.
 */
export async function listBlog(req, res, next) {
  try {
    const isAdmin = req.user?.role === 'ADMIN';
    const requestedStatus = req.query.status?.toUpperCase();

    // T-03-01 enforcement: non-admin callers always get published only
    const status = isAdmin && requestedStatus ? requestedStatus : 'PUBLISHED';
    const category = req.query.category;
    const limit = Number(req.query.limit) || 12;
    const cursor = req.query.cursor;

    const where = {
      status,
      // For published posts, publishedAt must exist and be in the past
      ...(status === 'PUBLISHED' ? { publishedAt: { not: null, lte: new Date() } } : {}),
      ...(category ? { category } : {}),
    };

    let posts;
    try {
      posts = await prisma.blogPost.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        take: limit + 1, // fetch one extra to detect next page
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
        // CONSTRAINT-SCHEMA-001: never SELECT * — select only needed fields for list view
        select: {
          id: true,
          slug: true,
          title: true,
          excerpt: true,
          coverImage: true,
          category: true,
          tags: true,
          publishedAt: true,
          readingTime: true,
          authorId: true,
        },
      });
    } catch (dbErr) {
      logger.warn({ err: dbErr }, 'DB query failed for blog list, falling back to mock data');
      let filteredMock = MOCK_BLOG_POSTS;
      if (category) {
        filteredMock = filteredMock.filter((p) => p.category === category);
      }
      filteredMock.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
      if (cursor) {
        const cursorIndex = filteredMock.findIndex((p) => p.id === cursor);
        if (cursorIndex !== -1) {
          filteredMock = filteredMock.slice(cursorIndex + 1);
        }
      }
      posts = filteredMock.slice(0, limit + 1);
    }

    const hasMore = posts.length > limit;
    const results = hasMore ? posts.slice(0, limit) : posts;
    const nextCursor = hasMore ? results[results.length - 1].id : null;

    return res.json({
      posts: results,
      nextCursor,
    });
  } catch (err) {
    logger.error({ err }, 'listBlog error');
    next(err);
  }
}

/**
 * getBlogBySlug — GET /api/v1/blog/:slug
 * Returns full post including `content`.
 * Non-admin callers cannot read draft or archived posts.
 */
export async function getBlogBySlug(req, res, next) {
  try {
    const { slug } = req.params;
    const isAdmin = req.user?.role === 'ADMIN';

    let post;
    try {
      post = await prisma.blogPost.findUnique({
        where: { slug },
        select: {
          id: true,
          slug: true,
          title: true,
          excerpt: true,
          content: true,
          coverImage: true,
          category: true,
          tags: true,
          publishedAt: true,
          readingTime: true,
          status: true,
          authorId: true,
        },
      });
    } catch (dbErr) {
      logger.warn({ err: dbErr, slug }, 'DB query failed for blog post, falling back to mock data');
      post = MOCK_BLOG_POSTS.find((p) => p.slug === slug);
    }

    if (!post) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Post not found.' });
    }

    // T-03-01: non-admin callers cannot read non-published posts
    if (!isAdmin && post.status !== 'PUBLISHED') {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Post not found.' });
    }

    return res.json(post);
  } catch (err) {
    logger.error({ err }, 'getBlogBySlug error');
    next(err);
  }
}
