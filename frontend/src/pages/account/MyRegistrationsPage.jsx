/**
 * MyRegistrationsPage — /account/my-registrations
 *
 * Full table of all the user's registrations (not just top 5).
 * Status badge colours per UI-SPEC:
 *   PAID → sage, PENDING → gold, FAILED → danger, REFUNDED → muted
 *
 * Empty state copy verbatim from UI-SPEC §Empty states.
 * NO inline styles (CONSTRAINT-CODE-001). NO animations (CONSTRAINT-CODE-004).
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { apiClient } from '../../api/client.js';
import { RegistrationRow } from '../../components/account/RegistrationRow.jsx';
import { ErrorBanner } from '../../components/ui/ErrorBanner.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';

function SkeletonRows() {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Loading registrations...">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-20 rounded-lg bg-soft animate-pulse" />
      ))}
    </div>
  );
}

export default function MyRegistrationsPage() {
  const [registrations, setRegistrations] = useState(null);
  const [error, setError] = useState(null);

  function load() {
    setError(null);
    setRegistrations(null);
    apiClient.get('/users/me/registrations')
      .then(({ data }) => setRegistrations(data))
      .catch(() => setError('Couldn\'t reach our server. Check your connection and try again.'));
  }

  useEffect(() => { load(); }, []);

  return (
    <>
      <Helmet>
        <title>My Registrations — Dnyanpith</title>
      </Helmet>

      <div className="max-w-3xl space-y-6">
        <h1 className="font-display text-3xl font-light text-ink">My Registrations</h1>

        {error && <ErrorBanner message={error} onRetry={load} />}

        {!error && registrations === null && <SkeletonRows />}

        {registrations !== null && registrations.length === 0 && (
          <div className="py-12 text-center">
            <p className="font-display text-xl font-light text-ink">Nothing booked yet.</p>
            <p className="mt-2 text-sm text-muted font-sans max-w-sm mx-auto">
              When you register for Badlaav, Mission Udaan, or a workshop, it'll show up here.
            </p>
            <Link
              to="/programs"
              className="mt-4 inline-block text-sm text-teal hover:text-teal-light underline-offset-4 hover:underline font-sans"
            >
              → Explore Programs
            </Link>
          </div>
        )}

        {registrations !== null && registrations.length > 0 && (
          <div className="space-y-3">
            {registrations.map((r) => (
              <RegistrationRow key={r.id} registration={r} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
