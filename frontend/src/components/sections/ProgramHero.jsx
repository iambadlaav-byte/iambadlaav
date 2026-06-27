/**
 * ProgramHero — shared hero section for program pages.
 * Props: program, headline, subHeadline, heroImage, primaryCta, secondaryCta
 * heroImage alt is required per CONSTRAINT-MEDIA-001.
 *
 * First Light motion (matches the homepage ProtoHero): the hero photo parallaxes
 * on scroll and the copy reveals / slides up on entrance. Parallax is gated by the
 * ambient-motion boundary (static image on form routes like /contact); the reveal
 * and slide-up primitives self-disable under prefers-reduced-motion.
 * FallingLeaves + BreathingPulse only on /badlaav (AmbientMotionBoundary handles blocking).
 */
import { Link } from 'react-router-dom';
import { cn } from '../../lib/cn.js';
import { FallingLeaves } from '../animations/FallingLeaves.jsx';
import { BreathingPulse } from '../animations/BreathingPulse.jsx';
import { ParallaxImage } from '../animations/ParallaxImage.jsx';
import { RevealText } from '../animations/RevealText.jsx';
import { RotatingWord } from '../animations/RotatingWord.jsx';
import { SlideUp } from '../animations/SlideUp.jsx';
import { useAmbientMotion } from '../animations/AmbientMotionBoundary.jsx';

export function ProgramHero({
  program,
  headline,
  headlinePrefix,
  headlineWords,
  headlineClassName,
  subHeadline,
  heroImage,
  heroImageAlt,
  primaryCta,
  secondaryCta,
  aside,
  showAmbient = false,
}) {
  const ambientDisabled = useAmbientMotion();
  const showLeaves = showAmbient && !ambientDisabled;

  return (
    <section
      className="relative min-h-[82vh] flex items-center bg-ember overflow-hidden"
      aria-label={`${program} hero`}
    >
      {/* Background image — photography leads, scrim keeps copy legible.
          Parallaxes on scroll, but stays static on form routes (ambient gate). */}
      {heroImage && (
        <div className="absolute inset-0">
          {ambientDisabled ? (
            <img
              src={heroImage}
              alt={heroImageAlt || `${program} hero`}
              className="w-full h-full object-cover"
            />
          ) : (
            <ParallaxImage
              src={heroImage}
              alt={heroImageAlt || `${program} hero`}
              containerClassName="absolute inset-0"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-ember via-ember/80 to-ember/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-ember/90 via-ember/40 to-transparent" />
        </div>
      )}

      {/* Ambient — only on pages that opt in (Badlaav) */}
      {showLeaves && (
        <>
          <BreathingPulse disabled={false} />
          <FallingLeaves disabled={false} />
        </>
      )}

      {/* Content */}
      <div className="relative z-10 w-full max-w-default mx-auto px-[var(--section-x)] py-[var(--section-y)]">
        <div
          className={cn(
            'grid gap-10 lg:gap-12 items-center',
            aside && 'lg:grid-cols-[1.5fr_minmax(0,1fr)]',
          )}
        >
          <div>
            <SlideUp delay={0.1}>
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-gold mb-5">
                {program}
              </p>
            </SlideUp>
            <h1
              className={cn(
                'font-display font-semibold text-pearl mb-6 leading-[1.05] max-w-[16ch]',
                headlineClassName,
              )}
              style={{ fontSize: 'clamp(3rem, 7.5vw, 5.5rem)' }}
            >
              {headlineWords?.length ? (
                <>
                  <RevealText text={headlinePrefix} delay={0.2} className="inline" />{' '}
                  <RotatingWord words={headlineWords} className="text-gold" />
                </>
              ) : (
                <RevealText text={headline} delay={0.2} />
              )}
            </h1>
            {subHeadline && (
              <SlideUp delay={0.5}>
                <p className="font-sans text-pearl/85 leading-body max-w-[580px] mb-10 text-lg">
                  {subHeadline}
                </p>
              </SlideUp>
            )}

            {(primaryCta || secondaryCta) && (
              <SlideUp delay={0.7}>
                <div className="flex flex-col sm:flex-row gap-4">
                  {primaryCta && (
                    <Link
                      to={primaryCta.href}
                      className="inline-flex items-center justify-center gap-2 rounded-full font-sans font-semibold
                                 bg-ochre text-on-ochre hover:bg-ochre/90 px-7 py-3.5 min-h-[44px]
                                 shadow-sm hover:shadow-md transition-all duration-150
                                 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ochre"
                    >
                      {primaryCta.label}
                    </Link>
                  )}
                  {secondaryCta && (
                    <Link
                      to={secondaryCta.href}
                      className="inline-flex items-center justify-center gap-2 rounded-full font-sans font-semibold
                                 text-pearl border border-pearl/50 hover:bg-pearl hover:text-ink hover:border-pearl
                                 px-7 py-3.5 min-h-[44px] transition-all duration-150
                                 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pearl"
                    >
                      {secondaryCta.label}
                    </Link>
                  )}
                </div>
              </SlideUp>
            )}
          </div>

          {aside && <div className="hidden lg:block w-full lg:justify-self-end">{aside}</div>}
        </div>
      </div>
    </section>
  );
}
