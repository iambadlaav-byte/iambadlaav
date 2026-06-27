/**
 * RotatingWord — cycles through a list of words in place, crossfading each
 * swap (up-and-out, in-from-below). Used in hero headlines like
 * "Transform your <mindset → results>".
 *
 * An invisible spacer sized to the longest word reserves the box, so the
 * absolutely-positioned animating words overlap without shifting surrounding
 * copy. Animates transform/opacity only. Under prefers-reduced-motion it
 * renders the first word statically — no looping.
 */
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '../../lib/cn.js';
import { HERO_WORD_ROTATE_MS } from '../../lib/constants.js';
import { useReducedMotion } from '../../hooks/useReducedMotion.js';

export function RotatingWord({ words, interval = HERO_WORD_ROTATE_MS, className = '' }) {
  const noMotion = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (noMotion || words.length < 2) return undefined;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % words.length);
    }, interval);
    return () => clearInterval(id);
  }, [noMotion, words.length, interval]);

  // Reduced motion: show the first word, no looping swap.
  if (noMotion) {
    return <span className={className}>{words[0]}</span>;
  }

  const longest = words.reduce((a, b) => (b.length > a.length ? b : a), '');

  return (
    <span className={cn('relative inline-block align-baseline', className)}>
      {/* Reserves width + height so the absolute words don't collapse the line. */}
      <span className="invisible" aria-hidden="true">{longest}</span>
      <AnimatePresence initial={false}>
        <motion.span
          key={index}
          className="absolute left-0 top-0"
          initial={{ opacity: 0, y: '0.4em' }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: '-0.4em' }}
          transition={{ duration: 0.6, ease: [0.45, 0, 0.2, 1] }}
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
