/**
 * ChoiceField — single-select question rendered as tappable option cards.
 * Controlled: pass value + onChange. Used by the Retreat questionnaire.
 */
import { cn } from '../../lib/cn.js';

export function ChoiceField({ question, options, value, onChange, required, error, columns = 1 }) {
  return (
    <fieldset>
      <legend className="font-sans text-charcoal font-medium mb-3 leading-snug">
        {question}
        {required && <span className="text-ochre"> *</span>}
      </legend>
      <div className={cn('grid gap-2', columns === 2 && 'sm:grid-cols-2')}>
        {options.map((opt) => {
          const selected = value === opt;
          return (
            <button
              type="button"
              key={opt}
              onClick={() => onChange(opt)}
              aria-pressed={selected}
              className={cn(
                'text-left rounded-xl border px-4 py-3 font-sans text-sm transition-colors min-h-[44px]',
                selected
                  ? 'border-ochre bg-ochre/10 text-ink ring-1 ring-ochre'
                  : 'border-charcoal/15 bg-pearl text-charcoal hover:border-ochre/50',
              )}
            >
              {opt}
            </button>
          );
        })}
      </div>
      {error && <p className="text-danger text-xs mt-2 font-sans">{error}</p>}
    </fieldset>
  );
}
