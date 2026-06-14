/**
 * RegistrationRow — card showing one registration entry.
 *
 * Status badge colours per UI-SPEC:
 *   PAID      → sage
 *   PENDING   → gold/warning
 *   FAILED    → danger
 *   REFUNDED  → muted
 *
 * Actions:
 *   PAID     → Download invoice (opens signed URL in new tab)
 *   PENDING  → Pay now (links back to /register with retry)
 *   FAILED   → Try again
 *   REFUNDED → (no action)
 *
 * NO inline styles (CONSTRAINT-CODE-001). NO animations (CONSTRAINT-CODE-004).
 */
import { cn } from '../../lib/cn.js';
import { Button } from '../ui/Button.jsx';
import { apiClient } from '../../api/client.js';
import { useState } from 'react';

const STATUS_LABEL = {
  PAID:     'Paid',
  PENDING:  'Pending',
  FAILED:   'Failed',
  REFUNDED: 'Refunded',
};

const STATUS_CLASSES = {
  PAID:     'bg-sage/15 text-sage',
  PENDING:  'bg-gold/15 text-ink',
  FAILED:   'bg-danger/10 text-danger',
  REFUNDED: 'bg-muted/10 text-muted',
};

// Color blocks used as program logo placeholder (no stock photos)
const PROGRAM_COLORS = {
  BADLAAV:          'bg-navy',
  MISSION_UDAAN:    'bg-teal',
  FUTURE_READINESS: 'bg-ochre',
};

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatAmount(amount) {
  if (amount == null) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function RegistrationRow({ registration }) {
  const [downloading, setDownloading] = useState(false);
  const [dlError, setDlError] = useState(null);

  const {
    id,
    program,
    paymentStatus,
    finalAmount,
    batch,
  } = registration;

  const statusLabel = STATUS_LABEL[paymentStatus] || paymentStatus;
  const statusClass = STATUS_CLASSES[paymentStatus] || 'bg-soft text-muted';
  const logoBg = PROGRAM_COLORS[program] || 'bg-soft';

  async function handleDownloadInvoice() {
    setDownloading(true);
    setDlError(null);
    try {
      const { data } = await apiClient.get(`/registrations/${id}/invoice`);
      window.open(data.invoiceUrl, '_blank', 'noopener,noreferrer');
    } catch {
      setDlError('Could not fetch the invoice. Try again shortly.');
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="flex items-center gap-4 p-4 bg-soft rounded-lg border border-soft/60">
      {/* Program logo placeholder — colored square */}
      <div
        className={cn('flex-shrink-0 w-10 h-10 rounded', logoBg)}
        aria-hidden="true"
      />

      {/* Program + batch info */}
      <div className="flex-1 min-w-0">
        <p className="font-sans font-medium text-ink truncate capitalize">
          {(program || '').replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}
        </p>
        {batch && (
          <p className="text-sm text-muted font-sans mt-0.5">
            {batch.name}
            {batch.startDate && (
              <span className="ml-2">
                {formatDate(batch.startDate)}
                {batch.endDate && ` – ${formatDate(batch.endDate)}`}
              </span>
            )}
          </p>
        )}
        {dlError && (
          <p className="text-xs text-danger font-sans mt-1">{dlError}</p>
        )}
      </div>

      {/* Status badge */}
      <span
        className={cn(
          'flex-shrink-0 px-2 py-0.5 rounded text-xs font-sans font-medium',
          statusClass
        )}
      >
        {statusLabel}
      </span>

      {/* Amount */}
      <span className="flex-shrink-0 font-sans text-sm text-ink hidden sm:block">
        {formatAmount(finalAmount)}
      </span>

      {/* Action */}
      <div className="flex-shrink-0">
        {paymentStatus === 'PAID' && (
          <Button
            variant="ghost"
            size="sm"
            loading={downloading}
            onClick={handleDownloadInvoice}
          >
            Download invoice
          </Button>
        )}
        {paymentStatus === 'PENDING' && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              window.location.href = `/register?program=${program}&reg=${id}`;
            }}
          >
            Pay now
          </Button>
        )}
        {paymentStatus === 'FAILED' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              window.location.href = `/register?program=${program}&reg=${id}`;
            }}
          >
            Try again
          </Button>
        )}
      </div>
    </div>
  );
}
