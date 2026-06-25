/**
 * RetreatPage — /retreat. The three days in depth (First Light look):
 * hero → day-by-day blocks → inclusions → batches → closing band.
 */
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { getSeoForRoute } from '../../lib/seo.js';
import { ProgramHero } from '../../components/sections/ProgramHero.jsx';
import { DayBlock } from '../../components/sections/DayBlock.jsx';
import { Inclusions } from '../../components/sections/Inclusions.jsx';
import { UpcomingBatches } from '../../components/sections/UpcomingBatches.jsx';
import { BigFooterCta } from '../../components/sections/BigFooterCta.jsx';
import { FadeIn } from '../../components/animations/FadeIn.jsx';
import { RETREAT_DAYS, HERO } from '../../lib/content.js';

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
        program="Day by day"
        headline="The Badlaav Retreat Experience"
        subHeadline="Step by step, day by day — a glimpse into the journey that awaits when you step away from the noise."
        heroImage={HERO.image}
        heroImageAlt="Arrival at a Badlaav retreat"
        primaryCta={{ label: 'Register', href: '/register?program=badlaav' }}
        secondaryCta={{ label: 'Talk to Arjun Dada', href: '/contact' }}
      />

      <section className="bg-cream pt-[var(--section-y)] text-center px-[var(--section-x)]">
        <FadeIn>
          <h2 className="font-display text-ink" style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)' }}>
            The Three Days
          </h2>
          <p className="font-sans text-charcoal/80 max-w-narrow mx-auto mt-3">
            Three days, carefully held, to take you from exhaustion to clarity. Here is how the journey unfolds.
          </p>
        </FadeIn>
      </section>

      {RETREAT_DAYS.map((day, i) => (
        <DayBlock key={day.day} day={day} reverse={i % 2 === 1} />
      ))}

      <Inclusions />
      <UpcomingBatches program="BADLAAV" title="Upcoming retreat dates" />
      <BigFooterCta />
    </>
  );
}
