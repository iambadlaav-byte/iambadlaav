/**
 * AdminBatchesPage — /admin/batches
 *
 * Lists batches with program + status filters, debounced name search, and row
 * actions: Edit, Close, Mark Full. Status transitions go through
 * PATCH /admin/batches/:id — the server is authoritative on whether the
 * transition is legal (e.g. PAST → OPEN is rejected).
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Plus, Edit3 } from 'lucide-react';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader.jsx';
import { DataTable } from '../../components/admin/DataTable.jsx';
import { SearchInput } from '../../components/admin/SearchInput.jsx';
import { Pagination, usePaginator } from '../../components/admin/Pagination.jsx';
import { StatusBadge } from '../../components/admin/StatusBadge.jsx';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { useToast } from '../../components/ui/Toast.jsx';
import { listBatches, updateBatch } from '../../api/admin.js';
import { cn } from '../../lib/cn.js';

const PROGRAMS = ['ALL', 'BADLAAV', 'FUTURE_READINESS', 'MISSION_UDAAN', 'ANTRANG'];
const PROGRAM_LABELS = {
  BADLAAV:          'The Retreat',
  FUTURE_READINESS: 'The Badlaav Experience',
  MISSION_UDAAN:    'Future programme 1',
  ANTRANG:          'Future programme 2',
};
const STATUSES = ['ALL', 'OPEN', 'FULL', 'CLOSED', 'PAST'];

const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
const fmtINR = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

export default function AdminBatchesPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [program, setProgram] = useState('ALL');
  const [status, setStatus]   = useState('ALL');
  const [search, setSearch]   = useState('');
  const [rows, setRows]       = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const paginator = usePaginator();
  const [confirm, setConfirm] = useState(null); // { id, action: 'CLOSED'|'FULL'|'OPEN', name }

  // Reset cursor stack when filters change
  useEffect(() => {
    paginator.reset();
  }, [program, status]); // eslint-disable-line react-hooks/exhaustive-deps

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const params = { limit: 25 };
      if (program !== 'ALL') params.program = program;
      if (status !== 'ALL')  params.status  = status;
      if (paginator.cursor)  params.cursor  = paginator.cursor;
      const data = await listBatches(params);
      setRows(data.rows ?? []);
      setNextCursor(data.nextCursor ?? null);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not load batches.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [program, status, paginator.cursor]); // eslint-disable-line react-hooks/exhaustive-deps

  // Client-side search (current page only). Server endpoint does not expose full-text search.
  const filtered = search
    ? rows.filter((b) => b.name?.toLowerCase().includes(search.toLowerCase()))
    : rows;

  async function applyStatus(id, newStatus) {
    try {
      await updateBatch(id, { status: newStatus });
      toast(`Batch marked ${newStatus.toLowerCase()}.`, 'success');
      load();
    } catch (err) {
      toast(err.response?.data?.error || 'Update failed.', 'danger');
    }
  }

  const columns = [
    {
      key: 'name',
      header: 'Batch',
      render: (b) => (
        <div className="flex flex-col">
          <span className="font-medium text-charcoal">{b.name}</span>
          <span className="text-xs text-muted font-mono">{PROGRAM_LABELS[b.program] ?? b.program}</span>
        </div>
      ),
    },
    {
      key: 'dates',
      header: 'Dates',
      render: (b) => (
        <span className="text-charcoal whitespace-nowrap">
          {fmtDate(b.startDate)} – {fmtDate(b.endDate)}
        </span>
      ),
    },
    { key: 'venue', header: 'Venue' },
    {
      key: 'seats',
      header: 'Seats',
      align: 'right',
      render: (b) => (
        <span className="font-mono text-xs">
          {b.seatsBooked}/{b.totalSeats}
        </span>
      ),
    },
    {
      key: 'waitlist',
      header: 'Waitlist',
      align: 'right',
      render: (b) => (
        <span className="font-mono text-xs text-ochre">{b.waitlistCount ?? 0}</span>
      ),
    },
    {
      key: 'price',
      header: 'Individual',
      align: 'right',
      render: (b) => <span className="font-mono text-xs">{fmtINR(b.priceIndividual)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (b) => <StatusBadge status={b.status} />,
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (b) => (
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => navigate(`/admin/batches/${b.id}/edit`)}
            className="p-1.5 rounded text-muted hover:text-charcoal hover:bg-soft transition-colors"
            aria-label={`Edit ${b.name}`}
          >
            <Edit3 size={14} />
          </button>
          {b.status === 'OPEN' && (
            <>
              <button
                type="button"
                onClick={() => setConfirm({ id: b.id, action: 'FULL', name: b.name })}
                className="px-2 py-1 rounded text-[11px] font-mono uppercase tracking-widest text-gold hover:bg-gold/10 transition-colors"
              >
                Mark full
              </button>
              <button
                type="button"
                onClick={() => setConfirm({ id: b.id, action: 'CLOSED', name: b.name })}
                className="px-2 py-1 rounded text-[11px] font-mono uppercase tracking-widest text-danger hover:bg-danger/10 transition-colors"
              >
                Close
              </button>
            </>
          )}
          {b.status === 'FULL' && (
            <button
              type="button"
              onClick={() => setConfirm({ id: b.id, action: 'OPEN', name: b.name })}
              className="px-2 py-1 rounded text-[11px] font-mono uppercase tracking-widest text-sage hover:bg-sage/10 transition-colors"
            >
              Reopen
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <Helmet>
        <title>Batches — Badlaav Admin</title>
      </Helmet>

      <AdminPageHeader
        title="Batches"
        subtitle="Programs are delivered as scheduled batches. Close or mark full when no longer accepting bookings."
        actions={
          <Button onClick={() => navigate('/admin/batches/new')} size="sm">
            <Plus size={14} /> New batch
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <SearchInput onSearch={setSearch} placeholder="Search by name" className="w-64" />
        <FilterChips label="Program" value={program} onChange={setProgram} options={PROGRAMS} labels={PROGRAM_LABELS} />
        <FilterChips label="Status"  value={status}  onChange={setStatus}  options={STATUSES}  />
      </div>

      <DataTable
        columns={columns}
        rows={filtered}
        loading={loading}
        error={error}
        emptyTitle="No batches yet"
        emptyMessage="Create the first batch to start accepting registrations."
        emptyAction={
          <Button onClick={() => navigate('/admin/batches/new')} size="sm">
            <Plus size={14} /> New batch
          </Button>
        }
        rowKey={(b) => b.id}
      />

      <Pagination
        page={paginator.page}
        nextCursor={nextCursor}
        onNext={() => paginator.next(nextCursor)}
        onPrev={paginator.prev}
      />

      <ConfirmDialog
        open={!!confirm}
        onOpenChange={(v) => !v && setConfirm(null)}
        title={
          confirm?.action === 'CLOSED'
            ? `Close “${confirm?.name}”?`
            : confirm?.action === 'FULL'
            ? `Mark “${confirm?.name}” as full?`
            : `Reopen “${confirm?.name}”?`
        }
        message={
          confirm?.action === 'CLOSED'
            ? 'Closing a batch stops all new registrations. You can reopen it later if needed.'
            : confirm?.action === 'FULL'
            ? 'Marking full hides the batch from the registration form. Useful when seats are sold out but you may still open later.'
            : 'Reopening will allow registrations again.'
        }
        confirmLabel={
          confirm?.action === 'CLOSED' ? 'Close batch'
            : confirm?.action === 'FULL' ? 'Mark full'
            : 'Reopen'
        }
        variant={confirm?.action === 'OPEN' ? 'primary' : 'danger'}
        onConfirm={() => applyStatus(confirm.id, confirm.action)}
      />
    </>
  );
}

function FilterChips({ label, value, onChange, options, labels }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="font-mono text-[10px] uppercase tracking-widest text-muted mr-1">
        {label}
      </span>
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={cn(
            'px-2.5 py-1 rounded-full border text-[11px] font-mono uppercase tracking-widest transition-colors',
            value === opt
              ? 'bg-ink text-pearl border-ink'
              : 'bg-cream text-muted border-muted/30 hover:border-charcoal/40 hover:text-charcoal'
          )}
        >
          {opt === 'ALL' ? 'All' : labels?.[opt] ?? opt}
        </button>
      ))}
    </div>
  );
}
