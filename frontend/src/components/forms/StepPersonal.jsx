/**
 * StepPersonal — Step 1 of the Registration wizard.
 * Fields: regType, fullName, partner2Name (couple only), email, phone, city, state.
 *
 * Per UI-SPEC §FORM-02: no animations on form pages (CONSTRAINT-CODE-004).
 * Inline errors only — never alert() (CONSTRAINT-CODE-005).
 */
import { useFormContext, Controller } from 'react-hook-form';
import { FormField } from '../ui/FormField.jsx';
import { Input } from '../ui/Input.jsx';
import { RadioGroup } from '../ui/RadioGroup.jsx';
import { Button } from '../ui/Button.jsx';
import { ErrorBanner } from '../ui/ErrorBanner.jsx';

const REG_TYPE_OPTIONS = [
  { value: 'INDIVIDUAL', label: 'Individual' },
  { value: 'COUPLE',     label: 'Couple' },
  { value: 'CORPORATE',  label: 'Corporate' },
];

export function StepPersonal({ onNext }) {
  const {
    register,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useFormContext();

  const regType = watch('regType');

  return (
    <div className="flex flex-col gap-5">
      {/* Root-level error (e.g. network error from previous submit) */}
      {errors.root && <ErrorBanner message={errors.root.message} />}

      {/* Registration type */}
      <FormField
        label="Registration type"
        error={errors.regType?.message}
        required
      >
        <Controller
          name="regType"
          control={control}
          render={({ field }) => (
            <RadioGroup
              name={field.name}
              options={REG_TYPE_OPTIONS}
              value={field.value ?? ''}
              onChange={field.onChange}
            />
          )}
        />
      </FormField>

      {/* Full name */}
      <FormField label="Full name" error={errors.fullName?.message} required>
        <Input
          type="text"
          placeholder="Your full name"
          autoComplete="name"
          {...register('fullName')}
        />
      </FormField>

      {/* Partner name — only for COUPLE */}
      {regType === 'COUPLE' && (
        <FormField label="Partner's full name" error={errors.partner2Name?.message} required>
          <Input
            type="text"
            placeholder="Partner's full name"
            autoComplete="off"
            {...register('partner2Name')}
          />
        </FormField>
      )}

      {/* Email */}
      <FormField label="Email" error={errors.email?.message} required>
        <Input
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          {...register('email')}
        />
      </FormField>

      {/* Phone */}
      <FormField
        label="WhatsApp number"
        helper="10-digit Indian mobile number"
        error={errors.phone?.message}
        required
      >
        <Input
          type="tel"
          placeholder="9XXXXXXXXX"
          autoComplete="tel"
          maxLength={10}
          {...register('phone')}
        />
      </FormField>

      {/* City */}
      <FormField label="City" error={errors.city?.message} required>
        <Input
          type="text"
          placeholder="e.g. Aurangabad"
          autoComplete="address-level2"
          {...register('city')}
        />
      </FormField>

      {/* State */}
      <FormField label="State" error={errors.state?.message}>
        <Input
          type="text"
          placeholder="e.g. Maharashtra"
          autoComplete="address-level1"
          {...register('state')}
        />
      </FormField>

      {/* Continue */}
      <Button
        type="button"
        variant="primary"
        onClick={onNext}
        loading={isSubmitting}
        className="w-full mt-2"
      >
        Continue
      </Button>
    </div>
  );
}
