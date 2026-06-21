/**
 * ProgramHero — shared hero section for program pages.
 * Props: program, headline, subHeadline, heroImage, primaryCta, secondaryCta
 * heroImage alt is required per CONSTRAINT-MEDIA-001.
 * FallingLeaves + BreathingPulse only on /badlaav (AmbientMotionBoundary handles blocking).
 */
import { Link } from 'react-router-dom';
import { cn } from '../../lib/cn.js';
import { FallingLeaves } from '../animations/FallingLeaves.jsx';
import { BreathingPulse } from '../animations/BreathingPulse.jsx';
import { useAmbientMotion } from '../animations/AmbientMotionBoundary.jsx';

export function ProgramHero({
  program,
  headline,
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
      className="relative min-h-[82vh] flex items-center bg-ink overflow-hidden"
      aria-label={`${program} hero`}
    >
      {/* Background image — photography leads, scrim keeps copy legible */}
      {heroImage && (
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt={heroImageAlt || `${program} hero`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/65 to-ink/25" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink/75 via-ink/25 to-transparent" />
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
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-gold mb-5">
              {program}
            </p>
            <h1
              className="font-display font-semibold text-pearl mb-6 leading-[1.05] max-w-[16ch]"
              style={{ fontSize: 'clamp(3rem, 7.5vw, 5.5rem)' }}
            >
              {headline}
            </h1>
            {subHeadline && (
              <p className="font-sans text-pearl/85 leading-body max-w-[580px] mb-10 text-lg">
                {subHeadline}
              </p>
            )}

            {(primaryCta || secondaryCta) && (
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
            )}
          </div>

          {aside && <div className="w-full lg:justify-self-end">{aside}</div>}
        </div>
      </div>
    </section>
  );
}
