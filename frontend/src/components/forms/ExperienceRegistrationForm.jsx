/**
 * ExperienceRegistrationForm — the lighter registration for The Badlaav Experience.
 * Single page: identity + batch + consent + pay. Reuses the Razorpay flow.
 *
 * Programme identity: "The Badlaav Experience" is stored under the (now-unused)
 * FUTURE_READINESS enum value to avoid an enum migration; the UI labels it Experience.
 */
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { registrationCreateSchema } from '@dnyanpith/validators';
import { apiClient } from '../../api/client.js';
import { openCheckout } from '../../lib/razorpay.js';
import { FormField } from '../ui/FormField.jsx';
import { CouponField } from './CouponField.jsx';
import { Button } from '../ui/Button.jsx';
import { Spinner } from '../ui/Spinner.jsx';

const OPTIONAL_BLANK_TO_NULL = ['state', 'age', 'occupation', 'dietaryNote', 'couponCode', 'partner2Name', 'batchId'];

const clientRegistrationSchema = z.preprocess((d) => {
  if (typeof d !== 'object' || !d) return d;
  const cleaned = Object.fromEntries(Object.entries(d).filter(([k]) => !k.startsWith('_')));
  for (const k of OPTIONAL_BLANK_TO_NULL) if (cleaned[k] === '') cleaned[k] = null;
  return cleaned;
}, registrationCreateSchema);

const PROGRAM = 'FUTURE_READINESS'; // labelled "The Badlaav Experience"

function fmtRange(start, end) {
  try {
    const o = { day: 'numeric', month: 'short' };
    return `${new Date(start).toLocaleDateString('en-IN', o)} – ${new Date(end).toLocaleDateString('en-IN', { ...o, year: 'numeric' })}`;
  } catch {
    return '';
  }
}

export function ExperienceRegistrationForm() {
  const navigate = useNavigate();
  const [batches, setBatches] = useState([]);
  const [razorpayLoading, setRazorpayLoading] = useState(false);
  const [couponApplied, setCouponApplied] = useState(null);

  const methods = useForm({
    resolver: zodResolver(clientRegistrationSchema),
    defaultValues: { program: PROGRAM, regType: 'INDIVIDUAL', plan: 'INDIVIDUAL', consent: false },
    mode: 'onBlur',
  });
  const { handleSubmit, register, setValue, setError, watch, formState: { errors } } = methods;
  const batchId = watch('batchId');
  const consent = watch('consent');

  useEffect(() => {
    apiClient
      .get('/batches')
      .then(({ data }) => {
        const list = Array.isArray(data) ? data : data?.batches ?? data?.data ?? [];
        setBatches(list.filter((b) => String(b.program).toUpperCase() === PROGRAM && String(b.status).toUpperCase() === 'OPEN'));
      })
      .catch(() => setBatches([]));
  }, []);

  // A coupon is validated against a specific price — drop it if the batch changes.
  useEffect(() => {
    if (couponApplied) { setCouponApplied(null); setValue('couponCode', null); }
  }, [batchId]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectedBatch = batches.find((b) => b.id === batchId);
  const price = selectedBatch ? Number(selectedBatch.priceIndividual) : null;

  const onSubmit = handleSubmit(async (data) => {
    setRazorpayLoading(true);
    try {
      const res = await apiClient.post('/registrations', data);
      if (res.data?.waitlisted) {
        navigate(`/payment-success?reg=${res.data.registrationId}&waitlist=1`);
        return;
      }
      const { registrationId, razorpayOrderId, amount, key } = res.data;
      openCheckout({
        key, amount: Math.round(amount * 100), orderId: razorpayOrderId, registrationId,
        userName: data.fullName, userEmail: data.email, userPhone: data.phone,
        onSuccess: async (r) => {
          try {
            await apiClient.post('/payments/verify', {
              razorpay_order_id: r.razorpay_order_id, razorpay_payment_id: r.razorpay_payment_id,
              razorpay_signature: r.razorpay_signature, registrationId,
            });
          } catch { /* webhook authoritative */ }
          navigate(`/payment-success?reg=${registrationId}`);
        },
        onDismiss: () => setRazorpayLoading(false),
      });
    } catch (err) {
      setRazorpayLoading(false);
      if (err.message?.includes('Razorpay')) { setError('root', { message: err.message }); return; }
      if (err.response?.status === 409) setError('root', { message: err.response.data?.message ?? 'You are already registered for this batch.' });
      else if (err.response?.status === 400 && Array.isArray(err.response.data?.errors)) err.response.data.errors.forEach((e) => setError(e.field || 'root', { message: e.message }));
      else if (err.response?.status === 429) setError('root', { message: 'Too many attempts. Try again later.' });
      else setError('root', { message: "Couldn't reach our server. Check your connection and try again." });
    }
  });

  const rootError = errors.root?.message;

  return (
    <FormProvider {...methods}>
      {razorpayLoading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-ink/80">
          <Spinner size={40} className="text-gold" />
          <p className="mt-4 font-sans text-pearl text-sm">One moment — opening Razorpay…</p>
        </div>
      )}

      <div className="max-w-[--container-narrow] mx-auto px-4 py-10">
        <p className="font-mono text-xs uppercase tracking-widest text-ochre text-center mb-1">The Badlaav Experience</p>
        <h1 className="font-display text-3xl font-semibold text-ink mb-8 text-center">Register</h1>

        <form onSubmit={onSubmit} noValidate className="space-y-5">
          <FormField name="fullName" label="Full name" required />
          <FormField name="email" label="Email" type="email" required />
          <FormField name="phone" label="WhatsApp number" type="tel" required />
          <FormField name="city" label="City / town" required />
          <div className="grid sm:grid-cols-2 gap-3">
            <FormField name="state" label="State (optional)" />
            <FormField name="age" label="Age (optional)" type="number" />
          </div>
          <FormField name="occupation" label="Profession (optional)" />

          <div>
            <p className="font-sans text-charcoal font-medium mb-3">Choose a batch <span className="text-ochre">*</span></p>
            {batches.length > 0 ? (
              <div className="space-y-2">
                {batches.map((b) => {
                  const sel = batchId === b.id;
                  return (
                    <button type="button" key={b.id} onClick={() => setValue('batchId', b.id)} aria-pressed={sel}
                      className={`w-full text-left rounded-xl border p-4 flex justify-between items-center transition-colors ${sel ? 'border-ochre bg-ochre/10 ring-1 ring-ochre' : 'border-charcoal/15 bg-pearl hover:border-ochre/50'}`}>
                      <span>
                        <span className="font-display font-semibold text-ink block">{b.name || 'The Badlaav Experience'}</span>
                        <span className="font-sans text-xs text-charcoal/70">{fmtRange(b.startDate, b.endDate)}{b.venue ? ` · ${b.venue}` : ''}</span>
                      </span>
                      <span className="font-display text-lg font-semibold text-ink">₹{Number(b.priceIndividual).toLocaleString('en-IN')}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-charcoal/15 bg-pearl p-5 text-center">
                <p className="font-sans text-sm text-charcoal/80">Dates announced soon. <Link to="/contact" className="text-teal underline">Tell us you’re interested</Link>.</p>
              </div>
            )}
          </div>

          <CouponField
            program={PROGRAM}
            amount={price}
            batchId={batchId}
            applied={couponApplied}
            disabled={price == null}
            onApply={(r) => { setValue('couponCode', r.code); setCouponApplied(r); }}
            onClear={() => { setValue('couponCode', null); setCouponApplied(null); }}
          />

          {price != null && (
            <div className="rounded-2xl border border-charcoal/10 bg-soft p-5">
              <div className="flex justify-between items-center">
                <span className="font-sans text-sm text-charcoal">Total</span>
                <span className="font-display text-2xl font-semibold text-ink">
                  ₹{(couponApplied ? couponApplied.finalAmount : price).toLocaleString('en-IN')}
                </span>
              </div>
              {couponApplied && (
                <p className="font-sans text-xs text-sage mt-1 text-right">
                  ₹{price.toLocaleString('en-IN')} − ₹{Number(couponApplied.discountAmount).toLocaleString('en-IN')} ({couponApplied.code})
                </p>
              )}
            </div>
          )}

          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" {...register('consent')} className="mt-1 accent-ochre w-4 h-4" />
            <span className="font-sans text-sm text-charcoal">
              I agree to Badlaav’s <Link to="/terms" className="text-teal underline underline-offset-2">terms and cancellation policy</Link>.
            </span>
          </label>
          {errors.consent && <p className="text-danger text-xs">{errors.consent.message}</p>}

          {rootError && <p className="text-danger text-sm bg-danger/10 rounded-lg px-4 py-3">{rootError}</p>}

          <Button type="submit" size="lg" className="w-full" loading={razorpayLoading} disabled={!batchId || !consent}>
            Proceed to payment
          </Button>
        </form>
      </div>
    </FormProvider>
  );
}
