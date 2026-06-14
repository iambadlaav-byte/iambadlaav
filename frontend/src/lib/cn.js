/**
 * cn() — className composition utility (CONSTRAINT-CODE-003).
 * Wraps clsx + tailwind-merge so conflicting Tailwind classes
 * (e.g. "p-4 p-8") resolve correctly — last one wins.
 *
 * Usage:
 *   cn('px-4 py-2', condition && 'text-gold', className)
 */
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...args) {
  return twMerge(clsx(args));
}
