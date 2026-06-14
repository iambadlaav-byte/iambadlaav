/**
 * Label — DM Mono uppercase label for form fields.
 * Per UI-SPEC: 12px, uppercase, letter-spacing 0.18em, color muted.
 */
import { cn } from '../../lib/cn.js';

export function Label({ htmlFor, children, required, className }) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        'font-mono text-xs uppercase tracking-widest text-muted block mb-1',
        className
      )}
    >
      {children}
      {required && (
        <span className="text-danger ml-1" aria-label="required">*</span>
      )}
    </label>
  );
}
