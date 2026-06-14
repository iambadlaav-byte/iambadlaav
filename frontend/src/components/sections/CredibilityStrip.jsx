/**
 * CredibilityStrip — Section 2 of 10 (ARCH §7.1).
 * Cream surface with three animated number stats.
 * Gold numbers via NumberCounter; charcoal labels.
 */
import { FadeIn } from '../animations/FadeIn.jsx';
import { NumberCounter } from '../animations/NumberCounter.jsx';

const STATS = [
  {
    target: 50,
    suffix: '+',
    label: 'officers cleared MPSC / UPSC',
    eyebrow: 'Mission Udaan',
  },
  {
    target: 200,
    suffix: '+',
    label: 'Badlaav participants',
    eyebrow: 'Corporate Retreat',
  },
  {
    target: 4,
    suffix: '',
    label: 'community circles — all free',
    eyebrow: 'Community',
  },
];

export function CredibilityStrip() {
  return (
    <section className="bg-cream py-[var(--section-y)] px-[var(--section-x)]" aria-label="Our impact at a glance">
      <div className="max-w-default mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          {STATS.map((stat, i) => (
            <FadeIn key={stat.eyebrow} delay={i * 0.1}>
              <div>
                <p className="font-mono text-xs uppercase tracking-widest text-muted mb-2">
                  {stat.eyebrow}
                </p>
                <div
                  className="font-display font-light leading-none mb-2"
                  style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)' }}
                >
                  <NumberCounter target={stat.target} suffix={stat.suffix} />
                </div>
                <p className="font-sans text-sm text-charcoal leading-snug">{stat.label}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
