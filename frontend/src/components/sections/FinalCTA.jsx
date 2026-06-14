/**
 * FinalCTA — Section 10 of 10 (ARCH §7.1).
 * Navy band, gold "Explore Programs" CTA + secondary "Talk to Arjun Dada".
 */
import { Link } from 'react-router-dom';
import { FadeIn } from '../animations/FadeIn.jsx';

export function FinalCTA() {
  return (
    <section
      className="bg-navy py-[var(--section-y)] px-[var(--section-x)]"
      aria-label="Call to action"
    >
      <div className="max-w-default mx-auto text-center">
        <FadeIn>
          <h2
            className="font-display font-light text-pearl mb-4 leading-[1.1]"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
          >
            Ready to change your environment?
          </h2>
          <p className="font-sans text-pearl/70 max-w-[520px] mx-auto leading-body mb-10">
            Badlaav, Mission Udaan, Future Readiness — or simply come and talk.
            Ambajogai is a real place. The door is open.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/programs"
              className="inline-flex items-center justify-center gap-2 rounded font-sans font-medium
                         bg-gold text-on-gold hover:bg-gold/90 px-7 py-4 text-lg min-h-[52px]
                         transition-colors duration-150
                         focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              Explore Programs
            </Link>

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
        </FadeIn>
      </div>
    </section>
  );
}
