/**
 * RegistrationForm — 3-step universal registration wizard (FORM-02).
 *
 * Step 1: Personal details (pre-filled via RegistrationStep1 URL-param handler)
 * Step 2: Program + batch + plan selection (skipped if both locked from URL)
 * Step 3: Final details + coupon + order summary + Razorpay checkout
 *
 * Session persistence: form state is saved to sessionStorage keyed by program
 * on every change and restored on mount. Cleared on successful payment redirect.
 *
 * Razorpay checkout:
 *   - openCheckout() is called ONLY when the form submits (Step 3 Pay button).
 *   - If Razorpay keys are missing, an inline error is shown on the Pay button.
 *   - A full-screen "One moment — opening Razorpay…" modal prevents duplicate clicks.
 *
 * T-05-13: The Razorpay onSuccess callback is UX-only. We call POST /payments/verify
 * for the redirect but NEVER update registration.paymentStatus from the client.
 * The webhook is authoritative.
 *
 * ARCHITECTURE.md §9.2 + RESEARCH Pattern 6 + Pitfall 3 + T-05-16.
 * CONSTRAINT-CODE-004: No animations on form pages.
 */
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { registrationCreateSchema } from '@dnyanpith/validators';

// Strip internal display-only fields (_couponPreview, _baseAmount) before
// Zod validates — registrationCreateSchema uses z.strictObject which rejects unknown keys.
const clientRegistrationSchema = z.preprocess(
  (d) => {
    if (typeof d !== 'object' || !d) return d;
    return Object.fromEntries(Object.entries(d).filter(([k]) => !k.startsWith('_')));
  },
  registrationCreateSchema
);
import { apiClient } from '../../api/client.js';
import { openCheckout } from '../../lib/razorpay.js';
import { ProgressIndicator } from './ProgressIndicator.jsx';
import { RegistrationStep1 } from './RegistrationStep1.jsx';
import { StepPersonal } from './StepPersonal.jsx';
import { StepProgram } from './StepProgram.jsx';
import { StepFinalAndPay } from './StepFinalAndPay.jsx';
import { Spinner } from '../ui/Spinner.jsx';

// Fields validated at each step before advancing
const STEP_FIELDS = {
  1: ['regType', 'partner2Name', 'fullName', 'email', 'phone', 'city', 'state'],
  2: ['program', 'batchId', 'plan'],
  3: ['age', 'occupation', 'dietaryNote', 'couponCode', 'consent'],
};

// Session storage key prefix
const SS_KEY = (program) => `reg-${program ?? 'default'}`;

export function RegistrationForm({ initialProgram }) {
  const navigate = useNavigate();
  const [step, setStep]                 = useState(1);
  const [programLocked, setProgramLocked] = useState(!!initialProgram);
  const [step2Skipped, setStep2Skipped] = useState(false);
  const [razorpayLoading, setRazorpayLoading] = useState(false);

  const methods = useForm({
    resolver: zodResolver(clientRegistrationSchema),
    defaultValues: {
      program:  initialProgram?.toUpperCase() ?? 'BADLAAV',
      regType:  'INDIVIDUAL',
      consent:  false,
    },
    mode: 'onBlur',
  });

  const { handleSubmit, trigger, watch, setValue, setError, formState: { isSubmitting } } = methods;
  const program = watch('program');

  // ── Restore from sessionStorage on mount ───────────────────────────────────
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(SS_KEY(program));
      if (saved) {
        const parsed = JSON.parse(saved);
        // Only restore safe fields — not payment or internal state
        const safeFields = ['fullName', 'email', 'phone', 'city', 'state', 'age', 'occupation', 'dietaryNote'];
        safeFields.forEach((f) => {
          if (parsed[f] != null) setValue(f, parsed[f], { shouldValidate: false });
        });
      }
    } catch {
      // SessionStorage read failure is non-fatal
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Persist to sessionStorage on field changes ──────────────────────────────
  useEffect(() => {
    const subscription = methods.watch((values) => {
      try {
        const { consent, _couponPreview, _baseAmount, ...persistable } = values;
        sessionStorage.setItem(SS_KEY(values.program), JSON.stringify(persistable));
      } catch {
        // Non-fatal
      }
    });
    return () => subscription.unsubscribe();
  }, [methods]);

  // ── Advance step with validation ────────────────────────────────────────────
  const next = useCallback(async () => {
    const fieldsToValidate = STEP_FIELDS[step] ?? [];
    const valid = await trigger(fieldsToValidate);
    if (!valid) return;

    if (step === 1 && step2Skipped) {
      // Skip Step 2 entirely (Mission Udaan handoff with program + plan locked)
      setStep(3);
    } else {
      setStep((s) => Math.min(s + 1, 3));
    }
  }, [step, step2Skipped, trigger]);

  const back = useCallback(() => {
    if (step === 3 && step2Skipped) {
      setStep(1);
    } else {
      setStep((s) => Math.max(s - 1, 1));
    }
  }, [step, step2Skipped]);

  // ── Form submission → Razorpay checkout ────────────────────────────────────
  const onSubmit = handleSubmit(async (data) => {
    setRazorpayLoading(true);
    try {
      // Strip internal display-only fields before sending to backend
      const { _couponPreview: _cp, _baseAmount: _ba, ...payload } = data;
      // POST /api/v1/registrations — creates DB row + Razorpay order
      const res = await apiClient.post('/registrations', payload);
      const { registrationId, razorpayOrderId, amount, key } = res.data;

      // Open Razorpay checkout
      openCheckout({
        key,
        amount:         Math.round(amount * 100), // paise
        orderId:        razorpayOrderId,
        registrationId,
        userName:       data.fullName,
        userEmail:      data.email,
        userPhone:      data.phone,
        onSuccess: async (rzpResponse) => {
          // T-05-13: UX-only callback — NEVER trust this for payment state
          try {
            await apiClient.post('/payments/verify', {
              razorpay_order_id:   rzpResponse.razorpay_order_id,
              razorpay_payment_id: rzpResponse.razorpay_payment_id,
              razorpay_signature:  rzpResponse.razorpay_signature,
              registrationId,
            });
          } catch {
            // Verify call failure is non-fatal — webhook is authoritative
          }
          // Clear persisted form state
          sessionStorage.removeItem(SS_KEY(data.program));
          navigate(`/payment-success?reg=${registrationId}`);
        },
        onDismiss: () => {
          setRazorpayLoading(false);
          // User closed modal — registration stays PENDING; cron will remind at 15 min
        },
      });
    } catch (err) {
      setRazorpayLoading(false);

      // Graceful error handling — never crash, never alert()
      if (err.message?.includes('Razorpay not configured') ||
          err.message?.includes('checkout script not loaded')) {
        setError('root', { message: err.message });
        return;
      }

      if (err.response?.status === 409) {
        // Issue 1 FIX: duplicate registration — already PAID or PENDING checkout re-opened
        const serverMsg = err.response.data?.message;
        setError('root', {
          message: serverMsg ?? 'You are already registered for this batch. Check your email for the confirmation.',
        });
      } else if (err.response?.status === 400 && Array.isArray(err.response.data?.errors)) {
        err.response.data.errors.forEach((e) => {
          setError(e.field || 'root', { message: e.message });
        });
      } else if (err.response?.status === 429) {
        setError('root', { message: 'Too many attempts. Try again later.' });
      } else {
        setError('root', {
          message: "Couldn't reach our server. Check your connection and try again.",
        });
      }
    }
  });

  return (
    <FormProvider {...methods}>
      {/* Razorpay loading overlay — prevents duplicate clicks */}
      {razorpayLoading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-ink/80">
          <Spinner size={40} className="text-gold" />
          <p className="mt-4 font-sans text-pearl text-sm">One moment — opening Razorpay…</p>
        </div>
      )}

      <div className="max-w-[--container-narrow] mx-auto px-4 py-10">
        <ProgressIndicator step={step} total={step2Skipped ? 2 : 3} />

        {/* Heading */}
        <h1 className="font-display text-3xl font-light text-charcoal mb-8 text-center">
          {step === 1 && 'Your details'}
          {step === 2 && 'Program & plan'}
          {step === 3 && 'Review & pay'}
        </h1>

        <form onSubmit={onSubmit} noValidate>
          {step === 1 && (
            <RegistrationStep1
              onProgramLocked={setProgramLocked}
              onSkipStep2={setStep2Skipped}
            >
              <StepPersonal onNext={next} />
            </RegistrationStep1>
          )}

          {step === 2 && (
            <StepProgram
              onNext={next}
              onBack={back}
              programLocked={programLocked}
            />
          )}

          {step === 3 && (
            <StepFinalAndPay
              onBack={back}
              onSubmit={onSubmit}
              isSubmitting={isSubmitting || razorpayLoading}
            />
          )}
        </form>
      </div>
    </FormProvider>
  );
}
