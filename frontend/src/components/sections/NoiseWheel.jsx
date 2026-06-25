/**
 * NoiseWheel — "the eight things noise takes" as an 8-spoke ring with the
 * brand line at its centre, beside a heading + check-list. Static (no tilt).
 */
import { NOISE_WHEEL } from '../../lib/content.js';
import { FadeIn } from '../animations/FadeIn.jsx';

const SPOKE_POS = [
  { x: 200, y: 50 }, { x: 310, y: 90 }, { x: 350, y: 205 }, { x: 310, y: 320 },
  { x: 200, y: 360 }, { x: 90, y: 320 }, { x: 50, y: 205 }, { x: 90, y: 90 },
];

export function NoiseWheel() {
  const w = NOISE_WHEEL;
  return (
    <section className="bg-cream py-[var(--section-y)] px-[var(--section-x)]">
      <div className="max-w-default mx-auto">
        <FadeIn>
          <h2
            className="font-display text-ink text-center mb-12"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.4rem)' }}
          >
            {w.heading}
            <br />
            <span className="text-ochre">{w.subheading}</span>
          </h2>
        </FadeIn>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <FadeIn>
            <svg viewBox="0 0 400 400" className="w-full max-w-md mx-auto" aria-hidden="true">
              <circle cx="200" cy="200" r="190" fill="none" stroke="rgb(var(--color-charcoal) / 0.12)" strokeWidth="2" />
              <line x1="200" y1="10" x2="200" y2="390" stroke="rgb(var(--color-charcoal) / 0.1)" strokeWidth="2" />
              <line x1="10" y1="200" x2="390" y2="200" stroke="rgb(var(--color-charcoal) / 0.1)" strokeWidth="2" />
              <line x1="65" y1="65" x2="335" y2="335" stroke="rgb(var(--color-charcoal) / 0.1)" strokeWidth="2" />
              <line x1="65" y1="335" x2="335" y2="65" stroke="rgb(var(--color-charcoal) / 0.1)" strokeWidth="2" />
              <circle cx="200" cy="200" r="90" fill="rgb(var(--color-ochre))" />
              <text x="200" y="195" fill="rgb(var(--color-pearl))" fontFamily="DM Sans" fontWeight="700" fontSize="22" textAnchor="middle">{w.center[0]}</text>
              <text x="200" y="220" fill="rgb(var(--color-pearl))" fontFamily="DM Sans" fontWeight="700" fontSize="22" textAnchor="middle">{w.center[1]}</text>
              {w.spokes.map((label, i) => (
                <text key={label} x={SPOKE_POS[i].x} y={SPOKE_POS[i].y} fontFamily="DM Sans" fontWeight="600" fontSize="14" textAnchor="middle" fill="rgb(var(--color-charcoal))">{label}</text>
              ))}
            </svg>
          </FadeIn>

          <FadeIn delay={0.1}>
            <h3 className="font-display text-2xl text-ink mb-6">{w.listHeading}</h3>
            <ul className="space-y-3">
              {w.list.map((item) => (
                <li key={item} className="flex items-start gap-3 font-sans text-charcoal leading-body">
                  <span className="text-gold mt-1 flex-shrink-0" aria-hidden="true">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
