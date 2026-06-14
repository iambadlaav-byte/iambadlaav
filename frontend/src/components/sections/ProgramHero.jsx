/**
 * ProgramHero — shared hero section for program pages.
 * Props: program, headline, subHeadline, heroImage, primaryCta, secondaryCta
 * heroImage alt is required per CONSTRAINT-MEDIA-001.
 * FallingLeaves + BreathingPulse only on /badlaav (AmbientMotionBoundary handles blocking).
 */
import { Link } from 'react-router-dom';
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
  showAmbient = false,
}) {
  const ambientDisabled = useAmbientMotion();
  const showLeaves = showAmbient && !ambientDisabled;

  return (
    <section
      className="relative min-h-[60vh] flex items-center bg-ink overflow-hidden"
      aria-label={`${program} hero`}
    >
      {/* Background image */}
      {heroImage && (
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt={heroImageAlt || `${program} hero`}
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-ink/60" />
        </div>
      )}

      {/* Ambient — only on pages that opt in (Badlaav, /community/antrang) */}
      {showLeaves && (
        <>
          <BreathingPulse disabled={false} />
          <FallingLeaves disabled={false} />
        </>
      )}

      {/* Content */}
      <div className="relative z-10 max-w-default mx-auto px-[var(--section-x)] py-[var(--section-y)]">
        <p className="font-mono text-xs uppercase tracking-widest text-gold mb-4">
          {program}
        </p>
        <h1
          className="font-display font-light text-pearl mb-5 leading-[1.1]"
          style={{ fontSize: 'clamp(2.8rem, 7vw, 5rem)' }}
        >
          {headline}
        </h1>
        {subHeadline && (
          <p className="font-sans text-pearl/80 leading-body max-w-[560px] mb-10 text-lg">
            {subHeadline}
          </p>
        )}

        {(primaryCta || secondaryCta) && (
          <div className="flex flex-col sm:flex-row gap-4">
            {primaryCta && (
              <Link
                to={primaryCta.href}
                className="inline-flex items-center justify-center gap-2 rounded font-sans font-medium
                           bg-gold text-on-gold hover:bg-gold/90 px-6 py-3 min-h-[44px]
                           transition-colors duration-150
                           focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
              >
                {primaryCta.label}
              </Link>
            )}
            {secondaryCta && (
              <Link
                to={secondaryCta.href}
                className="inline-flex items-center justify-center gap-2 rounded font-sans font-medium
                           text-pearl/80 hover:text-teal-light border border-pearl/30 hover:border-teal-light
                           px-6 py-3 min-h-[44px] transition-colors duration-150
                           focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
              >
                {secondaryCta.label}
              </Link>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
