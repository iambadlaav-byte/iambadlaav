/**
 * AboutArjun — Section 6 of 10 (ARCH §7.1).
 * Portrait placeholder (Cormorant initial 'A' on sage square per UI-SPEC Image Strategy).
 * Elder-brother voice. Link to /about.
 */
import { Link } from 'react-router-dom';
import { FadeIn } from '../animations/FadeIn.jsx';

export function AboutArjun() {
  return (
    <section
      className="bg-cream py-[var(--section-y)] px-[var(--section-x)]"
      aria-label="About Arjun"
    >
      <div className="max-w-default mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-12 items-start">
          {/* Portrait — sage monogram (real photo day 1, CREATIVE_ASSETS.md Part 8) */}
          <FadeIn>
            <div className="mx-auto lg:mx-0 w-48 h-48 lg:w-full lg:h-64 bg-sage/20 rounded-lg overflow-hidden flex-shrink-0">
              <img
                src="/images/arjun_portrait.jpg"
                alt="Candid portrait of Arjun Dada at Dnyanpith"
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              />
            </div>
          </FadeIn>

          {/* Bio */}
          <FadeIn delay={0.1}>
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-muted mb-3">
                The person behind Dnyanpith
              </p>
              <h2
                className="font-display font-light text-ink mb-6"
                style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}
              >
                Arjun Dada
              </h2>

              <div className="space-y-4 font-sans text-charcoal leading-body max-w-narrow">
                <p>
                  Arjun started Dnyanpith not from success, but from the long middle —
                  the years of trying to focus in the wrong environment, of wanting clarity
                  but not having the conditions for it. <span className="font-deva">दादा who walked the same road.</span>
                </p>
                <p>
                  He built the Abhyasika first for competitive exam students in Ambajogai.
                  Then Badlaav, when he saw that the environment problem wasn&rsquo;t just
                  a student problem. Then Mission Udaan, when 50+ officers proved what
                  a deliberate environment actually produces.
                </p>
                <p>
                  The philosophy is simple: you cannot think clearly in a noisy environment.
                  Change the environment first. Everything else follows.
                </p>
              </div>

              <Link
                to="/about"
                className="inline-flex items-center gap-2 mt-6 font-sans text-sm font-medium text-teal
                           hover:text-teal-light transition-colors duration-150
                           focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
              >
                Read the full story →
              </Link>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
