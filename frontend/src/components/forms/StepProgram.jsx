/**
 * StepProgram — Step 2 of the Registration wizard.
 *
 * - If program is already locked (arrived from FORM-05 URL params or pre-selected),
 *   shows a read-only program chip and skips program selection.
 * - Batch dropdown: fetches GET /api/v1/batches?program=X&hasSeats=true on mount.
 * - Plan selection: depends on regType (INDIVIDUAL/COUPLE/CORPORATE).
 * - Price display: read-only from selected batch row.
 *
 * If program === 'MISSION_UDAAN' and plan is already locked from URL params,
 * the entire step is skipped by the parent RegistrationForm.
 */
import { useEffect, useState } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { FormField } from '../ui/FormField.jsx';
import { Select, SelectItem } from '../ui/Select.jsx';
import { RadioGroup } from '../ui/RadioGroup.jsx';
import { Button } from '../ui/Button.jsx';
import { ErrorBanner } from '../ui/ErrorBanner.jsx';
import { Spinner } from '../ui/Spinner.jsx';
import { apiClient } from '../../api/client.js';

// Mission Udaan plan options
const MU_PLAN_OPTIONS = [
  { value: 'MONTHLY',   label: 'Monthly — ₹2,000/mo' },
  { value: 'QUARTERLY', label: 'Quarterly — ₹5,500' },
  { value: 'ANNUAL',    label: 'Annual — ₹20,000' },
];

const PROGRAM_LABELS = {
  BADLAAV:          'Badlaav Retreat',
  MISSION_UDAAN:    'Mission Udaan',
  FUTURE_READINESS: 'Future Readiness',
  ANTRANG:          'Antrang',
};

const PLAN_OPTIONS_FOR_REG_TYPE = {
  INDIVIDUAL: [{ value: 'INDIVIDUAL', label: 'Individual' }],
  COUPLE:     [{ value: 'COUPLE',     label: 'Couple' }],
  CORPORATE:  [{ value: 'CORPORATE',  label: 'Corporate Batch' }],
};

export function StepProgram({ onNext, onBack, programLocked }) {
  const {
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const program = watch('program');
  const regType = watch('regType');
  const batchId = watch('batchId');

  const [batches, setBatches]         = useState([]);
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchError, setBatchError]   = useState(null);

  // Fetch open batches for this program
  useEffect(() => {
    if (!program) return;
    // ANTRANG is a free community init — no paid batch
    if (program === 'ANTRANG') return;

    setBatchLoading(true);
    setBatchError(null);

    apiClient
      .get(`/batches?program=${program}&hasSeats=true`)
      .then((res) => {
        setBatches(res.data.batches ?? []);
      })
      .catch(() => {
        setBatchError('Could not load batch list. Check your connection.');
      })
      .finally(() => setBatchLoading(false));
  }, [program]);

  // Find the currently selected batch (for price display)
  const selectedBatch = batches.find((b) => b.id === batchId) ?? null;

  // Compute price for selected batch + regType
  const batchPrice = selectedBatch
    ? getPriceForRegType(selectedBatch, regType)
    : null;

  // Keep _baseAmount in sync so Step 3 order summary can read it
  useEffect(() => {
    setValue('_baseAmount', batchPrice ?? null, { shouldValidate: false });
  }, [batchPrice, setValue]);

  const planOptions =
    program === 'MISSION_UDAAN'
      ? MU_PLAN_OPTIONS
      : PLAN_OPTIONS_FOR_REG_TYPE[regType] ?? PLAN_OPTIONS_FOR_REG_TYPE.INDIVIDUAL;

  return (
    <div className="flex flex-col gap-5">
      {errors.root && <ErrorBanner message={errors.root.message} />}

      {/* Program chip (read-only when locked, selection when not) */}
      {programLocked ? (
        <div>
          <label className="font-mono text-[10px] uppercase tracking-widest text-muted block mb-1.5">
            Program
          </label>
          <span className="inline-block px-4 py-2 bg-navy text-pearl rounded text-sm font-medium">
            {PROGRAM_LABELS[program] ?? program}
          </span>
        </div>
      ) : (
        <FormField label="Program" error={errors.program?.message} required>
          <Controller
            name="program"
            control={control}
            render={({ field }) => (
              <RadioGroup
                name={field.name}
                options={Object.entries(PROGRAM_LABELS).map(([v, l]) => ({ value: v, label: l }))}
                value={field.value ?? ''}
                onChange={field.onChange}
              />
            )}
          />
        </FormField>
      )}

      {/* Batch dropdown (not for MU since MU billing is subscription-style) */}
      {program !== 'MISSION_UDAAN' && program !== 'ANTRANG' && (
        <FormField
          label="Batch"
          error={errors.batchId?.message}
          required
        >
          {batchLoading ? (
            <div className="flex items-center gap-2 text-muted text-sm py-2">
              <Spinner size={14} /> Loading batches…
            </div>
          ) : batchError ? (
            <p className="text-danger text-sm">{batchError}</p>
          ) : batches.length === 0 ? (
            <p className="text-muted text-sm">No open batches at the moment. Reach out on WhatsApp to be notified.</p>
          ) : (
            <Controller
              name="batchId"
              control={control}
              render={({ field }) => (
                <Select
                  name={field.name}
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  placeholder="Select a batch…"
                >
                  {batches.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name} — {formatDate(b.startDate)} ({b.seatsBooked}/{b.totalSeats} seats)
                    </SelectItem>
                  ))}
                </Select>
              )}
            />
          )}
        </FormField>
      )}

      {/* Plan selection */}
      <FormField label="Plan" error={errors.plan?.message} required>
        <Controller
          name="plan"
          control={control}
          render={({ field }) => (
            <RadioGroup
              name={field.name}
              options={planOptions}
              value={field.value ?? ''}
              onChange={field.onChange}
            />
          )}
        />
      </FormField>

      {/* Price display (read-only, from batch) */}
      {batchPrice != null && (
        <div className="bg-soft rounded p-4">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted mb-1">
            Registration fee
          </p>
          <p className="text-2xl font-display font-light text-charcoal">
            ₹{batchPrice.toLocaleString('en-IN')}
          </p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3 mt-2">
        <Button
          type="button"
          variant="ghost"
          onClick={onBack}
          className="flex-1"
        >
          Back
        </Button>
        <Button
          type="button"
          variant="primary"
          onClick={onNext}
          className="flex-1"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getPriceForRegType(batch, regType) {
  if (regType === 'COUPLE')    return Number(batch.priceCouple    ?? batch.priceIndividual);
  if (regType === 'CORPORATE') return Number(batch.priceCorporate ?? batch.priceIndividual);
  return Number(batch.priceIndividual);
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}
