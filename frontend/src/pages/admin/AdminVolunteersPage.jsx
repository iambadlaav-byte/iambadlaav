/**
 * AdminVolunteersPage — /admin/volunteers
 *
 * Lists volunteer applications with a counts summary strip and a "by batch"
 * mini-breakdown. Row click opens a detail modal showing every field, with
 * status-change actions: Approve / Reject / Reset to Pending.
 *
 * The list endpoint returns the full row set ({ rows, counts, byBatch }) — no
 * cursor pagination — so the status filter is applied client-side.
 * Visible to all staff (no adminOnly gate on the route/nav item).
 */
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Eye } from 'lucide-react';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader.jsx';
import { DataTable } from '../../components/admin/DataTable.jsx';
import { SearchInput } from '../../components/admin/SearchInput.jsx';
import { StatusBadge } from '../../components/admin/StatusBadge.jsx';
import { Modal } from '../../components/admin/Modal.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { useToast } from '../../components/ui/Toast.jsx';
import {
  listVolunteers,
  getVolunteerDetail,
  updateVolunteerStatus,
} from '../../api/admin.js';
import { cn } from '../../lib/cn.js';

const STATUSES = ['ALL', 'PENDING', 'APPROVED', 'REJECTED'];

const fmtDate = (iso) =>
  iso
    ? new Date(iso).toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
      })
    : '—';

export default function AdminVolunteersPage() {
  const { toast } = useToast();

  const [status, setStatus] = useState('ALL');
  const [search, setSearch] = useState('');
  const [rows, setRows]     = useState([]);
  const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [byBatch, setByBatch] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const [active, setActive]   = useState(null);
  const [saving, setSaving]   = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await listVolunteers();
      setRows(data.rows ?? []);
      setCounts(data.counts ?? { pending: 0, approved: 0, rejected: 0 });
      setByBatch(data.byBatch ?? []);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not load volunteers.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const filtered = rows.filter((v) => {
    if (status !== 'ALL' && v.status !== status) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      v.user?.name?.toLowerCase().includes(q) ||
      v.user?.email?.toLowerCase().includes(q) ||
      v.user?.city?.toLowerCase().includes(q) ||
      v.batchAttended?.toLowerCase().includes(q)
    );
  });

  async function openDetail(row) {
    // Open immediately with the list row, then hydrate with the full detail.
    setActive(row);
    try {
      const full = await getVolunteerDetail(row.id);
      setActive(full);
    } catch {
      // Fall back to the list row — it already carries the fields we render.
    }
  }

  async function changeStatus(next) {
    if (!active) return;
    setSaving(true);
    try {
      const updated = await updateVolunteerStatus(active.id, next);
      toast(`Marked ${next.toLowerCase()}.`, 'success');
      // Refresh the row in place and re-derive counts so the strip stays in sync.
      setRows((rs) => {
        const nextRows = rs.map((r) => (r.id === updated.id ? { ...r, ...updated } : r));
        setCounts({
          pending:  nextRows.filter((r) => r.status === 'PENDING').length,
          approved: nextRows.filter((r) => r.status === 'APPROVED').length,
          rejected: nextRows.filter((r) => r.status === 'REJECTED').length,
        });
        return nextRows;
      });
      setActive((a) => (a ? { ...a, ...updated } : a));
    } catch (err) {
      toast(err.response?.data?.error || 'Update failed.', 'danger');
    } finally {
      setSaving(false);
    }
  }

  const columns = [
    {
      key: 'name',
      header: 'Name',
      render: (v) => <span className="font-medium text-charcoal">{v.user?.name || '—'}</span>,
    },
    {
      key: 'contact',
      header: 'Email / phone',
      render: (v) => (
        <div className="flex flex-col">
          <span className="text-charcoal">{v.user?.email || '—'}</span>
          <span className="text-xs text-muted font-mono">{v.user?.phone || '—'}</span>
        </div>
      ),
    },
    { key: 'city', header: 'City', render: (v) => v.user?.city || '—' },
    {
      key: 'batch',
      header: 'Batch',
      render: (v) => (
        <span className="text-charcoal block max-w-[10rem] truncate" title={v.batchAttended}>
          {v.batchAttended || '—'}
        </span>
      ),
    },
    {
      key: 'skills',
      header: 'Skills',
      render: (v) => (
        <span className="text-charcoal block max-w-[14rem] truncate" title={(v.skills || []).join(', ')}>
          {(v.skills || []).join(', ') || '—'}
        </span>
      ),
    },
    { key: 'status', header: 'Status', render: (v) => <StatusBadge status={v.status} /> },
    {
      key: 'createdAt',
      header: 'Applied',
      render: (v) => <span className="text-xs text-muted whitespace-nowrap">{fmtDate(v.createdAt)}</span>,
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (v) => (
        <button
          type="button"
          onClick={() => openDetail(v)}
          className="p-1.5 rounded text-muted hover:text-charcoal hover:bg-soft transition-colors"
          aria-label="Open volunteer"
        >
          <Eye size={14} />
        </button>
      ),
    },
  ];

  return (
    <>
      <Helmet>
        <title>Volunteers — Badlaav Admin</title>
      </Helmet>

      <AdminPageHeader
        title="Volunteers"
        subtitle="People who applied to help hold a batch — via the public volunteer form."
      />

      {/* Counts summary strip */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <CountCard label="Pending"  value={counts.pending}  tone="warn" />
        <CountCard label="Approved" value={counts.approved} tone="positive" />
        <CountCard label="Rejected" value={counts.rejected} tone="danger" />
      </div>

      {byBatch.length > 0 && (
        <div className="bg-cream rounded-lg border border-muted/20 p-4 mb-4">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted mb-2">By batch</p>
          <ul className="flex flex-wrap gap-2">
            {byBatch.map((b) => (
              <li
                key={b.batch}
                className="inline-flex items-center gap-2 rounded-full border border-muted/30 bg-soft px-3 py-1 text-xs font-sans text-charcoal"
              >
                <span>{b.batch || 'Unspecified'}</span>
                <span className="font-mono text-muted">{b.count}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <SearchInput onSearch={setSearch} placeholder="Search name / email / city / batch" className="w-64" />
        <FilterChips label="Status" value={status} onChange={setStatus} options={STATUSES} />
      </div>

      <DataTable
        columns={columns}
        rows={filtered}
        loading={loading}
        error={error}
        emptyTitle="No volunteers yet"
        emptyMessage="No volunteer applications match the current filters."
        rowKey={(v) => v.id}
        onRowClick={openDetail}
      />

      <Modal
        open={!!active}
        onOpenChange={(v) => !v && setActive(null)}
        title="Volunteer application"
        description={active ? `${active.user?.name || ''} · ${fmtDate(active.createdAt)}` : ''}
        size="lg"
        footer={
          active && (
            <>
              <Button
                variant="ghost"
                onClick={() => changeStatus('PENDING')}
                disabled={saving || active.status === 'PENDING'}
              >
                Reset to Pending
              </Button>
              <Button
                variant="danger"
                onClick={() => changeStatus('REJECTED')}
                loading={saving}
                disabled={saving || active.status === 'REJECTED'}
              >
                Reject
              </Button>
              <Button
                onClick={() => changeStatus('APPROVED')}
                loading={saving}
                disabled={saving || active.status === 'APPROVED'}
              >
                Approve
              </Button>
            </>
          )
        }
      >
        {active && (
          <div className="flex flex-col gap-4 text-sm">
            <div className="flex items-center gap-3">
              <StatusBadge status={active.status} />
              {active.approvedAt && (
                <span className="text-xs text-muted">Approved {fmtDate(active.approvedAt)}</span>
              )}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Name" value={active.user?.name || '—'} />
              <Field label="City" value={active.user?.city || '—'} />
              <Field label="Email" value={active.user?.email || '—'} />
              <Field label="Phone" value={active.user?.phone || '—'} />
            </div>

            <Field label="Batch attended / interested in" value={active.batchAttended || '—'} />

            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted mb-1.5">Skills</p>
              <ChipList items={active.skills} />
            </div>

            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted mb-1.5">Availability</p>
              <ChipList items={active.availability} />
            </div>

            <Field label="Can travel to venue" value={active.canTravel ? 'Yes' : 'No'} />

            {active.whyVolunteer && (
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted mb-1">Why volunteer</p>
                <p className="bg-soft/60 rounded p-3 text-charcoal whitespace-pre-wrap">{active.whyVolunteer}</p>
              </div>
            )}

            {active.messageToArjun && (
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted mb-1">Message to Arjun</p>
                <p className="bg-soft/60 rounded p-3 text-charcoal whitespace-pre-wrap">{active.messageToArjun}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}

function ChipList({ items }) {
  if (!items || items.length === 0) return <p className="text-muted">—</p>;
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((item) => (
        <li
          key={item}
          className="inline-flex items-center rounded-full border border-ochre/30 bg-ochre/10 px-3 py-1 text-xs font-sans text-ink"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted mb-0.5">{label}</p>
      <p className="text-charcoal">{value}</p>
    </div>
  );
}

const TONE_CLASSES = {
  warn:     'text-gold',
  positive: 'text-sage',
  danger:   'text-danger',
};

function CountCard({ label, value, tone }) {
  return (
    <div className="bg-cream rounded-lg border border-muted/20 p-4 text-center">
      <p className={cn('font-display text-3xl font-light leading-none', TONE_CLASSES[tone])}>{value}</p>
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted mt-1.5">{label}</p>
    </div>
  );
}

function FilterChips({ label, value, onChange, options }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="font-mono text-[10px] uppercase tracking-widest text-muted mr-1">{label}</span>
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={cn(
            'px-2.5 py-1 rounded-full border text-[11px] font-mono uppercase tracking-widest transition-colors',
            value === opt
              ? 'bg-ink text-pearl border-ink'
              : 'bg-cream text-muted border-muted/30 hover:border-charcoal/40 hover:text-charcoal',
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
