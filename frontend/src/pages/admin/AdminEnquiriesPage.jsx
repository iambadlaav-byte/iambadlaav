/**
 * AdminEnquiriesPage — /admin/enquiries
 *
 * Table of corporate/college/general enquiries. Status updates fire
 * PATCH /admin/enquiries/:id with the chosen status + optional admin note.
 * Status transitions: NEW → CONTACTED → CONVERTED | CLOSED.
 */
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Eye, Download, Trash2 } from 'lucide-react';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader.jsx';
import { DataTable } from '../../components/admin/DataTable.jsx';
import { SearchInput } from '../../components/admin/SearchInput.jsx';
import { Pagination, usePaginator } from '../../components/admin/Pagination.jsx';
import { StatusBadge } from '../../components/admin/StatusBadge.jsx';
import { Modal } from '../../components/admin/Modal.jsx';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Textarea } from '../../components/ui/Textarea.jsx';
import { useToast } from '../../components/ui/Toast.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { listEnquiries, updateEnquiryStatus, deleteEnquiry, downloadCsv } from '../../api/admin.js';
import { cn } from '../../lib/cn.js';

// Admin-tier (ADMIN or SUPERADMIN) may hard-delete records.
const isAdminTier = (role) => role === 'ADMIN' || role === 'SUPERADMIN';

const STATUSES = ['ALL', 'NEW', 'CONTACTED', 'CONVERTED', 'CLOSED'];
const TYPES    = ['ALL', 'CORPORATE', 'COLLEGE', 'GENERAL'];

const fmtDate = (iso) =>
  new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

export default function AdminEnquiriesPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const canDelete = isAdminTier(user?.role);

  const [status, setStatus] = useState('ALL');
  const [type, setType]     = useState('ALL');
  const [search, setSearch] = useState('');
  const [rows, setRows]     = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [exporting, setExporting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null); // { id, name }
  const paginator = usePaginator();

  const [active, setActive]       = useState(null);
  const [draftStatus, setDraftStatus] = useState('');
  const [draftNote, setDraftNote]     = useState('');
  const [saving, setSaving]           = useState(false);

  useEffect(() => { paginator.reset(); }, [status, type]); // eslint-disable-line react-hooks/exhaustive-deps

  function exportParams() {
    const params = {};
    if (status !== 'ALL') params.status = status;
    if (type !== 'ALL')   params.type   = type;
    return params;
  }

  async function handleExport() {
    setExporting(true);
    try {
      await downloadCsv('/admin/enquiries/export.csv', exportParams(), 'enquiries.csv');
    } catch (err) {
      toast(err.response?.data?.error || 'Export failed.', 'danger');
    } finally {
      setExporting(false);
    }
  }

  async function handleDelete() {
    if (!confirmDelete) return;
    try {
      await deleteEnquiry(confirmDelete.id);
      toast('Enquiry deleted.', 'success');
      setRows((rs) => rs.filter((r) => r.id !== confirmDelete.id));
      if (active?.id === confirmDelete.id) setActive(null);
    } catch (err) {
      toast(err.response?.data?.error || 'Delete failed.', 'danger');
    }
  }

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const params = { limit: 25 };
      if (status !== 'ALL') params.status = status;
      if (type !== 'ALL')   params.type   = type;
      if (paginator.cursor) params.cursor = paginator.cursor;
      const data = await listEnquiries(params);
      setRows(data.rows ?? []);
      setNextCursor(data.nextCursor ?? null);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not load enquiries.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [status, type, paginator.cursor]); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = search
    ? rows.filter((e) => {
        const q = search.toLowerCase();
        return (
          e.name?.toLowerCase().includes(q) ||
          e.email?.toLowerCase().includes(q) ||
          e.organisation?.toLowerCase().includes(q)
        );
      })
    : rows;

  function openDetail(e) {
    setActive(e);
    setDraftStatus(e.status);
    setDraftNote(e.adminNote || '');
  }

  async function saveStatus() {
    if (!active) return;
    setSaving(true);
    try {
      const updated = await updateEnquiryStatus(active.id, { status: draftStatus, adminNote: draftNote || undefined });
      toast('Enquiry updated.', 'success');
      setRows((rs) => rs.map((r) => (r.id === updated.id ? updated : r)));
      setActive(null);
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
      render: (e) => (
        <div className="flex flex-col">
          <span className="font-medium text-charcoal">{e.name}</span>
          <span className="text-xs text-muted font-mono">{e.type}</span>
        </div>
      ),
    },
    { key: 'organization', header: 'Organization', render: (e) => e.organisation || '—' },
    { key: 'email', header: 'Email' },
    { key: 'phone', header: 'Phone', render: (e) => <span className="font-mono text-xs">{e.phone || '—'}</span> },
    {
      key: 'message',
      header: 'Message',
      render: (e) => (
        <span className="text-charcoal block max-w-xs truncate" title={e.message}>
          {e.message}
        </span>
      ),
    },
    { key: 'status', header: 'Status', render: (e) => <StatusBadge status={e.status} /> },
    {
      key: 'createdAt',
      header: 'Created',
      render: (e) => <span className="text-xs text-muted whitespace-nowrap">{fmtDate(e.createdAt)}</span>,
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (e) => (
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => openDetail(e)}
            className="p-1.5 rounded text-muted hover:text-charcoal hover:bg-soft transition-colors"
            aria-label="Open enquiry"
          >
            <Eye size={14} />
          </button>
          {canDelete && (
            <button
              type="button"
              onClick={() => setConfirmDelete({ id: e.id, name: e.name })}
              className="p-1.5 rounded text-danger hover:bg-danger/10 transition-colors"
              aria-label="Delete enquiry"
              title="Delete enquiry"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <Helmet>
        <title>Enquiries — Badlaav Admin</title>
      </Helmet>

      <AdminPageHeader
        title="Enquiries"
        subtitle="Corporate, college, and general enquiries from the public site forms."
        actions={
          <Button size="sm" variant="secondary" onClick={handleExport} loading={exporting}>
            <Download size={14} /> Export CSV
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <SearchInput onSearch={setSearch} placeholder="Search name / email / org" className="w-64" />
        <FilterChips label="Status" value={status} onChange={setStatus} options={STATUSES} />
        <FilterChips label="Type"   value={type}   onChange={setType}   options={TYPES} />
      </div>

      <DataTable
        columns={columns}
        rows={filtered}
        loading={loading}
        error={error}
        emptyTitle="Inbox zero"
        emptyMessage="No enquiries match the current filters."
        rowKey={(e) => e.id}
      />

      <Pagination
        page={paginator.page}
        nextCursor={nextCursor}
        onNext={() => paginator.next(nextCursor)}
        onPrev={paginator.prev}
      />

      <Modal
        open={!!active}
        onOpenChange={(v) => !v && setActive(null)}
        title="Enquiry"
        description={active ? `${active.type} · ${fmtDate(active.createdAt)}` : ''}
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setActive(null)} disabled={saving}>Cancel</Button>
            <Button onClick={saveStatus} loading={saving}>Save</Button>
          </>
        }
      >
        {active && (
          <div className="flex flex-col gap-4 text-sm">
            <Field label="Name" value={active.name} />
            <Field label="Organization" value={active.organisation || '—'} />
            {active.designation && <Field label="Designation" value={active.designation} />}
            <Field label="Email" value={active.email} />
            <Field label="Phone" value={active.phone || '—'} />
            {active.teamSize && <Field label="Team Size" value={active.teamSize} />}
            {active.preferredMonth && <Field label="Preferred Month" value={active.preferredMonth} />}
            {active.source && <Field label="Source" value={active.source} />}
            {active.message && (
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted mb-1">Message</p>
              <p className="bg-soft/60 rounded p-3 text-charcoal whitespace-pre-wrap">{active.message}</p>
            </div>
            )}
            <div>
              <label className="font-mono text-[10px] uppercase tracking-widest text-muted mb-1.5 block">Status</label>
              <select
                value={draftStatus}
                onChange={(e) => setDraftStatus(e.target.value)}
                className="w-full bg-cream border border-muted/40 rounded px-3 py-2.5 text-sm font-sans focus:border-teal focus:outline focus:outline-2 focus:outline-teal focus:outline-offset-2"
              >
                {['NEW', 'CONTACTED', 'CONVERTED', 'CLOSED'].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-mono text-[10px] uppercase tracking-widest text-muted mb-1.5 block">
                Admin note (optional)
              </label>
              <Textarea
                value={draftNote}
                onChange={(e) => setDraftNote(e.target.value)}
                rows={3}
                placeholder="Internal note — not shared with the enquirer."
                maxLength={2000}
              />
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!confirmDelete}
        onOpenChange={(v) => !v && setConfirmDelete(null)}
        title={`Delete enquiry from “${confirmDelete?.name}”?`}
        message="This permanently removes the enquiry. The deletion is recorded in the audit log, but the enquiry itself cannot be recovered."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
      />
    </>
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
              : 'bg-cream text-muted border-muted/30 hover:border-charcoal/40 hover:text-charcoal'
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
