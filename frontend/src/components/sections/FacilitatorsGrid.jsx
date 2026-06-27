/**
 * FacilitatorsGrid — Arjun Dada + facilitators, three portrait cards.
 */
import { FACILITATORS } from '../../lib/content.js';
import { SlideUp } from '../animations/SlideUp.jsx';
import { ScaleOnHover } from '../animations/ScaleOnHover.jsx';

export function FacilitatorsGrid() {
  return (
    <section className="bg-cream py-[var(--section-y)] px-[var(--section-x)]">
      <div className="max-w-default mx-auto text-center">
        <SlideUp>
          <h2 className="font-display text-ink mb-2" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}>
            {FACILITATORS.heading}
          </h2>
          <p className="font-sans text-charcoal/70 mb-12">{FACILITATORS.subheading}</p>
        </SlideUp>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
          {FACILITATORS.people.map((p, i) => (
            <SlideUp key={p.name} delay={i * 0.15} yOffset={30}>
              <ScaleOnHover scale={1.03}>
                <div className="rounded-2xl overflow-hidden mb-4 aspect-square">
                  <img src={p.image} alt={p.alt} className="w-full h-full object-cover" />
                </div>
              </ScaleOnHover>
              <h3 className="font-display text-xl text-ink">{p.name}</h3>
              <p className="font-mono text-xs uppercase tracking-widest text-ochre mt-1">{p.role}</p>
            </SlideUp>
          ))}
        </div>
      </div>
    </section>
  );
}
