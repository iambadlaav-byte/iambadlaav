/**
 * Testimonials — three voices from past participants.
 */
import { StaggerChildren, StaggerItem } from '../animations/StaggerChildren.jsx';
import { FadeIn } from '../animations/FadeIn.jsx';
import { TestimonialCard } from '../cards/TestimonialCard.jsx';
import { TESTIMONIALS } from '../../lib/content.js';

export function Testimonials() {
  return (
    <section className="bg-cream py-[var(--section-y)] px-[var(--section-x)]">
      <div className="max-w-default mx-auto">
        <FadeIn>
          <p className="font-mono text-xs uppercase tracking-widest text-muted text-center mb-3">In their words</p>
          <h2
            className="font-display font-light text-ink text-center mb-10"
            style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}
          >
            What participants say
          </h2>
        </FadeIn>
        <StaggerChildren className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t) => (
            <StaggerItem key={t.author} className="h-full">
              <TestimonialCard {...t} />
            </StaggerItem>
          ))}
        </StaggerChildren>
      </div>
    </section>
  );
}
