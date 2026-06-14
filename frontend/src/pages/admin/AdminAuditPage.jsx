/**
 * AdminAuditPage — /admin/audit
 *
 * Read-only audit log table. Last 100 rows by default.
 * Filterable by action and actorId.
 * NO animations (CONSTRAINT-CODE-004).
 */
import { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { AdminTable } from '../../components/admin/AdminTable.jsx';
import { ErrorBanner } from '../../components/ui/ErrorBanner.jsx';
import { apiClient } from '../../api/client.js';

const COLUMNS = [
  { key: 'createdAt',   header: 'Time',    render: (v) => new Date(v).toLocaleString('en-IN', { hour12: false }) },
  { key: 'actor',       header: 'Actor',   render: (_, row) => row.actor?.name ?? 'System' },
  { key: 'action',      header: 'Action',  render: (v) => <span className="font-mono text-xs text-teal">{v}</span> },
  { key: 'subjectType', header: 'Subject', render: (_, row) => row.subjectType ? `${row.subjectType} · ${row.subjectId?.slice(0, 8)}` : '—' },
  {
    key: 'meta',
    header: 'Meta',
    render: (v) => v ? (
      <details>
        <summary className="cursor-pointer font-mono text-xs text-muted">Details</summary>
        <pre className="text-xs font-mono text-muted mt-1 whitespace-pre-wrap break-all">{JSON.stringify(v, null, 2)}</pre>
      </details>
    ) : '—',
  },
  { key: 'ipAddress', header: 'IP', render: (v) => <span className="font-mono text-xs text-muted">{v ?? '—'}</span> },
];

export default function AdminAuditPage() {
  const [rows, setRows]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [filterActor, setFilterActor]   = useState('');

  const fetchRows = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { limit: 100 };
      if (filterAction) params.action  = filterAction;
      if (filterActor)  params.actorId = filterActor;
      const res = await apiClient.get('/admin/audit', { params });
      setRows(res.data.rows ?? []);
    } catch {
      setError("Couldn't reach our server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, [filterAction, filterActor]);

  useEffect(() => { fetchRows(); }, [fetchRows]);

  const filterBar = (
    <>
      <input
        type="text"
        className="border border-ink/20 rounded px-2 py-1.5 text-sm font-mono text-charcoal"
        placeholder="Filter by action (e.g. blog.published)"
        value={filterAction}
        onChange={(e) => setFilterAction(e.target.value)}
        aria-label="Filter by action"
      />
      <input
        type="text"
        className="border border-ink/20 rounded px-2 py-1.5 text-sm font-mono text-charcoal"
        placeholder="Filter by actor ID"
        value={filterActor}
        onChange={(e) => setFilterActor(e.target.value)}
        aria-label="Filter by actor"
      />
    </>
  );

  return (
    <>
      <Helmet>
        <title>Audit log — Dnyanpith Admin</title>
      </Helmet>

      <div className="p-6 max-w-6xl">
        <h1 className="font-sans text-xl font-semibold text-charcoal mb-6">Audit log</h1>

        {error && <ErrorBanner message={error} onRetry={fetchRows} className="mb-4" />}

        <AdminTable
          columns={COLUMNS}
          rows={rows}
          isLoading={loading}
          emptyState="No audit entries yet."
          filterBar={filterBar}
        />
      </div>
    </>
  );
}
