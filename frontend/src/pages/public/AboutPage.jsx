/**
 * AboutPage — /about. Arjun, the idea behind Badlaav, and the invitation.
 */
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { getSeoForRoute } from '../../lib/seo.js';
import { ProgramHero } from '../../components/sections/ProgramHero.jsx';
import { Testimonials } from '../../components/sections/Testimonials.jsx';
import { CtaBand } from '../../components/sections/CtaBand.jsx';
import { FadeIn } from '../../components/animations/FadeIn.jsx';
import { ABOUT_PARAGRAPHS, SITE } from '../../lib/content.js';

export default function AboutPage() {
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
        program="About"
        headline="दादा who walked the same road"
        subHeadline="Badlaav is led by Arjun. Not a motivational speaker — a fellow who needed the reset himself, and built the space he wished had existed."
      />

      {/* The idea */}
      <section className="bg-cream py-[var(--section-y)] px-[var(--section-x)]">
        <div className="max-w-narrow mx-auto">
          <FadeIn>
            <p className="font-mono text-xs uppercase tracking-widest text-teal mb-3">The idea</p>
            <h2 className="font-display font-semibold text-ink mb-6" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}>
              {SITE.coreIdea}
            </h2>
            <div className="space-y-4 font-sans text-charcoal leading-body">
              {ABOUT_PARAGRAPHS.map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Arjun */}
      <section className="bg-soft py-[var(--section-y)] px-[var(--section-x)]">
        <div className="max-w-default mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <FadeIn>
            <div className="aspect-[4/5] max-w-[420px] rounded-lg overflow-hidden bg-ink/10">
              <img
                src="/images/arjun_portrait.jpg"
                alt="Arjun Thoratt, who leads the Badlaav retreat"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </FadeIn>
          <FadeIn>
            <p className="font-mono text-xs uppercase tracking-widest text-teal mb-3">Who leads it</p>
            <h2 className="font-display font-semibold text-ink mb-6" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}>
              Arjun Dada
            </h2>
            <div className="space-y-4 font-sans text-charcoal leading-body">
              <p>
                I am Arjun. I built Badlaav after years of watching capable people burn out in noisy
                lives — and after needing the same reset myself.
              </p>
              <p>
                I do not perform a retreat. I hold a space. We sit with where you actually are, not
                where a curriculum says you should be, and we leave with a plan you can keep.
              </p>
              <p>
                Badlaav is one of the things we do at {SITE.legalEntity}, from our home in
                Ambajogai, Marathwada.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      <Testimonials />
      <CtaBand eyebrow="Come and see" heading="The room is quiet. The work is real." />
    </>
  );
}
