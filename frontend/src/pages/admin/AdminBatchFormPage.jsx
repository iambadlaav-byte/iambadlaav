/**
 * AdminBatchFormPage — /admin/batches/new and /admin/batches/:id/edit
 *
 * Same component serves both create and edit. On mount in edit mode it loads
 * the batch row via the list endpoint (no GET-by-id is exposed); we filter the
 * list result by id.
 *
 * Uses the shared @dnyanpith/validators batchCreateSchema / batchUpdateSchema
 * so client validation matches what the server enforces.
 */
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { batchCreateSchema } from '@dnyanpith/validators';
import { ArrowLeft } from 'lucide-react';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { ErrorBanner } from '../../components/ui/ErrorBanner.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { useToast } from '../../components/ui/Toast.jsx';
import { listBatches, createBatch, updateBatch } from '../../api/admin.js';
import { MAP_LINK, CONTACT_ADDRESS } from '../../lib/constants.js';

// Repurposed enum values → live programme labels (see Phase F notes).
const PROGRAM_OPTIONS = [
  { value: 'BADLAAV',          label: 'The Retreat' },
  { value: 'FUTURE_READINESS', label: 'The Badlaav Experience' },
  { value: 'MISSION_UDAAN',    label: 'Future programme 1' },
  { value: 'ANTRANG',          label: 'Future programme 2' },
];
const STATUS_OPTIONS = ['OPEN', 'FULL', 'CLOSED', 'PAST'];

// Normalise YYYY-MM-DD inputs so the schema's z.coerce.date() accepts them.
function toDateInputValue(iso) {
  if (!iso) return '';
  return new Date(iso).toISOString().slice(0, 10);
}

// RHF setValueAs helper — empty input becomes undefined (optional-friendly),
// non-empty becomes a Number. Avoids the NaN-from-valueAsNumber footgun
// that breaks Zod's .coerce.number().int().optional() for optional fields.
function emptyToUndefinedNumber(v) {
  if (v === '' || v == null) return undefined;
  const n = Number(v);
  return Number.isNaN(n) ? undefined : n;
}

export default function AdminBatchFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const isEdit = !!id;

  const [loading, setLoading] = useState(isEdit);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(batchCreateSchema),
    defaultValues: {
      program:              'BADLAAV',
      name:                 '',
      startDate:            '',
      endDate:              '',
      venue:                'Ambajogai, Maharashtra',
      address:              CONTACT_ADDRESS,
      mapLink:              MAP_LINK,
      totalSeats:           20,
      waitlistCapacity:     0,
      priceIndividual:      15000,
      priceCouple:          27000,
      priceCorporate:       12000,
      priceCorporateAnnual: undefined,
      status:               'OPEN',
    },
  });

  // Edit mode: load the batch (we pull from the list and find by id)
  useEffect(() => {
    if (!isEdit) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        // Pull a broad set; the typical batch count is small.
        const { rows } = await listBatches({ limit: 100 });
        const batch = rows.find((b) => b.id === id);
        if (cancelled) return;
        if (!batch) {
          setServerError('Batch not found.');
        } else {
          reset({
            program:              batch.program,
            name:                 batch.name,
            startDate:            toDateInputValue(batch.startDate),
            endDate:              toDateInputValue(batch.endDate),
            venue:                batch.venue,
            address:              batch.address ?? '',
            mapLink:              batch.mapLink ?? '',
            totalSeats:           batch.totalSeats,
            waitlistCapacity:     batch.waitlistCapacity ?? 0,
            priceIndividual:      Number(batch.priceIndividual),
            priceCouple:          batch.priceCouple ? Number(batch.priceCouple) : undefined,
            priceCorporate:       batch.priceCorporate ? Number(batch.priceCorporate) : undefined,
            priceCorporateAnnual: batch.priceCorporateAnnual ? Number(batch.priceCorporateAnnual) : undefined,
            status:               batch.status,
          });
        }
      } catch (err) {
        if (!cancelled) setServerError(err.response?.data?.error || 'Could not load batch.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id, isEdit, reset]);

  async function onSubmit(data) {
    setServerError('');

    // Strip empty/NaN optional fields before send.
    // Backend uses z.strictObject(), so undefined keys are simply omitted (good);
    // NaN would be coerced to a failed integer check (bad).
    const body = {};
    for (const [k, v] of Object.entries(data)) {
      if (v === undefined || v === null || v === '' || (typeof v === 'number' && Number.isNaN(v))) {
        continue;
      }
      body[k] = v;
    }

    try {
      if (isEdit) {
        await updateBatch(id, body);
        toast('Batch updated.', 'success');
      } else {
        await createBatch(body);
        toast('Batch created.', 'success');
      }
      navigate('/admin/batches');
    } catch (err) {
      const status = err.response?.status;
      const resp   = err.response?.data;
      const fieldErrors = resp?.errors;

      if (Array.isArray(fieldErrors)) {
        setServerError(fieldErrors.map((e) => `${e.field}: ${e.message}`).join(' · '));
      } else if (resp?.error) {
        setServerError(`${status ? `[${status}] ` : ''}${resp.error}`);
      } else if (resp?.message) {
        setServerError(`${status ? `[${status}] ` : ''}${resp.message}`);
      } else if (status === 401) {
        setServerError('Your session has expired. Sign in again.');
      } else if (status === 403) {
        setServerError("You don't have permission to do that. Your account must have ADMIN role.");
      } else if (status === 413) {
        setServerError('Payload too large.');
      } else if (err.message?.includes('Network')) {
        setServerError("Couldn't reach the server. Check your connection.");
      } else {
        // Last-resort: surface the raw status + a short body excerpt so the cause is visible.
        const excerpt = resp
          ? JSON.stringify(resp).slice(0, 200)
          : err.message;
        setServerError(`Save failed${status ? ` (HTTP ${status})` : ''}${excerpt ? ` · ${excerpt}` : ''}`);
      }
      // eslint-disable-next-line no-console
      console.error('Batch save error', { status, response: resp, error: err });
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size={24} />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{isEdit ? 'Edit batch' : 'New batch'} — Badlaav Admin</title>
      </Helmet>

      <AdminPageHeader
        title={isEdit ? 'Edit batch' : 'New batch'}
        subtitle={isEdit ? 'Update the details below. Status transitions to PAST happen automatically once endDate passes.' : 'Create a batch to make the program bookable.'}
        actions={
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin/batches')}>
            <ArrowLeft size={14} /> Back
          </Button>
        }
      />

      {serverError && <ErrorBanner message={serverError} className="mb-4" />}

      <form onSubmit={handleSubmit(onSubmit)} className="bg-cream rounded-lg border border-muted/20 shadow-sm p-6 max-w-3xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="font-mono text-xs uppercase tracking-widest text-muted mb-1.5 block">
              Program <span className="text-danger">*</span>
            </label>
            <select
              {...register('program')}
              className="w-full bg-cream border border-muted/40 rounded px-3 py-2.5 text-sm font-sans focus:border-teal focus:outline focus:outline-2 focus:outline-teal focus:outline-offset-2"
            >
              {PROGRAM_OPTIONS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
            {errors.program && <p className="text-danger text-xs mt-1">{errors.program.message}</p>}
          </div>

          <div>
            <label className="font-mono text-xs uppercase tracking-widest text-muted mb-1.5 block">
              Status
            </label>
            <select
              {...register('status')}
              className="w-full bg-cream border border-muted/40 rounded px-3 py-2.5 text-sm font-sans focus:border-teal focus:outline focus:outline-2 focus:outline-teal focus:outline-offset-2"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <Input
              label="Batch name"
              required
              error={errors.name?.message}
              placeholder="e.g. Badlaav · Aug 2026"
              {...register('name')}
            />
          </div>

          <Input
            type="date"
            label="Start date"
            required
            error={errors.startDate?.message}
            {...register('startDate')}
          />
          <Input
            type="date"
            label="End date"
            required
            error={errors.endDate?.message}
            {...register('endDate')}
          />

          <div className="sm:col-span-2">
            <Input
              label="Venue"
              required
              error={errors.venue?.message}
              {...register('venue')}
            />
          </div>

          <div className="sm:col-span-2">
            <Input
              label="Full address"
              error={errors.address?.message}
              placeholder="Street, area, city, PIN"
              {...register('address')}
            />
          </div>
          <div className="sm:col-span-2">
            <Input
              label="Google Maps link"
              error={errors.mapLink?.message}
              placeholder="https://maps.google.com/..."
              {...register('mapLink')}
            />
          </div>

          <Input
            type="number"
            label="Total seats"
            required
            min={1}
            max={500}
            error={errors.totalSeats?.message}
            {...register('totalSeats', { setValueAs: emptyToUndefinedNumber })}
          />
          <Input
            type="number"
            label="Waiting-list capacity (0 = unlimited)"
            min={0}
            error={errors.waitlistCapacity?.message}
            {...register('waitlistCapacity', { setValueAs: emptyToUndefinedNumber })}
          />
          <Input
            type="number"
            label="Individual price (₹)"
            required
            min={0}
            error={errors.priceIndividual?.message}
            {...register('priceIndividual', { setValueAs: emptyToUndefinedNumber })}
          />
          <Input
            type="number"
            label="Couple price (₹)"
            min={0}
            error={errors.priceCouple?.message}
            {...register('priceCouple', { setValueAs: emptyToUndefinedNumber })}
          />
          <Input
            type="number"
            label="Corporate price (₹)"
            min={0}
            error={errors.priceCorporate?.message}
            {...register('priceCorporate', { setValueAs: emptyToUndefinedNumber })}
          />
          <Input
            type="number"
            label="Corporate annual price (₹)"
            min={0}
            error={errors.priceCorporateAnnual?.message}
            {...register('priceCorporateAnnual', { setValueAs: emptyToUndefinedNumber })}
          />
        </div>

        <div className="mt-6 flex items-center justify-end gap-2 pt-5 border-t border-muted/15">
          <Button type="button" variant="ghost" onClick={() => navigate('/admin/batches')} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {isEdit ? 'Save changes' : 'Create batch'}
          </Button>
        </div>
      </form>
    </>
  );
}
