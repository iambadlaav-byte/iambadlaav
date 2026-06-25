/**
 * ThreeDaysInteractive — homepage "what three days look like": a selectable
 * list of the three days with the active day's image shown alongside.
 * Hover/click to switch (keyboard-accessible buttons). No image animation
 * for reduced-motion users.
 */
import { useState } from 'react';
import { RETREAT_DAYS } from '../../lib/content.js';
import { cn } from '../../lib/cn.js';
import { FadeIn } from '../animations/FadeIn.jsx';
import { useReducedMotion } from '../../hooks/useReducedMotion.js';

export function ThreeDaysInteractive() {
  const [active, setActive] = useState(0);
  const noMotion = useReducedMotion();
  const day = RETREAT_DAYS[active];

  return (
    <section className="bg-cream py-[var(--section-y)] px-[var(--section-x)]">
      <div className="max-w-default mx-auto">
        <FadeIn>
          <p className="font-mono text-xs uppercase tracking-widest text-ochre text-center mb-3">
            Three days, away from the noise
          </p>
          <h2 className="font-display text-ink text-center mb-12" style={{ fontSize: 'clamp(2rem, 4.5vw, 3rem)' }}>
            What three days look like
          </h2>
        </FadeIn>

        <div className="grid md:grid-cols-2 gap-10 items-center">
          <ul className="space-y-2">
            {RETREAT_DAYS.map((d, i) => (
              <li key={d.day}>
                <button
                  type="button"
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onClick={() => setActive(i)}
                  className={cn(
                    'w-full text-left rounded-2xl p-5 border transition-colors',
                    i === active
                      ? 'bg-soft border-ochre/30'
                      : 'bg-transparent border-charcoal/10 hover:bg-soft/60',
                  )}
                >
                  <h4 className="font-display text-xl text-ink">
                    {d.title} · <span className="text-ochre">{d.subtitle}</span>
                  </h4>
                  <p className="font-sans text-sm text-charcoal/80 mt-1">{d.paragraphs[0]}</p>
                </button>
              </li>
            ))}
          </ul>

          <div className="rounded-2xl overflow-hidden shadow-lg">
            <img
              key={day.image}
              src={day.image}
              alt={`${day.title} — ${day.subtitle}`}
              className={cn('w-full h-[360px] object-cover', !noMotion && 'animate-[fadeIn_0.5s_ease]')}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
