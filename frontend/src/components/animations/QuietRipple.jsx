/**
 * QuietRipple — calm ambient visual: rings that ripple gently outward, like
 * stillness returning to water. Meant to sit beside the FAQ questions.
 *
 * Only `transform` (scale) and `opacity` animate — strictly compliant with
 * CONSTRAINT-CODE-004. Honors reduced motion and the route-level ambient gate
 * via the `disabled` prop; when motion is off it falls back to the static
 * guide rings so the composition still reads.
 */
import { motion } from 'framer-motion';
import { useReducedMotion } from '../../hooks/useReducedMotion.js';

// Three staggered ripples — enough to feel alive without becoming busy.
const RIPPLES = [0, 1, 2];

export function QuietRipple({ disabled = false }) {
  const noMotion = useReducedMotion(disabled);

  return (
    <div className="relative mx-auto aspect-square w-full max-w-sm" aria-hidden="true">
      {/* Static guide rings + centre — visible even when motion is disabled. */}
      <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full">
        <circle cx="200" cy="200" r="160" fill="none" stroke="rgb(var(--color-teal) / 0.12)" strokeWidth="1.5" />
        <circle cx="200" cy="200" r="110" fill="none" stroke="rgb(var(--color-teal) / 0.16)" strokeWidth="1.5" />
        <circle cx="200" cy="200" r="62" fill="rgb(var(--color-ochre) / 0.10)" />
        <circle cx="200" cy="200" r="9" fill="rgb(var(--color-ochre))" />
      </svg>

      {/* Animated ripples expanding to the edge and fading out. */}
      {!noMotion &&
        RIPPLES.map((i) => (
          <motion.span
            key={i}
            className="absolute inset-0 rounded-full border border-teal/30"
            initial={{ scale: 0.32, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 0 }}
            transition={{ duration: 5, ease: 'easeOut', repeat: Infinity, delay: i * 1.6 }}
          />
        ))}
    </div>
  );
}
