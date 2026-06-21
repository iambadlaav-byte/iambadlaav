/**
 * AdminInvoicesPage — /admin/invoices
 *
 * Read-mostly list of paid + refunded registrations. Row actions:
 *   - View:     opens a fresh signed Cloudinary URL in a new tab.
 *   - Download: fetches the signed URL and triggers a file download.
 *   - Resend:   POSTs /admin/invoices/:id/resend (re-sends the confirmation email).
 *   - Delete:   admin-tier only — removes the underlying registration.
 *
 * Bulk: row checkboxes + a toolbar "Download selected" button that fetches each
 * invoice's signed URL and downloads them sequentially (client-side, no server zip).
 * "Export CSV" streams the filtered list via the authenticated download helper.
 */
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { ExternalLink, Mail, Download, Trash2 } from 'lucide-react';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader.jsx';
import { DataTable } from '../../components/admin/DataTable.jsx';
import { Pagination, usePaginator } from '../../components/admin/Pagination.jsx';
import { StatusBadge } from '../../components/admin/StatusBadge.jsx';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { useToast } from '../../components/ui/Toast.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  listInvoices,
  viewInvoice,
  resendInvoice,
  deleteRegistration,
  downloadCsv,
} from '../../api/admin.js';
import { cn } from '../../lib/cn.js';
import { programLabel } from '../../lib/constants.js';

const STATUSES = ['ALL', 'PAID', 'REFUNDED'];
const fmtDate = (iso) =>
  new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
const fmtINR = (n) => `₹${Number(n ?? 0).toLocaleString('en-IN')}`;

// Admin-tier (ADMIN or SUPERADMIN) may hard-delete the underlying registration.
const isAdminTier = (role) => role === 'ADMIN' || role === 'SUPERADMIN';

// Fetch a signed URL and trigger a browser download. Reuses the invoice view endpoint.
async function downloadInvoiceFile(id) {
  const { url, invoiceNumber } = await viewInvoice(id);
  if (!url) throw new Error('NO_URL');
  const a = document.createElement('a');
  a.href = url;
  // Cloudinary serves the PDF; suggest a filename. Cross-origin downloads may still
  // open in a tab depending on response headers, but the intent is explicit.
  a.download = invoiceNumber ? `${String(invoiceNumber).replace(/\//g, '-')}.pdf` : 'invoice.pdf';
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export default function AdminInvoicesPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const canDelete = isAdminTier(user?.role);

  const [status, setStatus] = useState('ALL');
  const [rows, setRows]     = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [opening, setOpening] = useState(null);
  const [downloading, setDownloading] = useState(null);
  const [resending, setResending] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [bulkBusy, setBulkBusy]   = useState(false);
  const [selected, setSelected]   = useState(() => new Set());
  const [confirmDelete, setConfirmDelete] = useState(null); // { id, label }
  const paginator = usePaginator();

  useEffect(() => { paginator.reset(); }, [status]); // eslint-disable-line react-hooks/exhaustive-deps

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const params = { limit: 25 };
      if (status !== 'ALL') params.paymentStatus = status;
      if (paginator.cursor) params.cursor = paginator.cursor;
      const data = await listInvoices(params);
      setRows(data.rows ?? []);
      setNextCursor(data.nextCursor ?? null);
      setSelected(new Set()); // clear selection when the page changes
    } catch (err) {
      setError(err.response?.data?.error || 'Could not load invoices.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [status, paginator.cursor]); // eslint-disable-line react-hooks/exhaustive-deps

  function toggleRow(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // Only rows with an actual invoice PDF can be selected for download.
  const downloadableRows = rows.filter((r) => r.invoiceUrl);
  const allSelected = downloadableRows.length > 0 && downloadableRows.every((r) => selected.has(r.id));

  function toggleAll() {
    setSelected(() => (allSelected ? new Set() : new Set(downloadableRows.map((r) => r.id))));
  }

  async function handleView(id) {
    setOpening(id);
    try {
      const { url } = await viewInvoice(id);
      if (url) window.open(url, '_blank', 'noopener,noreferrer');
      else toast('No invoice PDF available.', 'danger');
    } catch (err) {
      toast(err.response?.data?.error || 'Could not load invoice.', 'danger');
    } finally {
      setOpening(null);
    }
  }

  async function handleDownload(id) {
    setDownloading(id);
    try {
      await downloadInvoiceFile(id);
    } catch (err) {
      toast(err.response?.data?.error || 'Could not download invoice.', 'danger');
    } finally {
      setDownloading(null);
    }
  }

  async function handleBulkDownload() {
    const ids = [...selected];
    if (ids.length === 0) return;
    setBulkBusy(true);
    let failures = 0;
    // Sequential — each needs a fresh signed URL; spacing avoids popup-blocker churn.
    for (const id of ids) {
      try {
        await downloadInvoiceFile(id);
      } catch {
        failures += 1;
      }
    }
    setBulkBusy(false);
    if (failures === 0) toast(`Downloading ${ids.length} invoice${ids.length > 1 ? 's' : ''}.`, 'success');
    else toast(`Downloaded ${ids.length - failures} of ${ids.length}; ${failures} failed.`, 'danger');
  }

  async function handleResend(id) {
    setResending(id);
    try {
      await resendInvoice(id);
      toast('Confirmation email queued.', 'success');
    } catch (err) {
      toast(err.response?.data?.error || 'Resend failed.', 'danger');
    } finally {
      setResending(null);
    }
  }

  async function handleExport() {
    setExporting(true);
    try {
      const params = status !== 'ALL' ? { paymentStatus: status } : {};
      await downloadCsv('/admin/invoices/export.csv', params, 'invoices.csv');
    } catch (err) {
      toast(err.response?.data?.error || 'Export failed.', 'danger');
    } finally {
      setExporting(false);
    }
  }

  async function handleDelete() {
    if (!confirmDelete) return;
    try {
      await deleteRegistration(confirmDelete.id);
      toast('Registration deleted.', 'success');
      setRows((rs) => rs.filter((r) => r.id !== confirmDelete.id));
      setSelected((prev) => {
        const next = new Set(prev);
        next.delete(confirmDelete.id);
        return next;
      });
    } catch (err) {
      toast(err.response?.data?.error || 'Delete failed.', 'danger');
    }
  }

  const columns = [
    {
      key: 'select',
      header: (
        <input
          type="checkbox"
          checked={allSelected}
          onChange={toggleAll}
          aria-label="Select all downloadable invoices"
          className="accent-ink w-4 h-4 align-middle"
        />
      ),
      render: (r) => (
        <input
          type="checkbox"
          checked={selected.has(r.id)}
          disabled={!r.invoiceUrl}
          onChange={() => toggleRow(r.id)}
          aria-label="Select invoice"
          className={cn('accent-ink w-4 h-4 align-middle', !r.invoiceUrl && 'opacity-30 cursor-not-allowed')}
        />
      ),
    },
    {
      key: 'invoiceNumber',
      header: 'Invoice #',
      render: (r) => <span className="font-mono text-xs">{r.invoiceNumber || '—'}</span>,
    },
    {
      key: 'who',
      header: 'Registration',
      render: (r) => (
        <div className="flex flex-col">
          <span className="font-medium text-charcoal">{r.user?.name || '—'}</span>
          <span className="text-xs text-muted">{r.user?.email}</span>
        </div>
      ),
    },
    { key: 'program', header: 'Program', render: (r) => <span className="font-mono text-xs">{programLabel(r.program)}</span> },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      render: (r) => <span className="font-mono text-xs">{fmtINR(r.finalAmount)}</span>,
    },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.paymentStatus} /> },
    {
      key: 'createdAt',
      header: 'Date',
      render: (r) => <span className="text-xs text-muted whitespace-nowrap">{fmtDate(r.createdAt)}</span>,
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (r) => (
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => handleView(r.id)}
            disabled={opening === r.id || !r.invoiceUrl}
            className={cn(
              'p-1.5 rounded text-muted hover:text-charcoal hover:bg-soft transition-colors',
              (opening === r.id || !r.invoiceUrl) && 'opacity-30 cursor-not-allowed'
            )}
            aria-label="Open invoice"
            title={r.invoiceUrl ? 'Open invoice PDF' : 'Invoice PDF not generated yet'}
          >
            <ExternalLink size={14} />
          </button>
          <button
            type="button"
            onClick={() => handleDownload(r.id)}
            disabled={downloading === r.id || !r.invoiceUrl}
            className={cn(
              'p-1.5 rounded text-muted hover:text-charcoal hover:bg-soft transition-colors',
              (downloading === r.id || !r.invoiceUrl) && 'opacity-30 cursor-not-allowed'
            )}
            aria-label="Download invoice"
            title={r.invoiceUrl ? 'Download invoice PDF' : 'Invoice PDF not generated yet'}
          >
            <Download size={14} />
          </button>
          <button
            type="button"
            onClick={() => handleResend(r.id)}
            disabled={resending === r.id}
            className="p-1.5 rounded text-muted hover:text-charcoal hover:bg-soft transition-colors"
            aria-label="Resend confirmation email"
          >
            <Mail size={14} />
          </button>
          {canDelete && (
            <button
              type="button"
              onClick={() => setConfirmDelete({ id: r.id, label: r.invoiceNumber || r.user?.name || 'this registration' })}
              className="p-1.5 rounded text-danger hover:bg-danger/10 transition-colors"
              aria-label="Delete registration"
              title="Delete registration"
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
        <title>Invoices — Badlaav Admin</title>
      </Helmet>

      <AdminPageHeader
        title="Invoices"
        subtitle="Generated invoices for paid registrations."
        actions={
          <Button size="sm" variant="secondary" onClick={handleExport} loading={exporting}>
            <Download size={14} /> Export CSV
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-3 mb-4">
        {STATUSES.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => setStatus(opt)}
            className={cn(
              'px-2.5 py-1 rounded-full border text-[11px] font-mono uppercase tracking-widest transition-colors',
              status === opt
                ? 'bg-ink text-pearl border-ink'
                : 'bg-cream text-muted border-muted/30 hover:border-charcoal/40 hover:text-charcoal'
            )}
          >
            {opt}
          </button>
        ))}

        {selected.size > 0 && (
          <div className="ml-auto flex items-center gap-2">
            <span className="font-mono text-[11px] uppercase tracking-widest text-muted">
              {selected.size} selected
            </span>
            <Button size="sm" onClick={handleBulkDownload} loading={bulkBusy}>
              <Download size={14} /> Download selected
            </Button>
          </div>
        )}
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
        error={error}
        emptyTitle="No invoices yet"
        emptyMessage="Invoices are generated automatically when a payment succeeds."
        rowKey={(r) => r.id}
      />

      <Pagination
        page={paginator.page}
        nextCursor={nextCursor}
        onNext={() => paginator.next(nextCursor)}
        onPrev={paginator.prev}
      />

      <ConfirmDialog
        open={!!confirmDelete}
        onOpenChange={(v) => !v && setConfirmDelete(null)}
        title={`Delete “${confirmDelete?.label}”?`}
        message="This permanently removes the underlying registration (and frees its seat if it had one). The deletion is recorded in the audit log, but the registration cannot be recovered."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
      />
    </>
  );
}
