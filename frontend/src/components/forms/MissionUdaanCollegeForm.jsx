/**
 * MissionUdaanCollegeForm — FORM-06.
 * Embedded in /join-us?tab=college.
 * POST /api/v1/enquiries/college → enquiries(COLLEGE)
 * Success: SuccessCard about MOU.
 * NO inline styles. No alert(). No animations.
 */
import { useState } from 'react';
import { Controller } from 'react-hook-form';
import { collegeAssociationSchema } from '@validators/enquiries.js';
import { useFormSubmit } from './useFormSubmit.js';
import { FormSkeleton } from './FormSkeleton.jsx';
import { FormField } from '../ui/FormField.jsx';
import { Select, SelectItem } from '../ui/Select.jsx';
import { Textarea } from '../ui/Textarea.jsx';
import { Checkbox } from '../ui/Checkbox.jsx';
import { SuccessCard } from '../ui/SuccessCard.jsx';
import { MH_DISTRICTS } from '../../lib/constants.js';

export function MissionUdaanCollegeForm() {
  const [successData, setSuccessData] = useState(null);

  const { methods, submit } = useFormSubmit({
    schema: collegeAssociationSchema,
    endpoint: '/enquiries/college',
    onSuccess: (data) => setSuccessData(data),
    // Issue 3/7 FIX: 409 DUPLICATE_ENQUIRY → show success card
    onDuplicate: () => setSuccessData({ duplicate: true }),
  });

  const { control, formState: { errors } } = methods;

  if (successData) {
    return (
      <SuccessCard
        accent="gold"
        title="Got it. Expect an MOU draft soon."
        body="We'll email the MOU template to the official email above within two business days."
        secondaryAction={{ label: '← Back to Mission Udaan', href: '/mission-udaan' }}
      />
    );
  }

  return (
    <FormSkeleton
      methods={methods}
      onSubmit={submit}
      eyebrow="College Association"
      title="Partner with Dnyanpith"
      primaryCta="Send Association Request"
      primaryCtaPending="Sending..."
    >
      {/* College details */}
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-muted mb-4">Institution</p>
        <div className="space-y-4">
          <FormField name="collegeName" label="College Name" required />
          <Controller
            name="district"
            control={control}
            render={({ field }) => (
              <Select
                label="District"
                required
                error={errors.district?.message}
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
        </div>
      </div>

      {/* Contact details */}
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-muted mb-4">Contact</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField name="principalName" label="Principal / Coordinator Name" required />
          <FormField name="officialEmail" label="Official Email" type="email" required />
          <FormField name="officialPhone" label="Official Phone" type="tel" required helper="10 digits, starting with 6-9" />
          <FormField
            name="finalYearStudents"
            label="Final-Year Students"
            type="number"
            required
            helper="Approximate number of final-year students."
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
            name="hasPlacementCell"
            control={control}
            render={({ field }) => (
              <Checkbox
                id="hasPlacementCell"
                name={field.name}
                label="Our college has an active placement cell"
                checked={!!field.value}
                onCheckedChange={field.onChange}
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
                error={errors.message?.message}
                helper="Anything you'd like us to know before the MOU discussion. (optional, max 500 characters)"
                rows={3}
              />
            )}
          />
        </div>
      </details>
    </FormSkeleton>
  );
}
