/**
 * CorporateEnquiryForm — FORM-01.
 * Embedded in /badlaav at the #enquire anchor.
 * POST /api/v1/enquiries/corporate → enquiries(CORPORATE)
 * Success: SuccessCard with WhatsApp CTA.
 * NO inline styles. No alert(). No animations.
 */
import { useState } from 'react';
import { Controller } from 'react-hook-form';
import { corporateEnquirySchema } from '@validators/enquiries.js';
import { useFormSubmit } from './useFormSubmit.js';
import { FormSkeleton } from './FormSkeleton.jsx';
import { FormField } from '../ui/FormField.jsx';
import { Select, SelectItem } from '../ui/Select.jsx';
import { RadioGroup } from '../ui/RadioGroup.jsx';
import { Textarea } from '../ui/Textarea.jsx';
import { SuccessCard } from '../ui/SuccessCard.jsx';
import { WHATSAPP_NUMBER } from '../../lib/constants.js';

/** Next 6 months as YYYY-MM options */
function getNextSixMonths() {
  const months = [];
  const now = new Date();
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleString('en-IN', { month: 'long', year: 'numeric' });
    months.push({ value, label });
  }
  return months;
}

const MONTHS = getNextSixMonths();

const SOURCE_OPTIONS = [
  { value: 'instagram',  label: 'Instagram' },
  { value: 'referral',   label: 'Referral' },
  { value: 'whatsapp',   label: 'WhatsApp' },
  { value: 'other',      label: 'Other' },
];

export function CorporateEnquiryForm() {
  const [successData, setSuccessData] = useState(null);

  const { methods, submit } = useFormSubmit({
    schema: corporateEnquirySchema,
    endpoint: '/enquiries/corporate',
    onSuccess: (data) => setSuccessData(data),
    // Issue 3/7 FIX: 409 DUPLICATE_ENQUIRY → show success card (we already have their info)
    onDuplicate: () => setSuccessData({ duplicate: true }),
  });

  const { control, formState: { errors } } = methods;

  if (successData) {
    const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, '')}?text=${encodeURIComponent("Hi Arjun Dada, I just sent a corporate enquiry for Badlaav. Looking forward to a conversation.")}`;
    return (
      <SuccessCard
        accent="gold"
        title="Thanks for the enquiry."
        body="We'll reach out within 24 hours to discuss a Badlaav for your team."
        primaryAction={{ label: 'Talk on WhatsApp', href: whatsappLink }}
        secondaryAction={{ label: '← Back to Badlaav', href: '/badlaav' }}
      />
    );
  }

  return (
    <FormSkeleton
      methods={methods}
      onSubmit={submit}
      eyebrow="Corporate Enquiry"
      title="Tell us about your team"
      primaryCta="Enquire as Corporate"
      primaryCtaPending="Sending..."
    >
      {/* WHO section */}
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-muted mb-4">Who</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField name="companyName" label="Company Name" required />
          <FormField name="contactName" label="Your Name" required />
          <FormField name="designation" label="Designation" required />
        </div>
      </div>

      {/* CONTACT section */}
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-muted mb-4">Contact</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            name="phone"
            label="WhatsApp Number"
            type="tel"
            required
            helper="10 digits, starting with 6-9"
          />
          <FormField name="email" label="Work Email" type="email" required />
        </div>
      </div>

      {/* WHAT section */}
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-muted mb-4">What</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Controller
            name="teamSize"
            control={control}
            render={({ field }) => (
              <Select
                label="Team Size"
                required
                error={errors.teamSize?.message}
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                placeholder="How many people?"
              >
                <SelectItem value="5-10">5 – 10 people</SelectItem>
                <SelectItem value="11-20">11 – 20 people</SelectItem>
                <SelectItem value="21-30">21 – 30 people</SelectItem>
                <SelectItem value="30+">30+ people</SelectItem>
              </Select>
            )}
          />
          <Controller
            name="preferredMonth"
            control={control}
            render={({ field }) => (
              <Select
                label="Preferred Month"
                required
                error={errors.preferredMonth?.message}
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                placeholder="When works best?"
              >
                {MONTHS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                ))}
              </Select>
            )}
          />
        </div>
      </div>

      {/* Optional fields */}
      <details className="group">
        <summary className="font-mono text-xs uppercase tracking-widest text-muted cursor-pointer select-none hover:text-charcoal transition-colors duration-150">
          Optional details
        </summary>
        <div className="mt-4 space-y-4">
          <Controller
            name="goals"
            control={control}
            render={({ field }) => (
              <Textarea
                {...field}
                label="Goals for the retreat"
                error={errors.goals?.message}
                helper="What do you hope the team leaves with? (optional, max 500 characters)"
                rows={3}
              />
            )}
          />
          <Controller
            name="source"
            control={control}
            render={({ field }) => (
              <RadioGroup
                label="How did you hear about us?"
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                error={errors.source?.message}
                options={SOURCE_OPTIONS}
              />
            )}
          />
        </div>
      </details>
    </FormSkeleton>
  );
}
