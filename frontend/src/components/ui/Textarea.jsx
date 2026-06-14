/**
 * Textarea — base form textarea with label, error, helper text, and optional word count.
 * Forwards ref for React Hook Form compatibility.
 * NO inline styles (CONSTRAINT-CODE-001).
 */
import { forwardRef, useState } from 'react';
import { cn } from '../../lib/cn.js';

/**
 * @param {object}  props
 * @param {string}  props.label         - visible label text
 * @param {string}  [props.error]       - error message (shown below field)
 * @param {string}  [props.helper]      - helper text (shown when no error)
 * @param {boolean} [props.required]    - shows red asterisk
 * @param {number}  [props.rows=4]      - textarea rows
 * @param {number}  [props.wordCountMin] - if set, shows "{N} of {wordCountMin} words minimum" helper
 * @param {string}  [props.id]
 * @param {string}  [props.className]
 */
export const Textarea = forwardRef(function Textarea(
  { label, error, helper, required, rows = 4, wordCountMin, className, id, onChange, ...textareaProps },
  ref
) {
  const inputId = id || textareaProps.name;
  const [wordCount, setWordCount] = useState(0);

  function handleChange(e) {
    if (wordCountMin !== undefined) {
      const words = e.target.value.trim().split(/\s+/).filter(Boolean).length;
      setWordCount(words);
    }
    onChange?.(e);
  }

  const wordCountHelper = wordCountMin !== undefined
    ? `${wordCount} of ${wordCountMin} words minimum`
    : null;

  const wordCountReached = wordCountMin !== undefined && wordCount >= wordCountMin;

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
      <textarea
        ref={ref}
        id={inputId}
        rows={rows}
        onChange={handleChange}
        className={cn(
          'font-sans text-base text-charcoal bg-cream',
          'py-3 px-4 rounded w-full resize-y',
          'border border-muted/40',
          'focus:border-teal focus:outline focus:outline-2 focus:outline-teal focus:outline-offset-2',
          error && 'border-danger focus:border-danger focus:outline-danger',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          className
        )}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : helper || wordCountHelper ? `${inputId}-helper` : undefined}
        {...textareaProps}
      />
      {error && (
        <p id={`${inputId}-error`} className="text-danger text-xs mt-0.5" role="alert">
          {error}
        </p>
      )}
      {!error && wordCountHelper && (
        <p
          id={`${inputId}-helper`}
          className={cn('text-xs mt-0.5', wordCountReached ? 'text-sage' : 'text-muted')}
        >
          {wordCountHelper}
        </p>
      )}
      {!error && !wordCountHelper && helper && (
        <p id={`${inputId}-helper`} className="text-muted text-xs mt-0.5">
          {helper}
        </p>
      )}
    </div>
  );
});
