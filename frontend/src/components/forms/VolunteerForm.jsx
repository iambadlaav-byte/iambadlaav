/**
 * VolunteerForm — public "apply to volunteer" form (VOL-01).
 *
 * Posts a dedicated Volunteer record to POST /volunteers, validated against the
 * shared volunteerCreateSchema. Identity fields (name/email/phone/city) feed a
 * User upsert server-side; the rest persist on the Volunteer row.
 *
 * canTravel is a single-select Yes/No that maps to a real boolean (not a string).
 * skills + availability are multi-select chip groups that produce string arrays.
 *
 * NO inline styles. No alert(). No animations (CONSTRAINT-CODE-004).
 */
import { useState } from 'react';
import { Controller } from 'react-hook-form';
import { volunteerCreateSchema } from '@validators/volunteers.js';
import { useFormSubmit } from './useFormSubmit.js';
import { FormSkeleton } from './FormSkeleton.jsx';
import { ChoiceField } from './ChoiceField.jsx';
import { FormField } from '../ui/FormField.jsx';
import { Textarea } from '../ui/Textarea.jsx';
import { SuccessCard } from '../ui/SuccessCard.jsx';
import { cn } from '../../lib/cn.js';

const SKILL_OPTIONS = [
  'Logistics & setup',
  'Kitchen & meals',
  'Registration desk',
  'Photography / video',
  'Content & social',
  'Listening / counselling support',
  'Transport',
  'First-aid',
];

const AVAILABILITY_OPTIONS = [
  'Weekdays',
  'Weekends',
  'Full 3-day batch',
  'Setup day before',
  'Remote / online help',
];

// canTravel is a boolean on the wire — map the two visible chips to true/false.
const TRAVEL_OPTIONS = ['Yes', 'No'];

/**
 * ChipGroup — accessible multi-select. Toggles values in/out of a string array.
 * Selected chips use the ochre treatment to match ChoiceField.
 */
function ChipGroup({ legend, options, value = [], onChange, required, error }) {
  const toggle = (opt) =>
    onChange(value.includes(opt) ? value.filter((v) => v !== opt) : [...value, opt]);

  return (
    <fieldset>
      <legend className="font-sans text-charcoal font-medium mb-3 leading-snug">
        {legend}
        {required && <span className="text-ochre"> *</span>}
      </legend>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const selected = value.includes(opt);
          return (
            <button
              type="button"
              key={opt}
              onClick={() => toggle(opt)}
              aria-pressed={selected}
              className={cn(
                'rounded-full border px-4 py-2 font-sans text-sm transition-colors min-h-[44px]',
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

export function VolunteerForm() {
  const [successData, setSuccessData] = useState(null);

  const { methods, submit } = useFormSubmit({
    schema: volunteerCreateSchema,
    endpoint: '/volunteers',
    onSuccess: (data) => setSuccessData(data),
    onDuplicate: () => setSuccessData({ duplicate: true }),
  });

  const { control, reset, formState: { errors } } = methods;

  if (successData) {
    return successData.duplicate ? (
      <SuccessCard
        accent="ochre"
        title="Already applied for this batch."
        body="We have your application for this batch. Want to help with a different one? Apply again and pick that batch."
        primaryAction={{
          label: 'Apply for another batch',
          onClick: () => { reset(); setSuccessData(null); },
        }}
        secondaryAction={{ label: '← Back to home', href: '/' }}
      />
    ) : (
      <SuccessCard
        accent="ochre"
        title="Thanks for stepping up."
        body="We've got your details. Arjun's team will reach out about the next batch you can help hold — and where you fit best."
        secondaryAction={{ label: '← Back to home', href: '/' }}
      />
    );
  }

  return (
    <FormSkeleton
      methods={methods}
      onSubmit={submit}
      primaryCta="Apply to volunteer"
      primaryCtaPending="Sending..."
    >
      <div className="space-y-5">
        <FormField name="name" label="Your name" required />
        <FormField name="email" label="Email" type="email" required />
        <FormField name="phone" label="WhatsApp number" type="tel" required />
        <FormField name="city" label="City" required />
        <FormField
          name="batchAttended"
          label="Which Badlaav batch have you attended, or are interested in?"
          helper="If you haven't attended yet, tell us which upcoming batch."
          required
        />

        <Controller
          name="skills"
          control={control}
          defaultValue={[]}
          render={({ field }) => (
            <ChipGroup
              legend="Where can you help? (pick at least one)"
              options={SKILL_OPTIONS}
              value={field.value}
              onChange={field.onChange}
              required
              error={errors.skills?.message}
            />
          )}
        />

        <Controller
          name="availability"
          control={control}
          defaultValue={[]}
          render={({ field }) => (
            <ChipGroup
              legend="When are you available? (pick at least one)"
              options={AVAILABILITY_OPTIONS}
              value={field.value}
              onChange={field.onChange}
              required
              error={errors.availability?.message}
            />
          )}
        />

        <Controller
          name="canTravel"
          control={control}
          defaultValue={undefined}
          render={({ field }) => (
            <ChoiceField
              question="Can you travel to the retreat venue?"
              options={TRAVEL_OPTIONS}
              // Render the boolean back as its Yes/No label.
              value={field.value === true ? 'Yes' : field.value === false ? 'No' : undefined}
              onChange={(label) => field.onChange(label === 'Yes')}
              required
              columns={2}
              error={errors.canTravel?.message}
            />
          )}
        />

        <Controller
          name="whyVolunteer"
          control={control}
          defaultValue=""
          render={({ field }) => (
            <Textarea
              {...field}
              label="Why do you want to volunteer?"
              required
              error={errors.whyVolunteer?.message}
              helper="A few lines on why you want to volunteer."
              rows={4}
            />
          )}
        />

        <Controller
          name="messageToArjun"
          control={control}
          defaultValue=""
          render={({ field }) => (
            <Textarea
              {...field}
              label="Anything you'd like to tell Arjun? (optional)"
              error={errors.messageToArjun?.message}
              rows={3}
            />
          )}
        />
      </div>
    </FormSkeleton>
  );
}
