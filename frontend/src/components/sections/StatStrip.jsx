/**
 * StatStrip — the big-number rhythm band ("03 days / 20 people / 30-day call").
 * Large serif numerals, calm labels. One reveal per viewport (whole grid wrapped
 * in a single FadeIn) per the animation budget in CLAUDE.md.
 * Brand stats use numerals (the "numbers" voice exception).
 */
import { FadeIn } from '../animations/FadeIn.jsx';
import { STATS } from '../../lib/content.js';

export function StatStrip() {
  return (
    <section className="bg-soft py-[var(--section-y)] px-[var(--section-x)]">
      <FadeIn>
        <div className="max-w-default mx-auto grid grid-cols-1 sm:grid-cols-3 gap-12 sm:gap-8">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center sm:text-left">
              <p
                className="font-display font-semibold text-gold leading-none mb-3"
                style={{ fontSize: 'clamp(3.5rem, 8vw, 5.5rem)' }}
              >
                {stat.value}
              </p>
              <p className="font-mono text-[11px] uppercase tracking-widest text-muted mb-1">
                {stat.kicker}
              </p>
              <p className="font-sans text-charcoal leading-snug">{stat.label}</p>
            </div>
          ))}
        </div>
      </FadeIn>
    </section>
  );
}
