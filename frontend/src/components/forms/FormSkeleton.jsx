/**
 * FormSkeleton — shared form wrapper for all Plan 04 forms.
 * Renders the RHF FormProvider, an optional header, the ErrorBanner if there's
 * a root error, the form fields (children), and the submit button.
 *
 * Per UI-SPEC §Forms — Phase 1 UX Patterns:
 * - Submit button disables + shows spinner during request
 * - ErrorBanner above form for root/network errors
 * - Re-enables after success/failure
 * NO inline styles (CONSTRAINT-CODE-001). No animations (CONSTRAINT-CODE-004).
 */
import { useRef, useState } from 'react';
import { FormProvider } from 'react-hook-form';
import { Button } from '../ui/Button.jsx';
import { ErrorBanner } from '../ui/ErrorBanner.jsx';

/**
 * @param {object}   props
 * @param {object}   props.methods        - RHF useForm return value
 * @param {function} props.onSubmit       - called with validated data
 * @param {string}   [props.title]        - form heading
 * @param {string}   [props.eyebrow]      - eyebrow label above heading
 * @param {string}   props.primaryCta     - submit button label
 * @param {string}   [props.primaryCtaPending] - submit button label while submitting
 * @param {string}   [props.error]        - root error message (overrides methods error)
 * @param {function} [props.onRetry]      - retry handler for ErrorBanner
 * @param {React.ReactNode} props.children
 */
export function FormSkeleton({
  methods,
  onSubmit,
  title,
  eyebrow,
  primaryCta,
  primaryCtaPending,
  error,
  onRetry,
  children,
}) {
  const { handleSubmit, formState } = methods;
  const { isSubmitting, errors } = formState;
  const formRef = useRef(null);
  // Some fields (chip groups, choice tiles) aren't focusable inputs, so RHF can't
  // auto-focus them on a failed submit — the click then looks like it "did nothing".
  // Surface a banner + scroll the first error into view so feedback is always visible.
  const [showInvalidHint, setShowInvalidHint] = useState(false);

  function onInvalid() {
    setShowInvalidHint(true);
    // Wait a tick for the error nodes to render, then scroll to the first one.
    setTimeout(() => {
      const el = formRef.current?.querySelector('[aria-invalid="true"], .text-danger');
      (el ?? formRef.current)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 50);
  }

  function onValid(data) {
    setShowInvalidHint(false);
    return onSubmit(data);
  }

  // Root error: explicit prop takes priority, then RHF root error, then the invalid hint.
  const rootError =
    error ||
    errors.root?.message ||
    (showInvalidHint ? 'Please complete the highlighted fields below.' : null);

  return (
    <FormProvider {...methods}>
      <form ref={formRef} noValidate onSubmit={handleSubmit(onValid, onInvalid)} className="space-y-6">
        {(eyebrow || title) && (
          <div>
            {eyebrow && (
              <p className="font-mono text-xs uppercase tracking-widest text-muted mb-2">
                {eyebrow}
              </p>
            )}
            {title && (
              <h2 className="font-display font-semibold text-ink text-[length:var(--text-subheading)]">
                {title}
              </h2>
            )}
          </div>
        )}

        {rootError && (
          <ErrorBanner message={rootError} onRetry={onRetry} />
        )}

        {children}

        <Button
          type="submit"
          variant="primary"
          size="md"
          loading={isSubmitting}
          disabled={isSubmitting}
          className="w-full sm:w-auto"
        >
          {isSubmitting && primaryCtaPending ? primaryCtaPending : primaryCta}
        </Button>
      </form>
    </FormProvider>
  );
}
