/**
 * FormField — React Hook Form adapter with two modes:
 *
 * **Self-contained mode** (original):
 *   <FormField name="email" label="Email" type="email" required />
 *   → Calls register(name) and renders its own <Input>.
 *
 * **Wrapper mode** (used by StepPersonal, StepProgram):
 *   <FormField label="Full name" error={errors.fullName?.message} required>
 *     <Input type="text" {...register('fullName')} />
 *   </FormField>
 *   → Renders label + error chrome around the provided children.
 *
 * When `children` are present, wrapper mode is used.
 * When `name` is present (no children), self-contained mode is used.
 */
import { useFormContext } from 'react-hook-form';
import { Input } from './Input.jsx';

export function FormField({ name, label, helper, error: errorProp, type = 'text', required, children, ...inputProps }) {
  const { register, formState: { errors } } = useFormContext();

  // Wrapper mode — children are provided, render label + error chrome around them
  if (children) {
    const error = errorProp ?? (name ? errors[name]?.message : undefined);
    const fieldId = name || inputProps.id;

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label
            htmlFor={fieldId}
            className="font-mono text-xs uppercase tracking-widest text-muted"
          >
            {label}
            {required && (
              <span className="text-danger ml-1" aria-label="required">*</span>
            )}
          </label>
        )}
        {children}
        {error && (
          <p id={fieldId ? `${fieldId}-error` : undefined} className="text-danger text-xs mt-0.5" role="alert">
            {error}
          </p>
        )}
        {!error && helper && (
          <p id={fieldId ? `${fieldId}-helper` : undefined} className="text-muted text-xs mt-0.5">
            {helper}
          </p>
        )}
      </div>
    );
  }

  // Self-contained mode — render own <Input> with register(name)
  const error = errorProp ?? errors[name]?.message;

  return (
    <Input
      label={label}
      error={error}
      helper={helper}
      type={type}
      required={required}
      {...register(name)}
      {...inputProps}
    />
  );
}
