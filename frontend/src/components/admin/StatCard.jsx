/**
 * StatCard — dashboard summary tile.
 *
 * Renders a label, value, and optional delta/hint line. Supports a `loading`
 * skeleton so the dashboard doesn't flash empty tiles during the initial fetch.
 */
import { cn } from '../../lib/cn.js';
import { Spinner } from '../ui/Spinner.jsx';

export function StatCard({ label, value, hint, icon: Icon, loading, accent = 'gold' }) {
  const accentBar = {
    gold:   'bg-gold',
    sage:   'bg-sage',
    teal:   'bg-teal',
    danger: 'bg-danger',
    navy:   'bg-navy',
  }[accent] || 'bg-gold';

  return (
    <div className={cn(
      'relative bg-cream rounded-lg border border-muted/20 p-5 flex flex-col gap-2 overflow-hidden',
      'shadow-sm'
    )}>
      {/* Accent stripe */}
      <span aria-hidden="true" className={cn('absolute left-0 top-0 bottom-0 w-1', accentBar)} />

      <div className="flex items-start justify-between">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
          {label}
        </p>
        {Icon && <Icon size={16} className="text-muted" aria-hidden="true" />}
      </div>

      {loading ? (
        <div className="h-9 flex items-center">
          <Spinner size={18} />
        </div>
      ) : (
        <p className="font-display text-3xl font-light text-charcoal leading-none">
          {value}
        </p>
      )}

      {hint && !loading && (
        <p className="text-xs text-muted font-sans">{hint}</p>
      )}
    </div>
  );
}
