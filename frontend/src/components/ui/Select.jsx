/**
 * Select — Radix UI headless select with brand styling.
 * Forwards value/onChange for React Hook Form Controller compatibility.
 * NO inline styles (CONSTRAINT-CODE-001).
 */
import * as RadixSelect from '@radix-ui/react-select';
import { ChevronDown, Check } from 'lucide-react';
import { forwardRef } from 'react';
import { cn } from '../../lib/cn.js';

/**
 * Select item (option) within the dropdown.
 */
export const SelectItem = forwardRef(function SelectItem({ children, className, ...props }, ref) {
  return (
    <RadixSelect.Item
      ref={ref}
      className={cn(
        'relative flex items-center px-4 py-2.5 text-sm font-sans text-charcoal',
        'select-none cursor-pointer rounded',
        'data-[highlighted]:bg-soft data-[highlighted]:text-charcoal data-[highlighted]:outline-none',
        'data-[state=checked]:font-medium',
        className
      )}
      {...props}
    >
      <RadixSelect.ItemText>{children}</RadixSelect.ItemText>
      <RadixSelect.ItemIndicator className="absolute left-1 flex items-center justify-center">
        <Check size={12} className="text-teal" />
      </RadixSelect.ItemIndicator>
    </RadixSelect.Item>
  );
});

/**
 * Select root component.
 * @param {object} props
 * @param {string}   props.label        - visible label
 * @param {string}   [props.error]      - error message
 * @param {boolean}  [props.required]   - shows red asterisk
 * @param {string}   [props.placeholder] - placeholder text shown when no value selected
 * @param {string}   props.value        - controlled value (from RHF Controller)
 * @param {function} props.onChange     - change handler (from RHF Controller)
 * @param {string}   [props.name]
 * @param {React.ReactNode} props.children  - SelectItem elements
 */
export function Select({ label, error, required, placeholder = 'Select…', value, onChange, name, children }) {
  const inputId = name;

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
      <RadixSelect.Root value={value} onValueChange={onChange} name={name}>
        <RadixSelect.Trigger
          id={inputId}
          aria-label={label}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={cn(
            'inline-flex items-center justify-between gap-2 w-full',
            'font-sans text-base text-charcoal bg-cream',
            'py-3 px-4 rounded min-h-[44px]',
            'border border-muted/40',
            'focus:border-teal focus:outline focus:outline-2 focus:outline-teal focus:outline-offset-2',
            error && 'border-danger focus:border-danger focus:outline-danger',
            'data-[placeholder]:text-muted',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          <RadixSelect.Value placeholder={placeholder} />
          <RadixSelect.Icon>
            <ChevronDown size={16} className="text-muted flex-shrink-0" />
          </RadixSelect.Icon>
        </RadixSelect.Trigger>

        <RadixSelect.Portal>
          <RadixSelect.Content
            position="popper"
            sideOffset={4}
            className={cn(
              'bg-cream border border-muted/30 rounded shadow-lg',
              'w-[var(--radix-select-trigger-width)]',
              'max-h-64 overflow-y-auto',
              'z-50 py-1'
            )}
          >
            <RadixSelect.Viewport>
              {children}
            </RadixSelect.Viewport>
          </RadixSelect.Content>
        </RadixSelect.Portal>
      </RadixSelect.Root>
      {error && (
        <p id={`${inputId}-error`} className="text-danger text-xs mt-0.5" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
