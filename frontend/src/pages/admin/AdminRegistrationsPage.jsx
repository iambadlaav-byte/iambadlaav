/**
 * AdminRegistrationsPage — /admin/registrations
 *
 * Filterable table of registrations with:
 *   - Search (current page only — server endpoint is cursor-paginated)
 *   - Program + paymentStatus filters
 *   - View Details modal (full registration JSON + audit history)
 *   - Resend Confirmation Email action
 *   - CSV export link (opens in a new tab; the server inherits the session cookie)
 */
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Download, Mail, Eye } from 'lucide-react';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader.jsx';
import { DataTable } from '../../components/admin/DataTable.jsx';
import { SearchInput } from '../../components/admin/SearchInput.jsx';
import { Pagination, usePaginator } from '../../components/admin/Pagination.jsx';
import { StatusBadge } from '../../components/admin/StatusBadge.jsx';
import { Modal } from '../../components/admin/Modal.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { useToast } from '../../components/ui/Toast.jsx';
import {
  listRegistrations,
  getRegistration,
  resendConfirmationEmail,
  inviteFromWaitlist,
  registrationsCsvUrl,
} from '../../api/admin.js';
import { cn } from '../../lib/cn.js';

const PROGRAMS = ['ALL', 'BADLAAV', 'FUTURE_READINESS', 'MISSION_UDAAN', 'ANTRANG'];
const PROGRAM_LABELS = {
  BADLAAV:          'The Retreat',
  FUTURE_READINESS: 'The Badlaav Experience',
  MISSION_UDAAN:    'Future programme 1',
  ANTRANG:          'Future programme 2',
};
const PAYMENTS = ['ALL', 'PAID', 'PENDING', 'FAILED', 'REFUNDED'];

// camelCase / snake → "Sentence case" for questionnaire keys.
const humanize = (s) =>
  String(s).replace(/([A-Z])/g, ' $1').replace(/[_-]+/g, ' ').replace(/^./, (c) => c.toUpperCase()).trim();
const fmtVal = (v) => (v === true ? 'Yes' : v === false ? 'No' : v == null || v === '' ? '—' : String(v));

const fmtDate = (iso) =>
  new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
const fmtINR = (n) => `₹${Number(n ?? 0).toLocaleString('en-IN')}`;

export default function AdminRegistrationsPage() {
  const { toast } = useToast();

  const [program, setProgram] = useState('ALL');
  const [payment, setPayment] = useState('ALL');
  const [search, setSearch]   = useState('');
  const [rows, setRows]       = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const paginator = usePaginator();

  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail]         = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [resending, setResending]   = useState(null);

  useEffect(() => {
    paginator.reset();
  }, [program, payment]); // eslint-disable-line react-hooks/exhaustive-deps

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const params = { limit: 25 };
      if (program !== 'ALL') params.program       = program;
      if (payment !== 'ALL') params.paymentStatus = payment;
      if (paginator.cursor)  params.cursor        = paginator.cursor;
      const data = await listRegistrations(params);
      setRows(data.rows ?? []);
      setNextCursor(data.nextCursor ?? null);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not load registrations.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [program, payment, paginator.cursor]); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = search
    ? rows.filter((r) => {
        const q = search.toLowerCase();
        return (
          r.user?.name?.toLowerCase().includes(q) ||
          r.user?.email?.toLowerCase().includes(q) ||
          r.user?.phone?.toLowerCase().includes(q)
        );
      })
    : rows;

  async function openDetail(id) {
    setDetailOpen(true);
    setDetail(null);
    setDetailLoading(true);
    try {
      const data = await getRegistration(id);
      setDetail(data);
    } catch (err) {
      toast(err.response?.data?.error || 'Could not load details.', 'danger');
      setDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleResend(id) {
    setResending(id);
    try {
      await resendConfirmationEmail(id);
      toast('Confirmation email queued.', 'success');
    } catch (err) {
      toast(err.response?.data?.error || 'Resend failed.', 'danger');
    } finally {
      setResending(null);
    }
  }

  async function handleWaitlistInvite(id) {
    try {
      await inviteFromWaitlist(id);
      toast('Waitlist invite sent.', 'success');
      load();
    } catch (err) {
      toast(err.response?.data?.error || 'Invite failed.', 'danger');
    }
  }

  const columns = [
    {
      key: 'who',
      header: 'Participant',
      render: (r) => (
        <div className="flex flex-col">
          <span className="font-medium text-charcoal">{r.user?.name || '—'}</span>
          <span className="text-xs text-muted">{r.user?.email}</span>
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'Phone',
      render: (r) => <span className="font-mono text-xs">{r.user?.phone || '—'}</span>,
    },
    {
      key: 'batch',
      header: 'Batch',
      render: (r) => (
        <div className="flex flex-col">
          <span className="text-charcoal">{r.batch?.name || PROGRAM_LABELS[r.program] || r.program}</span>
          <span className="text-xs text-muted font-mono">{r.plan}</span>
        </div>
      ),
    },
    {
      key: 'candidateId',
      header: 'Candidate ID',
      render: (r) => <span className="font-mono text-xs">{r.candidateId || '—'}</span>,
    },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      render: (r) => <span className="font-mono text-xs">{r.finalAmount != null ? fmtINR(r.finalAmount) : '—'}</span>,
    },
    {
      key: 'paymentStatus',
      header: 'Payment',
      render: (r) => <StatusBadge status={r.paymentStatus} />,
    },
    {
      key: 'invoiceNumber',
      header: 'Invoice',
      render: (r) => <span className="font-mono text-xs">{r.invoiceNumber || '—'}</span>,
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (r) => <span className="text-xs text-muted whitespace-nowrap">{fmtDate(r.createdAt)}</span>,
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (r) => (
        <div className="flex items-center justify-end gap-1">
          {r.status === 'WAITLISTED' && (
            <button
              type="button"
              onClick={() => handleWaitlistInvite(r.id)}
              className="px-2 py-1 rounded text-[11px] font-mono uppercase tracking-widest text-ochre hover:bg-ochre/10 transition-colors"
              title="Invite from waiting list"
            >
              Invite
            </button>
          )}
          <button
            type="button"
            onClick={() => openDetail(r.id)}
            className="p-1.5 rounded text-muted hover:text-charcoal hover:bg-soft transition-colors"
            aria-label="View details"
          >
            <Eye size={14} />
          </button>
          <button
            type="button"
            onClick={() => handleResend(r.id)}
            disabled={resending === r.id || r.paymentStatus !== 'PAID'}
            className={cn(
              'p-1.5 rounded text-muted hover:text-charcoal hover:bg-soft transition-colors',
              (resending === r.id || r.paymentStatus !== 'PAID') && 'opacity-30 cursor-not-allowed'
            )}
            aria-label="Resend confirmation email"
            title={r.paymentStatus === 'PAID' ? 'Resend confirmation email' : 'Resend available only for PAID'}
          >
            <Mail size={14} />
          </button>
        </div>
      ),
    },
  ];

  const csvParams = {};
  if (program !== 'ALL') csvParams.program = program;
  if (payment !== 'ALL') csvParams.paymentStatus = payment;

  return (
    <>
      <Helmet>
        <title>Registrations — Badlaav Admin</title>
      </Helmet>

      <AdminPageHeader
        title="Registrations"
        subtitle="Every booking, paid or pending. Use the CSV export for accounting handoffs."
        actions={
          <a
            href={registrationsCsvUrl(csvParams)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-2 rounded text-sm font-sans bg-ink text-pearl hover:bg-ink/90 transition-colors"
          >
            <Download size={14} /> Export CSV
          </a>
        }
      />

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <SearchInput onSearch={setSearch} placeholder="Search name / email / phone" className="w-64" />
        <FilterChips label="Program" value={program} onChange={setProgram} options={PROGRAMS} labels={PROGRAM_LABELS} />
        <FilterChips label="Payment" value={payment} onChange={setPayment} options={PAYMENTS} />
      </div>

      <DataTable
        columns={columns}
        rows={filtered}
        loading={loading}
        error={error}
        emptyTitle="No registrations yet"
        emptyMessage="Registrations created via /register show up here once submitted."
        rowKey={(r) => r.id}
      />

      <Pagination
        page={paginator.page}
        nextCursor={nextCursor}
        onNext={() => paginator.next(nextCursor)}
        onPrev={paginator.prev}
      />

      {/* Detail modal */}
      <Modal
        open={detailOpen}
        onOpenChange={setDetailOpen}
        title="Registration details"
        size="lg"
      >
        {detailLoading || !detail ? (
          <div className="flex items-center justify-center py-10">
            <Spinner size={20} />
          </div>
        ) : (
          <RegistrationDetail data={detail} />
        )}
      </Modal>
    </>
  );
}

function RegistrationDetail({ data }) {
  const r = data.registration;
  const showMoney = r.finalAmount != null; // backend strips money for Contributor/Viewer
  return (
    <div className="flex flex-col gap-5 text-sm">
      <Section title="Participant">
        <KV k="Name" v={r.user?.name} />
        <KV k="Email" v={r.user?.email} />
        <KV k="Phone" v={r.user?.phone} />
        <KV k="City" v={r.user?.city || '—'} />
        <KV k="State" v={r.user?.state || '—'} />
        <KV k="Courses completed" v={r.user?.coursesCompleted} />
      </Section>

      <Section title="Booking">
        <KV k="Candidate ID" v={r.candidateId || '—'} />
        <KV k="Program" v={PROGRAM_LABELS[r.program] || r.program} />
        <KV k="Plan" v={r.plan} />
        <KV k="Type" v={r.regType} />
        <KV k="Partner name" v={r.partner2Name || '—'} />
        <KV k="Batch" v={r.batch?.name || '—'} />
        <KV k="Venue" v={r.batch?.venue || '—'} />
        <KV k="Status" v={<StatusBadge status={r.status} />} />
        <KV k="Created" v={new Date(r.createdAt).toLocaleString('en-IN')} />
      </Section>

      <Section title="Details">
        <KV k="Age" v={r.age ?? '—'} />
        <KV k="Occupation" v={r.occupation || '—'} />
        <KV k="Dietary / health note" v={r.dietaryNote || '—'} />
      </Section>

      <Section title="Payment">
        {showMoney ? (
          <>
            <KV k="Amount" v={`₹${Number(r.amount).toLocaleString('en-IN')}`} />
            <KV k="Discount" v={`₹${Number(r.discountAmount ?? 0).toLocaleString('en-IN')}`} />
            <KV k="Final" v={`₹${Number(r.finalAmount).toLocaleString('en-IN')}`} />
            <KV k="Coupon" v={r.couponCode || '—'} />
          </>
        ) : (
          <KV k="Amounts" v={<span className="italic text-muted">Hidden for your role</span>} />
        )}
        <KV k="Method" v={r.paymentMethod || 'RAZORPAY'} />
        <KV k="Status" v={<StatusBadge status={r.paymentStatus} />} />
        <KV k="Order ID" v={<span className="font-mono text-xs">{r.razorpayOrderId || '—'}</span>} />
        <KV k="Payment ID" v={<span className="font-mono text-xs">{r.razorpayPaymentId || '—'}</span>} />
        <KV k="Invoice #" v={r.invoiceNumber || '—'} />
        {data.invoiceSignedUrl && (
          <KV
            k="Invoice PDF"
            v={
              <a href={data.invoiceSignedUrl} target="_blank" rel="noopener noreferrer" className="text-teal underline underline-offset-2">
                Open PDF
              </a>
            }
          />
        )}
      </Section>

      {/* Questionnaire — every answer the participant filled at registration. */}
      {r.questionnaire && typeof r.questionnaire === 'object' &&
        Object.entries(r.questionnaire).map(([group, vals]) =>
          vals && typeof vals === 'object' ? (
            <Section key={group} title={`Questionnaire · ${humanize(group)}`}>
              {Object.entries(vals).map(([k, v]) => <KV key={k} k={humanize(k)} v={fmtVal(v)} />)}
            </Section>
          ) : (
            <Section key={group} title="Questionnaire">
              <KV k={humanize(group)} v={fmtVal(vals)} />
            </Section>
          ),
        )}

      <Section title="Recent activity">
        {data.auditRows && data.auditRows.length > 0 ? (
          <ul className="flex flex-col gap-1.5">
            {data.auditRows.map((a) => (
              <li key={a.id} className="flex items-baseline gap-2 text-xs">
                <span className="font-mono text-muted shrink-0">
                  {new Date(a.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="font-mono text-teal">{a.action}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-muted">No audit entries yet.</p>
        )}
      </Section>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h3 className="font-mono text-[10px] uppercase tracking-widest text-muted mb-2">{title}</h3>
      <div className="bg-soft/60 rounded p-3 flex flex-col gap-1">{children}</div>
    </div>
  );
}

function KV({ k, v }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-muted font-sans">{k}</span>
      <span className="text-charcoal text-right break-all">{v ?? '—'}</span>
    </div>
  );
}

function FilterChips({ label, value, onChange, options, labels }) {
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
          {opt === 'ALL' ? 'All' : labels?.[opt] ?? opt}
        </button>
      ))}
    </div>
  );
}

