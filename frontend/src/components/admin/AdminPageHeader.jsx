/**
 * AdminPageHeader — page title, subtitle, and right-aligned action slot.
 * Used as the first child of every admin page so spacing stays consistent.
 */
export function AdminPageHeader({ title, subtitle, actions }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-6">
      <div className="min-w-0">
        <h1 className="font-display text-2xl sm:text-3xl font-light text-charcoal leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-muted font-sans mt-1">{subtitle}</p>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>
      )}
    </div>
  );
}
