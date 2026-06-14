/**
 * useReducedMotion — returns true when the user prefers reduced motion.
 * Required wrapper for every animation (CONSTRAINT-CODE-004).
 *
 * Also accepts an optional forceOff prop (RESEARCH Pitfall 10) used by
 * form/admin route checks to disable ambient animations on those pages.
 * Animation components should check: const noMotion = useReducedMotion(isFormOrAdminRoute)
 */
import { useState, useEffect } from 'react';

export function useReducedMotion(forceOff = false) {
  const [prefersReduced, setPrefersReduced] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');

    function handleChange(e) {
      setPrefersReduced(e.matches);
    }

    // Use addEventListener (addListener is deprecated)
    mq.addEventListener('change', handleChange);
    return () => mq.removeEventListener('change', handleChange);
  }, []);

  return prefersReduced || forceOff;
}
