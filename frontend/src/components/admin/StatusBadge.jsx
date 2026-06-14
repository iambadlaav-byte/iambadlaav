/**
 * StatusBadge — colored chip for enum statuses across the admin panel.
 *
 * Tones map onto the brand palette: sage = positive, gold = neutral/in-progress,
 * danger = blocked, navy = neutral. Unknown statuses fall back to a muted chip.
 */
import { cn } from '../../lib/cn.js';

const TONE_MAP = {
  // Generic tones
  positive: 'bg-sage/15 text-sage border-sage/30',
  warn:     'bg-gold/15 text-gold border-gold/30',
  danger:   'bg-danger/15 text-danger border-danger/30',
  info:     'bg-teal/15 text-teal border-teal/30',
  muted:    'bg-muted/15 text-muted border-muted/30',
  neutral:  'bg-navy/10 text-navy border-navy/30',
};

// Maps status enums (across batches, registrations, enquiries, payments) to a tone.
const STATUS_TO_TONE = {
  // Batch
  OPEN:        'positive',
  FULL:        'warn',
  CLOSED:      'muted',
  PAST:        'muted',
  // Registration
  ACTIVE:      'info',
  COMPLETED:   'positive',
  CANCELLED:   'danger',
  // Payment
  PAID:        'positive',
  PENDING:     'warn',
  FAILED:      'danger',
  REFUNDED:    'muted',
  // Enquiry
  NEW:         'info',
  CONTACTED:   'warn',
  CONVERTED:   'positive',
  // CLOSED already mapped above
};

export function StatusBadge({ status, tone }) {
  const resolvedTone =
    tone || (status && STATUS_TO_TONE[status.toUpperCase?.()]) || 'muted';
  const classes = TONE_MAP[resolvedTone] || TONE_MAP.muted;

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full border',
        'font-mono text-[10px] uppercase tracking-widest font-medium',
        classes
      )}
    >
      {status}
    </span>
  );
}
