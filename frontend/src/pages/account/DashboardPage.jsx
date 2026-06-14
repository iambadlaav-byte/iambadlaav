/**
 * DashboardPage — /account/dashboard
 *
 * Composes:
 *   ProfileCard · Recent Registrations (top 5) · Upcoming Events ·
 *   My Community · Volunteer Portal card
 *
 * Empty state copy is verbatim from UI-SPEC §Empty states.
 * Network errors show an inline ErrorBanner with retry.
 * Skeleton loaders use animate-pulse (opacity only — CONSTRAINT-CODE-004).
 * NO inline styles. NO ambient animations.
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../../context/AuthContext.jsx';
import { apiClient } from '../../api/client.js';
import { ProfileCard } from '../../components/account/ProfileCard.jsx';
import { RegistrationRow } from '../../components/account/RegistrationRow.jsx';
import { ErrorBanner } from '../../components/ui/ErrorBanner.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';

// ── Section skeleton ──────────────────────────────────────────
function SectionSkeleton({ rows = 3 }) {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Loading...">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-16 rounded-lg bg-soft animate-pulse"
        />
      ))}
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────
function EmptyState({ heading, body, linkTo, linkLabel }) {
  return (
    <div className="py-8 text-center">
      <p className="font-display text-lg font-light text-ink">{heading}</p>
      <p className="mt-2 text-sm text-muted font-sans max-w-sm mx-auto">{body}</p>
      {linkTo && (
        <Link
          to={linkTo}
          className="mt-3 inline-block text-sm text-teal hover:text-teal-light underline-offset-4 hover:underline font-sans"
        >
          {linkLabel}
        </Link>
      )}
    </div>
  );
}

// ── Section wrapper ───────────────────────────────────────────
function Section({ title, children }) {
  return (
    <section>
      <h2 className="font-mono text-xs uppercase tracking-widest text-muted mb-4">
        {title}
      </h2>
      {children}
    </section>
  );
}

// ── Individual data sections ──────────────────────────────────
function RecentRegistrations() {
  const [registrations, setRegistrations] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    apiClient.get('/users/me/registrations')
      .then(({ data }) => { if (active) setRegistrations(data.slice(0, 5)); })
      .catch(() => { if (active) setError('Couldn\'t load registrations. Check your connection and try again.'); });
    return () => { active = false; };
  }, []);

  if (error) {
    return (
      <ErrorBanner message={error} onRetry={() => { setError(null); setRegistrations(null); }} />
    );
  }
  if (registrations === null) return <SectionSkeleton rows={2} />;
  if (registrations.length === 0) {
    return (
      <EmptyState
        heading="Nothing booked yet."
        body="When you register for Badlaav, Mission Udaan, or a workshop, it'll show up here."
        linkTo="/programs"
        linkLabel="→ Explore Programs"
      />
    );
  }
  return (
    <div className="space-y-3">
      {registrations.map((r) => (
        <RegistrationRow key={r.id} registration={r} />
      ))}
      <Link
        to="/account/my-registrations"
        className="block text-center text-sm text-teal hover:text-teal-light underline-offset-4 hover:underline font-sans mt-2"
      >
        View all registrations →
      </Link>
    </div>
  );
}

function UpcomingEvents() {
  const [events, setEvents] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    apiClient.get('/users/me/events')
      .then(({ data }) => { if (active) setEvents(data); })
      .catch(() => { if (active) setError('Couldn\'t load events. Check your connection and try again.'); });
    return () => { active = false; };
  }, []);

  if (error) {
    return (
      <ErrorBanner message={error} onRetry={() => { setError(null); setEvents(null); }} />
    );
  }
  if (events === null) return <SectionSkeleton rows={2} />;
  if (events.length === 0) {
    return (
      <EmptyState
        heading="No upcoming events for you."
        body="When you register or RSVP for a session, it'll appear here."
        linkTo="/events"
        linkLabel="→ See all events"
      />
    );
  }
  return (
    <div className="space-y-3">
      {events.map((reg) => (
        <div key={reg.id} className="p-4 bg-soft rounded-lg">
          <p className="font-sans font-medium text-ink capitalize">
            {(reg.program || '').replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}
          </p>
          {reg.batch && (
            <p className="text-sm text-muted font-sans mt-0.5">
              {reg.batch.name}
              {reg.batch.startDate && (
                <span className="ml-2">
                  {new Date(reg.batch.startDate).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric',
                  })}
                </span>
              )}
              {reg.batch.venue && <span className="ml-2">· {reg.batch.venue}</span>}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

function MyCommunityPreview() {
  const [memberships, setMemberships] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    apiClient.get('/users/me/community')
      .then(({ data }) => { if (active) setMemberships(data); })
      .catch(() => { if (active) setError('Couldn\'t load community memberships. Check your connection and try again.'); });
    return () => { active = false; };
  }, []);

  if (error) {
    return (
      <ErrorBanner message={error} onRetry={() => { setError(null); setMemberships(null); }} />
    );
  }
  if (memberships === null) return <SectionSkeleton rows={2} />;
  if (memberships.length === 0) {
    return (
      <EmptyState
        heading="You haven't joined any circles yet."
        body="Vachan Vari, Antrang, 5am Club, Get Together — all free."
        linkTo="/community"
        linkLabel="→ Browse Community"
      />
    );
  }
  return (
    <div className="flex flex-wrap gap-2">
      {memberships.map((m) => (
        <span
          key={m.id}
          className="px-3 py-1.5 bg-teal/10 text-teal text-sm font-sans rounded-full capitalize"
        >
          {(m.initiative || '').replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}
        </span>
      ))}
      <Link
        to="/account/my-community"
        className="text-sm text-teal hover:text-teal-light underline-offset-4 hover:underline font-sans self-center ml-1"
      >
        View all →
      </Link>
    </div>
  );
}

function VolunteerPortalCard({ user }) {
  const eligible = user && user.coursesCompleted >= 1;

  return (
    <div className={`p-5 rounded-lg border ${eligible ? 'border-gold/30 bg-gold/5' : 'border-soft bg-soft/40'}`}>
      <p className={`font-display text-lg font-light ${eligible ? 'text-ink' : 'text-muted'}`}>
        Volunteer Portal
      </p>
      {eligible ? (
        <>
          <p className="text-sm text-ink font-sans mt-1">
            You're eligible to apply as a volunteer. Arjun will open the application window soon.
          </p>
          <Link
            to="/account/volunteer"
            className="mt-3 inline-block text-sm font-sans font-medium text-gold hover:underline underline-offset-4"
          >
            Apply as Volunteer →
          </Link>
        </>
      ) : (
        <>
          <p className="font-sans font-medium text-muted mt-1">
            Complete one Badlaav batch first.
          </p>
          <p className="text-sm text-muted font-sans mt-1">
            The Volunteer Portal opens once you've attended a retreat. We'll email you the day it unlocks.
          </p>
        </>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <>
      <Helmet>
        <title>Dashboard — Dnyanpith</title>
      </Helmet>

      <div className="max-w-3xl space-y-10">
        {/* Profile card */}
        <ProfileCard user={user} />

        {/* Recent registrations */}
        <Section title="Recent Registrations">
          <RecentRegistrations />
        </Section>

        {/* Upcoming events */}
        <Section title="Upcoming Events">
          <UpcomingEvents />
        </Section>

        {/* My community */}
        <Section title="My Community">
          <MyCommunityPreview />
        </Section>

        {/* Volunteer portal */}
        <Section title="Volunteer Portal">
          <VolunteerPortalCard user={user} />
        </Section>
      </div>
    </>
  );
}
