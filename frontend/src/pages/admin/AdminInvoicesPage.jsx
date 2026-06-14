/**
 * AdminInvoicesPage — /admin/invoices
 *
 * Read-mostly list of paid + refunded registrations. Two row actions:
 *   - View: fetches a fresh signed Cloudinary URL and opens it in a new tab.
 *   - Resend: POSTs /admin/invoices/:id/resend (server re-sends the confirmation email).
 *
 * Refund is intentionally out of scope for phase 1 (sits in RefundConfirmDialog;
 * phase 2 will surface it via this page).
 */
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { ExternalLink, Mail } from 'lucide-react';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader.jsx';
import { DataTable } from '../../components/admin/DataTable.jsx';
import { Pagination, usePaginator } from '../../components/admin/Pagination.jsx';
import { StatusBadge } from '../../components/admin/StatusBadge.jsx';
import { useToast } from '../../components/ui/Toast.jsx';
import { listInvoices, viewInvoice, resendInvoice } from '../../api/admin.js';
import { cn } from '../../lib/cn.js';

const STATUSES = ['ALL', 'PAID', 'REFUNDED'];
const fmtDate = (iso) =>
  new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
const fmtINR = (n) => `₹${Number(n ?? 0).toLocaleString('en-IN')}`;

export default function AdminInvoicesPage() {
  const { toast } = useToast();

  const [status, setStatus] = useState('ALL');
  const [rows, setRows]     = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [opening, setOpening] = useState(null);
  const [resending, setResending] = useState(null);
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
    } catch (err) {
      setError(err.response?.data?.error || 'Could not load invoices.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [status, paginator.cursor]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const columns = [
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
    { key: 'program', header: 'Program', render: (r) => <span className="font-mono text-xs">{r.program}</span> },
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
            onClick={() => handleResend(r.id)}
            disabled={resending === r.id}
            className="p-1.5 rounded text-muted hover:text-charcoal hover:bg-soft transition-colors"
            aria-label="Resend confirmation email"
          >
            <Mail size={14} />
          </button>
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
        subtitle="Generated invoices for paid registrations. Refund flow lives in phase 2."
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
    </>
  );
}
