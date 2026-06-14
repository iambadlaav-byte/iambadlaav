/**
 * OfficerCard — displays a Mission Udaan officer achievement.
 * Props: name, exam, year, photoUrl?, consented
 *
 * If !consented || !photoUrl → render a sage-square initial monogram.
 * NEVER an AI-generated face (UI-SPEC Image Strategy, CONSTRAINT-MEDIA-001).
 */
import { cn } from '../../lib/cn.js';

export function OfficerCard({ name, exam, year, photoUrl, consented, className }) {
  const showPhoto = consented && photoUrl;
  const initial = name ? name.charAt(0).toUpperCase() : '?';

  return (
    <div className={cn('flex flex-col items-center text-center p-4', className)}>
      {/* Avatar */}
      <div className="w-16 h-16 rounded-full overflow-hidden mb-3 flex-shrink-0">
        {showPhoto ? (
          <img
            src={photoUrl}
            alt={`${name}, ${exam}`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-sage/20 flex items-center justify-center">
            <span className="font-display text-xl font-semibold text-sage">
              {initial}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <p className="font-sans text-sm font-medium text-ink leading-tight">{name}</p>
      <p className="font-mono text-xs uppercase tracking-widest text-teal mt-1">{exam}</p>
      <p className="font-mono text-xs text-muted mt-0.5">{year}</p>
    </div>
  );
}
