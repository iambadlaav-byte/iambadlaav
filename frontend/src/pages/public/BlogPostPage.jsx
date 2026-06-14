/**
 * BlogPostPage — /blog/:slug
 * Fetches post by slug, renders sanitized HTML content via DOMPurify.
 * On 404: renders NotFoundPage.
 */
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FadeIn } from '../../components/animations/FadeIn.jsx';
import { apiClient } from '../../api/client.js';
import NotFoundPage from './NotFoundPage.jsx';

/**
 * Sanitize HTML client-side — DOMPurify defense-in-depth (CONSTRAINT-SEC-007).
 * Dynamic import so DOMPurify only loads when a post is actually viewed.
 */
async function sanitizeHtml(dirty) {
  try {
    const DOMPurify = (await import('dompurify')).default;
    return DOMPurify.sanitize(dirty, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'a', 'ul', 'ol', 'li', 'h2', 'h3', 'h4', 'blockquote', 'code', 'pre', 'img'],
      ALLOWED_ATTR: ['href', 'src', 'alt', 'class', 'target', 'rel'],
    });
  } catch {
    // DOMPurify not installed yet — strip all tags as fallback
    return dirty.replace(/<[^>]*>/g, '');
  }
}

function formatBlogDate(dateStr) {
  if (!dateStr) return '';
  try {
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata',
    }).format(new Date(dateStr));
  } catch {
    return '';
  }
}

export default function BlogPostPage() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [sanitizedContent, setSanitizedContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function fetchPost() {
      try {
        const { data } = await apiClient.get(`/blog/${slug}`);
        if (!cancelled) {
          setPost(data);
          if (data.content) {
            const clean = await sanitizeHtml(data.content);
            if (!cancelled) setSanitizedContent(clean);
          }
        }
      } catch (err) {
        if (!cancelled) {
          if (err.response?.status === 404) setNotFound(true);
          else setPost(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchPost();
    return () => { cancelled = true; };
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="font-mono text-xs uppercase tracking-widest text-muted">Loading…</span>
      </div>
    );
  }

  if (notFound || !post) {
    return <NotFoundPage />;
  }

  const pageTitle = `${post.title} — Dnyanpith`;
  const shareUrl = typeof window !== 'undefined' ? window.location.href : `https://dnyanpith.org/blog/${slug}`;

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={post.excerpt || ''} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={post.excerpt || ''} />
        <meta property="og:type" content="article" />
        {post.coverImage && <meta property="og:image" content={post.coverImage} />}
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      {/* Hero */}
      <section className="bg-ink py-16 px-[var(--section-x)]">
        <div className="max-w-narrow mx-auto">
          <FadeIn>
            {post.category && (
              <p className="font-mono text-xs uppercase tracking-widest text-teal-light mb-4">{post.category}</p>
            )}
            <h1 className="font-display font-light text-pearl mb-5" style={{ fontSize: 'clamp(2rem, 5vw, 4rem)' }}>
              {post.title}
            </h1>
            <div className="flex flex-wrap gap-4 text-sm text-pearl/60 font-mono">
              {post.publishedAt && <span>{formatBlogDate(post.publishedAt)}</span>}
              {post.readingTime && <span>{post.readingTime} min read</span>}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Cover image */}
      {post.coverImage && (
        <div className="bg-ink">
          <div className="max-w-default mx-auto">
            <img
              src={post.coverImage}
              alt={`Cover for ${post.title}`}
              className="w-full max-h-[480px] object-cover"
            />
          </div>
        </div>
      )}

      {/* Body */}
      <section className="bg-cream py-[var(--section-y)] px-[var(--section-x)]">
        <div className="max-w-narrow mx-auto">
          <FadeIn>
            {/* Author strip */}
            <div className="flex items-center gap-3 mb-8 pb-6 border-b border-muted/20">
              <div className="w-10 h-10 rounded-full bg-sage/20 flex items-center justify-center">
                <span className="font-display text-base font-semibold text-sage">A</span>
              </div>
              <div>
                <p className="font-sans text-sm font-medium text-ink">Arjun Thoratt</p>
                <p className="font-mono text-xs text-muted">Dnyanpith</p>
              </div>
            </div>

            {/* Content */}
            {sanitizedContent ? (
              <div
                className="font-sans text-charcoal leading-body prose-headings:font-display prose-headings:font-light
                           prose-a:text-teal prose-a:underline"
                dangerouslySetInnerHTML={{ __html: sanitizedContent }}
              />
            ) : post.content ? (
              <p className="font-sans text-charcoal leading-body">{post.content}</p>
            ) : (
              <p className="font-sans text-muted">No content available.</p>
            )}

            {/* Share buttons */}
            <div className="mt-12 pt-8 border-t border-muted/20">
              <p className="font-mono text-xs uppercase tracking-widest text-muted mb-4">Share this</p>
              <div className="flex flex-wrap gap-3">
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs uppercase tracking-widest px-4 py-2 border border-muted/30 rounded
                             text-muted hover:text-teal hover:border-teal transition-colors duration-150"
                >
                  Twitter
                </a>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(post.title + ' — ' + shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs uppercase tracking-widest px-4 py-2 border border-muted/30 rounded
                             text-muted hover:text-teal hover:border-teal transition-colors duration-150"
                >
                  WhatsApp
                </a>
                <button
                  onClick={() => { if (navigator.clipboard) navigator.clipboard.writeText(shareUrl); }}
                  className="font-mono text-xs uppercase tracking-widest px-4 py-2 border border-muted/30 rounded
                             text-muted hover:text-teal hover:border-teal transition-colors duration-150"
                >
                  Copy link
                </button>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Back to blog */}
      <section className="bg-soft py-12 px-[var(--section-x)]">
        <div className="max-w-narrow mx-auto">
          <Link to="/blog" className="font-sans text-sm font-medium text-teal hover:text-teal-light transition-colors duration-150">
            ← Back to blog
          </Link>
        </div>
      </section>
    </>
  );
}
