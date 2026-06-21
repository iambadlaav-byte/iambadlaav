/**
 * AdminDashboardPage — /admin/dashboard
 *
 * Four KPI tiles + a 14-day registrations bar chart derived client-side from
 * /admin/registrations. Tiles map directly to the backend dashboard endpoint:
 *   { pendingEnquiries, registrationsLast30, upcomingEvents, revenueLast30 }.
 *
 * NO animations beyond chart enter (CONSTRAINT-CODE-004 still allowed for
 * non-form pages; we keep it subtle).
 */
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Users, Inbox, CalendarClock, Wallet, AlertCircle, CheckCircle2, Clock, HeartHandshake, Hourglass } from 'lucide-react';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader.jsx';
import { StatCard } from '../../components/admin/StatCard.jsx';
import { EmptyState } from '../../components/admin/EmptyState.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { fetchDashboardStats, listRegistrations } from '../../api/admin.js';

const INR = (n) => `₹${Number(n ?? 0).toLocaleString('en-IN')}`;

function buildLast14Days(rows) {
  const buckets = new Map();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    buckets.set(key, { day: key.slice(5), count: 0 });
  }

  for (const r of rows) {
    const key = new Date(r.createdAt).toISOString().slice(0, 10);
    const b = buckets.get(key);
    if (b) b.count += 1;
  }

  return [...buckets.values()];
}

export default function AdminDashboardPage() {
  const [stats, setStats]   = useState(null);
  const [chart, setChart]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
      const [stats, regs] = await Promise.all([
        fetchDashboardStats(),
        listRegistrations({ from: fourteenDaysAgo, limit: 100 }),
      ]);
      setStats(stats);
      setChart(buildLast14Days(regs.rows ?? []));
    } catch (err) {
      setError(err.response?.data?.error || 'Could not load dashboard. Try again.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <>
      <Helmet>
        <title>Dashboard — Badlaav Admin</title>
      </Helmet>

      <AdminPageHeader
        title="Dashboard"
        subtitle="At-a-glance health of registrations, revenue, and inbox."
      />

      {error && (
        <div className="mb-6">
          <EmptyState
            icon={AlertCircle}
            title="Couldn't load dashboard"
            message={error}
            action={<Button size="sm" onClick={load}>Retry</Button>}
          />
        </div>
      )}

      {/* Stat tiles — the 7 headline metrics (+ enquiries). Revenue is Admin-only. */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total registrations"
          value={loading ? '—' : stats?.totalRegistrations ?? 0}
          hint="Active + completed registrations."
          icon={Users}
          loading={loading}
          accent="navy"
        />
        <StatCard
          label="Paid registrations"
          value={loading ? '—' : stats?.paidRegistrations ?? 0}
          hint="Registrations with payment captured."
          icon={CheckCircle2}
          loading={loading}
          accent="sage"
        />
        <StatCard
          label="Pending payments"
          value={loading ? '—' : stats?.pendingPayments ?? 0}
          hint="Started checkout but not yet paid."
          icon={Clock}
          loading={loading}
          accent="gold"
        />
        {stats?.revenueTotal !== undefined && (
          <StatCard
            label="Revenue"
            value={loading ? '—' : INR(stats?.revenueTotal)}
            hint="All paid registrations."
            icon={Wallet}
            loading={loading}
            accent="sage"
          />
        )}
        <StatCard
          label="Upcoming batches"
          value={loading ? '—' : stats?.upcomingBatches ?? 0}
          hint="Open batches starting in the future."
          icon={CalendarClock}
          loading={loading}
          accent="teal"
        />
        <StatCard
          label="Volunteers"
          value={loading ? '—' : stats?.volunteers ?? 0}
          hint="Volunteer applications."
          icon={HeartHandshake}
          loading={loading}
          accent="gold"
        />
        <StatCard
          label="Waiting list"
          value={loading ? '—' : stats?.waitlist ?? 0}
          hint="Registrations waiting for a seat."
          icon={Hourglass}
          loading={loading}
          accent="navy"
        />
        <StatCard
          label="New enquiries"
          value={loading ? '—' : stats?.pendingEnquiries ?? 0}
          hint="Enquiries awaiting first contact."
          icon={Inbox}
          loading={loading}
          accent="teal"
        />
      </div>

      {/* Registrations chart */}
      <div className="bg-cream rounded-lg border border-muted/20 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display text-lg font-light text-charcoal leading-none">
              Registrations · last 14 days
            </h2>
            <p className="text-xs text-muted font-sans mt-1">
              Counts all registrations created per day (PAID + PENDING).
            </p>
          </div>
        </div>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chart} margin={{ top: 8, right: 8, bottom: 0, left: -24 }}>
              <CartesianGrid strokeDasharray="2 4" vertical={false} stroke="rgba(0,0,0,0.06)" />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 10, fontFamily: 'monospace', fill: '#7a7a7a' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 10, fontFamily: 'monospace', fill: '#7a7a7a' }}
                axisLine={false}
                tickLine={false}
                width={32}
              />
              <Tooltip
                cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                contentStyle={{
                  backgroundColor: '#fbf6ec',
                  border: '1px solid rgba(0,0,0,0.1)',
                  borderRadius: 6,
                  fontSize: 12,
                  fontFamily: 'sans-serif',
                }}
                labelStyle={{ color: '#2a2a2a' }}
              />
              <Bar dataKey="count" fill="currentColor" className="text-gold" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}
