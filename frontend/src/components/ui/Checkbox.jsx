/**
 * Checkbox — Radix UI headless checkbox with brand styling.
 * Used for boolean fields (hasPlacementCell) and checkbox groups (targetExams).
 * NO inline styles (CONSTRAINT-CODE-001).
 */
import * as RadixCheckbox from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';
import { cn } from '../../lib/cn.js';

/**
 * Single checkbox.
 *
 * @param {object}   props
 * @param {string}   props.label       - visible label
 * @param {boolean}  props.checked     - controlled state
 * @param {function} props.onCheckedChange
 * @param {string}   [props.name]
 * @param {string}   [props.id]
 * @param {string}   [props.className]
 */
export function Checkbox({ label, checked, onCheckedChange, name, id, className }) {
  const checkId = id || name;
  return (
    <label
      htmlFor={checkId}
      className={cn(
        'flex items-center gap-2 cursor-pointer select-none',
        'font-sans text-sm text-charcoal',
        className
      )}
    >
      <RadixCheckbox.Root
        id={checkId}
        name={name}
        checked={checked}
        onCheckedChange={onCheckedChange}
        className={cn(
          'w-4 h-4 rounded border border-muted/60 bg-cream flex-shrink-0',
          'flex items-center justify-center',
          'focus:outline focus:outline-2 focus:outline-teal focus:outline-offset-2',
          'data-[state=checked]:bg-teal data-[state=checked]:border-teal',
          'transition-colors duration-150'
        )}
      >
        <RadixCheckbox.Indicator>
          <Check size={11} className="text-pearl" />
        </RadixCheckbox.Indicator>
      </RadixCheckbox.Root>
      {label}
    </label>
  );
}

/**
 * CheckboxGroup — renders a labeled group of checkboxes.
 * Used by FORM-05 targetExams field (multiple selection, min 1).
 *
 * @param {object}   props
 * @param {string}   props.label     - group label
 * @param {string}   [props.error]   - error message
 * @param {boolean}  [props.required]
 * @param {string[]} props.value     - array of selected values
 * @param {function} props.onChange  - called with new array on change
 * @param {string}   [props.name]
 * @param {{ value: string, label: string }[]} props.options
 */
export function CheckboxGroup({ label, error, required, value = [], onChange, name, options = [] }) {
  function handleCheckedChange(optValue, checked) {
    if (checked) {
      onChange([...value, optValue]);
    } else {
      onChange(value.filter((v) => v !== optValue));
    }
  }

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
      <div className="flex flex-wrap gap-3" role="group" aria-describedby={error ? `${name}-error` : undefined}>
        {options.map((opt) => (
          <Checkbox
            key={opt.value}
            id={`${name}-${opt.value}`}
            label={opt.label}
            checked={value.includes(opt.value)}
            onCheckedChange={(checked) => handleCheckedChange(opt.value, checked)}
          />
        ))}
      </div>
      {error && (
        <p id={`${name}-error`} className="text-danger text-xs mt-0.5" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
