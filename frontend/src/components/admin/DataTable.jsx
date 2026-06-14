/**
 * DataTable — generic admin list view primitive.
 *
 * Renders a header row, body rows, and standardised states for loading,
 * error, and empty results. Column shape:
 *   { key, header, render?: (row) => ReactNode, className?: string, align?: 'left'|'right'|'center' }
 *
 * The table itself is presentation-only — search, filters, and pagination are
 * the caller's responsibility (see SearchInput + Pagination + usePaginator).
 *
 * Mobile: horizontal scroll inside a rounded container. Each row stays a
 * single line; columns can collapse via className if needed.
 */
import { AlertCircle, Inbox } from 'lucide-react';
import { Spinner } from '../ui/Spinner.jsx';
import { EmptyState } from './EmptyState.jsx';
import { cn } from '../../lib/cn.js';

export function DataTable({
  columns,
  rows = [],
  loading,
  error,
  emptyTitle = 'Nothing here yet',
  emptyMessage,
  emptyAction,
  rowKey = (row) => row.id,
  onRowClick,
}) {
  const colCount = columns.length;
  const alignClass = (a) =>
    a === 'right' ? 'text-right' : a === 'center' ? 'text-center' : 'text-left';

  return (
    <div className="bg-cream rounded-lg border border-muted/20 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-soft">
            <tr>
              {columns.map((c) => (
                <th
                  key={c.key}
                  scope="col"
                  className={cn(
                    'px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-muted',
                    alignClass(c.align),
                    c.className
                  )}
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={colCount} className="px-4 py-10">
                  <div className="flex items-center justify-center gap-2 text-muted">
                    <Spinner size={16} />
                    <span className="text-sm font-sans">Loading…</span>
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={colCount} className="px-4 py-10">
                  <EmptyState
                    icon={AlertCircle}
                    title="Couldn't load"
                    message={typeof error === 'string' ? error : 'Something went wrong. Try again.'}
                  />
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={colCount} className="px-4 py-10">
                  <EmptyState
                    icon={Inbox}
                    title={emptyTitle}
                    message={emptyMessage}
                    action={emptyAction}
                  />
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={rowKey(row)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn(
                    'border-t border-muted/15',
                    onRowClick && 'cursor-pointer hover:bg-soft/60 transition-colors'
                  )}
                >
                  {columns.map((c) => (
                    <td
                      key={c.key}
                      className={cn(
                        'px-4 py-3 text-sm font-sans text-charcoal align-middle',
                        alignClass(c.align),
                        c.className
                      )}
                    >
                      {c.render ? c.render(row) : row[c.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
