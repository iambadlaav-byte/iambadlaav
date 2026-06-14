/**
 * useFormSubmit — shared form submit hook for Plan 04+ forms.
 *
 * Wraps RHF useForm with:
 * - zodResolver for client-side validation (schema shared with backend)
 * - axios POST to backend endpoint
 * - server-side field error mapping ({errors:[{field,message}]} → RHF setError)
 * - rate-limit (429) inline message
 * - network/5xx inline banner via root error
 * - hasSubmitted flag (Issue 7 FIX): prevents re-submission after success,
 *   even if the user manually navigates back within the same session
 *
 * @param {object}   opts
 * @param {import('zod').ZodSchema} opts.schema   - Zod schema (shared from @validators)
 * @param {string}   opts.endpoint                - API path e.g. '/enquiries/corporate'
 * @param {function} opts.onSuccess               - called with response.data on success
 * @param {function} [opts.onDuplicate]           - optional: called instead of showing an error
 *                                                  when the server returns 409. Receives response.data.
 *                                                  If omitted, a root error is shown instead.
 * @returns {{ methods, submit, isSubmitting, hasSubmitted }}
 */
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { apiClient } from '../../api/client.js';

/**
 * @param {{ schema: object, endpoint: string, onSuccess: function, onDuplicate?: function }} opts
 */
export function useFormSubmit({ schema, endpoint, onSuccess, onDuplicate }) {
  // Issue 7 FIX: track successful submission to block repeated submits.
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const methods = useForm({
    resolver: zodResolver(schema),
    mode: 'onBlur',
  });

  /**
   * submit — passed to FormSkeleton's onSubmit after RHF validation passes.
   * Data is already Zod-validated at this point.
   */
  async function submit(data) {
    // Guard: silently bail if already successfully submitted
    if (hasSubmitted) return;

    try {
      const res = await apiClient.post(endpoint, data);
      setHasSubmitted(true);
      onSuccess(res.data);
    } catch (e) {
      if (e.response?.status === 409) {
        // Duplicate submission detected by the server
        if (onDuplicate) {
          // Let the caller decide how to handle it (e.g. show the success card)
          onDuplicate(e.response.data);
        } else {
          methods.setError('root', {
            message: e.response.data?.message ?? 'Already submitted. We have your details.',
          });
        }
      } else if (e.response?.status === 400 && Array.isArray(e.response.data?.errors)) {
        // Map server-side Zod errors back to RHF fields
        e.response.data.errors.forEach((err) => {
          methods.setError(err.field || 'root', { message: err.message });
        });
      } else if (e.response?.status === 429) {
        methods.setError('root', {
          message: 'Too many attempts. Try again later.',
        });
      } else {
        // Network error or 5xx — backend may be down (expected during local preview)
        methods.setError('root', {
          message: "Couldn't reach our server. Check your connection and try again.",
        });
      }
    }
  }

  return {
    methods,
    submit,
    isSubmitting: methods.formState.isSubmitting,
    hasSubmitted,
  };
}
