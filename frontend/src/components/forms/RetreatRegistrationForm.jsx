/**
 * RetreatRegistrationForm — the deep 5-step questionnaire + payment for The Retreat.
 *
 * Step 1 Personal info · 2 Current life state · 3 Self-assessment ·
 * 4 Energy & commitment · 5 Review & pay.
 *
 * Identity + plan/batch/consent live in RHF (validated by the shared schema).
 * The psychographic answers live in local state and ship as a `questionnaire`
 * JSON blob alongside the registration. Payment reuses the existing Razorpay flow.
 *
 * Wave-1 note: Individual/Couple pay in full via Razorpay; Corporate plans route to
 * an enquiry (quoted). 50%-advance and partial links are handled by admin in Wave 2.
 * CONSTRAINT-CODE-004: no animations on form pages.
 */
import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { registrationCreateSchema } from '@dnyanpith/validators';
import { apiClient } from '../../api/client.js';
import { openCheckout } from '../../lib/razorpay.js';
import { ProgressIndicator } from './ProgressIndicator.jsx';
import { FormField } from '../ui/FormField.jsx';
import { ChoiceField } from './ChoiceField.jsx';
import { SliderField } from './SliderField.jsx';
import { Button } from '../ui/Button.jsx';
import { Spinner } from '../ui/Spinner.jsx';
import {
  MARITAL_OPTIONS, PROFESSION_OPTIONS, LIFE_STATE_QUESTIONS, HEALTH_OPTIONS,
  SUCCESS_OPTIONS, HUNGER_OPTIONS, BADLAAV_OPTIONS, FREQUENCY_OPTIONS,
  COMMITMENT_LEVEL_OPTIONS, COMMITMENT_CONFIRM, RETREAT_PLANS,
} from '../../lib/retreatQuestions.js';

// registrationCreateSchema is strict; strip display-only _fields before validating.
const clientRegistrationSchema = z.preprocess((d) => {
  if (typeof d !== 'object' || !d) return d;
  return Object.fromEntries(Object.entries(d).filter(([k]) => !k.startsWith('_')));
}, registrationCreateSchema);

const STEP_TITLES = [
  'Personal information',
  'Current life state',
  'Self-assessment',
  'Energy & commitment',
  'Review & pay',
];

function fmtRange(start, end) {
  try {
    const o = { day: 'numeric', month: 'short' };
    return `${new Date(start).toLocaleDateString('en-IN', o)} – ${new Date(end).toLocaleDateString('en-IN', { ...o, year: 'numeric' })}`;
  } catch {
    return '';
  }
}

export function RetreatRegistrationForm({ program = 'BADLAAV', programLabel = 'The Retreat' }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({});
  const [localErrors, setLocalErrors] = useState({});
  const [batches, setBatches] = useState([]);
  const [razorpayLoading, setRazorpayLoading] = useState(false);

  const methods = useForm({
    resolver: zodResolver(clientRegistrationSchema),
    defaultValues: { program, regType: 'INDIVIDUAL', plan: 'INDIVIDUAL', consent: false },
    mode: 'onBlur',
  });
  const { handleSubmit, trigger, register, setValue, setError, watch, formState: { errors } } = methods;

  const plan = watch('plan');
  const batchId = watch('batchId');
  const consent = watch('consent');
  const set = (k, v) => setAnswers((a) => ({ ...a, [k]: v }));

  useEffect(() => {
    apiClient
      .get('/batches')
      .then(({ data }) => {
        const list = Array.isArray(data) ? data : data?.batches ?? data?.data ?? [];
        setBatches(
          list.filter(
            (b) => String(b.program).toUpperCase() === program && String(b.status).toUpperCase() === 'OPEN',
          ),
        );
      })
      .catch(() => setBatches([]));
  }, [program]);

  // Pre-fill plan from the pricing page (?plan=individual) and batch from a CTA (?batch=ID).
  useEffect(() => {
    const p = searchParams.get('plan');
    if (p) {
      const match = RETREAT_PLANS.find((x) => x.value === p.toUpperCase());
      if (match) { setValue('plan', match.value); setValue('regType', match.regType); }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const b = searchParams.get('batch');
    if (b && batches.some((x) => x.id === b)) setValue('batchId', b);
  }, [batches]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectedPlan = RETREAT_PLANS.find((p) => p.value === plan) ?? RETREAT_PLANS[0];
  const selectedBatch = batches.find((b) => b.id === batchId);
  const price = selectedBatch
    ? plan === 'COUPLE'
      ? Number(selectedBatch.priceCouple ?? selectedBatch.priceIndividual)
      : Number(selectedBatch.priceIndividual)
    : null;

  function choosePlan(value) {
    const p = RETREAT_PLANS.find((x) => x.value === value);
    setValue('plan', value);
    setValue('regType', p?.regType ?? 'INDIVIDUAL');
  }

  async function validateStep() {
    const e = {};
    if (step === 1) {
      const ok = await trigger(['fullName', 'email', 'phone', 'city']);
      if (!answers.dob) e.dob = 'Date of birth is required.';
      if (!answers.maritalStatus) e.maritalStatus = 'Select one.';
      if (!answers.profession) e.profession = 'Select one.';
      if (!answers.emergencyName) e.emergencyName = 'Emergency contact name is required.';
      if (!answers.emergencyPhone) e.emergencyPhone = 'Emergency contact number is required.';
      setLocalErrors(e);
      return ok && Object.keys(e).length === 0;
    }
    if (step === 2) {
      LIFE_STATE_QUESTIONS.forEach((q) => { if (!answers[q.key]) e[q.key] = 'Pick one.'; });
    } else if (step === 3) {
      if (!answers.potential) e.potential = 'Move the slider.';
      if (!answers.health) e.health = 'Pick one.';
      if (answers.health && answers.health !== 'None' && !answers.healthDetails) e.healthDetails = 'Please add a few details.';
      if (!answers.success) e.success = 'Pick one.';
      if (!answers.hunger) e.hunger = 'Pick one.';
      if (!answers.badlaav) e.badlaav = 'Pick one.';
      if (!answers.commitmentScale) e.commitmentScale = 'Move the slider.';
    } else if (step === 4) {
      if (!answers.frequency) e.frequency = 'Pick one.';
      if (!answers.commitmentLevel) e.commitmentLevel = 'Pick one.';
      if (!answers.commitmentConfirm) e.commitmentConfirm = 'Please confirm to continue.';
    }
    setLocalErrors(e);
    return Object.keys(e).length === 0;
  }

  async function next() {
    if (await validateStep()) setStep((s) => Math.min(s + 1, 5));
  }
  const back = () => setStep((s) => Math.max(s - 1, 1));

  const onSubmit = handleSubmit(async (data) => {
    setRazorpayLoading(true);
    try {
      const questionnaire = {
        personal: {
          dob: answers.dob, maritalStatus: answers.maritalStatus, company: answers.company ?? null,
          profession: answers.profession, emergencyName: answers.emergencyName,
          emergencyPhone: answers.emergencyPhone, emergencyRelation: answers.emergencyRelation ?? null,
        },
        lifeState: {
          energyNow: answers.energyNow, visionClarity: answers.visionClarity,
          meditation: answers.meditation, baggage: answers.baggage,
        },
        selfAssessment: {
          potential: answers.potential, health: answers.health, success: answers.success,
          hunger: answers.hunger, badlaav: answers.badlaav, commitmentScale: answers.commitmentScale,
        },
        energy: {
          frequency: answers.frequency, commitmentLevel: answers.commitmentLevel,
          commitmentConfirm: !!answers.commitmentConfirm,
        },
      };
      const { _b, ...rest } = data;
      const payload = { ...rest, dietaryNote: answers.healthDetails ?? null, questionnaire };

      const res = await apiClient.post('/registrations', payload);
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
          } catch { /* webhook is authoritative */ }
          navigate(`/payment-success?reg=${registrationId}`);
        },
        onDismiss: () => setRazorpayLoading(false),
      });
    } catch (err) {
      setRazorpayLoading(false);
      if (err.message?.includes('Razorpay')) { setError('root', { message: err.message }); return; }
      if (err.response?.status === 409) {
        setError('root', { message: err.response.data?.message ?? 'You are already registered for this batch.' });
      } else if (err.response?.status === 400 && Array.isArray(err.response.data?.errors)) {
        err.response.data.errors.forEach((e) => setError(e.field || 'root', { message: e.message }));
      } else if (err.response?.status === 429) {
        setError('root', { message: 'Too many attempts. Try again later.' });
      } else {
        setError('root', { message: "Couldn't reach our server. Check your connection and try again." });
      }
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
        <ProgressIndicator step={step} total={5} />
        <p className="font-mono text-xs uppercase tracking-widest text-ochre text-center mt-6 mb-1">{programLabel}</p>
        <h1 className="font-display text-3xl font-semibold text-ink mb-8 text-center">{STEP_TITLES[step - 1]}</h1>

        <form onSubmit={onSubmit} noValidate className="space-y-6">
          {/* STEP 1 — Personal */}
          {step === 1 && (
            <div className="space-y-5">
              <FormField name="fullName" label="Full name" required />
              <div>
                <label className="block font-sans text-sm text-charcoal mb-1">Date of birth <span className="text-ochre">*</span></label>
                <input type="date" value={answers.dob ?? ''} onChange={(e) => set('dob', e.target.value)}
                  className="w-full rounded-lg border border-charcoal/20 bg-pearl px-3 py-2.5 font-sans text-sm" />
                {localErrors.dob && <p className="text-danger text-xs mt-1">{localErrors.dob}</p>}
              </div>
              <ChoiceField question="Marital status" options={MARITAL_OPTIONS} value={answers.maritalStatus}
                onChange={(v) => set('maritalStatus', v)} required columns={2} error={localErrors.maritalStatus} />
              <FormField name="email" label="Email" type="email" required />
              <FormField name="phone" label="WhatsApp number" type="tel" required />
              <FormField name="city" label="City / town you’re travelling from" required />
              <div>
                <label className="block font-sans text-sm text-charcoal mb-1">Company / organisation</label>
                <input value={answers.company ?? ''} onChange={(e) => set('company', e.target.value)}
                  className="w-full rounded-lg border border-charcoal/20 bg-pearl px-3 py-2.5 font-sans text-sm" />
              </div>
              <ChoiceField question="Current profession / role" options={PROFESSION_OPTIONS} value={answers.profession}
                onChange={(v) => set('profession', v)} required error={localErrors.profession} />
              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-sans text-sm text-charcoal mb-1">Emergency name <span className="text-ochre">*</span></label>
                  <input value={answers.emergencyName ?? ''} onChange={(e) => set('emergencyName', e.target.value)}
                    className="w-full rounded-lg border border-charcoal/20 bg-pearl px-3 py-2.5 font-sans text-sm" />
                  {localErrors.emergencyName && <p className="text-danger text-xs mt-1">{localErrors.emergencyName}</p>}
                </div>
                <div>
                  <label className="block font-sans text-sm text-charcoal mb-1">Emergency number <span className="text-ochre">*</span></label>
                  <input value={answers.emergencyPhone ?? ''} onChange={(e) => set('emergencyPhone', e.target.value)}
                    className="w-full rounded-lg border border-charcoal/20 bg-pearl px-3 py-2.5 font-sans text-sm" />
                  {localErrors.emergencyPhone && <p className="text-danger text-xs mt-1">{localErrors.emergencyPhone}</p>}
                </div>
                <div>
                  <label className="block font-sans text-sm text-charcoal mb-1">Relationship</label>
                  <input value={answers.emergencyRelation ?? ''} onChange={(e) => set('emergencyRelation', e.target.value)}
                    className="w-full rounded-lg border border-charcoal/20 bg-pearl px-3 py-2.5 font-sans text-sm" />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 — Current life state */}
          {step === 2 && (
            <div className="space-y-7">
              {LIFE_STATE_QUESTIONS.map((q) => (
                <ChoiceField key={q.key} question={q.question} options={q.options}
                  value={answers[q.key]} onChange={(v) => set(q.key, v)} required error={localErrors[q.key]} />
              ))}
            </div>
          )}

          {/* STEP 3 — Self-assessment */}
          {step === 3 && (
            <div className="space-y-7">
              <SliderField question="How much of your true potential are you using right now?"
                value={answers.potential} onChange={(v) => set('potential', v)}
                minLabel="1 · Barely surviving" maxLabel="10 · Crushing it" required error={localErrors.potential} />
              <ChoiceField question="Any health conditions or dietary requirements?" options={HEALTH_OPTIONS}
                value={answers.health} onChange={(v) => set('health', v)} required error={localErrors.health} />
              {answers.health && answers.health !== 'None' && (
                <div>
                  <label className="block font-sans text-sm text-charcoal mb-1">Please provide details <span className="text-ochre">*</span></label>
                  <textarea rows={3} value={answers.healthDetails ?? ''} onChange={(e) => set('healthDetails', e.target.value)}
                    className="w-full rounded-lg border border-charcoal/20 bg-pearl px-3 py-2.5 font-sans text-sm" />
                  {localErrors.healthDetails && <p className="text-danger text-xs mt-1">{localErrors.healthDetails}</p>}
                </div>
              )}
              <ChoiceField question="If December 2026 was a massive success, your biggest achievement would be…"
                options={SUCCESS_OPTIONS} value={answers.success} onChange={(v) => set('success', v)} required error={localErrors.success} />
              <ChoiceField question="What is your deepest hunger right now?" options={HUNGER_OPTIONS}
                value={answers.hunger} onChange={(v) => set('hunger', v)} required columns={2} error={localErrors.hunger} />
              <ChoiceField question="The #1 Badlaav you want to take home" options={BADLAAV_OPTIONS}
                value={answers.badlaav} onChange={(v) => set('badlaav', v)} required columns={2} error={localErrors.badlaav} />
              <SliderField question="Commitment scale" value={answers.commitmentScale} onChange={(v) => set('commitmentScale', v)}
                minLabel="1 · Not ready" maxLabel="10 · Fully committed" required error={localErrors.commitmentScale} />
            </div>
          )}

          {/* STEP 4 — Energy & commitment */}
          {step === 4 && (
            <div className="space-y-7">
              <ChoiceField question="Which frequency best represents your average daily energy?"
                options={FREQUENCY_OPTIONS} value={answers.frequency} onChange={(v) => set('frequency', v)} required columns={2} error={localErrors.frequency} />
              <ChoiceField question="What is your commitment level for this retreat?" options={COMMITMENT_LEVEL_OPTIONS}
                value={answers.commitmentLevel} onChange={(v) => set('commitmentLevel', v)} required columns={2} error={localErrors.commitmentLevel} />
              <label className="flex items-start gap-3 rounded-xl border border-charcoal/15 bg-pearl p-4 cursor-pointer">
                <input type="checkbox" checked={!!answers.commitmentConfirm} onChange={(e) => set('commitmentConfirm', e.target.checked)}
                  className="mt-1 accent-ochre w-4 h-4" />
                <span className="font-sans text-sm text-charcoal">{COMMITMENT_CONFIRM}</span>
              </label>
              {localErrors.commitmentConfirm && <p className="text-danger text-xs">{localErrors.commitmentConfirm}</p>}
            </div>
          )}

          {/* STEP 5 — Review & pay */}
          {step === 5 && (
            <div className="space-y-6">
              <div>
                <p className="font-sans text-charcoal font-medium mb-3">Choose your plan <span className="text-ochre">*</span></p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {RETREAT_PLANS.map((p) => {
                    const sel = plan === p.value;
                    return (
                      <button type="button" key={p.value} onClick={() => choosePlan(p.value)} aria-pressed={sel}
                        className={`text-left rounded-xl border p-4 transition-colors ${sel ? 'border-ochre bg-ochre/10 ring-1 ring-ochre' : 'border-charcoal/15 bg-pearl hover:border-ochre/50'}`}>
                        <p className="font-display font-semibold text-ink">{p.label}</p>
                        <p className="font-sans text-xs text-charcoal/70 mt-1">{p.note}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {selectedPlan.paid ? (
                <>
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
                                <span className="font-display font-semibold text-ink block">{b.name || programLabel}</span>
                                <span className="font-sans text-xs text-charcoal/70">{fmtRange(b.startDate, b.endDate)}{b.venue ? ` · ${b.venue}` : ''}</span>
                              </span>
                              <span className="font-display text-lg font-semibold text-ink">
                                ₹{Number(plan === 'COUPLE' ? (b.priceCouple ?? b.priceIndividual) : b.priceIndividual).toLocaleString('en-IN')}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="rounded-xl border border-charcoal/15 bg-pearl p-5 text-center">
                        <p className="font-sans text-sm text-charcoal/80">Dates announced soon. <Link to="/contact" className="text-teal underline">Tell us you’re interested</Link> and we’ll hold you a seat.</p>
                      </div>
                    )}
                  </div>

                  {price != null && (
                    <div className="rounded-2xl border border-charcoal/10 bg-soft p-5 flex justify-between items-center">
                      <span className="font-sans text-sm text-charcoal">Total</span>
                      <span className="font-display text-2xl font-semibold text-ink">₹{price.toLocaleString('en-IN')}</span>
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
                </>
              ) : (
                <div className="rounded-2xl border border-charcoal/10 bg-soft p-6 text-center space-y-4">
                  <p className="font-sans text-charcoal leading-body">
                    Corporate batches are quoted to fit your team and invoiced directly. Tell us about your group and Arjun will send a proposal.
                  </p>
                  <Link to="/contact" className="inline-flex items-center justify-center rounded-full font-sans font-semibold bg-ochre text-on-ochre hover:bg-ochre/90 px-7 py-3.5 shadow-sm hover:shadow-md transition-all">
                    Request a quote
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 pt-2">
            {step > 1 && (
              <Button type="button" variant="secondary" onClick={back}>Back</Button>
            )}
            {step < 5 && (
              <Button type="button" onClick={next} className="ml-auto">Continue</Button>
            )}
          </div>
        </form>
      </div>
    </FormProvider>
  );
}
