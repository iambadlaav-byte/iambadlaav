/**
 * NumberBadge — the LBD numbered circle ("01", "02", …) in rotating brand tones.
 * Decorative; cycles through gold / terracotta / fern / sage so a list of items
 * reads playfully without leaving the palette.
 */
import { cn } from '../../lib/cn.js';

const BADGE_TONES = [
  'bg-gold text-on-gold',
  'bg-ochre text-on-ochre',
  'bg-teal-light text-ink',
  'bg-sage text-on-ochre',
];

export function NumberBadge({ label, index = 0, className }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-flex items-center justify-center w-12 h-12 rounded-full',
        'font-display font-semibold text-lg shadow-sm',
        BADGE_TONES[index % BADGE_TONES.length],
        className,
      )}
    >
      {label}
    </span>
  );
}
