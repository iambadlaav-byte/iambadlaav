/**
 * ProgramSpotlight — Section 4 of 10 (ARCH §7.1).
 * Featured program highlight (default: Badlaav).
 * Large image placeholder + description + "Enquire as Corporate" CTA.
 */
import { Link } from 'react-router-dom';
import { FadeIn } from '../animations/FadeIn.jsx';

export function ProgramSpotlight() {
  return (
    <section
      className="bg-cream py-[var(--section-y)] px-[var(--section-x)]"
      aria-label="Badlaav spotlight"
    >
      <div className="max-w-default mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Image placeholder */}
          <FadeIn>
            <div
              className="aspect-[4/3] rounded-lg overflow-hidden bg-ink/10"
              aria-label="Group circle at a Badlaav retreat in Ambajogai"
            >
              <img
                src="/images/program_badlaav.jpg"
                alt="Atmospheric study setup for Badlaav retreat"
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              />
            </div>
          </FadeIn>

          {/* Content */}
          <FadeIn delay={0.15}>
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-muted mb-3">
                Featured — Corporate Retreat
              </p>
              <h2
                className="font-display font-semibold text-ink mb-4 leading-[1.2]"
                style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}
              >
                <span className="font-deva">Trip नाही — Turning Point.</span>
              </h2>
              <p className="font-sans text-charcoal leading-body mb-4">
                Badlaav is a 3-day residential retreat for corporate teams and professionals.
                Not a motivational event. A structured pause — designed to break the patterns
                that keep intelligent people stuck.
              </p>
              <p className="font-sans text-charcoal leading-body mb-8">
                Ambajogai, Marathwada. Away from the city. Deliberately minimal.
                The environment does the work.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/badlaav"
                  className="inline-flex items-center justify-center gap-2 rounded font-sans font-medium
                             bg-gold text-on-gold hover:bg-gold/90 px-6 py-3 min-h-[44px]
                             transition-colors duration-150
                             focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                >
                  Enquire as Corporate
                </Link>
                <Link
                  to="/badlaav"
                  className="inline-flex items-center justify-center gap-2 rounded font-sans font-medium
                             text-teal hover:text-teal-light underline-offset-4 hover:underline
                             px-6 py-3 min-h-[44px] transition-colors duration-150
                             focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
                >
                  Register as Individual or Couple
                </Link>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
