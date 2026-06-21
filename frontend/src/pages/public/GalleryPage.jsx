/**
 * GalleryPage — /gallery. Photographs from past batches.
 */
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { getSeoForRoute } from '../../lib/seo.js';
import { apiClient } from '../../api/client.js';
import { ProgramHero } from '../../components/sections/ProgramHero.jsx';
import { CtaBand } from '../../components/sections/CtaBand.jsx';
import { StaggerChildren, StaggerItem } from '../../components/animations/StaggerChildren.jsx';
import { GALLERY } from '../../lib/content.js';

export default function GalleryPage() {
  const { pathname } = useLocation();
  const seo = getSeoForRoute(pathname);

  // Prefer CMS-managed gallery items; fall back to the bundled set so the page
  // never blanks (e.g. before any items are added, or if the request fails).
  const [images, setImages] = useState(GALLERY);
  useEffect(() => {
    let active = true;
    apiClient
      .get('/gallery')
      .then(({ data }) => {
        if (!active) return;
        const rows = (data?.rows ?? []).map((r) => ({ url: r.url, alt: r.altText || r.caption || 'Badlaav' }));
        if (rows.length) setImages(rows);
      })
      .catch(() => { /* keep the static fallback */ });
    return () => { active = false; };
  }, []);

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
          <StaggerChildren className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((img) => (
              <StaggerItem key={img.url}>
                <div className="aspect-[4/3] rounded-lg overflow-hidden bg-ink/10">
                  <img
                    src={img.url}
                    alt={img.alt}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      <CtaBand eyebrow="Be in the next set of photos" heading="Come to Badlaav." />
    </>
  );
}
