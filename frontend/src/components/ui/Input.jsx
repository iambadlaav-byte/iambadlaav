/**
 * Input — base form input with label, error, and helper text.
 * Forwards ref for React Hook Form compatibility.
 * NO inline styles (CONSTRAINT-CODE-001).
 * Min height 44px for mobile touch target.
 */
import { forwardRef } from 'react';
import { cn } from '../../lib/cn.js';

export const Input = forwardRef(function Input(
  { label, error, helper, required, className, id, ...inputProps },
  ref
) {
  const inputId = id || inputProps.name;

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={inputId}
          className="font-mono text-xs uppercase tracking-widest text-muted"
        >
          {label}
          {required && (
            <span className="text-danger ml-1" aria-label="required">*</span>
          )}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={cn(
          'font-sans text-base text-charcoal bg-cream',
          'py-3 px-4 rounded min-h-[44px] w-full',
          'border border-muted/40',
          // Focus state — teal ring (WCAG focus visible)
          'focus:border-teal focus:outline focus:outline-2 focus:outline-teal focus:outline-offset-2',
          // Error state
          error && 'border-danger focus:border-danger focus:outline-danger',
          // Disabled state
          'disabled:opacity-50 disabled:cursor-not-allowed',
          className
        )}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : helper ? `${inputId}-helper` : undefined}
        {...inputProps}
      />
      {error && (
        <p id={`${inputId}-error`} className="text-danger text-xs mt-0.5" role="alert">
          {error}
        </p>
      )}
      {!error && helper && (
        <p id={`${inputId}-helper`} className="text-muted text-xs mt-0.5">
          {helper}
        </p>
      )}
    </div>
  );
});
