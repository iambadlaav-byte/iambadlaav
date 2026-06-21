/**
 * StoryDetailPage — /stories/:id. Full read of one PUBLISHED retreat story.
 *
 * Fetches GET /api/v1/stories/:id (404 for non-existent or non-published) and
 * renders the title, subtitle, batch · date, category tag, the full passage
 * (paragraph breaks preserved) and every photo. Photos open in the shared
 * Lightbox with prev/next.
 */
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Seo } from '../../components/ui/Seo.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { CtaBand } from '../../components/sections/CtaBand.jsx';
import { Lightbox } from '../../components/ui/Lightbox.jsx';
import { apiClient } from '../../api/client.js';
import { contentCategoryLabel } from '../../lib/contentCategory.js';

function metaLine(story) {
  const parts = [];
  if (story.batchName) parts.push(story.batchName);
  if (story.date) parts.push(new Date(story.date).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }));
  return parts.join(' · ');
}

// Split the passage into paragraphs on blank lines, preserving the author's breaks.
function paragraphs(passage) {
  if (!passage) return [];
  return passage.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
}

export default function StoryDetailPage() {
  const { id } = useParams();
  const [story, setStory]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError]     = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setNotFound(false);
    setError(false);
    (async () => {
      try {
        const { data } = await apiClient.get(`/stories/${id}`);
        if (active) setStory(data);
      } catch (err) {
        if (!active) return;
        if (err.response?.status === 404) setNotFound(true);
        else setError(true);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [id]);

  const photos = useMemo(
    () => (story?.photos ?? []).map((url) => ({ url, alt: story?.title || '', caption: '' })),
    [story],
  );

  if (loading) {
    return (
      <section className="bg-cream min-h-[60vh] flex items-center justify-center">
        <Spinner size={24} />
      </section>
    );
  }

  if (notFound || error || !story) {
    return (
      <>
        <Seo title="Story not found — Badlaav" noindex />
        <section className="bg-cream py-[var(--section-y)] px-[var(--section-x)] min-h-[60vh] flex items-center">
          <div className="max-w-narrow mx-auto text-center">
            <h1 className="font-display text-3xl text-charcoal mb-3">
              {error ? 'Something went wrong' : 'Story not found'}
            </h1>
            <p className="font-sans text-charcoal/80 mb-8">
              {error
                ? "We couldn't load this story just now. Please try again."
                : 'This story may have been removed or is no longer published.'}
            </p>
            <Link
              to="/stories"
              className="inline-flex items-center font-mono text-xs uppercase tracking-widest text-ochre hover:underline"
            >
              ← Back to all stories
            </Link>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <Seo
        title={`${story.title} — Stories — Badlaav`}
        description={story.subtitle || story.passage?.slice(0, 160)}
        image={story.photos?.[0]}
        type="article"
      />

      <article className="bg-cream py-[var(--section-y)] px-[var(--section-x)]">
        <div className="max-w-narrow mx-auto">
          <Link
            to="/stories"
            className="inline-flex items-center font-mono text-xs uppercase tracking-widest text-muted hover:text-charcoal mb-8"
          >
            ← All stories
          </Link>

          <div className="flex flex-wrap items-center gap-3 mb-4">
            {metaLine(story) && (
              <p className="font-mono text-[11px] uppercase tracking-widest text-muted">
                {metaLine(story)}
              </p>
            )}
            <span className="font-mono text-[10px] uppercase tracking-widest bg-soft text-charcoal/70 px-2 py-1 rounded">
              {contentCategoryLabel(story.category)}
            </span>
          </div>

          <h1
            className="font-display font-semibold text-ink leading-[1.08] mb-3"
            style={{ fontSize: 'clamp(2.2rem, 5vw, 3.4rem)' }}
          >
            {story.title}
          </h1>
          {story.subtitle && (
            <p className="font-sans text-lg text-teal mb-8">{story.subtitle}</p>
          )}

          {story.photos?.[0] && (
            <button
              type="button"
              onClick={() => setLightboxIndex(0)}
              className="block w-full aspect-[16/9] rounded-lg overflow-hidden bg-ink/10 mb-10 focus:outline-none focus:ring-2 focus:ring-ochre/60"
              aria-label="View photo"
            >
              <img
                src={story.photos[0]}
                alt={story.title}
                className="w-full h-full object-cover"
              />
            </button>
          )}

          <div className="space-y-5 font-sans text-charcoal leading-body text-lg">
            {paragraphs(story.passage).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          {/* Remaining photos as a thumbnail strip */}
          {story.photos?.length > 1 && (
            <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {story.photos.slice(1).map((url, i) => (
                <button
                  key={url}
                  type="button"
                  onClick={() => setLightboxIndex(i + 1)}
                  className="block aspect-[4/3] rounded-lg overflow-hidden bg-ink/10 focus:outline-none focus:ring-2 focus:ring-ochre/60"
                  aria-label="View photo"
                >
                  <img src={url} alt={story.title} loading="lazy" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      </article>

      <Lightbox
        images={photos}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onIndex={setLightboxIndex}
      />

      <CtaBand eyebrow="Your story is next" heading="Come to Badlaav." />
    </>
  );
}
