/**
 * RadioGroup — Radix UI headless radio group with brand styling.
 * Compatible with React Hook Form Controller.
 * NO inline styles (CONSTRAINT-CODE-001).
 */
import * as RadixRadio from '@radix-ui/react-radio-group';
import { cn } from '../../lib/cn.js';

/**
 * RadioGroup — renders a labeled group of radio options.
 *
 * @param {object}   props
 * @param {string}   props.label     - group label
 * @param {string}   [props.error]   - error message
 * @param {boolean}  [props.required]
 * @param {string}   props.value     - controlled value
 * @param {function} props.onChange  - change handler (onValueChange)
 * @param {string}   [props.name]
 * @param {{ value: string, label: string }[]} props.options
 */
export function RadioGroup({ label, error, required, value, onChange, name, options = [] }) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <span className="font-mono text-xs uppercase tracking-widest text-muted">
          {label}
          {required && (
            <span className="text-danger ml-1" aria-label="required">*</span>
          )}
        </span>
      )}
      <RadixRadio.Root
        value={value}
        onValueChange={onChange}
        name={name}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
        className="flex flex-wrap gap-3"
      >
        {options.map((opt) => (
          <label
            key={opt.value}
            className={cn(
              'flex items-center gap-2 cursor-pointer',
              'font-sans text-sm text-charcoal select-none'
            )}
          >
            <RadixRadio.Item
              value={opt.value}
              id={`${name}-${opt.value}`}
              className={cn(
                'w-4 h-4 rounded-full border border-muted/60 bg-cream flex-shrink-0',
                'focus:outline focus:outline-2 focus:outline-teal focus:outline-offset-2',
                'data-[state=checked]:border-teal',
                'transition-colors duration-150'
              )}
            >
              <RadixRadio.Indicator className="flex items-center justify-center w-full h-full relative">
                <span className="w-2 h-2 rounded-full bg-teal block" />
              </RadixRadio.Indicator>
            </RadixRadio.Item>
            {opt.label}
          </label>
        ))}
      </RadixRadio.Root>
      {error && (
        <p id={`${name}-error`} className="text-danger text-xs mt-0.5" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
