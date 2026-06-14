/**
 * BlogTeaser — Section 9 of 10 (ARCH §7.1).
 * Fetches /api/v1/blog?status=published&limit=3.
 * Renders 3 BlogCards; shows skeleton → empty state on error/empty.
 * Gracefully handles API unavailability.
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FadeIn } from '../animations/FadeIn.jsx';
import { BlogCard } from '../cards/BlogCard.jsx';
import { apiClient } from '../../api/client.js';

function BlogCardSkeleton() {
  return (
    <div className="bg-soft rounded-lg overflow-hidden animate-pulse">
      <div className="aspect-[16/9] bg-muted/20" />
      <div className="p-5">
        <div className="h-3 bg-muted/20 rounded w-1/3 mb-3" />
        <div className="h-5 bg-muted/20 rounded w-5/6 mb-2" />
        <div className="h-4 bg-muted/20 rounded w-full mb-1" />
        <div className="h-4 bg-muted/20 rounded w-4/5" />
      </div>
    </div>
  );
}

export function BlogTeaser() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetchPosts() {
      try {
        const { data } = await apiClient.get('/blog', {
          params: { status: 'published', limit: 3 },
        });
        if (!cancelled) setPosts(data.posts || data || []);
      } catch {
        // API not yet running — show empty state gracefully
        if (!cancelled) setPosts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchPosts();
    return () => { cancelled = true; };
  }, []);

  return (
    <section
      className="bg-soft py-[var(--section-y)] px-[var(--section-x)]"
      aria-label="From the blog"
    >
      <div className="max-w-default mx-auto">
        <FadeIn>
          <p className="font-mono text-xs uppercase tracking-widest text-muted text-center mb-3">
            Thoughts &amp; writing
          </p>
          <h2
            className="font-display font-light text-ink text-center mb-10"
            style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}
          >
            From the blog
          </h2>
        </FadeIn>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            <BlogCardSkeleton />
            <BlogCardSkeleton />
            <BlogCardSkeleton />
          </div>
        ) : posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            {posts.map((post) => (
              <FadeIn key={post.id || post.slug}>
                <BlogCard
                  title={post.title}
                  slug={post.slug}
                  excerpt={post.excerpt}
                  coverImage={post.coverImage}
                  category={post.category}
                  publishedAt={post.publishedAt}
                  readingTime={post.readingTime}
                />
              </FadeIn>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 mb-8">
            <p className="font-sans text-charcoal font-medium mb-1">Writing is in progress.</p>
            <p className="font-sans text-muted text-sm">
              Articles on focus, environment, Vipassana, and the road to a steady life — coming soon.
            </p>
          </div>
        )}

        <div className="text-center">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 font-sans text-sm font-medium text-teal
                       hover:text-teal-light transition-colors duration-150
                       focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
          >
            Read the blog →
          </Link>
        </div>
      </div>
    </section>
  );
}
