/**
 * BlogIndexPage — /blog
 * Fetches published posts from /api/v1/blog.
 * Category filter, featured post pinned at top.
 * Empty state: "Writing is in progress."
 * Loading: 6 skeleton cards.
 */
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { getSeoForRoute } from '../../lib/seo.js';
import { BlogCard } from '../../components/cards/BlogCard.jsx';
import { FadeIn } from '../../components/animations/FadeIn.jsx';
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

export default function BlogIndexPage() {
  const { pathname } = useLocation();
  const seo = getSeoForRoute(pathname);

  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetchPosts() {
      try {
        const { data } = await apiClient.get('/blog', {
          params: { status: 'published', limit: 12 },
        });
        const list = data.posts || data || [];
        if (!cancelled) {
          setPosts(list);
          // Extract unique categories
          const cats = ['All', ...new Set(list.map((p) => p.category).filter(Boolean))];
          setCategories(cats);
        }
      } catch {
        if (!cancelled) setPosts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchPosts();
    return () => { cancelled = true; };
  }, []);

  const filteredPosts = activeCategory === 'All'
    ? posts
    : posts.filter((p) => p.category === activeCategory);

  const featuredPost = filteredPosts[0];
  const restPosts = filteredPosts.slice(1);

  return (
    <>
      <Helmet>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        <meta property="og:title" content={seo.title} />
        <meta property="og:description" content={seo.description} />
        <meta property="og:type" content={seo.ogType} />
        <meta property="og:image" content={seo.ogImage} />
        <meta name="twitter:card" content={seo.twitterCard} />
      </Helmet>

      {/* Header */}
      <section className="bg-cream py-16 px-[var(--section-x)] border-b border-muted/20">
        <div className="max-w-default mx-auto">
          <FadeIn>
            <p className="font-mono text-xs uppercase tracking-widest text-muted mb-3">Writing</p>
            <h1 className="font-display font-light text-ink" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)' }}>
              The blog
            </h1>
          </FadeIn>
        </div>
      </section>

      {/* Category filter */}
      {!loading && categories.length > 1 && (
        <section className="bg-cream px-[var(--section-x)] py-6 border-b border-muted/20">
          <div className="max-w-default mx-auto flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`font-mono text-xs uppercase tracking-widest px-4 py-2 rounded-full border transition-colors duration-150
                  ${activeCategory === cat
                    ? 'bg-teal text-pearl border-teal'
                    : 'bg-cream text-muted border-muted/30 hover:border-teal hover:text-teal'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Posts */}
      <section className="bg-cream py-[var(--section-y)] px-[var(--section-x)]">
        <div className="max-w-default mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {Array.from({ length: 6 }, (_, i) => <BlogCardSkeleton key={i} />)}
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-16">
              <p className="font-display text-2xl font-light text-ink mb-3">Writing is in progress.</p>
              <p className="font-sans text-muted leading-body">
                Articles on focus, environment, Vipassana, and the road to a steady life — coming soon.
              </p>
            </div>
          ) : (
            <>
              {/* Featured post pinned */}
              {featuredPost && (
                <FadeIn className="mb-10">
                  <BlogCard {...featuredPost} className="md:grid md:grid-cols-[1.5fr_1fr]" />
                </FadeIn>
              )}

              {/* Remaining posts grid */}
              {restPosts.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {restPosts.map((post) => (
                    <FadeIn key={post.id || post.slug}>
                      <BlogCard {...post} />
                    </FadeIn>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}
