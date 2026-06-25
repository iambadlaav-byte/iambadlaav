/**
 * ProtoHero — full-bleed dawn image with forest-green overlay, the brand line
 * in heavy DM Sans, and the live NextRetreatCard floating bottom-right.
 */
import { HERO } from '../../lib/content.js';
import { NextRetreatCard } from './NextRetreatCard.jsx';

export function ProtoHero() {
  return (
    <header className="relative min-h-[88vh] flex items-center overflow-hidden bg-ink">
      <div className="absolute inset-0">
        <img src={HERO.image} alt={HERO.imageAlt} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/40 to-ink/30" />
      </div>

      <div className="relative z-10 w-full max-w-wide mx-auto px-[var(--section-x)]">
        <p className="font-mono text-xs uppercase tracking-widest text-pearl/80 mb-5">
          {HERO.badge}
        </p>
        <h1
          className="font-sans font-[1000] tracking-[-0.02em] leading-[1.02] text-pearl mb-6"
          style={{ fontSize: 'clamp(3rem, 7vw, 5.5rem)' }}
        >
          {HERO.titleTop}
          <br />
          {HERO.titleBottom}
        </h1>
        <p
          className="font-sans text-pearl/90 max-w-xl leading-snug"
          style={{ fontSize: 'clamp(1.1rem, 2.2vw, 1.5rem)' }}
        >
          {HERO.subtitle}
        </p>
      </div>

      <div className="absolute z-10 bottom-8 right-[var(--section-x)] hidden md:block">
        <NextRetreatCard />
      </div>
    </header>
  );
}
