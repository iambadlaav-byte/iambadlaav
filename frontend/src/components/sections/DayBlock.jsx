/**
 * DayBlock — one day on the /retreat page: copy + check-list on one side,
 * image trio on the other. `reverse` alternates the layout. `day.accent` is a
 * theme token name ('gold' | 'sage') used for the badge + check marks.
 */
import { cn } from '../../lib/cn.js';
import { FadeIn } from '../animations/FadeIn.jsx';

const ACCENT = {
  gold: { badge: 'bg-gold text-on-gold', mark: 'text-gold' },
  sage: { badge: 'bg-sage text-pearl', mark: 'text-sage' },
};

export function DayBlock({ day, reverse = false }) {
  const accent = ACCENT[day.accent] ?? ACCENT.gold;
  return (
    <article className="py-[calc(var(--section-y)/1.5)] px-[var(--section-x)]">
      <div className={cn('max-w-default mx-auto grid md:grid-cols-2 gap-10 items-center', reverse && 'md:[&>*:first-child]:order-2')}>
        <FadeIn>
          <span className={cn('inline-block font-mono text-xs uppercase tracking-widest rounded-full px-3 py-1 mb-4', accent.badge)}>
            {day.day}
          </span>
          <h3 className="font-display text-ink mb-5" style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)' }}>
            {day.title} | <span className="text-ochre">{day.subtitle}</span>
          </h3>
          {day.paragraphs.map((p) => (
            <p key={p.slice(0, 24)} className="font-sans text-charcoal leading-body mb-4">{p}</p>
          ))}
          <ul className="space-y-2 mt-2">
            {day.list.map((item) => (
              <li key={item} className="flex items-start gap-3 font-sans text-charcoal">
                <span className={cn('mt-1 flex-shrink-0', accent.mark)} aria-hidden="true">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </FadeIn>
        <FadeIn delay={0.1}>
          <img src={day.image} alt={`${day.title} — ${day.subtitle}`} className="w-full h-[360px] object-cover rounded-2xl shadow-lg" />
        </FadeIn>
      </div>
    </article>
  );
}
