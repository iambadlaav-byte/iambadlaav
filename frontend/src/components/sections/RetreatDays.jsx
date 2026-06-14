/**
 * RetreatDays — the signature day-by-day narrative (Day 1 → Day 2 → Day 3).
 * The structural centrepiece, modelled on a retreat's linear arc.
 * `variant="deep"` shows the "what you'll gain" callout per day (used on /retreat).
 */
import { FadeIn } from '../animations/FadeIn.jsx';
import { DAYS } from '../../lib/content.js';

export function RetreatDays({ variant = 'teaser' }) {
  const deep = variant === 'deep';

  return (
    <section className="bg-soft py-[var(--section-y)] px-[var(--section-x)]" id="schedule">
      <div className="max-w-default mx-auto">
        <FadeIn>
          <p className="font-mono text-xs uppercase tracking-widest text-muted text-center mb-3">Programme</p>
          <h2
            className="font-display font-light text-ink text-center mb-3"
            style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}
          >
            Three days
          </h2>
          <p className="font-sans text-charcoal/80 text-center max-w-[560px] mx-auto mb-12 leading-body">
            Not a schedule of sessions — an arc. You arrive, you do the work, you leave with a plan.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {DAYS.map(({ day, title, body, gain }) => (
            <FadeIn key={day} className="h-full">
              <div className="bg-cream rounded-lg p-7 h-full flex flex-col border border-muted/15">
                <p className="font-mono text-xs uppercase tracking-widest text-teal mb-2">{day}</p>
                <h3 className="font-display text-2xl font-semibold text-ink mb-3">{title}</h3>
                <p className="font-sans text-sm text-charcoal leading-body flex-1">{body}</p>
                {deep && (
                  <p className="font-mono text-xs uppercase tracking-widest text-ochre mt-5 pt-4 border-t border-muted/15">
                    You leave with — {gain}
                  </p>
                )}
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
