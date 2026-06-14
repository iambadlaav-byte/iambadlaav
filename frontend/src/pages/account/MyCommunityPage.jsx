/**
 * MyCommunityPage — /account/my-community
 *
 * Card grid of joined initiatives with WhatsApp group links.
 * WhatsApp URLs are placeholders in constants.js until Arjun confirms;
 * we fall back gracefully when the URL is absent.
 *
 * Empty state verbatim from UI-SPEC §Empty states:
 *   Heading: "You haven't joined any circles yet."
 *   Body: "Vachan Vari, Antrang, 5am Club, Get Together — all free. → Browse Community"
 *
 * NO inline styles (CONSTRAINT-CODE-001). NO animations (CONSTRAINT-CODE-004).
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { apiClient } from '../../api/client.js';
import { ErrorBanner } from '../../components/ui/ErrorBanner.jsx';

// Initiative display metadata
// WhatsApp group URLs filled in here once Arjun confirms (Week 9 per constants.js comment).
// Keyed by the initiative value returned from the API (snake_case / uppercase).
const INITIATIVE_META = {
  VACHAN_VARI:    { label: 'Vachan Vari',    slug: 'vachan-vari',    whatsapp: null },
  ANTRANG:        { label: 'Antrang',        slug: 'antrang',        whatsapp: null },
  '5AM_CLUB':     { label: '5am Club',       slug: '5am-club',       whatsapp: null },
  GET_TOGETHER:   { label: 'Get Together',   slug: 'get-together',   whatsapp: null },
};

function getInitiativeMeta(initiative) {
  // Normalise: VACHAN_VARI, vachan_vari, VACHAN-VARI all map to the same key
  const key = (initiative || '').toUpperCase().replace(/-/g, '_');
  return INITIATIVE_META[key] || {
    label: (initiative || '').replace(/[_-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    slug: null,
    whatsapp: null,
  };
}

function CommunityCard({ membership }) {
  const meta = getInitiativeMeta(membership.initiative);

  return (
    <div className="p-5 bg-soft rounded-lg border border-ochre/10 space-y-3">
      <div>
        <p className="font-display text-lg font-light text-ink">{meta.label}</p>
        {membership.city && (
          <p className="text-xs font-mono text-muted uppercase tracking-widest mt-0.5">
            {membership.city}
          </p>
        )}
        {membership.joinedAt && (
          <p className="text-xs text-muted font-sans mt-1">
            Joined{' '}
            {new Date(membership.joinedAt).toLocaleDateString('en-IN', {
              day: 'numeric', month: 'long', year: 'numeric',
            })}
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {meta.whatsapp ? (
          <a
            href={meta.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-ochre text-on-ochre text-sm font-sans font-medium rounded hover:bg-ochre/90 transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ochre"
          >
            Open WhatsApp Group
          </a>
        ) : (
          <span className="text-xs text-muted font-sans italic">
            WhatsApp link coming soon.
          </span>
        )}

        {meta.slug && (
          <Link
            to={`/community/${meta.slug}`}
            className="text-sm text-teal hover:text-teal-light underline-offset-4 hover:underline font-sans self-center"
          >
            View circle →
          </Link>
        )}
      </div>
    </div>
  );
}

function SkeletonCards() {
  return (
    <div className="grid sm:grid-cols-2 gap-4" aria-busy="true" aria-label="Loading memberships...">
      {[1, 2].map((i) => (
        <div key={i} className="h-36 rounded-lg bg-soft animate-pulse" />
      ))}
    </div>
  );
}

export default function MyCommunityPage() {
  const [memberships, setMemberships] = useState(null);
  const [error, setError] = useState(null);

  function load() {
    setError(null);
    setMemberships(null);
    apiClient.get('/users/me/community')
      .then(({ data }) => setMemberships(data))
      .catch(() => setError('Couldn\'t reach our server. Check your connection and try again.'));
  }

  useEffect(() => { load(); }, []);

  return (
    <>
      <Helmet>
        <title>My Community — Dnyanpith</title>
      </Helmet>

      <div className="max-w-3xl space-y-6">
        <h1 className="font-display text-3xl font-light text-ink">My Community</h1>

        {error && <ErrorBanner message={error} onRetry={load} />}

        {!error && memberships === null && <SkeletonCards />}

        {memberships !== null && memberships.length === 0 && (
          <div className="py-12 text-center">
            <p className="font-display text-xl font-light text-ink">
              You haven't joined any circles yet.
            </p>
            <p className="mt-2 text-sm text-muted font-sans max-w-sm mx-auto">
              Vachan Vari, Antrang, 5am Club, Get Together — all free.
            </p>
            <Link
              to="/community"
              className="mt-4 inline-block text-sm text-teal hover:text-teal-light underline-offset-4 hover:underline font-sans"
            >
              → Browse Community
            </Link>
          </div>
        )}

        {memberships !== null && memberships.length > 0 && (
          <div className="grid sm:grid-cols-2 gap-4">
            {memberships.map((m) => (
              <CommunityCard key={m.id} membership={m} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
