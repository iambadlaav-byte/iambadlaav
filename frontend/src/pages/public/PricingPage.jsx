/**
 * PricingPage — /pricing. The three plans, what they include, and the refund terms.
 */
import { Helmet } from 'react-helmet-async';
import { useLocation, Link } from 'react-router-dom';
import { getSeoForRoute } from '../../lib/seo.js';
import { ProgramHero } from '../../components/sections/ProgramHero.jsx';
import { Pricing3Plans } from '../../components/sections/Pricing3Plans.jsx';
import { Inclusions } from '../../components/sections/Inclusions.jsx';
import { CtaBand } from '../../components/sections/CtaBand.jsx';
import { FadeIn } from '../../components/animations/FadeIn.jsx';
import { PLANS, EXPERIENCE_PLANS } from '../../lib/content.js';

export default function PricingPage() {
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
        program="Pricing"
        headline="One price, everything included"
        subHeadline="Stay, meals, and every session — no add-ons, no surprises. Choose how you want to come."
        primaryCta={{ label: 'Register', href: '/register?program=badlaav' }}
      />

      <Pricing3Plans program="Retreat" plans={PLANS} />

      {/* The Badlaav Experience — the lighter, single-price programme. */}
      <Pricing3Plans program="The Badlaav Experience" plans={EXPERIENCE_PLANS} />

      <Inclusions />

      {/* Refund policy summary */}
      <section className="bg-soft py-[var(--section-y)] px-[var(--section-x)]">
        <div className="max-w-narrow mx-auto">
          <FadeIn>
            <p className="font-mono text-xs uppercase tracking-widest text-muted mb-3">If plans change</p>
            <h2 className="font-display font-semibold text-ink mb-6" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}>
              Refunds, simply
            </h2>
            <ul className="space-y-3 font-sans text-charcoal leading-body">
              <li>· Full refund up to 14 days before the retreat.</li>
              <li>· 50% refund between 7 and 14 days before.</li>
              <li>· Within 7 days, no refund — but your seat transfers to the next batch.</li>
            </ul>
            <p className="font-sans text-sm text-muted mt-6">
              Full terms on the{' '}
              <Link to="/refund" className="text-teal hover:text-teal-light">
                refund policy
              </Link>{' '}
              page.
            </p>
          </FadeIn>
        </div>
      </section>

      <CtaBand eyebrow="Pick your dates" heading="See the upcoming batches." primary={{ label: 'Register', href: '/register?program=badlaav' }} />
    </>
  );
}
