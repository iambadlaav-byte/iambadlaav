/**
 * HeroSection — Homepage hero (Section 1 of 10, ARCH §7.1).
 * Full-bleed dark surface (--color-ink background).
 * Cormorant H1 + italic teal-light sub-headline (Typewriter on desktop).
 * Ambient: FallingLeaves + BreathingPulse (1 ambient per viewport).
 * CTAs: gold "Explore Programs" + ghost "Talk to Arjun Dada".
 */
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FallingLeaves } from '../animations/FallingLeaves.jsx';
import { BreathingPulse } from '../animations/BreathingPulse.jsx';
import { Typewriter } from '../animations/Typewriter.jsx';
import { useAmbientMotion } from '../animations/AmbientMotionBoundary.jsx';
import { OrganizationLD } from '../../lib/seo.js';

export function HeroSection() {
  const ambientDisabled = useAmbientMotion();

  return (
    <section
      className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-ink"
      aria-label="Hero — Dnyanpith"
    >
      {/* JSON-LD Organization schema — rendered once on the homepage */}
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(OrganizationLD)}
        </script>
      </Helmet>

      {/* Ambient animations */}
      <BreathingPulse disabled={ambientDisabled} />
      <FallingLeaves disabled={ambientDisabled} />

      {/* Content */}
      <div className="relative z-10 max-w-default mx-auto px-[var(--section-x)] py-[var(--section-y)] text-center">
        <h1
          className="font-display font-light text-pearl leading-[1.1] tracking-[-0.01em]"
          style={{ fontSize: 'clamp(2.8rem, 7vw, 6rem)' }}
        >
          You don&rsquo;t have a focus problem.
        </h1>

        <p
          className="font-display italic mt-3 leading-[1.1]"
          style={{ fontSize: 'clamp(2rem, 4.5vw, 4rem)', color: 'rgb(var(--color-teal-light))' }}
        >
          <Typewriter
            text="You have an environment problem."
            speed={55}
            delay={1000}
            disabled={ambientDisabled}
          />
        </p>

        <p className="font-sans text-pearl/70 mt-6 max-w-[600px] mx-auto leading-body text-base md:text-lg">
          Dnyanpith builds the environment. Badlaav retreats, Mission Udaan preparation,
          Future Readiness workshops — and four free community circles in Ambajogai.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
          {/* Primary CTA — gold (UI-SPEC §Color §Accent reserved-for) */}
          <Link
            to="/programs"
            className="inline-flex items-center justify-center gap-2 rounded font-sans font-medium
                       bg-gold text-on-gold hover:bg-gold/90 px-7 py-4 text-lg min-h-[52px]
                       transition-colors duration-150
                       focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          >
            Explore Programs
          </Link>

          {/* Secondary CTA — ghost on dark */}
          <Link
            to="/contact"
            className="inline-flex items-center justify-center gap-2 rounded font-sans font-medium
                       text-pearl/80 hover:text-teal-light border border-pearl/30 hover:border-teal-light
                       px-7 py-4 text-lg min-h-[52px] transition-colors duration-150
                       focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
          >
            <span className="font-deva">Talk to Arjun Dada</span>
          </Link>
        </div>
      </div>

      {/* Bottom fade to cream */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent, rgb(var(--color-cream)))' }}
      />
    </section>
  );
}
