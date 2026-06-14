/**
 * UpcomingEventsPage — /account/upcoming-events
 *
 * Lists registrations where batch.startDate >= now.
 * Each card: program · batch name · dates · venue · "Add to calendar" .ics button.
 *
 * Empty state verbatim from UI-SPEC §Empty states:
 *   Heading: "No upcoming events for you."
 *   Body: "When you register or RSVP for a session, it'll appear here. → See all events"
 *
 * .ics generation is done client-side (no server round-trip needed for basic VCALENDAR).
 * NO inline styles (CONSTRAINT-CODE-001). NO animations (CONSTRAINT-CODE-004).
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { apiClient } from '../../api/client.js';
import { ErrorBanner } from '../../components/ui/ErrorBanner.jsx';
import { Button } from '../../components/ui/Button.jsx';

// ── .ics generation ───────────────────────────────────────────
function toIcsDate(dateStr) {
  // Format: YYYYMMDDTHHMMSSZ
  const d = new Date(dateStr);
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

function generateIcs({ summary, description, location, startDate, endDate }) {
  const start = toIcsDate(startDate);
  // If no end date, set end to startDate + 1 day
  const end = endDate
    ? toIcsDate(endDate)
    : toIcsDate(new Date(new Date(startDate).getTime() + 86400000).toISOString());

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Dnyanpith//dnyanpith.org//EN',
    'BEGIN:VEVENT',
    `UID:${Date.now()}@dnyanpith.org`,
    `DTSTAMP:${toIcsDate(new Date().toISOString())}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${(summary || '').replace(/\n/g, '\\n')}`,
    `DESCRIPTION:${(description || '').replace(/\n/g, '\\n')}`,
    `LOCATION:${(location || '').replace(/\n/g, '\\n')}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

function downloadIcs(reg) {
  const programLabel = (reg.program || '')
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
  const batchName = reg.batch?.name || '';
  const summary = `${programLabel}${batchName ? ` — ${batchName}` : ''}`;
  const description = `Registered via Dnyanpith (dnyanpith.org). Registration ID: ${reg.id}`;
  const location = reg.batch?.venue || 'Ambajogai, Beed, Maharashtra';

  const ics = generateIcs({
    summary,
    description,
    location,
    startDate: reg.batch?.startDate,
    endDate:   reg.batch?.endDate,
  });

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${(summary).replace(/\s+/g, '-').toLowerCase()}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ── Event card ────────────────────────────────────────────────
function EventCard({ registration }) {
  const { program, batch } = registration;

  const programLabel = (program || '')
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());

  function formatDate(dateStr) {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  }

  return (
    <div className="p-5 bg-soft rounded-lg border border-soft/60 space-y-3">
      <div>
        <p className="font-sans font-medium text-ink">{programLabel}</p>
        {batch?.name && (
          <p className="text-sm text-muted font-sans mt-0.5">{batch.name}</p>
        )}
        {(batch?.startDate || batch?.endDate) && (
          <p className="text-sm text-muted font-sans mt-1">
            {formatDate(batch?.startDate)}
            {batch?.endDate && ` – ${formatDate(batch?.endDate)}`}
          </p>
        )}
        {batch?.venue && (
          <p className="text-xs font-mono text-muted uppercase tracking-widest mt-1">
            {batch.venue}
          </p>
        )}
      </div>

      {batch?.startDate && (
        <Button
          variant="ghost"
          size="sm"
          type="button"
          onClick={() => downloadIcs(registration)}
        >
          Add to calendar (.ics)
        </Button>
      )}
    </div>
  );
}

function SkeletonCards() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading events...">
      {[1, 2].map((i) => (
        <div key={i} className="h-28 rounded-lg bg-soft animate-pulse" />
      ))}
    </div>
  );
}

export default function UpcomingEventsPage() {
  const [events, setEvents] = useState(null);
  const [error, setError] = useState(null);

  function load() {
    setError(null);
    setEvents(null);
    apiClient.get('/users/me/events')
      .then(({ data }) => setEvents(data))
      .catch(() => setError('Couldn\'t reach our server. Check your connection and try again.'));
  }

  useEffect(() => { load(); }, []);

  return (
    <>
      <Helmet>
        <title>Upcoming Events — Dnyanpith</title>
      </Helmet>

      <div className="max-w-3xl space-y-6">
        <h1 className="font-display text-3xl font-light text-ink">Upcoming Events</h1>

        {error && <ErrorBanner message={error} onRetry={load} />}

        {!error && events === null && <SkeletonCards />}

        {events !== null && events.length === 0 && (
          <div className="py-12 text-center">
            <p className="font-display text-xl font-light text-ink">
              No upcoming events for you.
            </p>
            <p className="mt-2 text-sm text-muted font-sans max-w-sm mx-auto">
              When you register or RSVP for a session, it'll appear here.
            </p>
            <Link
              to="/events"
              className="mt-4 inline-block text-sm text-teal hover:text-teal-light underline-offset-4 hover:underline font-sans"
            >
              → See all events
            </Link>
          </div>
        )}

        {events !== null && events.length > 0 && (
          <div className="space-y-4">
            {events.map((reg) => (
              <EventCard key={reg.id} registration={reg} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
