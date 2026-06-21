/**
 * AdminReportsPage — /admin/reports
 *
 * Aggregated registration counts (and revenue, when permitted) grouped by a
 * chosen dimension, with an optional created-at date range and CSV export.
 *
 * Revenue is gated SERVER-SIDE (canSeeFinancials). This page simply renders the
 * Revenue column only when the response carries financialsVisible / per-row
 * revenue — Contributor/Viewer never receive the numbers.
 */
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Download, RefreshCw } from 'lucide-react';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader.jsx';
import { DataTable } from '../../components/admin/DataTable.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { fetchReports, reportsCsvUrl } from '../../api/admin.js';

const GROUP_OPTIONS = [
  { value: 'program',  label: 'Programme' },
  { value: 'batch',    label: 'Batch' },
  { value: 'location', label: 'Location' },
  { value: 'date',     label: 'Month' },
  { value: 'status',   label: 'Status' },
];

const fmtINR = (n) => `₹${Number(n ?? 0).toLocaleString('en-IN')}`;

export default function AdminReportsPage() {
  const [groupBy, setGroupBy] = useState('program');
  const [from, setFrom] = useState('');
  const [to, setTo]     = useState('');

  const [rows, setRows]     = useState([]);
  const [totals, setTotals] = useState(null);
  const [financialsVisible, setFinancialsVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  function buildParams() {
    const params = { groupBy };
    if (from) params.from = from;
    if (to)   params.to   = to;
    return params;
  }

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchReports(buildParams());
      setRows(data.rows ?? []);
      setTotals(data.totals ?? null);
      setFinancialsVisible(Boolean(data.financialsVisible));
    } catch (err) {
      setError(err.response?.data?.error || 'Could not load reports.');
    } finally {
      setLoading(false);
    }
  }

  // Reload whenever the grouping dimension changes; date range applies on Refresh.
  useEffect(() => { load(); }, [groupBy]); // eslint-disable-line react-hooks/exhaustive-deps

  const columns = [
    { key: 'label',      header: 'Group',      render: (r) => <span className="font-medium text-charcoal">{r.label}</span> },
    { key: 'total',      header: 'Total',      align: 'right', render: (r) => <span className="font-mono text-xs">{r.total}</span> },
    { key: 'paid',       header: 'Paid',       align: 'right', render: (r) => <span className="font-mono text-xs">{r.paid}</span> },
    { key: 'pending',    header: 'Pending',    align: 'right', render: (r) => <span className="font-mono text-xs">{r.pending}</span> },
    { key: 'waitlisted', header: 'Waitlisted', align: 'right', render: (r) => <span className="font-mono text-xs">{r.waitlisted}</span> },
    ...(financialsVisible
      ? [{ key: 'revenue', header: 'Revenue', align: 'right', render: (r) => <span className="font-mono text-xs">{fmtINR(r.revenue)}</span> }]
      : []),
  ];

  return (
    <>
      <Helmet>
        <title>Reports — Badlaav Admin</title>
      </Helmet>

      <AdminPageHeader
        title="Reports"
        subtitle="Registration counts grouped by programme, batch, location, month, or status."
        actions={
          <a
            href={reportsCsvUrl(buildParams())}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-2 rounded text-sm font-sans bg-ink text-pearl hover:bg-ink/90 transition-colors"
          >
            <Download size={14} /> Export CSV
          </a>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-4 mb-4">
        <label className="flex flex-col gap-1">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted">Group by</span>
          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value)}
            className="rounded border border-muted/30 bg-cream px-3 py-2 text-sm font-sans text-charcoal"
          >
            {GROUP_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted">From</span>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="rounded border border-muted/30 bg-cream px-3 py-2 text-sm font-sans text-charcoal"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted">To</span>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="rounded border border-muted/30 bg-cream px-3 py-2 text-sm font-sans text-charcoal"
          />
        </label>

        <Button size="sm" variant="secondary" onClick={load} loading={loading}>
          <RefreshCw size={14} /> Refresh
        </Button>
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
        error={error}
        emptyTitle="No registrations match"
        emptyMessage="Adjust the grouping or date range to see aggregated counts."
        rowKey={(r) => r.key}
      />

      {/* Totals strip */}
      {!loading && !error && totals && (
        <div className="mt-3 flex flex-wrap items-center justify-end gap-x-6 gap-y-1 px-4 py-3 bg-soft/60 rounded-lg border border-muted/20 text-sm font-sans">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted">Totals</span>
          <Total label="Total" value={totals.total} />
          <Total label="Paid" value={totals.paid} />
          <Total label="Pending" value={totals.pending} />
          <Total label="Waitlisted" value={totals.waitlisted} />
          {financialsVisible && <Total label="Revenue" value={fmtINR(totals.revenue)} />}
        </div>
      )}
    </>
  );
}

function Total({ label, value }) {
  return (
    <span className="inline-flex items-baseline gap-1.5">
      <span className="text-muted">{label}</span>
      <span className="font-mono text-charcoal">{value}</span>
    </span>
  );
}
