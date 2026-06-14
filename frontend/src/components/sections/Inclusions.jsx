/**
 * Inclusions — what the price covers. Plain checklist, no upsell.
 */
import { FadeIn } from '../animations/FadeIn.jsx';
import { INCLUSIONS } from '../../lib/content.js';

export function Inclusions() {
  return (
    <section className="bg-cream py-[var(--section-y)] px-[var(--section-x)]">
      <div className="max-w-default mx-auto">
        <FadeIn>
          <p className="font-mono text-xs uppercase tracking-widest text-muted mb-3">Included</p>
          <h2
            className="font-display font-light text-ink mb-8"
            style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}
          >
            Everything is taken care of
          </h2>
        </FadeIn>
        <FadeIn>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-4 max-w-2xl">
            {INCLUSIONS.map((item) => (
              <li key={item} className="flex items-start gap-3 font-sans text-charcoal">
                <span className="text-sage mt-0.5 flex-shrink-0" aria-hidden="true">
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>
          <p className="font-sans text-sm text-muted mt-8 max-w-2xl leading-body">
            You bring comfortable clothes, an open mind, and no work calls. We share a detailed
            pre-arrival note once you register.
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
