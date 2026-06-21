/**
 * AdminCommunityPage — /admin/community
 *
 * Community members table filterable by initiative + city.
 * [Export CSV] and [Export WhatsApp list] both trigger the same CSV download
 * (CSV includes whatsappLink column by design).
 * NO animations (CONSTRAINT-CODE-004).
 */
import { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { AdminTable } from '../../components/admin/AdminTable.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { ErrorBanner } from '../../components/ui/ErrorBanner.jsx';
import { apiClient } from '../../api/client.js';

const INITIATIVES = ['', 'VACHAN_VARI', 'ANTRANG', 'FIVE_AM_CLUB', 'GET_TOGETHER'];

const COLUMNS = [
  { key: 'name',       header: 'Name' },
  { key: 'phone',      header: 'Phone' },
  { key: 'city',       header: 'City' },
  { key: 'email',      header: 'Email', render: (v) => v ?? '—' },
  { key: 'initiative', header: 'Initiative', render: (v) => v?.replace('_', ' ') },
  { key: 'joinedAt',   header: 'Joined',  render: (v) => new Date(v).toLocaleDateString('en-IN') },
];

function triggerDownload(blobData, filename) {
  const url = URL.createObjectURL(new Blob([blobData]));
  const a   = document.createElement('a');
  a.href     = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function AdminCommunityPage() {
  const [rows, setRows]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [filterInit, setFilterInit] = useState('');
  const [filterCity, setFilterCity] = useState('');

  const fetchRows = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (filterInit) params.initiative = filterInit;
      if (filterCity) params.city       = filterCity;
      const res = await apiClient.get('/admin/community', { params });
      setRows(res.data.rows ?? []);
    } catch {
      setError("Couldn't reach our server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, [filterInit, filterCity]);

  useEffect(() => { fetchRows(); }, [fetchRows]);

  async function handleExport() {
    try {
      const params = {};
      if (filterInit) params.initiative = filterInit;
      if (filterCity) params.city       = filterCity;
      const res = await apiClient.get('/admin/community/export.csv', { params, responseType: 'blob' });
      triggerDownload(res.data, 'community.csv');
    } catch {
      setError("Couldn't export. Try again.");
    }
  }

  const filterBar = (
    <>
      <select
        className="border border-ink/20 rounded px-2 py-1.5 text-sm font-sans text-charcoal bg-pearl"
        value={filterInit}
        onChange={(e) => setFilterInit(e.target.value)}
        aria-label="Filter by initiative"
      >
        {INITIATIVES.map((v) => (
          <option key={v} value={v}>{v ? v.replace('_', ' ') : 'All initiatives'}</option>
        ))}
      </select>
      <input
        type="text"
        className="border border-ink/20 rounded px-2 py-1.5 text-sm font-sans text-charcoal"
        placeholder="Filter by city"
        value={filterCity}
        onChange={(e) => setFilterCity(e.target.value)}
        aria-label="Filter by city"
      />
    </>
  );

  const exportButton = (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="sm" onClick={handleExport}>
        Export CSV
      </Button>
      <Button variant="ghost" size="sm" onClick={handleExport}>
        Export WhatsApp list
      </Button>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>Community — Badlaav Admin</title>
      </Helmet>

      <div className="p-6 max-w-5xl">
        <h1 className="font-sans text-xl font-semibold text-charcoal mb-6">Community database</h1>

        {error && <ErrorBanner message={error} onRetry={fetchRows} className="mb-4" />}

        <AdminTable
          columns={COLUMNS}
          rows={rows}
          isLoading={loading}
          emptyState="No community members yet."
          filterBar={filterBar}
          exportButton={exportButton}
        />
      </div>
    </>
  );
}
