/**
 * Highlight — wraps a word with a hand-drawn gold scribble underline
 * (the LBD marker-stroke under a key word). Two loose strokes for a sketched feel.
 * Decorative SVG (aria-hidden); the text stays readable above it.
 */
import { cn } from '../../lib/cn.js';

export function Highlight({ children, className }) {
  return (
    <span className={cn('relative inline-block whitespace-nowrap', className)}>
      <span className="relative z-10">{children}</span>
      <svg
        aria-hidden="true"
        className="absolute inset-x-0 -bottom-2 w-full h-[0.45em]"
        viewBox="0 0 300 24"
        preserveAspectRatio="none"
        fill="none"
      >
        <path
          d="M6 15 C 70 6, 140 20, 210 11 S 290 9, 296 14"
          stroke="rgb(var(--color-gold))"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <path
          d="M12 19 C 92 12, 162 23, 252 16"
          stroke="rgb(var(--color-gold))"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.6"
        />
      </svg>
    </span>
  );
}
