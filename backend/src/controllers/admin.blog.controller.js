/**
 * admin.blog.controller.js — Blog post management.
 *
 * GET   /admin/blog          — list all posts (any status)
 * POST  /admin/blog          — create post
 * PATCH /admin/blog/:id      — update post
 * POST  /admin/blog/:id/archive — soft-archive (status = ARCHIVED, never hard-delete)
 *
 * SECURITY (CONSTRAINT-SEC-007 / T-07-03):
 *   Save-time DOMPurify sanitization — content is sanitized BEFORE prisma.blogPost.create/update.
 *   The sanitizeBlogContent helper uses dompurify + jsdom (NOT isomorphic-dompurify, which is
 *   flagged [SUS] in RESEARCH §Package Legitimacy Audit).
 *
 *   Conservative allowlist:
 *     Tags: p, h2, h3, h4, strong, em, ul, ol, li, a, blockquote, br
 *     Attrs: href, target, rel
 *   Any <script>, <img>, <iframe>, inline event handlers, or other tags are stripped.
 *
 * SOFT-DELETE (CONSTRAINT-SCHEMA-002):
 *   Blogs are never hard-deleted. archiveBlog sets status = ARCHIVED.
 */

// DOMPurify server-side setup — requires jsdom to provide a DOM window.
// Using dompurify + jsdom directly per RESEARCH §Package Legitimacy Audit.
// DO NOT substitute isomorphic-dompurify (flagged [SUS]).
import { JSDOM }           from 'jsdom';
import createDOMPurify     from 'dompurify';
import { prisma }          from '../lib/prisma.js';
import { writeAudit, AUDIT_ACTIONS } from '../services/audit.service.js';

// Singleton DOMPurify instance with a server-side DOM window
const { window: jsdomWindow } = new JSDOM('');
const DOMPurify = createDOMPurify(jsdomWindow);

/**
 * Sanitize HTML blog content before persisting.
 * Conservative allowlist — strips anything not explicitly permitted.
 * @param {string} html - raw HTML from admin editor
 * @returns {string} sanitized HTML
 */
function sanitizeBlogContent(html) {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS:  ['p', 'h2', 'h3', 'h4', 'strong', 'em', 'ul', 'ol', 'li', 'a', 'blockquote', 'br'],
    ALLOWED_ATTR:  ['href', 'target', 'rel'],
    // Force all links to be safe — strips javascript: hrefs
    FORCE_BODY:    false,
  });
}

// ── listBlog ──────────────────────────────────────────────────────────────────

export async function listBlog(req, res, next) {
  try {
    const { status, category, cursor, limit = 25 } = req.query;

    const where = {};
    if (status)   where.status   = status;
    if (category) where.category = category;

    const rows = await prisma.blogPost.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take:    Math.min(Number(limit) || 25, 100),
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      select: {
        id:         true,
        title:      true,
        slug:       true,
        category:   true,
        status:     true,
        publishedAt: true,
        createdAt:  true,
        updatedAt:  true,
        excerpt:    true,
      },
    });

    const nextCursor = rows.length === Math.min(Number(limit) || 25, 100)
      ? rows[rows.length - 1].id
      : null;

    return res.json({ rows, nextCursor });
  } catch (err) {
    next(err);
  }
}

// ── createBlog ────────────────────────────────────────────────────────────────

export async function createBlog(req, res, next) {
  try {
    // req.body validated by blogCreateSchema
    const { content, status = 'DRAFT', ...rest } = req.body;

    // Save-time sanitization (CONSTRAINT-SEC-007) — strip any injected script/img before storing
    const sanitizedContent = sanitizeBlogContent(content);

    const post = await prisma.$transaction(async (tx) => {
      const created = await tx.blogPost.create({
        data: {
          ...rest,
          content:     sanitizedContent,
          authorId:    req.user.id,
          status,
          publishedAt: status === 'PUBLISHED' ? new Date() : undefined,
        },
      });

      if (status === 'PUBLISHED') {
        await writeAudit({
          tx,
          actorId:     req.user.id,
          action:      AUDIT_ACTIONS.BLOG_PUBLISHED,
          subjectType: 'BlogPost',
          subjectId:   created.id,
          meta:        { title: created.title, slug: created.slug },
          req,
        });
      }

      return created;
    });

    return res.status(201).json({ post });
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'SLUG_TAKEN', message: 'A post with this slug already exists.' });
    }
    next(err);
  }
}

// ── updateBlog ────────────────────────────────────────────────────────────────

export async function updateBlog(req, res, next) {
  try {
    const { id } = req.params;
    // req.body validated by blogUpdateSchema (partial)
    const { content, status, ...rest } = req.body;

    const post = await prisma.$transaction(async (tx) => {
      const current = await tx.blogPost.findUnique({
        where:  { id },
        select: { id: true, status: true, title: true, slug: true },
      });
      if (!current) throw Object.assign(new Error('NOT_FOUND'), { statusCode: 404 });

      const updateData = { ...rest };

      // Sanitize content if provided — same conservative allowlist
      if (content !== undefined) {
        updateData.content = sanitizeBlogContent(content);
      }

      if (status !== undefined) {
        updateData.status = status;
        if (status === 'PUBLISHED' && current.status !== 'PUBLISHED') {
          updateData.publishedAt = new Date();
        }
      }

      const updated = await tx.blogPost.update({
        where: { id },
        data:  updateData,
      });

      // Audit status transitions
      if (status && status !== current.status) {
        const action = status === 'PUBLISHED' ? AUDIT_ACTIONS.BLOG_PUBLISHED
                     : status === 'DRAFT'     ? AUDIT_ACTIONS.BLOG_UNPUBLISHED
                     : status === 'ARCHIVED'  ? AUDIT_ACTIONS.BLOG_ARCHIVED
                     : null;
        if (action) {
          await writeAudit({
            tx,
            actorId:     req.user.id,
            action,
            subjectType: 'BlogPost',
            subjectId:   id,
            meta:        { previousStatus: current.status, newStatus: status },
            req,
          });
        }
      }

      return updated;
    });

    return res.json({ post });
  } catch (err) {
    if (err.statusCode === 404) return res.status(404).json({ error: 'NOT_FOUND' });
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'SLUG_TAKEN', message: 'A post with this slug already exists.' });
    }
    next(err);
  }
}

// ── archiveBlog ───────────────────────────────────────────────────────────────

export async function archiveBlog(req, res, next) {
  try {
    const { id } = req.params;

    const post = await prisma.$transaction(async (tx) => {
      const current = await tx.blogPost.findUnique({
        where:  { id },
        select: { id: true, status: true, title: true },
      });
      if (!current) throw Object.assign(new Error('NOT_FOUND'), { statusCode: 404 });

      // Soft-archive only — NEVER hard-delete (CONSTRAINT-SCHEMA-002)
      const archived = await tx.blogPost.update({
        where: { id },
        data:  { status: 'ARCHIVED' },
      });

      await writeAudit({
        tx,
        actorId:     req.user.id,
        action:      AUDIT_ACTIONS.BLOG_ARCHIVED,
        subjectType: 'BlogPost',
        subjectId:   id,
        meta:        { previousStatus: current.status, title: current.title },
        req,
      });

      return archived;
    });

    return res.json({ post });
  } catch (err) {
    if (err.statusCode === 404) return res.status(404).json({ error: 'NOT_FOUND' });
    next(err);
  }
}
