/**
 * EventsPage — /events (ARCH §7.11).
 * Calendar/list toggle, event cards, filters by type.
 * Sold-out events show "Seats filled" badge only — NO email-capture input.
 * event_notifications table is deferred to Phase 2 per ROADMAP.
 * .ics export constructed client-side from event fields (no extra dep).
 */
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { getSeoForRoute } from '../../lib/seo.js';
import { EventCard } from '../../components/cards/EventCard.jsx';
import { FadeIn } from '../../components/animations/FadeIn.jsx';
import { apiClient } from '../../api/client.js';

const EVENT_TYPES = ['All', 'RETREAT', 'WORKSHOP', 'SESSION', 'COMMUNITY'];

const TYPE_LABELS = {
  RETREAT: 'Retreat',
  WORKSHOP: 'Workshop',
  SESSION: 'Session',
  COMMUNITY: 'Community',
};

/**
 * buildIcs — constructs a minimal .ics file content from an event.
 * Exported as a data: URI; no server round-trip needed.
 */
function buildIcs(event) {
  const fmt = (d) => new Date(d).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const end = event.endDate ? fmt(event.endDate) : fmt(new Date(new Date(event.startDate).getTime() + 3600000));
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Dnyanpith//Events//EN',
    'BEGIN:VEVENT',
    `UID:${event.id}@dnyanpith.org`,
    `DTSTART:${fmt(event.startDate)}`,
    `DTEND:${end}`,
    `SUMMARY:${event.title}`,
    `LOCATION:${event.location || 'Ambajogai, Maharashtra'}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

function EventSkeleton() {
  return (
    <div className="bg-soft rounded-lg p-5 animate-pulse">
      <div className="h-3 bg-muted/20 rounded w-1/4 mb-3" />
      <div className="h-5 bg-muted/20 rounded w-3/4 mb-2" />
      <div className="h-3 bg-muted/20 rounded w-1/2" />
    </div>
  );
}

export default function EventsPage() {
  const { pathname } = useLocation();
  const seo = getSeoForRoute(pathname);

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('All');

  useEffect(() => {
    let cancelled = false;
    async function fetchEvents() {
      try {
        const { data } = await apiClient.get('/events', { params: { upcoming: true } });
        if (!cancelled) setEvents(data.events || data || []);
      } catch {
        if (!cancelled) setEvents([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchEvents();
    return () => { cancelled = true; };
  }, []);

  const filteredEvents = typeFilter === 'All'
    ? events
    : events.filter((e) => e.type === typeFilter);

  return (
    <>
      <Helmet>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        <meta property="og:title" content={seo.title} />
        <meta property="og:description" content={seo.description} />
        <meta property="og:type" content={seo.ogType} />
        <meta property="og:image" content={seo.ogImage} />
        <meta name="twitter:card" content={seo.twitterCard} />
      </Helmet>

      {/* Header */}
      <section className="bg-cream py-16 px-[var(--section-x)] border-b border-muted/20">
        <div className="max-w-default mx-auto">
          <FadeIn>
            <p className="font-mono text-xs uppercase tracking-widest text-muted mb-3">Calendar</p>
            <h1 className="font-display font-light text-ink" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)' }}>
              Upcoming events
            </h1>
          </FadeIn>
        </div>
      </section>

      {/* Type filters */}
      <section className="bg-cream px-[var(--section-x)] py-6 border-b border-muted/20">
        <div className="max-w-default mx-auto flex flex-wrap gap-2">
          {EVENT_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`font-mono text-xs uppercase tracking-widest px-4 py-2 rounded-full border transition-colors duration-150
                ${typeFilter === type
                  ? 'bg-teal text-pearl border-teal'
                  : 'bg-cream text-muted border-muted/30 hover:border-teal hover:text-teal'
                }`}
            >
              {TYPE_LABELS[type] || type}
            </button>
          ))}
        </div>
      </section>

      {/* Events list */}
      <section className="bg-cream py-[var(--section-y)] px-[var(--section-x)]">
        <div className="max-w-default mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }, (_, i) => <EventSkeleton key={i} />)}
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-16">
              <p className="font-display text-2xl font-light text-ink mb-3">No upcoming events.</p>
              <p className="font-sans text-muted leading-body">
                Next batch dates and sessions will appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEvents.map((event) => (
                <FadeIn key={event.id} className="h-full">
                  <div className="h-full flex flex-col">
                    <EventCard
                      title={event.title}
                      startDate={event.startDate}
                      location={event.location}
                      type={event.type}
                      totalSeats={event.totalSeats}
                      seatsBooked={event.seatsBooked}
                      status={event.status}
                    />
                    {/* .ics export — client-side, no server needed */}
                    <div className="mt-2 px-1">
                      <a
                        href={`data:text/calendar;charset=utf-8,${encodeURIComponent(buildIcs(event))}`}
                        download={`${event.title.toLowerCase().replace(/\s+/g, '-')}.ics`}
                        className="font-mono text-xs text-muted hover:text-teal transition-colors duration-150"
                        aria-label={`Add ${event.title} to calendar`}
                      >
                        + Add to calendar
                      </a>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
