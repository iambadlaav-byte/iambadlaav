/**
 * FallingLeaves — Animation #1.
 * 14 CSS-drawn leaf SVGs drift across the parent container.
 * Only `transform` and `opacity` are animated (CONSTRAINT-CODE-004).
 * Uses CSS keyframes, not JS animation, for performance.
 * Intersection Observer pauses the animation when off-screen.
 * Disabled by: useReducedMotion, AmbientMotionBoundary, or disabled prop.
 *
 * Used on: Homepage hero, /badlaav hero, /community/antrang hero, /404.
 */
import { useEffect, useRef, useMemo } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion.js';

/** Seeded pseudo-random — stable across re-renders (same date = same layout). */
function seededRandom(seed) {
  let s = seed;
  return function () {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/** Leaf SVG path — simple 2-lobe organic shape */
function LeafSvg({ color, size }) {
  return (
    <svg
      width={size}
      height={size * 1.4}
      viewBox="0 0 20 28"
      fill={color}
      aria-hidden="true"
    >
      <path d="M10 0 C10 0 20 8 20 16 C20 22 15 28 10 28 C5 28 0 22 0 16 C0 8 10 0 10 0Z" />
      <path d="M10 4 L10 26" stroke="rgba(0,0,0,0.15)" strokeWidth="0.8" fill="none" />
    </svg>
  );
}

const LEAF_COLORS = [
  'rgb(var(--color-gold))',
  'rgb(var(--color-ochre))',
  'rgb(var(--color-teal-light))',
  'rgb(var(--color-gold))',
  'rgb(var(--color-ochre))',
];

export function FallingLeaves({ count = 14, disabled = false }) {
  const noMotion = useReducedMotion(disabled);
  const containerRef = useRef(null);

  // Generate stable leaf configs seeded by today's date
  const leaves = useMemo(() => {
    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    const rand = seededRandom(seed);

    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: rand() * 95, // % from left
      size: 8 + rand() * 10, // 8–18px
      color: LEAF_COLORS[Math.floor(rand() * LEAF_COLORS.length)],
      duration: 8 + rand() * 10, // 8–18s
      delay: 0,
      opacity: 0.4 + rand() * 0.4, // 0.4–0.8
      rotateStart: rand() * 360,
    }));
  }, [count]);

  // Intersection Observer — pause animation when off-screen
  useEffect(() => {
    if (noMotion || !containerRef.current) return;
    const el = containerRef.current;

    const observer = new IntersectionObserver(
      ([entry]) => {
        el.style.animationPlayState = entry.isIntersecting ? 'running' : 'paused';
        // Apply to all child leaf elements
        el.querySelectorAll('.leaf-drift').forEach((leaf) => {
          leaf.style.animationPlayState = entry.isIntersecting ? 'running' : 'paused';
        });
      },
      { threshold: 0 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [noMotion]);

  if (noMotion) return null;

  return (
    <>
      {/* Inject keyframes once via a style tag */}
      <style>{`
        @keyframes leaf-drift {
          0% {
            transform: translateY(-60px) rotate(var(--leaf-rotate-start, 0deg));
            opacity: 0;
          }
          10% {
            opacity: var(--leaf-opacity, 0.6);
          }
          90% {
            opacity: var(--leaf-opacity, 0.6);
          }
          100% {
            transform: translateY(110vh) rotate(calc(var(--leaf-rotate-start, 0deg) + 720deg));
            opacity: 0;
          }
        }
      `}</style>
      <div
        ref={containerRef}
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none overflow-hidden"
      >
        {leaves.map((leaf) => (
          <span
            key={leaf.id}
            className="leaf-drift absolute"
            style={{
              left: `${leaf.left}%`,
              top: 0,
              '--leaf-rotate-start': `${leaf.rotateStart}deg`,
              '--leaf-opacity': leaf.opacity,
              animation: `leaf-drift ${leaf.duration}s ${leaf.delay}s linear infinite`,
              opacity: 0,
            }}
          >
            <LeafSvg color={leaf.color} size={leaf.size} />
          </span>
        ))}
      </div>
    </>
  );
}
