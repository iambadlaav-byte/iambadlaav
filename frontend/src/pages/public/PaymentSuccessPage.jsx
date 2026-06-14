/**
 * PaymentSuccessPage — /payment-success?reg=<registrationId>
 *
 * On mount: polls GET /api/v1/registrations/:id every 2s for up to 30s
 * waiting for paymentStatus === 'PAID' (webhook is async).
 *
 * States:
 *   polling  — "Confirming your payment…" with spinner
 *   paid     — "Payment confirmed." with receipt, invoice download, next steps
 *   timeout  — "Still confirming…" with WhatsApp fallback
 *   error    — missing ?reg param or API error
 *
 * T-05-13: this page NEVER sets payment state — it only reads it.
 * No animations (CONSTRAINT-CODE-004 — post-payment is still a functional page).
 */
import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Check, Download, Calendar, ArrowRight } from 'lucide-react';
import { apiClient } from '../../api/client.js';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { WHATSAPP_NUMBER } from '../../lib/constants.js';
import { cn } from '../../lib/cn.js';

const POLL_INTERVAL_MS = 2000;
const POLL_TIMEOUT_MS  = 30000;

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate        = useNavigate();
  const regId           = searchParams.get('reg');

  const [status, setStatus]             = useState('polling'); // 'polling' | 'paid' | 'timeout' | 'error'
  const [registration, setRegistration] = useState(null);
  const intervalRef                     = useRef(null);
  const timeoutRef                      = useRef(null);

  useEffect(() => {
    if (!regId) {
      // No reg param — redirect to home
      navigate('/', { replace: true });
      return;
    }

    let elapsed = 0;

    const poll = async () => {
      try {
        const res = await apiClient.get(`/registrations/${regId}`);
        const reg = res.data?.registration ?? res.data;

        if (reg?.paymentStatus === 'PAID') {
          setRegistration(reg);
          setStatus('paid');
          clearInterval(intervalRef.current);
          clearTimeout(timeoutRef.current);
        }
      } catch {
        // API down (expected during local preview) — keep polling
      }

      elapsed += POLL_INTERVAL_MS;
      if (elapsed >= POLL_TIMEOUT_MS) {
        clearInterval(intervalRef.current);
        setStatus('timeout');
      }
    };

    // First poll immediately
    poll();
    intervalRef.current = setInterval(poll, POLL_INTERVAL_MS);
    timeoutRef.current  = setTimeout(() => {
      clearInterval(intervalRef.current);
      setStatus((s) => s === 'polling' ? 'timeout' : s);
    }, POLL_TIMEOUT_MS);

    return () => {
      clearInterval(intervalRef.current);
      clearTimeout(timeoutRef.current);
    };
  }, [regId, navigate]);

  if (status === 'polling') {
    return (
      <>
        <Helmet><title>Confirming payment — Dnyanpith</title></Helmet>
        <main className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4">
          <Spinner size={36} />
          <p className="font-sans text-muted text-sm">Confirming your payment…</p>
        </main>
      </>
    );
  }

  if (status === 'timeout') {
    return (
      <>
        <Helmet><title>Payment confirming — Dnyanpith</title></Helmet>
        <main className="flex flex-col items-center justify-center min-h-[60vh] gap-5 px-4 text-center max-w-[--container-narrow] mx-auto">
          <div className="w-12 h-12 rounded-full bg-soft flex items-center justify-center">
            <Spinner size={20} />
          </div>
          <h1 className="font-display text-3xl font-light text-charcoal">Still confirming…</h1>
          <p className="text-charcoal font-sans">
            Your payment is being processed. Check your email in a few minutes — we'll send a confirmation once it's through.
          </p>
          <p className="text-muted text-sm">
            If you need confirmation right now,{' '}
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal underline underline-offset-2"
            >
              talk on WhatsApp
            </a>
            .
          </p>
          <Button variant="ghost" onClick={() => window.location.reload()}>
            Refresh
          </Button>
        </main>
      </>
    );
  }

  // ── Paid state ─────────────────────────────────────────────────────────────
  const reg         = registration ?? {};
  const programLabels = {
    BADLAAV:          'Badlaav Retreat',
    MISSION_UDAAN:    'Mission Udaan',
    FUTURE_READINESS: 'Future Readiness',
    ANTRANG:          'Antrang',
  };
  const programDisplay = programLabels[reg.program] ?? reg.program ?? '';
  const batchName      = reg.batch?.name ?? '';
  const batchDate      = reg.batch?.startDate
    ? new Date(reg.batch.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  return (
    <>
      <Helmet>
        <title>You're registered — Dnyanpith</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <main className="max-w-[--container-narrow] mx-auto px-4 py-12">
        {/* Success header */}
        <div className="flex flex-col items-center gap-4 mb-10 text-center">
          <div className="w-14 h-14 rounded-full bg-sage flex items-center justify-center">
            <Check size={28} className="text-pearl" strokeWidth={2.5} />
          </div>

          <h1 className="font-display text-4xl font-light text-charcoal">
            Payment confirmed.
          </h1>

          <p className="font-sans text-charcoal text-base">
            You're all set{batchDate ? ` for ${programDisplay} on ${batchDate}` : ` for ${programDisplay}`}.
          </p>
        </div>

        {/* Receipt card */}
        <div className="border border-soft rounded bg-cream p-6 mb-8 flex flex-col gap-3">
          <h2 className="font-mono text-[10px] uppercase tracking-widest text-muted mb-1">
            Receipt
          </h2>

          {reg.invoiceNumber && (
            <div className="flex justify-between text-sm">
              <span className="text-muted">Invoice</span>
              <span className="font-medium text-charcoal">{reg.invoiceNumber}</span>
            </div>
          )}

          <div className="flex justify-between text-sm">
            <span className="text-muted">Program</span>
            <span className="font-medium text-charcoal">{programDisplay}</span>
          </div>

          {batchName && (
            <div className="flex justify-between text-sm">
              <span className="text-muted">Batch</span>
              <span className="font-medium text-charcoal">{batchName}</span>
            </div>
          )}

          <div className="flex justify-between text-sm">
            <span className="text-muted">Amount paid</span>
            <span className="font-display text-lg font-light text-charcoal">
              ₹{Number(reg.finalAmount ?? reg.amount ?? 0).toLocaleString('en-IN')}
            </span>
          </div>

          {reg.couponCode && reg.discountAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted">Coupon</span>
              <span className="text-sage">{reg.couponCode} — ₹{Number(reg.discountAmount).toLocaleString('en-IN')} off</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 mb-10">
          {reg.invoiceUrl && (
            <Button
              variant="primary"
              onClick={() => window.open(reg.invoiceUrl, '_blank')}
              className="w-full"
            >
              <Download size={16} />
              Download Invoice
            </Button>
          )}

          {reg.batch?.startDate && reg.batch?.endDate && (
            <Button
              variant="secondary"
              onClick={() => downloadIcs(reg, programDisplay)}
              className="w-full"
            >
              <Calendar size={16} />
              Add to Calendar
            </Button>
          )}

          <Button
            as={Link}
            variant="ghost"
            to="/account/dashboard"
            className="w-full justify-center"
          >
            Go to Dashboard
            <ArrowRight size={14} />
          </Button>
        </div>

        {/* What happens next */}
        <div className="border-t border-soft pt-8">
          <h2 className="font-mono text-[10px] uppercase tracking-widest text-muted mb-5">
            What happens next
          </h2>
          <ul className="flex flex-col gap-3">
            {[
              'Confirmation email sent to your inbox — check spam if you don\'t see it.',
              'WhatsApp follow-up from Arjun within 24 hours.',
              'Joining link and batch details emailed 48 hours before the batch.',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-charcoal">
                <span className="w-5 h-5 rounded-full bg-sage/20 text-sage flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check size={11} strokeWidth={2.5} />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </main>
    </>
  );
}

// ── ICS calendar file generation ──────────────────────────────────────────────

function downloadIcs(reg, programDisplay) {
  const start = new Date(reg.batch.startDate);
  const end   = new Date(reg.batch.endDate ?? reg.batch.startDate);

  const fmt = (d) => d.toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z';

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Dnyanpith//Registration//EN',
    'BEGIN:VEVENT',
    `UID:${reg.id}@dnyanpith.org`,
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${programDisplay} — ${reg.batch.name ?? ''}`,
    `DESCRIPTION:Your Dnyanpith registration. Invoice: ${reg.invoiceNumber ?? 'pending'}`,
    `LOCATION:${reg.batch.venue ?? 'Ambajogai, Maharashtra'}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([ics], { type: 'text/calendar' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `dnyanpith-${(reg.batch.name ?? 'event').toLowerCase().replace(/\s+/g, '-')}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}
