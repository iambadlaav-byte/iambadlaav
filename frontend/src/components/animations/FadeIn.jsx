/**
 * FadeIn — scroll-triggered reveal animation (Animation #3).
 * Framer Motion whileInView: opacity 0→1, translateY 20px→0.
 * Short-circuits to a plain <div> when reduced-motion is active or
 * when the nearest AmbientMotionBoundary has disabled animations.
 *
 * FadeIn is ALLOWED everywhere except /admin/* (CONSTRAINT-CODE-004).
 * It is a reveal animation, not ambient — it fires once and stops.
 */
import { motion } from 'framer-motion';
import { useReducedMotion } from '../../hooks/useReducedMotion.js';

export function FadeIn({
  children,
  className,
  delay = 0,
  duration = 0.6,
  amount = 0.3,
  disabled = false,
  as: Tag = 'div',
}) {
  const noMotion = useReducedMotion(disabled);

  if (noMotion) {
    return <Tag className={className}>{children}</Tag>;
  }

  const MotionTag = motion[Tag] || motion.div;

  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{ duration, ease: 'easeOut', delay }}
    >
      {children}
    </MotionTag>
  );
}
