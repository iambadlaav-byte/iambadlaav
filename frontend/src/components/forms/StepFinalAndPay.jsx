/**
 * StepFinalAndPay — Step 3 of the Registration wizard.
 *
 * - Optional fields: age, occupation, dietaryNote.
 * - CouponInput (pre-filled from URL param if present).
 * - Order summary card (gold border): base amount, coupon discount, final total.
 * - Consent checkbox with terms link.
 * - "Proceed to Payment" CTA — triggers parent onSubmit (which calls the backend
 *   and opens Razorpay checkout).
 *
 * The Razorpay SDK is NOT invoked here — it lives in RegistrationForm.onSubmit
 * so loading state and error handling are centralised.
 *
 * CONSTRAINT-CODE-004: No animations on form pages.
 */
import { useFormContext, Controller } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { FormField } from '../ui/FormField.jsx';
import { Input } from '../ui/Input.jsx';
import { Textarea } from '../ui/Textarea.jsx';
import { Checkbox } from '../ui/Checkbox.jsx';
import { Button } from '../ui/Button.jsx';
import { ErrorBanner } from '../ui/ErrorBanner.jsx';
import { CouponInput } from './CouponInput.jsx';
import { cn } from '../../lib/cn.js';

export function StepFinalAndPay({ onBack, onSubmit, isSubmitting }) {
  const {
    register,
    control,
    watch,
    formState: { errors },
  } = useFormContext();

  const program      = watch('program');
  const regType      = watch('regType');
  const batchId      = watch('batchId');
  const plan         = watch('plan');
  const couponPreview = watch('_couponPreview'); // set by CouponInput — display only

  // Base amount is shown in StepProgram; we need to show it here too.
  // Use _baseAmount if the parent injected it, else fall back to a static label.
  const baseAmount = watch('_baseAmount') ?? null;

  return (
    <div className="flex flex-col gap-5">
      {errors.root && <ErrorBanner message={errors.root.message} />}

      {/* Optional fields */}
      <FormField label="Age" error={errors.age?.message}>
        <Input
          type="number"
          placeholder="e.g. 28"
          min={13}
          max={99}
          {...register('age')}
        />
      </FormField>

      <FormField label="Occupation" error={errors.occupation?.message}>
        <Input
          type="text"
          placeholder="e.g. Civil engineer, Teacher, Student"
          maxLength={80}
          {...register('occupation')}
        />
      </FormField>

      <FormField
        label="Dietary preferences / allergies"
        helper="Optional — helps us plan meals"
        error={errors.dietaryNote?.message}
      >
        <Textarea
          placeholder="e.g. Vegetarian, nut allergy"
          maxLength={280}
          rows={2}
          {...register('dietaryNote')}
        />
      </FormField>

      {/* Coupon */}
      {program && (
        <CouponInput
          program={program}
          baseAmount={baseAmount ?? 0}
        />
      )}

      {/* Order summary card */}
      <div className={cn(
        'rounded border-2 border-gold bg-cream p-5 flex flex-col gap-2'
      )}>
        <h3 className="font-mono text-[10px] uppercase tracking-widest text-muted mb-1">
          Order summary
        </h3>

        <div className="flex justify-between text-sm text-charcoal">
          <span>{planLabel(plan, regType, program)}</span>
          <span className="font-medium">
            {baseAmount != null ? `₹${baseAmount.toLocaleString('en-IN')}` : '—'}
          </span>
        </div>

        {couponPreview?.discountAmount > 0 && (
          <div className="flex justify-between text-sm text-sage">
            <span>Coupon discount</span>
            <span>−₹{couponPreview.discountAmount.toLocaleString('en-IN')}</span>
          </div>
        )}

        {/* NOTE: No GST line items in Phase 1 per REQUIREMENTS.md PAY-01 + DECISION-009 */}

        <div className="border-t border-soft mt-1 pt-2 flex justify-between">
          <span className="font-medium text-charcoal">Total</span>
          <span className="font-display text-xl font-light text-charcoal">
            {couponPreview?.finalAmount != null
              ? `₹${couponPreview.finalAmount.toLocaleString('en-IN')}`
              : baseAmount != null
              ? `₹${baseAmount.toLocaleString('en-IN')}`
              : '—'}
          </span>
        </div>

        <p className="text-muted text-xs mt-1">
          You'll be redirected to Razorpay to complete payment securely.
        </p>
      </div>

      {/* Consent */}
      <FormField error={errors.consent?.message}>
        <div className="flex items-start gap-3">
          <Controller
            name="consent"
            control={control}
            render={({ field }) => (
              <Checkbox
                id="consent"
                name={field.name}
                checked={!!field.value}
                onCheckedChange={(checked) => field.onChange(checked === true)}
              />
            )}
          />
          <label htmlFor="consent" className="text-sm text-charcoal leading-relaxed cursor-pointer">
            I agree to Dnyanpith's{' '}
            <Link to="/terms" className="text-teal underline underline-offset-2">
              terms and cancellation policy
            </Link>
            .
          </label>
        </div>
      </FormField>

      {/* Navigation */}
      <div className="flex gap-3 mt-2">
        <Button
          type="button"
          variant="ghost"
          onClick={onBack}
          disabled={isSubmitting}
          className="flex-1"
        >
          Back
        </Button>
        <Button
          type="submit"
          variant="primary"
          loading={isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? 'Proceeding to Payment…' : 'Proceed to Payment'}
        </Button>
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function planLabel(plan, regType, program) {
  if (program === 'MISSION_UDAAN') {
    const labels = { MONTHLY: 'Monthly plan', QUARTERLY: 'Quarterly plan', ANNUAL: 'Annual plan' };
    return labels[plan?.toUpperCase()] ?? plan ?? 'Program registration';
  }
  const labels = { INDIVIDUAL: 'Individual registration', COUPLE: 'Couple registration', CORPORATE: 'Corporate batch' };
  return labels[plan?.toUpperCase()] ?? plan ?? 'Program registration';
}
