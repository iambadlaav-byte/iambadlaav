/**
 * NextRetreatCard — the white "NEXT BATCH — date / location" card overlaid on the
 * hero (LBD's signature). Self-fetching: pulls the soonest OPEN Badlaav batch from
 * GET /batches and degrades to a calm "dates announced soon" state if none/offline.
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../api/client.js';

function formatRange(start, end) {
  try {
    const opts = { day: 'numeric', month: 'short' };
    const s = new Date(start).toLocaleDateString('en-IN', opts);
    const e = new Date(end).toLocaleDateString('en-IN', { ...opts, year: 'numeric' });
    return `${s} – ${e}`;
  } catch {
    return '';
  }
}

export function NextRetreatCard() {
  const [batch, setBatch] = useState(undefined); // undefined = loading, null = none

  useEffect(() => {
    let active = true;
    apiClient
      .get('/batches')
      .then(({ data }) => {
        const list = Array.isArray(data) ? data : data?.batches ?? data?.data ?? [];
        const open = list
          .filter(
            (b) =>
              String(b.program).toUpperCase() === 'BADLAAV' &&
              String(b.status).toUpperCase() === 'OPEN',
          )
          .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
        if (active) setBatch(open[0] ?? null);
      })
      .catch(() => {
        if (active) setBatch(null);
      });
    return () => {
      active = false;
    };
  }, []);

  const hasBatch = batch && batch.startDate;

  return (
    <div className="bg-pearl text-charcoal rounded-2xl shadow-xl p-7 w-full max-w-sm">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ochre mb-4 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-ochre" /> Next batch
      </p>

      <p className="font-display text-2xl font-semibold text-ink leading-tight mb-1">
        {batch === undefined
          ? 'Loading…'
          : hasBatch
            ? formatRange(batch.startDate, batch.endDate)
            : 'Dates announced soon'}
      </p>
      <p className="font-sans text-sm text-charcoal/80 mb-6">
        {hasBatch
          ? batch.venue || batch.name || 'Ambajogai, Maharashtra'
          : "Tell us you're interested and we'll hold you a seat."}
      </p>

      <Link
        to={hasBatch ? `/register?program=badlaav&batch=${batch.id}` : '/contact'}
        className="inline-flex w-full items-center justify-center rounded-full font-sans font-semibold
                   bg-ochre text-on-ochre hover:bg-ochre/90 px-6 py-3 min-h-[44px]
                   shadow-sm hover:shadow-md transition-all"
      >
        {hasBatch ? 'Register' : 'Talk to Arjun Dada'}
      </Link>
    </div>
  );
}
