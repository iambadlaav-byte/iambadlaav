/**
 * BreathingPulse — Animation #2.
 * Pure CSS keyframes: radial-gradient overlay that breathes opacity 0.05→0.08→0.05.
 * ONLY `opacity` is animated — strictly compliant with CONSTRAINT-CODE-004.
 * 6-second loop. Positioned absolute, fills parent container.
 *
 * Used on: Homepage hero, /badlaav hero, /community/antrang hero.
 * NOT on: form pages, /admin/*, /account/* (AmbientMotionBoundary).
 */
import { useReducedMotion } from '../../hooks/useReducedMotion.js';

export function BreathingPulse({ disabled = false }) {
  const noMotion = useReducedMotion(disabled);

  if (noMotion) return null;

  return (
    <>
      <style>{`
        @keyframes breathe {
          0%, 100% { opacity: 0.05; }
          50%       { opacity: 0.08; }
        }
      `}</style>
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 40%, rgb(var(--color-gold)), transparent 70%)',
          animation: 'breathe 6s ease-in-out infinite',
          opacity: 0.05,
        }}
      />
    </>
  );
}
