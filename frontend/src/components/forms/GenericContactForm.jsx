/**
 * GenericContactForm — FORM-09.
 * Embedded in /contact page.
 * POST /api/v1/messages → messages table (separate from enquiries).
 * Success: SuccessCard with WhatsApp CTA.
 * NO inline styles. No alert(). No animations.
 */
import { useState } from 'react';
import { Controller } from 'react-hook-form';
import { genericContactSchema, GENERIC_CONTACT_TYPES } from '@validators/messages.js';
import { useFormSubmit } from './useFormSubmit.js';
import { FormSkeleton } from './FormSkeleton.jsx';
import { FormField } from '../ui/FormField.jsx';
import { RadioGroup } from '../ui/RadioGroup.jsx';
import { Textarea } from '../ui/Textarea.jsx';
import { SuccessCard } from '../ui/SuccessCard.jsx';
import { WHATSAPP_NUMBER } from '../../lib/constants.js';

const ENQUIRY_TYPE_OPTIONS = [
  { value: 'GENERAL',          label: 'General' },
  { value: 'BADLAAV',          label: 'Badlaav' },
  { value: 'MISSION_UDAAN',    label: 'Mission Udaan' },
  { value: 'FUTURE_READINESS', label: 'Future Readiness' },
  { value: 'COMMUNITY',        label: 'Community' },
  { value: 'PRESS',            label: 'Press' },
  { value: 'PARTNERSHIP',      label: 'Partnership' },
];

export function GenericContactForm() {
  const [successData, setSuccessData] = useState(null);

  const { methods, submit } = useFormSubmit({
    schema: genericContactSchema,
    endpoint: '/messages',
    onSuccess: (data) => setSuccessData(data),
    // Issue 4/7 FIX: 409 DUPLICATE_MESSAGE → treat as success (message already received)
    onDuplicate: () => setSuccessData({ duplicate: true }),
  });

  const { control, formState: { errors } } = methods;

  if (successData) {
    const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, '')}?text=${encodeURIComponent("Hi, I just sent a message on dnyanpith.org.")}`;
    return (
      <SuccessCard
        accent="gold"
        title="Message sent."
        body="We usually reply within four hours during office hours."
        primaryAction={{ label: 'Talk on WhatsApp', href: whatsappLink }}
        secondaryAction={{ label: '← Back to home', href: '/' }}
      />
    );
  }

  return (
    <FormSkeleton
      methods={methods}
      onSubmit={submit}
      primaryCta="Send Message"
      primaryCtaPending="Sending..."
    >
      <div className="space-y-4">
        <FormField name="name" label="Your Name" required />
        <FormField name="email" label="Email" type="email" required />

        <Controller
          name="enquiryType"
          control={control}
          render={({ field }) => (
            <RadioGroup
              label="What is this about?"
              required
              name={field.name}
              value={field.value}
              onChange={field.onChange}
              error={errors.enquiryType?.message}
              options={ENQUIRY_TYPE_OPTIONS}
            />
          )}
        />

        <Controller
          name="message"
          control={control}
          render={({ field }) => (
            <Textarea
              {...field}
              label="Message"
              required
              error={errors.message?.message}
              helper="Min 10, max 2000 characters."
              rows={5}
            />
          )}
        />

        <FormField
          name="phone"
          label="Phone (optional)"
          type="tel"
          helper="If you'd prefer we call back."
        />
      </div>
    </FormSkeleton>
  );
}
