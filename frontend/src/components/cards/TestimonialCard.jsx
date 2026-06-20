/**
 * TestimonialCard — displays a testimonial quote.
 * Props: quote, author, designation, program, year, photoUrl?
 * Phase 1: static card. Phase 2 adds shimmer reveal.
 * No photo → sage monogram (UI-SPEC Image Strategy).
 */
import { cn } from '../../lib/cn.js';

const PROGRAM_COLORS = {
  badlaav: 'text-teal',
  'mission-udaan': 'text-teal',
  'future-readiness': 'text-teal',
  community: 'text-teal',
};

export function TestimonialCard({ quote, author, designation, program, year, photoUrl, className }) {
  const initial = author ? author.charAt(0).toUpperCase() : 'A';
  const programColor = PROGRAM_COLORS[program] || 'text-muted';

  return (
    <div
      className={cn(
        'bg-pearl rounded-2xl p-6 flex flex-col gap-4 h-full shadow-sm hover:shadow-lg transition-shadow',
        'border-l-4 border-gold',
        className
      )}
    >
      {/* Quote */}
      <blockquote>
        <p className="font-sans text-charcoal leading-body italic text-sm">
          &ldquo;{quote}&rdquo;
        </p>
      </blockquote>

      {/* Author */}
      <div className="flex items-center gap-3 mt-auto">
        <div className="w-10 h-10 rounded-full flex-shrink-0 overflow-hidden">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={author}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-sage/20 flex items-center justify-center">
              <span className="font-display text-base font-semibold text-sage">{initial}</span>
            </div>
          )}
        </div>
        <div>
          <p className="font-sans text-sm font-medium text-ink leading-tight">{author}</p>
          {designation && (
            <p className="font-mono text-xs text-muted mt-0.5">{designation}</p>
          )}
          {(program || year) && (
            <p className={cn('font-mono text-xs mt-0.5', programColor)}>
              {program && <span className="capitalize">{program.replace(/-/g, ' ')}</span>}
              {program && year && ' · '}
              {year}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
