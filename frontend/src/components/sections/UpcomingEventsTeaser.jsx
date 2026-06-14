/**
 * UpcomingEventsTeaser — Section 8 of 10 (ARCH §7.1).
 * Fetches /api/v1/events?upcoming=true&limit=3.
 * Renders 3 EventCards; shows skeleton → empty state on error/empty.
 * Gracefully handles API unavailability (backend not yet connected in dev).
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FadeIn } from '../animations/FadeIn.jsx';
import { EventCard } from '../cards/EventCard.jsx';
import { apiClient } from '../../api/client.js';

function EventSkeleton() {
  return (
    <div className="bg-soft rounded-lg p-5 animate-pulse">
      <div className="h-3 bg-muted/20 rounded w-1/4 mb-3" />
      <div className="h-5 bg-muted/20 rounded w-3/4 mb-2" />
      <div className="h-3 bg-muted/20 rounded w-1/2" />
    </div>
  );
}

export function UpcomingEventsTeaser() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetchEvents() {
      try {
        const { data } = await apiClient.get('/events', {
          params: { upcoming: true, limit: 3 },
        });
        if (!cancelled) setEvents(data.events || data || []);
      } catch {
        // API not running yet — show empty state, never crash
        if (!cancelled) setEvents([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchEvents();
    return () => { cancelled = true; };
  }, []);

  return (
    <section
      className="bg-cream py-[var(--section-y)] px-[var(--section-x)]"
      aria-label="Upcoming events"
    >
      <div className="max-w-default mx-auto">
        <FadeIn>
          <p className="font-mono text-xs uppercase tracking-widest text-muted text-center mb-3">
            What&rsquo;s coming up
          </p>
          <h2
            className="font-display font-light text-ink text-center mb-10"
            style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}
          >
            Upcoming events
          </h2>
        </FadeIn>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <EventSkeleton />
            <EventSkeleton />
            <EventSkeleton />
          </div>
        ) : events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {events.map((event) => (
              <FadeIn key={event.id}>
                <EventCard
                  title={event.title}
                  startDate={event.startDate}
                  location={event.location}
                  type={event.type}
                  totalSeats={event.totalSeats}
                  seatsBooked={event.seatsBooked}
                  status={event.status}
                />
              </FadeIn>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 mb-8">
            <p className="font-sans text-charcoal font-medium mb-1">No upcoming events.</p>
            <p className="font-sans text-muted text-sm">
              Next batch dates and sessions will appear here.
            </p>
          </div>
        )}

        <div className="text-center">
          <Link
            to="/events"
            className="inline-flex items-center gap-2 font-sans text-sm font-medium text-teal
                       hover:text-teal-light transition-colors duration-150
                       focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
          >
            See all events →
          </Link>
        </div>
      </div>
    </section>
  );
}
