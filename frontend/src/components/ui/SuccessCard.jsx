/**
 * SuccessCard — post-submit success state for forms.
 * Replaces the form after a successful API response.
 * Gold accent for enquiry forms; ochre accent for community forms.
 * NO inline styles (CONSTRAINT-CODE-001).
 */
import { cn } from '../../lib/cn.js';
import { Button } from './Button.jsx';

/**
 * @param {object}   props
 * @param {string}   props.title            - headline (e.g. "Thanks for the enquiry.")
 * @param {string}   props.body             - body copy
 * @param {'gold'|'ochre'} [props.accent='gold'] - color accent
 * @param {{ label: string, href?: string, onClick?: function }} [props.primaryAction]
 * @param {{ label: string, href?: string, onClick?: function }} [props.secondaryAction]
 */
export function SuccessCard({ title, body, accent = 'gold', primaryAction, secondaryAction }) {
  const accentBorder = accent === 'ochre' ? 'border-ochre' : 'border-gold';
  const accentText   = accent === 'ochre' ? 'text-ochre'   : 'text-gold';
  const btnVariant   = accent === 'ochre' ? 'community'    : 'primary';

  return (
    <div className={cn('bg-cream rounded-lg p-8 border-t-4', accentBorder)}>
      <p className={cn('font-mono text-xs uppercase tracking-widest mb-3', accentText)}>
        Done
      </p>
      <h3 className="font-display font-light text-ink mb-3 text-[length:var(--text-subheading)]">
        {title}
      </h3>
      <p className="font-sans text-sm text-charcoal leading-body mb-6">
        {body}
      </p>
      <div className="flex flex-wrap gap-3">
        {primaryAction && (
          primaryAction.href ? (
            <a
              href={primaryAction.href}
              target={primaryAction.href.startsWith('http') ? '_blank' : undefined}
              rel={primaryAction.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              className={cn(
                'inline-flex items-center justify-center gap-2 rounded font-sans font-medium',
                'px-5 py-3 text-base min-h-[44px] transition-colors duration-150',
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
                accent === 'ochre'
                  ? 'bg-ochre text-on-ochre hover:bg-ochre/90 focus-visible:outline-ochre'
                  : 'bg-gold text-on-gold hover:bg-gold/90 focus-visible:outline-gold'
              )}
            >
              {primaryAction.label}
            </a>
          ) : (
            <Button variant={btnVariant} onClick={primaryAction.onClick}>
              {primaryAction.label}
            </Button>
          )
        )}
        {secondaryAction && (
          secondaryAction.href ? (
            <a
              href={secondaryAction.href}
              className="font-sans text-sm text-muted hover:text-teal transition-colors duration-150 flex items-center"
            >
              {secondaryAction.label}
            </a>
          ) : (
            <button
              type="button"
              onClick={secondaryAction.onClick}
              className="font-sans text-sm text-muted hover:text-teal transition-colors duration-150"
            >
              {secondaryAction.label}
            </button>
          )
        )}
      </div>
    </div>
  );
}
