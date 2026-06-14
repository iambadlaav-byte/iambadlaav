/**
 * MissionUdaanStudentForm — FORM-05. NAVIGATION FORM — no backend POST.
 * On Zod-valid submit, navigates to /register?program=mission-udaan&plan=<plan>&...
 * Step 1 of FORM-02 (Plan 05) pre-fills from those URL params.
 * NO success card — the navigation IS the success.
 * NO inline styles. No alert(). No animations.
 */
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { missionUdaanStudentSchema, TARGET_EXAMS, QUALIFICATION_OPTIONS, PLAN_OPTIONS } from '@validators/students.js';
import { FormProvider } from 'react-hook-form';
import { FormField } from '../ui/FormField.jsx';
import { Select, SelectItem } from '../ui/Select.jsx';
import { RadioGroup } from '../ui/RadioGroup.jsx';
import { CheckboxGroup } from '../ui/Checkbox.jsx';
import { ErrorBanner } from '../ui/ErrorBanner.jsx';
import { Button } from '../ui/Button.jsx';
import { MH_DISTRICTS } from '../../lib/constants.js';

const QUALIFICATION_OPTS = [
  { value: 'GRADUATION', label: 'Graduation' },
  { value: 'PG',         label: 'Post-Graduation' },
  { value: 'OTHER',      label: 'Other' },
];

const TARGET_EXAM_OPTS = [
  { value: 'MPSC',  label: 'MPSC' },
  { value: 'UPSC',  label: 'UPSC' },
  { value: 'PSI',   label: 'PSI' },
  { value: 'STI',   label: 'STI' },
  { value: 'RTS',   label: 'RTS' },
  { value: 'OTHER', label: 'Other' },
];

const PLAN_OPTS = [
  { value: 'MONTHLY',   label: 'Monthly — ₹8,000/month' },
  { value: 'QUARTERLY', label: 'Quarterly — ₹21,000 (save ₹3,000)' },
  { value: 'ANNUAL',    label: 'Annual — ₹72,000 (save ₹24,000)' },
];

export function MissionUdaanStudentForm() {
  const navigate = useNavigate();

  const methods = useForm({
    resolver: zodResolver(missionUdaanStudentSchema),
    mode: 'onBlur',
    defaultValues: {
      targetExams: [],
      previousAttempts: 0,
    },
  });

  const { control, handleSubmit, formState: { errors, isSubmitting } } = methods;

  /**
   * On valid submit: build URL params and navigate to /register.
   * NO backend POST — FORM-05 is a navigation gate for FORM-02 (Plan 05).
   */
  function onSubmit(data) {
    const params = new URLSearchParams();
    params.set('program', 'mission-udaan');
    params.set('plan', data.plan);
    params.set('qualification', data.qualification);
    params.set('targetExams', data.targetExams.join(','));
    params.set('previousAttempts', String(data.previousAttempts));
    params.set('homeDistrict', data.homeDistrict);
    params.set('fullName', data.fullName);
    params.set('email', data.email);
    params.set('phone', data.phone);
    if (data.parentName)    params.set('parentName', data.parentName);
    if (data.parentContact) params.set('parentContact', data.parentContact);
    if (data.couponCode)    params.set('couponCode', data.couponCode);

    navigate(`/register?${params.toString()}`);
  }

  const rootError = errors.root?.message;

  return (
    <FormProvider {...methods}>
      <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-muted mb-2">Student Application</p>
          <h2 className="font-display font-light text-ink text-[length:var(--text-subheading)]">
            Apply as Student
          </h2>
        </div>

        {rootError && <ErrorBanner message={rootError} />}

        {/* Personal details */}
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-muted mb-4">Who</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField name="fullName" label="Full Name" required />
            <FormField name="phone" label="WhatsApp Number" type="tel" required helper="10 digits, starting with 6-9" />
            <FormField name="email" label="Email" type="email" required />
            <FormField name="previousAttempts" label="Previous Attempts" type="number" required helper="Enter 0 if this is your first attempt." />
          </div>
        </div>

        {/* Academic */}
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-muted mb-4">Academic</p>
          <div className="space-y-4">
            <Controller
              name="qualification"
              control={control}
              render={({ field }) => (
                <Select
                  label="Qualification"
                  required
                  error={errors.qualification?.message}
                  name={field.name}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Highest qualification"
                >
                  {QUALIFICATION_OPTS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </Select>
              )}
            />
            <Controller
              name="homeDistrict"
              control={control}
              render={({ field }) => (
                <Select
                  label="Home District"
                  required
                  error={errors.homeDistrict?.message}
                  name={field.name}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select district"
                >
                  {MH_DISTRICTS.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </Select>
              )}
            />
            <Controller
              name="targetExams"
              control={control}
              render={({ field }) => (
                <CheckboxGroup
                  label="Target Exams"
                  required
                  error={errors.targetExams?.message}
                  name={field.name}
                  value={field.value || []}
                  onChange={field.onChange}
                  options={TARGET_EXAM_OPTS}
                />
              )}
            />
          </div>
        </div>

        {/* Plan */}
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-muted mb-4">Plan</p>
          <Controller
            name="plan"
            control={control}
            render={({ field }) => (
              <RadioGroup
                label="Enrollment Plan"
                required
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                error={errors.plan?.message}
                options={PLAN_OPTS}
              />
            )}
          />
        </div>

        {/* Optional fields */}
        <details className="group">
          <summary className="font-mono text-xs uppercase tracking-widest text-muted cursor-pointer select-none hover:text-charcoal transition-colors duration-150">
            Optional details
          </summary>
          <div className="mt-4 space-y-4">
            <FormField name="parentName" label="Parent / Guardian Name" />
            <FormField name="parentContact" label="Parent WhatsApp Number" type="tel" helper="10 digits, starting with 6-9" />
            <FormField name="couponCode" label="Coupon Code" helper="If you have a referral or discount code." />
          </div>
        </details>

        <Button
          type="submit"
          variant="primary"
          size="md"
          loading={isSubmitting}
          disabled={isSubmitting}
          className="w-full sm:w-auto"
        >
          {isSubmitting ? 'Validating...' : 'Continue to Registration'}
        </Button>
      </form>
    </FormProvider>
  );
}
