/**
 * FloatingParticles — Animation #4.
 * ~25 tiny gold dots that float upward with a gentle translateY loop.
 * Only `transform` and `opacity` animated (CONSTRAINT-CODE-004).
 * Budget: counts as 1 ambient animation per viewport (UI-SPEC).
 * Disabled by: useReducedMotion, disabled prop.
 *
 * Used on: Homepage hero, /about story section.
 */
import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion.js';

function seededRandom(seed) {
  let s = seed;
  return function () {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function FloatingParticles({ count = 25, disabled = false }) {
  const noMotion = useReducedMotion(disabled);

  const particles = useMemo(() => {
    const seed = 20260519; // fixed seed for stable layout
    const rand = seededRandom(seed);
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: rand() * 100,
      bottom: rand() * 40, // start in lower portion
      size: 2 + rand() * 3, // 2–5px
      duration: 6 + rand() * 8, // 6–14s
      delay: rand() * 8,
      opacity: 0.2 + rand() * 0.4,
      floatDistance: 40 + rand() * 60, // px upward travel
    }));
  }, [count]);

  if (noMotion) return null;

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none overflow-hidden"
    >
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-full bg-gold"
          style={{
            left: `${p.left}%`,
            bottom: `${p.bottom}%`,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
          }}
          animate={{
            y: [-0, -p.floatDistance],
            opacity: [p.opacity, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
}
