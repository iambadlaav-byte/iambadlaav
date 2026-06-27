/**
 * HeroGeometry — decorative animated line-art figure for the right side of a hero.
 * Picks a figure by `variant`, owns the motion gate (prefers-reduced-motion OR the
 * route ambient gate → static skeleton), and renders the SVG. Desktop-only and
 * aria-hidden — it carries no meaning, only atmosphere.
 *
 * Animates transform/opacity (+ SVG pathLength draw-in) only (CONSTRAINT-CODE-004).
 */
import { cn } from '../../lib/cn.js';
import { useReducedMotion } from '../../hooks/useReducedMotion.js';
import { useAmbientMotion } from './AmbientMotionBoundary.jsx';
import { renderHeroFigure, HERO_FIGURE } from './heroFigures.jsx';

export function HeroGeometry({ variant, className }) {
  const ambientDisabled = useAmbientMotion();
  // `still` when the user prefers reduced motion OR the route bans ambient motion.
  const still = useReducedMotion(ambientDisabled);

  return (
    <div
      className={cn('hidden lg:block pointer-events-none select-none w-full max-w-[440px] mx-auto', className)}
      aria-hidden="true"
    >
      <svg viewBox="0 0 400 400" className="w-full h-auto">
        {renderHeroFigure(variant, still)}
      </svg>
    </div>
  );
}

// Re-export so pages can `import { HeroGeometry, HERO_FIGURE }` from one path.
export { HERO_FIGURE };
