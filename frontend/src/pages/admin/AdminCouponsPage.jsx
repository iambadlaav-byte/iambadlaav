/**
 * AdminCouponsPage — /admin/coupons (and /admin/coupons/new)
 *
 * List + create + deactivate coupons. Hard-delete is intentionally absent —
 * coupons soft-deactivate via PATCH { active: false } so audit history and
 * currentUses remain intact.
 *
 * The create form opens in a Modal triggered by the page header CTA OR by
 * landing on /admin/coupons/new (deep-link convenience). Both paths share one
 * code path.
 */
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { couponCreateSchema } from '@dnyanpith/validators';
import { Plus, Power } from 'lucide-react';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader.jsx';
import { DataTable } from '../../components/admin/DataTable.jsx';
import { Pagination, usePaginator } from '../../components/admin/Pagination.jsx';
import { StatusBadge } from '../../components/admin/StatusBadge.jsx';
import { Modal } from '../../components/admin/Modal.jsx';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Checkbox } from '../../components/ui/Checkbox.jsx';
import { ErrorBanner } from '../../components/ui/ErrorBanner.jsx';
import { useToast } from '../../components/ui/Toast.jsx';
import {
  listCoupons,
  createCoupon,
  deactivateCoupon,
} from '../../api/admin.js';
import { cn } from '../../lib/cn.js';
import { programLabel } from '../../lib/constants.js';

const ACTIVE_FILTER = ['ALL', 'ACTIVE', 'INACTIVE'];
// Live programmes first; the last two are future placeholders.
const PROGRAMS = ['BADLAAV', 'FUTURE_READINESS', 'MISSION_UDAAN', 'ANTRANG'];

const INR = (n) => `₹${Number(n).toLocaleString('en-IN')}`;
const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export default function AdminCouponsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const [filter, setFilter] = useState('ALL');
  const [rows, setRows]     = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);
  const paginator = usePaginator();

  // Create modal is open whenever the user clicks "New coupon" OR lands on /admin/coupons/new.
  const [createOpen, setCreateOpen] = useState(location.pathname.endsWith('/new'));
  const [confirm, setConfirm]       = useState(null); // { id, code }

  useEffect(() => { paginator.reset(); }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const params = { limit: 50 };
      if (filter === 'ACTIVE')   params.active = 'true';
      if (filter === 'INACTIVE') params.active = 'false';
      if (paginator.cursor)      params.cursor = paginator.cursor;
      const data = await listCoupons(params);
      setRows(data.rows ?? []);
      setNextCursor(data.nextCursor ?? null);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not load coupons.');
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, [filter, paginator.cursor]); // eslint-disable-line react-hooks/exhaustive-deps

  function openCreate() {
    setCreateOpen(true);
    if (!location.pathname.endsWith('/new')) navigate('/admin/coupons/new', { replace: false });
  }
  function closeCreate() {
    setCreateOpen(false);
    if (location.pathname.endsWith('/new')) navigate('/admin/coupons', { replace: true });
  }

  async function handleDeactivate({ id }) {
    try {
      await deactivateCoupon(id);
      toast('Coupon deactivated.', 'success');
      load();
    } catch (err) {
      toast(err.response?.data?.error || 'Deactivation failed.', 'danger');
    }
  }

  const columns = [
    {
      key: 'code',
      header: 'Code',
      render: (c) => <span className="font-mono text-sm font-medium text-charcoal">{c.code}</span>,
    },
    {
      key: 'discount',
      header: 'Discount',
      render: (c) =>
        c.discountPct != null
          ? <span>{c.discountPct}%</span>
          : c.discountAmount != null
          ? <span>{INR(c.discountAmount)}</span>
          : <span className="text-muted">—</span>,
    },
    {
      key: 'programs',
      header: 'Programs',
      render: (c) => (
        <div className="flex flex-wrap gap-1">
          {(c.applicablePrograms?.length ? c.applicablePrograms : ['ALL']).map((p) => (
            <span key={p} className="font-mono text-[10px] uppercase tracking-widest text-muted bg-soft px-1.5 py-0.5 rounded">
              {p === 'ALL' ? 'All programs' : programLabel(p)}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: 'uses',
      header: 'Uses',
      align: 'right',
      render: (c) => (
        <span className="font-mono text-xs">
          {c.currentUses}
          {c.maxUses != null && <span className="text-muted">/{c.maxUses}</span>}
        </span>
      ),
    },
    {
      key: 'remaining',
      header: 'Remaining',
      align: 'right',
      render: (c) => (
        <span className="font-mono text-xs">
          {c.maxUses == null ? '∞' : c.remainingUses ?? Math.max(c.maxUses - c.currentUses, 0)}
        </span>
      ),
    },
    {
      key: 'validUntil',
      header: 'Valid until',
      render: (c) => <span className="text-xs text-muted whitespace-nowrap">{fmtDate(c.validUntil)}</span>,
    },
    {
      key: 'active',
      header: 'Status',
      render: (c) => <StatusBadge status={c.active ? 'ACTIVE' : 'INACTIVE'} tone={c.active ? 'positive' : 'muted'} />,
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (c) => (
        c.active ? (
          <button
            type="button"
            onClick={() => setConfirm({ id: c.id, code: c.code })}
            className="px-2 py-1 rounded text-[11px] font-mono uppercase tracking-widest text-danger hover:bg-danger/10 transition-colors"
            title="Deactivate coupon"
          >
            <span className="inline-flex items-center gap-1"><Power size={12} /> Deactivate</span>
          </button>
        ) : (
          <span className="text-[11px] font-mono uppercase tracking-widest text-muted">—</span>
        )
      ),
    },
  ];

  return (
    <>
      <Helmet>
        <title>Coupons — Badlaav Admin</title>
      </Helmet>

      <AdminPageHeader
        title="Coupons"
        subtitle="Discount codes for campaigns, partners, and goodwill. Deactivate to soft-delete; codes are never hard-deleted."
        actions={
          <Button size="sm" onClick={openCreate}>
            <Plus size={14} /> New coupon
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-3 mb-4">
        {ACTIVE_FILTER.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => setFilter(opt)}
            className={cn(
              'px-2.5 py-1 rounded-full border text-[11px] font-mono uppercase tracking-widest transition-colors',
              filter === opt
                ? 'bg-ink text-pearl border-ink'
                : 'bg-cream text-muted border-muted/30 hover:border-charcoal/40 hover:text-charcoal'
            )}
          >
            {opt}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
        error={error}
        emptyTitle="No coupons yet"
        emptyMessage="Create the first code to start running discounts."
        emptyAction={<Button size="sm" onClick={openCreate}><Plus size={14} /> New coupon</Button>}
        rowKey={(c) => c.id}
      />

      <Pagination
        page={paginator.page}
        nextCursor={nextCursor}
        onNext={() => paginator.next(nextCursor)}
        onPrev={paginator.prev}
      />

      <CreateCouponModal
        open={createOpen}
        onOpenChange={(v) => v ? openCreate() : closeCreate()}
        onCreated={() => { closeCreate(); load(); toast('Coupon created.', 'success'); }}
      />

      <ConfirmDialog
        open={!!confirm}
        onOpenChange={(v) => !v && setConfirm(null)}
        title={`Deactivate “${confirm?.code}”?`}
        message="Deactivating stops new redemptions immediately. Existing registrations using this code keep their discount. You can't undo this from the UI (database edit required)."
        confirmLabel="Deactivate"
        variant="danger"
        onConfirm={() => handleDeactivate(confirm)}
      />
    </>
  );
}

// ── Create modal ──────────────────────────────────────────────────────────────

function CreateCouponModal({ open, onOpenChange, onCreated }) {
  const [discountType, setDiscountType] = useState('pct'); // 'pct' | 'amount'
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(couponCreateSchema),
    defaultValues: {
      code: '',
      discountPct: 10,
      discountAmount: null,
      applicablePrograms: [],
      maxUses: null,
      validUntil: null,
      active: true,
    },
  });

  const selectedPrograms = watch('applicablePrograms') ?? [];

  useEffect(() => {
    if (!open) {
      reset();
      setDiscountType('pct');
      setServerError('');
    }
  }, [open, reset]);

  // Keep the unused discount field null so the Zod XOR refine passes.
  useEffect(() => {
    if (discountType === 'pct') setValue('discountAmount', null);
    else setValue('discountPct', null);
  }, [discountType, setValue]);

  function toggleProgram(p) {
    setValue(
      'applicablePrograms',
      selectedPrograms.includes(p)
        ? selectedPrograms.filter((x) => x !== p)
        : [...selectedPrograms, p],
      { shouldValidate: false }
    );
  }

  async function onSubmit(data) {
    setServerError('');
    try {
      // Trim empty optionals
      const body = { ...data };
      if (body.maxUses === '' || body.maxUses == null) delete body.maxUses;
      if (body.validUntil === '' || body.validUntil == null) delete body.validUntil;
      if (body.discountPct == null) delete body.discountPct;
      if (body.discountAmount == null) delete body.discountAmount;
      await createCoupon(body);
      onCreated?.();
    } catch (err) {
      const fieldErrors = err.response?.data?.errors;
      if (Array.isArray(fieldErrors)) {
        setServerError(fieldErrors.map((e) => `${e.field}: ${e.message}`).join(' · '));
      } else {
        setServerError(err.response?.data?.error || 'Save failed.');
      }
    }
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="New coupon"
      description="Create a discount code. Deactivate later by editing the row."
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancel</Button>
          <Button onClick={handleSubmit(onSubmit)} loading={isSubmitting}>Create</Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {serverError && <ErrorBanner message={serverError} />}

        <Input
          label="Code"
          required
          placeholder="e.g. EARLYBIRD25"
          error={errors.code?.message}
          {...register('code')}
        />

        {/* Discount type chooser */}
        <div>
          <label className="font-mono text-[10px] uppercase tracking-widest text-muted mb-2 block">
            Discount type <span className="text-danger">*</span>
          </label>
          <div className="flex gap-2 mb-2">
            <button
              type="button"
              onClick={() => setDiscountType('pct')}
              className={cn(
                'flex-1 px-3 py-2 rounded border text-sm font-sans transition-colors',
                discountType === 'pct' ? 'bg-ink text-pearl border-ink' : 'bg-cream text-muted border-muted/30'
              )}
            >
              Percentage
            </button>
            <button
              type="button"
              onClick={() => setDiscountType('amount')}
              className={cn(
                'flex-1 px-3 py-2 rounded border text-sm font-sans transition-colors',
                discountType === 'amount' ? 'bg-ink text-pearl border-ink' : 'bg-cream text-muted border-muted/30'
              )}
            >
              Flat ₹
            </button>
          </div>
          {discountType === 'pct' ? (
            <Input
              type="number"
              label="Discount %"
              min={1}
              max={100}
              error={errors.discountPct?.message}
              {...register('discountPct', { valueAsNumber: true, setValueAs: (v) => (v === '' ? null : Number(v)) })}
            />
          ) : (
            <Input
              type="number"
              label="Discount ₹"
              min={1}
              error={errors.discountAmount?.message}
              {...register('discountAmount', { valueAsNumber: true, setValueAs: (v) => (v === '' ? null : Number(v)) })}
            />
          )}
        </div>

        {/* Applicable programs */}
        <div>
          <label className="font-mono text-[10px] uppercase tracking-widest text-muted mb-2 block">
            Applicable programs
          </label>
          <p className="text-xs text-muted mb-2">Leave empty to allow all programs.</p>
          <div className="flex flex-wrap gap-2">
            {PROGRAMS.map((p) => (
              <Checkbox
                key={p}
                label={programLabel(p)}
                checked={selectedPrograms.includes(p)}
                onCheckedChange={() => toggleProgram(p)}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            type="number"
            label="Max uses"
            min={1}
            helper="Empty = unlimited"
            error={errors.maxUses?.message}
            {...register('maxUses', { setValueAs: (v) => (v === '' || v == null ? null : Number(v)) })}
          />
          <Input
            type="date"
            label="Valid until"
            helper="Empty = no expiry"
            error={errors.validUntil?.message}
            {...register('validUntil', { setValueAs: (v) => (v === '' ? null : v) })}
          />
        </div>
      </form>
    </Modal>
  );
}

