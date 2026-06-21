/**
 * WhoItsFor — audience chips. Quiet, declarative; no hard sell.
 */
import { FadeIn } from '../animations/FadeIn.jsx';
import { WHO_CHIPS } from '../../lib/content.js';

export function WhoItsFor() {
  return (
    <section className="bg-cream py-[var(--section-y)] px-[var(--section-x)]">
      <div className="max-w-default mx-auto">
        <FadeIn>
          <p className="font-mono text-xs uppercase tracking-widest text-muted text-center mb-3">Is this for you?</p>
          <h2
            className="font-display font-semibold text-ink text-center mb-8"
            style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}
          >
            Who comes to Badlaav
          </h2>
          <div className="flex flex-wrap gap-3 justify-center">
            {WHO_CHIPS.map((chip) => (
              <span
                key={chip}
                className="font-mono text-xs uppercase tracking-widest bg-pearl text-charcoal px-4 py-2 rounded-full border border-charcoal/10 shadow-sm"
              >
                {chip}
              </span>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
