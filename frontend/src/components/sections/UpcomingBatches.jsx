/**
 * UpcomingBatches — live retreat dates with seat scarcity.
 *
 * Fetches GET /api/v1/batches and lists OPEN batches with a "seats left" / "Full"
 * badge and a Register link that opens the matching programme's form.
 *
 * Props:
 *   program  — enum value to filter by (e.g. 'BADLAAV'). Omit/null → show ALL
 *              open batches across programmes (used on the home page).
 *   eyebrow / title — section copy.
 *
 * Degrades gracefully: if the API is unreachable or returns nothing, shows a calm
 * "dates announced soon" note so the marketing site renders without a database.
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../api/client.js';
import { FadeIn } from '../animations/FadeIn.jsx';
import { programLabel, programRegisterHref } from '../../lib/constants.js';

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

export function UpcomingBatches({ program = null, eyebrow = 'Upcoming batches', title = 'Find your dates' }) {
  const [state, setState] = useState({ status: 'loading', batches: [] });
  const wantProgram = program ? String(program).toUpperCase() : null;

  useEffect(() => {
    let active = true;
    apiClient
      .get('/batches')
      .then(({ data }) => {
        const list = Array.isArray(data) ? data : data?.batches ?? data?.data ?? [];
        const open = list.filter((b) => {
          const isOpen = String(b.status).toUpperCase() === 'OPEN';
          const matchesProgram = !wantProgram || String(b.program).toUpperCase() === wantProgram;
          return isOpen && matchesProgram;
        });
        if (active) setState({ status: 'ready', batches: open });
      })
      .catch(() => {
        if (active) setState({ status: 'error', batches: [] });
      });
    return () => {
      active = false;
    };
  }, [wantProgram]);

  const { status, batches } = state;
  // When listing across programmes (home page), tag each row with its programme name.
  const showProgramTag = !wantProgram;

  return (
    <section className="bg-ink text-pearl py-[var(--section-y)] px-[var(--section-x)]">
      <div className="max-w-default mx-auto">
        <FadeIn>
          <p className="font-mono text-xs uppercase tracking-widest text-gold mb-3">{eyebrow}</p>
          <h2
            className="font-display font-semibold text-pearl mb-10"
            style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}
          >
            {title}
          </h2>
        </FadeIn>

        {status === 'ready' && batches.length > 0 ? (
          <div className="space-y-3">
            {batches.map((b) => {
              const seatsLeft = Math.max(0, (b.totalSeats ?? 0) - (b.seatsBooked ?? 0));
              const full = seatsLeft <= 0;
              const scarce = !full && seatsLeft <= 5;
              return (
                <FadeIn key={b.id}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-pearl/5 border border-pearl/10 rounded-lg px-6 py-5">
                    <div>
                      {showProgramTag && (
                        <p className="font-mono text-[10px] uppercase tracking-widest text-gold/80 mb-1">
                          {programLabel(b.program)}
                        </p>
                      )}
                      <p className="font-display text-xl text-pearl">{b.name || programLabel(b.program)}</p>
                      <p className="font-sans text-sm text-pearl/70 mt-1">
                        {formatRange(b.startDate, b.endDate)}
                        {b.venue ? ` · ${b.venue}` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span
                        className={
                          full
                            ? 'font-mono text-xs uppercase tracking-widest text-pearl/50'
                            : scarce
                              ? 'font-mono text-xs uppercase tracking-widest text-ochre'
                              : 'font-mono text-xs uppercase tracking-widest text-teal-light'
                        }
                      >
                        {full ? 'Full' : scarce ? `Only ${seatsLeft} seats left` : `${seatsLeft} seats open`}
                      </span>
                      {!full && (
                        <Link
                          to={programRegisterHref(b.program, b.id)}
                          className="inline-flex items-center justify-center rounded-full font-sans font-semibold text-sm bg-ochre text-on-ochre hover:bg-ochre/90 px-5 py-2.5 min-h-[44px] shadow-sm hover:shadow-md transition-all"
                        >
                          Register
                        </Link>
                      )}
                    </div>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        ) : (
          <FadeIn>
            <div className="bg-pearl/5 border border-pearl/10 rounded-lg px-6 py-8 text-center">
              <p className="font-sans text-pearl/80 leading-body max-w-[520px] mx-auto">
                The next batch dates are announced soon. Tell us you're interested and we'll hold you a
                seat the moment the calendar opens.
              </p>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center mt-6 rounded-full font-sans font-semibold text-sm bg-ochre text-on-ochre hover:bg-ochre/90 px-6 py-3 min-h-[44px] shadow-sm hover:shadow-md transition-all"
              >
                Talk to Arjun Dada
              </Link>
            </div>
          </FadeIn>
        )}
      </div>
    </section>
  );
}
