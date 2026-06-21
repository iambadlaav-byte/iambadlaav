/**
 * Highlights — "what to expect" cards (residential, silence, small group, follow-through).
 */
import { StaggerChildren, StaggerItem } from '../animations/StaggerChildren.jsx';
import { FadeIn } from '../animations/FadeIn.jsx';
import { Highlight } from '../ui/Highlight.jsx';
import { HIGHLIGHTS } from '../../lib/content.js';

export function Highlights() {
  return (
    <section className="bg-soft py-[var(--section-y)] px-[var(--section-x)]">
      <div className="max-w-default mx-auto">
        <FadeIn>
          <h2
            className="font-display font-semibold text-ink text-center mb-10"
            style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}
          >
            What to <Highlight>expect</Highlight>
          </h2>
        </FadeIn>
        <StaggerChildren className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {HIGHLIGHTS.map((h) => (
            <StaggerItem key={h.title} className="h-full">
              <div className="bg-pearl rounded-2xl p-7 h-full flex flex-col border border-charcoal/5 shadow-sm hover:shadow-lg transition-shadow">
                <h3 className="font-display text-xl font-semibold text-ink mb-2">{h.title}</h3>
                <p className="font-sans text-sm text-charcoal leading-body flex-1">{h.body}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </div>
    </section>
  );
}
