/**
 * FacilitatorsGrid — Arjun Dada + facilitators, three portrait cards.
 */
import { FACILITATORS } from '../../lib/content.js';
import { FadeIn } from '../animations/FadeIn.jsx';

export function FacilitatorsGrid() {
  return (
    <section className="bg-cream py-[var(--section-y)] px-[var(--section-x)]">
      <div className="max-w-default mx-auto text-center">
        <FadeIn>
          <h2 className="font-display text-ink mb-2" style={{ fontSize: 'clamp(2rem, 4.5vw, 3rem)' }}>
            {FACILITATORS.heading}
          </h2>
          <p className="font-sans text-charcoal/70 mb-12">{FACILITATORS.subheading}</p>
        </FadeIn>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
          {FACILITATORS.people.map((p, i) => (
            <FadeIn key={p.name} delay={i * 0.08}>
              <img src={p.image} alt={p.alt} className="w-full aspect-square object-cover rounded-2xl mb-4" />
              <h3 className="font-display text-xl text-ink">{p.name}</h3>
              <p className="font-mono text-xs uppercase tracking-widest text-ochre mt-1">{p.role}</p>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
