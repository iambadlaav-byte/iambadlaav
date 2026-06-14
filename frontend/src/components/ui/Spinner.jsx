/**
 * Spinner — 24px teal stroke loading indicator.
 * Animation uses CSS transform: rotate only (CONSTRAINT-CODE-004).
 */
import { cn } from '../../lib/cn.js';

export function Spinner({ className, size = 24 }) {
  return (
    <svg
      className={cn('animate-spin text-teal', className)}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-label="Loading"
      role="status"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}
