/**
 * ProtoHero — full-bleed dawn image with forest-green overlay, the brand line
 * in heavy DM Sans, and the live NextRetreatCard floating bottom-right.
 */
import { HERO } from '../../lib/content.js';
import { NextRetreatCard } from './NextRetreatCard.jsx';
import { ParallaxImage } from '../animations/ParallaxImage.jsx';
import { RevealText } from '../animations/RevealText.jsx';
import { SlideUp } from '../animations/SlideUp.jsx';
import { HeroGeometry, HERO_FIGURE } from '../animations/HeroGeometry.jsx';

export function ProtoHero() {
  return (
    <header className="relative min-h-[80vh] flex items-center overflow-hidden bg-ember">
      <ParallaxImage
        src={HERO.image}
        alt={HERO.imageAlt}
        containerClassName="absolute inset-0"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ember/90 via-ember/60 to-ember/40 z-0" />

      {/* Decorative geometric figure — upper-right, clear of the bottom-right NextRetreatCard. */}
      <div className="absolute top-8 right-[var(--section-x)] z-[1] w-[clamp(220px,26vw,380px)] hidden lg:block pointer-events-none">
        <HeroGeometry variant={HERO_FIGURE.HOME} className="max-w-none" />
      </div>

      <div className="relative z-10 w-full max-w-wide mx-auto px-[var(--section-x)]">
        <SlideUp delay={0.1}>
          <p className="font-mono text-xs uppercase tracking-widest text-pearl/80 mb-5">
            {HERO.badge}
          </p>
        </SlideUp>
        
        <h1
          className="font-sans font-[1000] tracking-[-0.02em] leading-[1.02] text-pearl mb-6"
          style={{ fontSize: 'clamp(2.4rem, 5.2vw, 4.2rem)' }}
        >
          <RevealText text={HERO.titleTop} delay={0.2} />
          <br />
          <RevealText text={HERO.titleBottom} delay={0.4} />
        </h1>
        
        <SlideUp delay={0.6}>
          <p
            className="font-sans text-pearl/90 max-w-xl leading-snug"
            style={{ fontSize: 'clamp(1rem, 1.8vw, 1.3rem)' }}
          >
            {HERO.subtitle}
          </p>
        </SlideUp>
      </div>

      <div className="absolute z-10 bottom-8 right-[var(--section-x)] hidden md:block">
        <SlideUp delay={0.8} yOffset={20}>
          <NextRetreatCard />
        </SlideUp>
      </div>
    </header>
  );
}
