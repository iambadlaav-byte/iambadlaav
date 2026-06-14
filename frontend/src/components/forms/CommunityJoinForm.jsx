/**
 * CommunityJoinForm — FORM-04. Single shared component for all 4 initiative variants.
 * Reads useParams().slug, resolves initiative from SLUG_TO_INITIATIVE map.
 * If slug is invalid, returns null (parent CommunitySubPage handles 404).
 * POST /api/v1/community/join → community_members table.
 * Success: SuccessCard with WhatsApp group link from API response.
 * NO inline styles. No alert(). No animations.
 */
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { communityJoinSchema, SLUG_TO_INITIATIVE, INITIATIVE_DISPLAY_NAMES } from '@validators/community.js';
import { useFormSubmit } from './useFormSubmit.js';
import { FormSkeleton } from './FormSkeleton.jsx';
import { FormField } from '../ui/FormField.jsx';
import { SuccessCard } from '../ui/SuccessCard.jsx';

export function CommunityJoinForm() {
  const { slug } = useParams();
  const initiative = SLUG_TO_INITIATIVE[slug];
  const initiativeName = INITIATIVE_DISPLAY_NAMES[initiative] || initiative;

  const [successData, setSuccessData] = useState(null);

  const { methods, submit } = useFormSubmit({
    schema: communityJoinSchema,
    endpoint: '/community/join',
    onSuccess: (data) => setSuccessData(data),
    // Issue 2/7 FIX: 409 ALREADY_JOINED → treat as success; show the group link
    onDuplicate: (data) => setSuccessData(data),
  });

  // If slug doesn't map to a known initiative, render nothing — parent handles 404
  if (!initiative) return null;

  // Pre-fill the hidden initiative field on mount
  const defaultValues = { initiative };

  if (successData) {
    return (
      <SuccessCard
        accent="ochre"
        title="You're in."
        body={`We'll add you to the ${initiativeName} WhatsApp group within 24 hours.`}
        primaryAction={{
          label: 'Open WhatsApp Group',
          href: successData.whatsappGroupUrl,
        }}
      />
    );
  }

  return (
    <FormSkeleton
      methods={methods}
      onSubmit={(data) => submit({ ...data, initiative })}
      eyebrow={initiativeName}
      title="Join the circle"
      primaryCta="Join the Circle"
      primaryCtaPending="Joining..."
    >
      {/* 3 required visible fields per ARCH §9.4 low-friction design */}
      <div className="space-y-4">
        <FormField name="name" label="Full Name" required />
        <FormField
          name="whatsapp"
          label="WhatsApp Number"
          type="tel"
          required
          helper="We'll add you to the WhatsApp group via this number."
        />
        <FormField name="city" label="City" required />
      </div>

      {/* Optional fields */}
      <details className="group">
        <summary className="font-mono text-xs uppercase tracking-widest text-muted cursor-pointer select-none hover:text-charcoal transition-colors duration-150">
          Optional details
        </summary>
        <div className="mt-4 space-y-4">
          <FormField
            name="email"
            label="Email"
            type="email"
            helper="For occasional updates about the circle. (optional)"
          />
          <FormField
            name="occupation"
            label="Occupation"
            helper="Helps us understand who joins. (optional)"
          />
        </div>
      </details>
    </FormSkeleton>
  );
}
