/**
 * HomePage — / (Badlaav).
 * A single calm scroll: hero → the idea → the three days → who → highlights →
 * testimonials → pricing → upcoming batches → questions → closing CTA.
 */
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { getSeoForRoute, OrganizationLD } from '../../lib/seo.js';
import { ProgramHero } from '../../components/sections/ProgramHero.jsx';
import { NextRetreatCard } from '../../components/sections/NextRetreatCard.jsx';
import { StatStrip } from '../../components/sections/StatStrip.jsx';
import { ValueProp } from '../../components/sections/ValueProp.jsx';
import { RetreatDays } from '../../components/sections/RetreatDays.jsx';
import { WhoItsFor } from '../../components/sections/WhoItsFor.jsx';
import { Highlights } from '../../components/sections/Highlights.jsx';
import { Testimonials } from '../../components/sections/Testimonials.jsx';
import { Pricing3Plans } from '../../components/sections/Pricing3Plans.jsx';
import { UpcomingBatches } from '../../components/sections/UpcomingBatches.jsx';
import { FAQAccordion } from '../../components/sections/FAQAccordion.jsx';
import { CtaBand } from '../../components/sections/CtaBand.jsx';
import { SITE, PLANS, HERO_IMAGE } from '../../lib/content.js';

export default function HomePage() {
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
        <script type="application/ld+json">{JSON.stringify(OrganizationLD)}</script>
      </Helmet>

      <ProgramHero
        program="Badlaav · 3-day residential retreat"
        headline={SITE.tagline}
        subHeadline={SITE.oneLiner}
        heroImage={HERO_IMAGE}
        heroImageAlt="The Badlaav retreat grounds at Ambajogai"
        primaryCta={{ label: 'Register', href: '/register?program=badlaav' }}
        secondaryCta={{ label: 'Talk to Arjun Dada', href: '/contact' }}
        aside={<NextRetreatCard />}
        showAmbient
      />

      <StatStrip />
      <ValueProp />
      <RetreatDays variant="teaser" />
      <WhoItsFor />
      <Highlights />
      <Testimonials />
      <Pricing3Plans program="Badlaav" plans={PLANS} />
      <UpcomingBatches />
      <FAQAccordion />
      <CtaBand />
    </>
  );
}
