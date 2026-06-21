/**
 * StoriesPage — /stories. Published retreat stories from past batches.
 *
 * Fetches GET /api/v1/stories (published only) and renders a warm grid of
 * story cards: first photo, title, subtitle, batch · date, category tag and a
 * passage excerpt. Cards can be filtered by programme vertical and each links to
 * the full read at /stories/:id. NO ambient animations beyond the shared
 * StaggerChildren reveal.
 */
import { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Seo } from '../../components/ui/Seo.jsx';
import { ProgramHero } from '../../components/sections/ProgramHero.jsx';
import { CtaBand } from '../../components/sections/CtaBand.jsx';
import { StaggerChildren, StaggerItem } from '../../components/animations/StaggerChildren.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { cn } from '../../lib/cn.js';
import { apiClient } from '../../api/client.js';
import {
  CONTENT_CATEGORY_FILTERS,
  DEFAULT_CONTENT_CATEGORY,
  contentCategoryLabel,
} from '../../lib/contentCategory.js';

// Keep card copy tidy — passages can run long.
const EXCERPT_LIMIT = 220;

function excerpt(text) {
  if (!text) return '';
  const clean = text.trim();
  return clean.length > EXCERPT_LIMIT ? `${clean.slice(0, EXCERPT_LIMIT).trimEnd()}…` : clean;
}

function metaLine(story) {
  const parts = [];
  if (story.batchName) parts.push(story.batchName);
  if (story.date) parts.push(new Date(story.date).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }));
  return parts.join(' · ');
}

export default function StoriesPage() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);
  const [filter, setFilter]   = useState('ALL');

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data } = await apiClient.get('/stories');
        if (active) setStories(data.stories ?? []);
      } catch {
        if (active) setError(true);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  // Only offer filter chips for categories that actually have published stories.
  const visibleFilters = useMemo(() => {
    const present = new Set(stories.map((s) => s.category || DEFAULT_CONTENT_CATEGORY));
    return CONTENT_CATEGORY_FILTERS.filter((f) => f.value === 'ALL' || present.has(f.value));
  }, [stories]);

  const filtered = useMemo(
    () => (filter === 'ALL'
      ? stories
      : stories.filter((s) => (s.category || DEFAULT_CONTENT_CATEGORY) === filter)),
    [stories, filter],
  );

  return (
    <>
      <Seo
        title="Stories — Badlaav"
        description="Real accounts from people who came to Badlaav and left changed. Trip नाही — Turning Point."
      />

      <ProgramHero
        program="Stories"
        headline="What changed, in their words"
        subHeadline="Three days in Ambajogai look different from the inside. Here are a few who came, and what they carried home."
      />

      <section className="bg-cream py-[var(--section-y)] px-[var(--section-x)]">
        <div className="max-w-wide mx-auto">
          {loading && (
            <div className="flex items-center justify-center py-20">
              <Spinner size={24} />
            </div>
          )}

          {!loading && (error || stories.length === 0) && (
            <p className="text-center font-sans text-muted py-16">
              No stories to share just yet. Check back soon.
            </p>
          )}

          {!loading && !error && stories.length > 0 && (
            <>
              {/* Category filter */}
              {visibleFilters.length > 2 && (
                <div className="mb-8 flex flex-wrap gap-2">
                  {visibleFilters.map((f) => (
                    <button
                      key={f.value}
                      type="button"
                      onClick={() => setFilter(f.value)}
                      aria-pressed={filter === f.value}
                      className={cn(
                        'font-mono text-xs uppercase tracking-widest px-4 py-2 rounded-full border transition-colors',
                        filter === f.value
                          ? 'bg-ink text-pearl border-ink'
                          : 'bg-pearl text-charcoal border-charcoal/10 hover:border-charcoal/30',
                      )}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              )}

              <StaggerChildren className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {filtered.map((story) => (
                  <StaggerItem key={story.id}>
                    <article className="flex flex-col h-full bg-pearl rounded-lg overflow-hidden border border-soft">
                      {story.photos?.[0] && (
                        <div className="aspect-[4/3] overflow-hidden bg-ink/10">
                          <img
                            src={story.photos[0]}
                            alt={story.title}
                            loading="lazy"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex flex-col flex-1 p-6">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          {metaLine(story) ? (
                            <p className="font-mono text-[11px] uppercase tracking-widest text-muted">
                              {metaLine(story)}
                            </p>
                          ) : <span />}
                          <span className="font-mono text-[10px] uppercase tracking-widest bg-soft text-charcoal/70 px-2 py-1 rounded">
                            {contentCategoryLabel(story.category)}
                          </span>
                        </div>
                        <h2 className="font-display text-2xl font-light text-charcoal leading-tight mb-1">
                          {story.title}
                        </h2>
                        {story.subtitle && (
                          <p className="font-sans text-sm text-teal mb-3">{story.subtitle}</p>
                        )}
                        <p className="font-sans text-sm text-charcoal/80 leading-body">
                          {excerpt(story.passage)}
                        </p>
                        <Link
                          to={`/stories/${story.id}`}
                          className="mt-4 inline-flex items-center font-mono text-xs uppercase tracking-widest text-ochre hover:underline"
                        >
                          Read story →
                        </Link>
                      </div>
                    </article>
                  </StaggerItem>
                ))}
              </StaggerChildren>
            </>
          )}
        </div>
      </section>

      <CtaBand eyebrow="Your story is next" heading="Come to Badlaav." />
    </>
  );
}
