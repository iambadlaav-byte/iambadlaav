/**
 * ErrorBanner — root-level form error displayed above the form.
 * Shows for network failures or server errors that aren't field-specific.
 * Per UI-SPEC §Error states: "Couldn't reach our server. Check your connection and try again."
 * NO inline styles (CONSTRAINT-CODE-001).
 */
import { cn } from '../../lib/cn.js';

/**
 * @param {object}   props
 * @param {string}   props.message      - error message to display
 * @param {function} [props.onRetry]    - if provided, shows a retry button
 * @param {string}   [props.className]
 */
export function ErrorBanner({ message, onRetry, className }) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-3 p-4 rounded border border-danger/40 bg-danger/5',
        className
      )}
    >
      <span className="w-4 h-4 rounded-full bg-danger flex-shrink-0 mt-0.5" aria-hidden="true" />
      <div className="flex-1 min-w-0">
        <p className="font-sans text-sm text-charcoal">{message}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-2 font-sans text-sm font-medium text-teal hover:text-teal-light underline-offset-2 hover:underline transition-colors duration-150"
          >
            Try again
          </button>
        )}
      </div>
    </div>
  );
}
