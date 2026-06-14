/**
 * AdminTable — reusable admin data table with loading skeleton and empty state.
 *
 * Loading skeleton uses Tailwind animate-pulse (opacity-only — CONSTRAINT-CODE-004 compliant).
 * NO ambient animations on admin tree.
 *
 * Props:
 *   columns      — array of { key, header, render? } objects
 *   rows         — data rows; each row should have a unique `id` field
 *   onRowClick   — callback(row) when a row is clicked
 *   isLoading    — shows skeleton rows when true
 *   emptyState   — string message for empty table
 *   filterBar    — optional ReactNode rendered above the table
 *   exportButton — optional ReactNode rendered top-right (e.g. Export CSV button)
 */
export function AdminTable({
  columns = [],
  rows = [],
  onRowClick,
  isLoading = false,
  emptyState = 'No records found.',
  filterBar,
  exportButton,
}) {
  return (
    <div className="flex flex-col gap-3">
      {/* Header row: filter bar + export button */}
      {(filterBar || exportButton) && (
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            {filterBar}
          </div>
          {exportButton && (
            <div>{exportButton}</div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto border border-ink/10 rounded-lg">
        <table className="w-full text-sm font-sans">
          <thead className="bg-cream border-b border-ink/10">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className="px-4 py-3 text-left font-mono text-xs uppercase tracking-widest text-muted"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-pearl divide-y divide-ink/5">
            {/* Loading skeleton — animate-pulse is opacity-only and admin-safe */}
            {isLoading && (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={`skel-${i}`} className="animate-pulse">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3">
                      <div className="h-4 bg-ink/10 rounded w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            )}

            {/* Empty state */}
            {!isLoading && rows.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-10 text-center text-muted font-sans"
                >
                  {emptyState}
                </td>
              </tr>
            )}

            {/* Data rows */}
            {!isLoading && rows.map((row) => (
              <tr
                key={row.id}
                onClick={() => onRowClick?.(row)}
                className={onRowClick ? 'cursor-pointer hover:bg-cream/60' : ''}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-charcoal">
                    {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
