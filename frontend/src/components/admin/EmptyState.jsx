/**
 * EmptyState — friendly "nothing here yet" placeholder used inside DataTable
 * and any list view that may return zero rows.
 */
import { cn } from '../../lib/cn.js';

export function EmptyState({ icon: Icon, title, message, action, className }) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center text-center px-6 py-12 gap-3',
      className
    )}>
      {Icon && (
        <div className="w-12 h-12 rounded-full bg-soft flex items-center justify-center">
          <Icon size={20} className="text-muted" aria-hidden="true" />
        </div>
      )}
      {title && (
        <h3 className="font-display text-lg font-light text-charcoal">{title}</h3>
      )}
      {message && (
        <p className="text-sm text-muted font-sans max-w-sm">{message}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
