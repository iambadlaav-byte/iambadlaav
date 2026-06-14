/**
 * AdminSettingsPage — /admin/settings
 *
 * Read-only system health view. Pulls from the public /api/v1/health endpoint
 * which the backend already exposes — no admin-only mutation routes yet.
 *
 * Auto-refreshes every 30 seconds while the page is visible so the on-call
 * admin can leave it open as a "is the system alive?" pane.
 */
import { useEffect, useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  HeartPulse, Database, CreditCard, Activity, Tag, RefreshCw,
} from 'lucide-react';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader.jsx';
import { StatusBadge } from '../../components/admin/StatusBadge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { fetchHealth } from '../../api/admin.js';
import { useAuth } from '../../context/AuthContext.jsx';

function formatUptime(seconds) {
  if (seconds == null) return '—';
  const s = Math.floor(seconds);
  const days = Math.floor(s / 86400);
  const hours = Math.floor((s % 86400) / 3600);
  const mins = Math.floor((s % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h ${mins}m`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastRefresh, setLastRefresh] = useState(null);
  const timer = useRef(null);

  async function load(silent = false) {
    if (!silent) setLoading(true);
    setError('');
    try {
      const data = await fetchHealth();
      setHealth(data);
      setLastRefresh(new Date());
    } catch (err) {
      setError(err.response?.data?.error || 'Could not reach health endpoint.');
    } finally {
      if (!silent) setLoading(false);
    }
  }

  useEffect(() => {
    load();
    timer.current = setInterval(() => load(true), 30_000);
    return () => clearInterval(timer.current);
  }, []);

  return (
    <>
      <Helmet>
        <title>Settings — Badlaav Admin</title>
      </Helmet>

      <AdminPageHeader
        title="Settings"
        subtitle="System health and configuration. Auto-refreshes every 30 seconds."
        actions={
          <Button size="sm" variant="ghost" onClick={() => load()} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </Button>
        }
      />

      {loading && !health ? (
        <div className="flex items-center justify-center py-20">
          <Spinner size={20} />
        </div>
      ) : error && !health ? (
        <div className="bg-danger/10 border border-danger/30 text-danger rounded-lg p-4 text-sm">
          {error}
        </div>
      ) : health && (
        <>
          {/* Health summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <HealthTile
              label="System"
              value={health.status?.toUpperCase()}
              icon={HeartPulse}
              tone={health.status === 'ok' ? 'positive' : 'danger'}
            />
            <HealthTile
              label="Database"
              value={health.database?.toUpperCase()}
              icon={Database}
              tone={health.database === 'connected' ? 'positive' : 'danger'}
            />
            <HealthTile
              label="Razorpay"
              value={health.razorpay?.toUpperCase()}
              icon={CreditCard}
              tone={health.razorpay === 'reachable' ? 'positive' : 'warn'}
            />
            <HealthTile
              label="Uptime"
              value={formatUptime(health.uptime)}
              icon={Activity}
              tone="info"
            />
          </div>

          {/* Build info */}
          <div className="bg-cream rounded-lg border border-muted/20 shadow-sm p-5 mb-6">
            <h2 className="font-display text-lg font-light text-charcoal mb-3">Build</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-sm">
              <KV k="Version" v={<span className="font-mono text-xs">{health.version || 'dev'}</span>} />
              <KV k="Server time" v={new Date(health.timestamp).toLocaleString('en-IN')} />
              <KV k="Last refresh" v={lastRefresh?.toLocaleString('en-IN') ?? '—'} />
              <KV
                k="Build tag"
                v={<span className="font-mono text-xs">{health.version === 'dev' ? 'development' : `prod · ${health.version}`}</span>}
              />
            </dl>
          </div>

          {/* Signed-in admin */}
          <div className="bg-cream rounded-lg border border-muted/20 shadow-sm p-5 mb-6">
            <h2 className="font-display text-lg font-light text-charcoal mb-3">Signed in as</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-sm">
              <KV k="Name"  v={user?.name || '—'} />
              <KV k="Email" v={user?.email} />
              <KV k="Role"  v={<StatusBadge status={user?.role} tone="info" />} />
              <KV
                k="Session"
                v={<span className="text-muted text-xs">Auto-renews via httpOnly refresh cookie every 50 minutes.</span>}
              />
            </dl>
          </div>

          {/* Notes */}
          <div className="bg-soft rounded-lg p-5 text-sm text-muted leading-relaxed">
            <h3 className="font-mono text-[10px] uppercase tracking-widest text-muted mb-2 flex items-center gap-2">
              <Tag size={12} /> Notes
            </h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Database = Supabase pooler · runtime queries use transaction-pooler (port 6543).</li>
              <li>Razorpay = test mode unless RAZORPAY_KEY_ID starts with <code className="font-mono">rzp_live_</code>.</li>
              <li>Refresh cookie = httpOnly + sameSite. Access tokens never leave memory.</li>
              <li>All admin mutations are audit-logged. See the parent project's audit log for details.</li>
            </ul>
          </div>
        </>
      )}
    </>
  );
}

function HealthTile({ label, value, icon: Icon, tone }) {
  const toneClass = {
    positive: 'border-sage/30 text-sage',
    warn:     'border-gold/30 text-gold',
    danger:   'border-danger/30 text-danger',
    info:     'border-teal/30 text-teal',
  }[tone] || 'border-muted/30 text-muted';

  return (
    <div className={`bg-cream rounded-lg border-2 shadow-sm p-5 flex flex-col gap-2 ${toneClass}`}>
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted">{label}</p>
        <Icon size={14} aria-hidden="true" />
      </div>
      <p className="font-display text-2xl font-light leading-tight">{value}</p>
    </div>
  );
}

function KV({ k, v }) {
  return (
    <div>
      <dt className="font-mono text-[10px] uppercase tracking-widest text-muted">{k}</dt>
      <dd className="text-charcoal">{v}</dd>
    </div>
  );
}
