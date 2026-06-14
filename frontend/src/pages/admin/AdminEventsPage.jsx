/**
 * AdminEventsPage — /admin/events
 *
 * Events list + [+ New Event] modal + [Cancel event] confirm dialog.
 * Cancellation sets status=CANCELLED (soft, never delete per CONSTRAINT-SCHEMA-002).
 * Phase 1 does NOT auto-email cancellation — dialog informs admin this is manual for now.
 * NO animations (CONSTRAINT-CODE-004).
 */
import { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import * as Dialog from '@radix-ui/react-dialog';
import { AdminTable } from '../../components/admin/AdminTable.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { ErrorBanner } from '../../components/ui/ErrorBanner.jsx';
import { apiClient } from '../../api/client.js';

const STATUS_BADGE = {
  UPCOMING:  'bg-teal/10 text-teal',
  PAST:      'bg-ink/10 text-muted',
  CANCELLED: 'bg-danger/10 text-danger',
};

const COLUMNS = [
  { key: 'title',     header: 'Title' },
  { key: 'type',      header: 'Type',  render: (v) => v },
  { key: 'startDate', header: 'Date',  render: (v) => new Date(v).toLocaleDateString('en-IN') },
  { key: 'city',      header: 'City' },
  { key: 'totalSeats',header: 'Seats', render: (v) => v ?? '—' },
  {
    key: 'status',
    header: 'Status',
    render: (v) => <span className={`px-2 py-0.5 rounded text-xs font-mono ${STATUS_BADGE[v] ?? ''}`}>{v}</span>,
  },
];

const EVENT_TYPES = ['badlaav', 'antrang', 'meetup', 'workshop', 'community'];

const EMPTY_FORM = {
  title: '', description: '', startDate: '', endDate: '', location: '',
  city: '', type: 'badlaav', totalSeats: '', price: '', coverImage: '', status: 'UPCOMING',
};

export default function AdminEventsPage() {
  const [rows, setRows]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [modalOpen, setModalOpen]   = useState(false);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError]   = useState('');
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling]     = useState(false);
  const [cancelError, setCancelError]   = useState('');

  const fetchRows = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.get('/admin/events');
      setRows(res.data.rows ?? []);
    } catch {
      setError("Couldn't reach our server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRows(); }, [fetchRows]);

  function openCreate() {
    setForm(EMPTY_FORM);
    setFormError('');
    setModalOpen(true);
  }

  async function handleCreate(e) {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');
    try {
      const payload = { ...form };
      if (!payload.endDate)     delete payload.endDate;
      if (!payload.totalSeats)  delete payload.totalSeats;
      if (!payload.price)       delete payload.price;
      if (!payload.coverImage)  delete payload.coverImage;
      await apiClient.post('/admin/events', payload);
      setModalOpen(false);
      fetchRows();
    } catch (err) {
      setFormError(err.response?.data?.errors?.[0]?.message ?? "Couldn't create. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCancel() {
    if (!cancelTarget) return;
    setCancelling(true);
    setCancelError('');
    try {
      await apiClient.post(`/admin/events/${cancelTarget.id}/cancel`);
      setCancelTarget(null);
      fetchRows();
    } catch (err) {
      setCancelError(err.response?.data?.message ?? "Couldn't cancel. Try again.");
    } finally {
      setCancelling(false);
    }
  }

  // Add cancel action column
  const columnsWithActions = [
    ...COLUMNS,
    {
      key: '_actions',
      header: '',
      render: (_, row) => (
        row.status !== 'CANCELLED' ? (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setCancelTarget(row); setCancelError(''); }}
            className="text-xs font-sans text-danger hover:underline"
          >
            Cancel event
          </button>
        ) : null
      ),
    },
  ];

  return (
    <>
      <Helmet>
        <title>Events — Dnyanpith Admin</title>
      </Helmet>

      <div className="p-6 max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-sans text-xl font-semibold text-charcoal">Events</h1>
          <Button variant="primary" size="sm" onClick={openCreate}>
            + New Event
          </Button>
        </div>

        {error && <ErrorBanner message={error} onRetry={fetchRows} className="mb-4" />}

        <AdminTable
          columns={columnsWithActions}
          rows={rows}
          isLoading={loading}
          emptyState="No events yet."
        />
      </div>

      {/* Create modal */}
      <Dialog.Root open={modalOpen} onOpenChange={setModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-ink/40 z-50" />
          <Dialog.Content className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-pearl rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6">
              <Dialog.Title className="font-sans font-semibold text-charcoal text-lg mb-4">
                New event
              </Dialog.Title>

              <form onSubmit={handleCreate} className="space-y-3 text-sm font-sans">
                {[
                  ['Title',        'title',     'text'],
                  ['Location',     'location',  'text'],
                  ['City',         'city',      'text'],
                  ['Cover image URL', 'coverImage', 'url'],
                ].map(([label, field, type]) => (
                  <div key={field}>
                    <label className="block font-mono text-xs text-muted uppercase tracking-widest mb-1">{label}</label>
                    <input
                      type={type}
                      className="w-full border border-ink/20 rounded px-3 py-2 text-charcoal"
                      value={form[field]}
                      onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                    />
                  </div>
                ))}

                <div>
                  <label className="block font-mono text-xs text-muted uppercase tracking-widest mb-1">Description</label>
                  <textarea
                    className="w-full border border-ink/20 rounded px-3 py-2 text-charcoal resize-none"
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    maxLength={5000}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-mono text-xs text-muted uppercase tracking-widest mb-1">Start date</label>
                    <input type="datetime-local" className="w-full border border-ink/20 rounded px-3 py-2 text-charcoal"
                      value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
                  </div>
                  <div>
                    <label className="block font-mono text-xs text-muted uppercase tracking-widest mb-1">End date</label>
                    <input type="datetime-local" className="w-full border border-ink/20 rounded px-3 py-2 text-charcoal"
                      value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block font-mono text-xs text-muted uppercase tracking-widest mb-1">Type</label>
                    <select className="w-full border border-ink/20 rounded px-3 py-2 text-charcoal bg-pearl"
                      value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                      {EVENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block font-mono text-xs text-muted uppercase tracking-widest mb-1">Seats</label>
                    <input type="number" className="w-full border border-ink/20 rounded px-3 py-2 text-charcoal"
                      value={form.totalSeats} onChange={(e) => setForm({ ...form, totalSeats: e.target.value })} />
                  </div>
                  <div>
                    <label className="block font-mono text-xs text-muted uppercase tracking-widest mb-1">Price (₹)</label>
                    <input type="number" className="w-full border border-ink/20 rounded px-3 py-2 text-charcoal"
                      value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                  </div>
                </div>

                {formError && <ErrorBanner message={formError} />}

                <div className="flex items-center justify-end gap-3 pt-2">
                  <Dialog.Close asChild>
                    <Button variant="ghost" size="sm" type="button">Cancel</Button>
                  </Dialog.Close>
                  <Button variant="primary" size="sm" type="submit" loading={submitting}>
                    Create event
                  </Button>
                </div>
              </form>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Cancel confirm dialog */}
      <Dialog.Root open={!!cancelTarget} onOpenChange={(v) => { if (!v) setCancelTarget(null); }}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-ink/40 z-50" />
          <Dialog.Content className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-pearl rounded-lg shadow-xl w-full max-w-sm p-6">
              <Dialog.Title className="font-sans font-semibold text-charcoal text-lg mb-3">
                Cancel this event?
              </Dialog.Title>
              <p className="font-sans text-sm text-charcoal mb-2">
                Registered participants will not receive an automatic email in Phase 1 — reach out to them directly if needed.
              </p>
              {cancelError && <ErrorBanner message={cancelError} className="mb-3" />}
              <div className="flex items-center justify-end gap-3 mt-4">
                <Dialog.Close asChild>
                  <Button variant="ghost" size="sm">Keep event</Button>
                </Dialog.Close>
                <Button variant="danger" size="sm" loading={cancelling} onClick={handleCancel}>
                  Cancel event
                </Button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
