/**
 * AdminSettingsPage — /admin/settings
 *
 * System health view plus staff administration:
 *   - Health/Build/Signed-in/Notes (read-only, auto-refreshing).
 *   - Team (Admin only): list staff, change roles, reset passwords, add members.
 *   - Change your password (all staff).
 *   - Login activity (Admin only): merged success/failed sign-in audit log.
 *
 * The health pane auto-refreshes every 30 seconds while the page is visible so
 * the on-call admin can leave it open as a "is the system alive?" pane.
 */
import { useEffect, useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  HeartPulse, Database, CreditCard, Activity, Tag, RefreshCw,
  UserPlus, KeyRound, Users, ShieldCheck, Trash2,
} from 'lucide-react';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader.jsx';
import { StatusBadge } from '../../components/admin/StatusBadge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { Input } from '../../components/ui/Input.jsx';
import {
  fetchHealth,
  listStaffUsers,
  createStaffUser,
  updateStaffUserRole,
  resetUserPassword,
  deleteStaffUser,
  fetchLoginLogs,
} from '../../api/admin.js';
import { useAuth } from '../../context/AuthContext.jsx';

const ROLES = ['ADMIN', 'CONTRIBUTOR', 'VIEWER'];
const MIN_PASSWORD = 8;

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

const fmtDateTime = (iso) => (iso ? new Date(iso).toLocaleString('en-IN') : '—');

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPERADMIN';
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
        subtitle="System health, team, and your account. Health auto-refreshes every 30 seconds."
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

          {/* Team — Admin only */}
          {isAdmin && <TeamSection />}

          {/* Change your password — all staff */}
          <ChangePasswordSection />

          {/* Login activity — Admin only */}
          {isAdmin && <LoginActivitySection />}

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

// ── Team (Admin only) ──────────────────────────────────────────────────────────

function TeamSection() {
  const { user: me } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      setRows(await listStaffUsers());
    } catch (err) {
      setError(err.response?.data?.error || 'Could not load team members.');
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  function handleCreated(newUser) {
    setRows((prev) => [newUser, ...prev]);
  }
  function handleRoleChanged(id, role) {
    setRows((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
  }
  function handleDeleted(id) {
    setRows((prev) => prev.filter((u) => u.id !== id));
  }

  return (
    <div className="bg-cream rounded-lg border border-muted/20 shadow-sm p-5 mb-6">
      <h2 className="font-display text-lg font-light text-charcoal mb-1 flex items-center gap-2">
        <Users size={16} className="text-muted" /> Team
      </h2>
      <p className="text-sm text-muted mb-4">
        Manage who can sign in. Roles gate what each member can do across the admin panel.
      </p>

      {loading ? (
        <div className="flex items-center justify-center py-10"><Spinner size={18} /></div>
      ) : error ? (
        <div className="bg-danger/10 border border-danger/30 text-danger rounded p-3 text-sm">{error}</div>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted">No team members yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-muted/20 text-left">
                <Th>Name</Th>
                <Th>Email</Th>
                <Th>Role</Th>
                <Th>Last login</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => (
                <TeamRow
                  key={u.id}
                  staff={u}
                  currentRole={me?.role}
                  currentUserId={me?.id}
                  onRoleChanged={handleRoleChanged}
                  onDeleted={handleDeleted}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AddTeamMemberForm onCreated={handleCreated} />
    </div>
  );
}

function TeamRow({ staff, currentRole, currentUserId, onRoleChanged, onDeleted }) {
  const [roleError, setRoleError] = useState('');
  const [savingRole, setSavingRole] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [delError, setDelError] = useState('');

  const isSuperActor = currentRole === 'SUPERADMIN';
  const targetIsSuper = staff.role === 'SUPERADMIN';
  // A regular ADMIN can delete CONTRIBUTOR/VIEWER; only a SUPERADMIN can delete an
  // ADMIN. Nobody deletes a SUPERADMIN here, and nobody deletes themselves.
  const canDelete =
    staff.id !== currentUserId &&
    !targetIsSuper &&
    (staff.role !== 'ADMIN' || isSuperActor);

  async function remove() {
    setDelError('');
    setDeleting(true);
    try {
      await deleteStaffUser(staff.id);
      onDeleted(staff.id);
    } catch (err) {
      setDelError(err.response?.data?.error || 'Could not delete.');
      setDeleting(false);
    }
  }

  async function changeRole(nextRole) {
    if (nextRole === staff.role) return;
    setRoleError('');
    setSavingRole(true);
    try {
      const updated = await updateStaffUserRole(staff.id, nextRole);
      onRoleChanged(staff.id, updated.role);
    } catch (err) {
      if (err.response?.data?.error === 'LAST_ADMIN') {
        setRoleError("Can't remove the last admin.");
      } else {
        setRoleError(err.response?.data?.error || 'Could not change role.');
      }
      // Revert the <select> to the unchanged role.
      onRoleChanged(staff.id, staff.role);
    } finally {
      setSavingRole(false);
    }
  }

  return (
    <>
      <tr className="border-b border-muted/10">
        <Td className="font-medium text-charcoal">{staff.name || '—'}</Td>
        <Td className="text-muted">{staff.email}</Td>
        <Td>
          <div className="flex flex-col gap-1">
            {targetIsSuper ? (
              <span className="font-mono text-[11px] uppercase tracking-widest text-ochre">SUPERADMIN</span>
            ) : (
              <select
                value={staff.role}
                disabled={savingRole}
                onChange={(e) => changeRole(e.target.value)}
                className="font-mono text-[11px] uppercase tracking-widest bg-cream border border-muted/40 rounded px-2 py-1 text-charcoal focus:border-teal focus:outline focus:outline-2 focus:outline-teal focus:outline-offset-2 disabled:opacity-50"
                aria-label={`Role for ${staff.email}`}
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            )}
            {roleError && <span className="text-danger text-xs" role="alert">{roleError}</span>}
          </div>
        </Td>
        <Td className="text-muted text-xs whitespace-nowrap">{fmtDateTime(staff.lastLoginAt)}</Td>
        <Td className="text-right">
          <div className="inline-flex items-center gap-1 justify-end">
            <button
              type="button"
              onClick={() => setResetOpen((v) => !v)}
              className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-mono uppercase tracking-widest text-teal hover:bg-teal/10 transition-colors"
            >
              <KeyRound size={12} /> Reset password
            </button>
            {canDelete && (confirmDel ? (
              <>
                <button type="button" onClick={remove} disabled={deleting}
                  className="px-2 py-1 rounded text-[11px] font-mono uppercase tracking-widest text-danger hover:bg-danger/10 transition-colors disabled:opacity-50">
                  {deleting ? '…' : 'Confirm'}
                </button>
                <button type="button" onClick={() => setConfirmDel(false)} disabled={deleting}
                  className="px-2 py-1 rounded text-[11px] font-mono uppercase tracking-widest text-muted hover:bg-muted/10 transition-colors">
                  No
                </button>
              </>
            ) : (
              <button type="button" onClick={() => { setDelError(''); setConfirmDel(true); }}
                className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-mono uppercase tracking-widest text-danger hover:bg-danger/10 transition-colors">
                <Trash2 size={12} /> Delete
              </button>
            ))}
          </div>
          {delError && <span className="block text-danger text-xs mt-1" role="alert">{delError}</span>}
        </Td>
      </tr>
      {resetOpen && (
        <tr className="border-b border-muted/10 bg-soft/50">
          <td colSpan={5} className="px-3 py-3">
            <ResetPasswordInline
              staff={staff}
              onDone={() => setResetOpen(false)}
            />
          </td>
        </tr>
      )}
    </>
  );
}

function ResetPasswordInline({ staff, onDone }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);

  async function submit() {
    setError('');
    if (password.length < MIN_PASSWORD) {
      setError(`At least ${MIN_PASSWORD} characters.`);
      return;
    }
    setPending(true);
    try {
      await resetUserPassword(staff.id, password);
      setDone(true);
      setPassword('');
      // Auto-close shortly after the confirmation shows.
      setTimeout(() => onDone(), 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not reset password.');
    } finally {
      setPending(false);
    }
  }

  if (done) {
    return (
      <p className="text-sage text-sm flex items-center gap-2" role="status">
        <ShieldCheck size={14} /> Password reset for {staff.email}.
      </p>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-2">
      <div className="flex-1 max-w-xs">
        <Input
          type="password"
          autoComplete="new-password"
          placeholder={`New password for ${staff.email}`}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={error}
        />
      </div>
      <div className="flex items-center gap-2 pt-0.5">
        <Button size="sm" onClick={submit} loading={pending} disabled={pending}>Set password</Button>
        <Button size="sm" variant="ghost" onClick={onDone} disabled={pending}>Cancel</Button>
      </div>
    </div>
  );
}

function AddTeamMemberForm({ onCreated }) {
  const [form, setForm] = useState({ name: '', email: '', role: 'VIEWER', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [pending, setPending] = useState(false);

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validate() {
    const next = {};
    if (!form.name.trim()) next.name = 'Name is required.';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) next.email = 'Check the email format.';
    if (form.password.length < MIN_PASSWORD) next.password = `At least ${MIN_PASSWORD} characters.`;
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function submit(e) {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;
    setPending(true);
    try {
      const user = await createStaffUser({
        name: form.name.trim(),
        email: form.email.trim(),
        role: form.role,
        password: form.password,
      });
      onCreated(user);
      setForm({ name: '', email: '', role: 'VIEWER', password: '' });
      setErrors({});
    } catch (err) {
      if (err.response?.data?.error === 'EMAIL_TAKEN') {
        setErrors((prev) => ({ ...prev, email: 'That email is already in use.' }));
      } else {
        setServerError(err.response?.data?.error || 'Could not add team member.');
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-6 pt-5 border-t border-muted/20">
      <h3 className="font-mono text-[10px] uppercase tracking-widest text-muted mb-3 flex items-center gap-2">
        <UserPlus size={12} /> Add team member
      </h3>
      {serverError && (
        <div className="bg-danger/10 border border-danger/30 text-danger rounded p-3 text-sm mb-3">{serverError}</div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          label="Name"
          value={form.name}
          onChange={(e) => setField('name', e.target.value)}
          error={errors.name}
        />
        <Input
          label="Email"
          type="email"
          autoComplete="off"
          value={form.email}
          onChange={(e) => setField('email', e.target.value)}
          error={errors.email}
        />
        <div className="flex flex-col gap-1">
          <label className="font-mono text-xs uppercase tracking-widest text-muted" htmlFor="new-staff-role">Role</label>
          <select
            id="new-staff-role"
            value={form.role}
            onChange={(e) => setField('role', e.target.value)}
            className="font-sans text-base text-charcoal bg-cream py-3 px-4 rounded min-h-[44px] w-full border border-muted/40 focus:border-teal focus:outline focus:outline-2 focus:outline-teal focus:outline-offset-2"
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
        <Input
          label="Password"
          type="password"
          autoComplete="new-password"
          helper={`At least ${MIN_PASSWORD} characters`}
          value={form.password}
          onChange={(e) => setField('password', e.target.value)}
          error={errors.password}
        />
      </div>
      <div className="mt-4">
        <Button size="sm" type="submit" loading={pending} disabled={pending}>
          <UserPlus size={14} /> Add member
        </Button>
      </div>
    </form>
  );
}

// ── Change your password (all staff) ───────────────────────────────────────────

function ChangePasswordSection() {
  const { changePassword } = useAuth();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);
  const [pending, setPending] = useState(false);

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validate() {
    const next = {};
    if (!form.currentPassword) next.currentPassword = 'Enter your current password.';
    if (form.newPassword.length < MIN_PASSWORD) next.newPassword = `At least ${MIN_PASSWORD} characters.`;
    if (form.confirmPassword !== form.newPassword) next.confirmPassword = 'Passwords do not match.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function submit(e) {
    e.preventDefault();
    setServerError('');
    setSuccess(false);
    if (!validate()) return;
    setPending(true);
    try {
      await changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword });
      setSuccess(true);
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setErrors({});
    } catch (err) {
      const status = err.response?.status;
      const code = err.response?.data?.error;
      if (status === 401 || code === 'INVALID_CREDENTIALS') {
        setErrors((prev) => ({ ...prev, currentPassword: 'Current password is incorrect.' }));
      } else if (code === 'NO_PASSWORD_SET') {
        setServerError('Your account uses email-OTP sign-in; no password to change.');
      } else {
        setServerError(code || 'Could not change password.');
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="bg-cream rounded-lg border border-muted/20 shadow-sm p-5 mb-6">
      <h2 className="font-display text-lg font-light text-charcoal mb-1 flex items-center gap-2">
        <KeyRound size={16} className="text-muted" /> Change your password
      </h2>
      <p className="text-sm text-muted mb-4">Choose a new password for your own account.</p>

      {serverError && (
        <div className="bg-danger/10 border border-danger/30 text-danger rounded p-3 text-sm mb-3">{serverError}</div>
      )}
      {success && (
        <p className="text-sage text-sm flex items-center gap-2 mb-3" role="status">
          <ShieldCheck size={14} /> Password changed. Your session has been refreshed.
        </p>
      )}

      <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl">
        <div className="sm:col-span-2 max-w-sm">
          <Input
            label="Current password"
            type="password"
            autoComplete="current-password"
            value={form.currentPassword}
            onChange={(e) => setField('currentPassword', e.target.value)}
            error={errors.currentPassword}
          />
        </div>
        <Input
          label="New password"
          type="password"
          autoComplete="new-password"
          helper={`At least ${MIN_PASSWORD} characters`}
          value={form.newPassword}
          onChange={(e) => setField('newPassword', e.target.value)}
          error={errors.newPassword}
        />
        <Input
          label="Confirm new password"
          type="password"
          autoComplete="new-password"
          value={form.confirmPassword}
          onChange={(e) => setField('confirmPassword', e.target.value)}
          error={errors.confirmPassword}
        />
        <div className="sm:col-span-2 mt-1">
          <Button size="sm" type="submit" loading={pending} disabled={pending}>
            Update password
          </Button>
        </div>
      </form>
    </div>
  );
}

// ── Login activity (Admin only) ────────────────────────────────────────────────

function LoginActivitySection() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      setRows(await fetchLoginLogs(50));
    } catch (err) {
      setError(err.response?.data?.error || 'Could not load login activity.');
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  return (
    <div className="bg-cream rounded-lg border border-muted/20 shadow-sm p-5 mb-6">
      <div className="flex items-center justify-between mb-1">
        <h2 className="font-display text-lg font-light text-charcoal flex items-center gap-2">
          <ShieldCheck size={16} className="text-muted" /> Login activity
        </h2>
        <Button size="sm" variant="ghost" onClick={load} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
        </Button>
      </div>
      <p className="text-sm text-muted mb-4">Recent admin sign-in attempts, newest first.</p>

      {loading ? (
        <div className="flex items-center justify-center py-10"><Spinner size={18} /></div>
      ) : error ? (
        <div className="bg-danger/10 border border-danger/30 text-danger rounded p-3 text-sm">{error}</div>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted">No login activity recorded yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-muted/20 text-left">
                <Th>When</Th>
                <Th>Who</Th>
                <Th>Result</Th>
                <Th>IP</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const success = r.action === 'admin.login.success';
                const who = r.actor?.email || r.meta?.email || '—';
                return (
                  <tr key={r.id} className="border-b border-muted/10">
                    <Td className="text-muted text-xs whitespace-nowrap">{fmtDateTime(r.createdAt)}</Td>
                    <Td className="text-charcoal">{who}</Td>
                    <Td>
                      <StatusBadge
                        status={success ? 'Success' : 'Failed'}
                        tone={success ? 'positive' : 'danger'}
                      />
                    </Td>
                    <Td className="font-mono text-xs text-muted">{r.ipAddress || '—'}</Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Small presentational helpers ───────────────────────────────────────────────

function Th({ children, className = '' }) {
  return (
    <th className={`py-2 pr-3 font-mono text-[10px] uppercase tracking-widest text-muted font-medium ${className}`}>
      {children}
    </th>
  );
}

function Td({ children, className = '' }) {
  return <td className={`py-2 pr-3 align-top ${className}`}>{children}</td>;
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
