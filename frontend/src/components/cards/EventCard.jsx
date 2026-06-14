/**
 * EventCard — displays an event summary.
 * Props: title, startDate, location, type, totalSeats, seatsBooked, status, href
 *
 * Shows "Seats filled" badge when seatsBooked >= totalSeats (UI-SPEC §Empty states).
 * NO email-capture input in Phase 1 — event_notifications table deferred to Phase 2 (ROADMAP).
 * When seats are filled, only the badge is shown — no notify-me UX.
 */
import { Link } from 'react-router-dom';
import { cn } from '../../lib/cn.js';

function formatEventDate(dateStr) {
  if (!dateStr) return '';
  try {
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'Asia/Kolkata',
    }).format(new Date(dateStr));
  } catch {
    return '';
  }
}

const typeLabel = {
  RETREAT: 'Retreat',
  WORKSHOP: 'Workshop',
  SESSION: 'Session',
  COMMUNITY: 'Community',
};

export function EventCard({ title, startDate, location, type, totalSeats, seatsBooked, status, href, className }) {
  const isSoldOut = typeof totalSeats === 'number' &&
    typeof seatsBooked === 'number' &&
    seatsBooked >= totalSeats;

  return (
    <div
      className={cn(
        'bg-soft rounded-lg p-5 border border-soft h-full flex flex-col',
        'hover:shadow-sm transition-shadow duration-200',
        className
      )}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          {type && (
            <p className="font-mono text-xs uppercase tracking-widest text-teal mb-1">
              {typeLabel[type] || type}
            </p>
          )}
          {href ? (
            <Link
              to={href}
              className="font-display text-lg font-semibold text-ink hover:text-teal transition-colors duration-150 leading-snug block"
            >
              {title}
            </Link>
          ) : (
            <h3 className="font-display text-lg font-semibold text-ink leading-snug">{title}</h3>
          )}
        </div>

        {/* Sold-out badge — Phase 1 only shows badge, no notify-me input */}
        {isSoldOut && (
          <span className="flex-shrink-0 font-mono text-xs uppercase tracking-widest bg-muted/20 text-muted px-2 py-1 rounded">
            Seats filled
          </span>
        )}
      </div>

      {/* Meta */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-mono text-muted mt-auto pt-2">
        {startDate && <span>{formatEventDate(startDate)}</span>}
        {location && <span>{location}</span>}
        {!isSoldOut && typeof totalSeats === 'number' && typeof seatsBooked === 'number' && (
          <span>{totalSeats - seatsBooked} seats available</span>
        )}
      </div>
    </div>
  );
}
