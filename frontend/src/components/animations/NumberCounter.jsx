/**
 * NumberCounter — Animation #5.
 * Counts from 0 → target when the element enters the viewport.
 * Ease-out curve. Once-only (fires on first intersection, never again).
 * Gold color by default (reserved for stats — UI-SPEC §Color).
 * Respects prefers-reduced-motion (renders target immediately).
 */
import { useState, useEffect, useRef } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion.js';
import { cn } from '../../lib/cn.js';

/** Ease-out interpolation: 0→1 over t in [0,1]. */
function easeOut(t) {
  return 1 - Math.pow(1 - t, 3);
}

export function NumberCounter({
  target,
  suffix = '',
  prefix = '',
  duration = 1800,
  className,
  disabled = false,
}) {
  const noMotion = useReducedMotion(disabled);
  const [value, setValue] = useState(noMotion ? target : 0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (noMotion) {
      setValue(target);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [noMotion, hasStarted, target]);

  useEffect(() => {
    if (!hasStarted || noMotion) return;

    const start = performance.now();

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOut(progress);
      setValue(Math.round(eased * target));

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    }

    const raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [hasStarted, target, duration, noMotion]);

  return (
    <span ref={ref} className={cn('font-display font-light text-gold', className)}>
      {prefix}{value}{suffix}
    </span>
  );
}
