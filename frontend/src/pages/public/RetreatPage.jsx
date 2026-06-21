/**
 * RetreatPage — /retreat. The experience in depth: the three days,
 * what's included, and the place itself.
 */
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { getSeoForRoute } from '../../lib/seo.js';
import { ProgramHero } from '../../components/sections/ProgramHero.jsx';
import { RetreatDays } from '../../components/sections/RetreatDays.jsx';
import { Inclusions } from '../../components/sections/Inclusions.jsx';
import { Highlights } from '../../components/sections/Highlights.jsx';
import { CtaBand } from '../../components/sections/CtaBand.jsx';
import { FadeIn } from '../../components/animations/FadeIn.jsx';
import { SITE, HERO_IMAGE } from '../../lib/content.js';

export default function RetreatPage() {
  const { pathname } = useLocation();
  const seo = getSeoForRoute(pathname);

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
        program="The Retreat"
        headline="Three days in Ambajogai"
        subHeadline="Not a workshop you attend, but an environment you enter. Here is exactly what the three days hold."
        heroImage={HERO_IMAGE}
        heroImageAlt="The Badlaav retreat grounds at Ambajogai"
        primaryCta={{ label: 'Register', href: '/register?program=badlaav' }}
        secondaryCta={{ label: 'See pricing', href: '/pricing' }}
      />

      <RetreatDays variant="deep" />
      <Inclusions />
      <Highlights />

      {/* The place */}
      <section className="bg-soft py-[var(--section-y)] px-[var(--section-x)]">
        <div className="max-w-narrow mx-auto">
          <FadeIn>
            <p className="font-mono text-xs uppercase tracking-widest text-muted mb-3">The place</p>
            <h2 className="font-display font-semibold text-ink mb-6" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}>
              Why Ambajogai
            </h2>
            <div className="space-y-4 font-sans text-charcoal leading-body">
              <p>
                {SITE.locationLong} The distance is not an inconvenience — it is the point. Far enough
                that the office cannot reach you; close enough that you can get here in a morning.
              </p>
              <p>
                We share detailed travel instructions once you register. Come by road or rail to
                Aurangabad or Latur; we will guide you the rest of the way.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      <CtaBand
        eyebrow="Ready when you are"
        heading="Hold a seat for the next batch."
        body="Batches are small — twenty people at most. When the dates open, they fill quickly."
      />
    </>
  );
}
