/**
 * VolunteerForm — public "apply to volunteer" form.
 *
 * Wave 1: volunteer interest is captured through the existing /messages channel
 * (enquiryType=COMMUNITY) so it works end-to-end today and lands in the admin inbox.
 * Wave 2 migrates this to a dedicated Volunteer record with status + per-batch counts.
 * NO inline styles. No alert(). No animations.
 */
import { useEffect, useState } from 'react';
import { Controller } from 'react-hook-form';
import { genericContactSchema } from '@validators/messages.js';
import { useFormSubmit } from './useFormSubmit.js';
import { FormSkeleton } from './FormSkeleton.jsx';
import { FormField } from '../ui/FormField.jsx';
import { Textarea } from '../ui/Textarea.jsx';
import { SuccessCard } from '../ui/SuccessCard.jsx';

export function VolunteerForm() {
  const [successData, setSuccessData] = useState(null);

  const { methods, submit } = useFormSubmit({
    schema: genericContactSchema,
    endpoint: '/messages',
    onSuccess: (data) => setSuccessData(data),
    onDuplicate: () => setSuccessData({ duplicate: true }),
  });

  const { control, formState: { errors }, setValue } = methods;

  // Route volunteer applications through the COMMUNITY message type for now.
  useEffect(() => {
    setValue('enquiryType', 'COMMUNITY');
  }, [setValue]);

  if (successData) {
    return (
      <SuccessCard
        accent="ochre"
        title="Thanks for stepping up."
        body="We've got your details. Arjun's team will reach out about the next batch you can help with."
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
      <div className="space-y-4">
        <FormField name="name" label="Your Name" required />
        <FormField name="email" label="Email" type="email" required />
        <FormField name="phone" label="WhatsApp number" type="tel" />

        <Controller
          name="message"
          control={control}
          render={({ field }) => (
            <Textarea
              {...field}
              label="Tell us about yourself"
              required
              error={errors.message?.message}
              helper="Your city, why you want to volunteer, and which batch dates you're available for."
              rows={5}
            />
          )}
        />
      </div>
    </FormSkeleton>
  );
}
