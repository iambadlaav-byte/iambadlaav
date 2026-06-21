/**
 * GalleryPage — /gallery. Photographs from past batches.
 *
 * CMS-managed images load from GET /api/v1/gallery (with a static fallback so the
 * page never blanks). Images can be filtered by programme vertical, and clicking
 * one opens an accessible full-screen lightbox with prev/next that wraps within
 * the CURRENTLY FILTERED set.
 */
import { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { getSeoForRoute } from '../../lib/seo.js';
import { apiClient } from '../../api/client.js';
import { cn } from '../../lib/cn.js';
import { ProgramHero } from '../../components/sections/ProgramHero.jsx';
import { CtaBand } from '../../components/sections/CtaBand.jsx';
import { StaggerChildren, StaggerItem } from '../../components/animations/StaggerChildren.jsx';
import { Lightbox } from '../../components/ui/Lightbox.jsx';
import { GALLERY } from '../../lib/content.js';
import {
  CONTENT_CATEGORY_FILTERS,
  DEFAULT_CONTENT_CATEGORY,
  contentCategoryLabel,
} from '../../lib/contentCategory.js';

// Static fallback items carry no category — bucket them under GENERAL.
const FALLBACK_IMAGES = GALLERY.map((img) => ({
  url: img.url,
  alt: img.alt,
  caption: '',
  category: DEFAULT_CONTENT_CATEGORY,
}));

export default function GalleryPage() {
  const { pathname } = useLocation();
  const seo = getSeoForRoute(pathname);

  const [images, setImages] = useState(FALLBACK_IMAGES);
  const [filter, setFilter] = useState('ALL');
  const [lightboxIndex, setLightboxIndex] = useState(null);

  useEffect(() => {
    let active = true;
    apiClient
      .get('/gallery')
      .then(({ data }) => {
        if (!active) return;
        const rows = (data?.rows ?? []).map((r) => ({
          url:      r.url,
          alt:      r.altText || r.caption || 'Badlaav',
          caption:  r.caption || '',
          category: r.category || DEFAULT_CONTENT_CATEGORY,
        }));
        if (rows.length) setImages(rows);
      })
      .catch(() => { /* keep the static fallback */ });
    return () => { active = false; };
  }, []);

  // Only show filter chips for categories that actually have photos (plus "All").
  const visibleFilters = useMemo(() => {
    const present = new Set(images.map((img) => img.category));
    return CONTENT_CATEGORY_FILTERS.filter((f) => f.value === 'ALL' || present.has(f.value));
  }, [images]);

  const filtered = useMemo(
    () => (filter === 'ALL' ? images : images.filter((img) => img.category === filter)),
    [images, filter],
  );

  function changeFilter(next) {
    setFilter(next);
    setLightboxIndex(null); // avoid a stale index when the set changes
  }

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

      <ProgramHero
        program="Gallery"
        headline="From the retreat"
        subHeadline="The grounds, the sessions, the quiet. A look at the environment that does the work."
      />

      <section className="bg-cream py-[var(--section-y)] px-[var(--section-x)]">
        <div className="max-w-wide mx-auto">
          {/* Category filter */}
          {visibleFilters.length > 2 && (
            <div className="mb-8 flex flex-wrap gap-2">
              {visibleFilters.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => changeFilter(f.value)}
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

          {filtered.length === 0 ? (
            <p className="text-center font-sans text-muted py-16">No photos in this set yet.</p>
          ) : (
            <StaggerChildren className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((img, i) => (
                <StaggerItem key={`${img.url}-${i}`}>
                  <button
                    type="button"
                    onClick={() => setLightboxIndex(i)}
                    className="group relative block aspect-[4/3] w-full rounded-lg overflow-hidden bg-ink/10 focus:outline-none focus:ring-2 focus:ring-ochre/60"
                    aria-label={img.alt ? `View photo: ${img.alt}` : 'View photo'}
                  >
                    <img
                      src={img.url}
                      alt={img.alt}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {filter === 'ALL' && img.category && img.category !== DEFAULT_CONTENT_CATEGORY && (
                      <span className="absolute bottom-2 left-2 font-mono text-[10px] uppercase tracking-widest bg-ink/70 text-pearl px-2 py-1 rounded">
                        {contentCategoryLabel(img.category)}
                      </span>
                    )}
                  </button>
                </StaggerItem>
              ))}
            </StaggerChildren>
          )}
        </div>
      </section>

      <Lightbox
        images={filtered}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onIndex={setLightboxIndex}
      />

      <CtaBand eyebrow="Be in the next set of photos" heading="Come to Badlaav." />
    </>
  );
}
