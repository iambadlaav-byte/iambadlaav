/**
 * ProfileCard — avatar (photoUrl OR Cormorant initial fallback), name, role badge,
 * "Edit profile →" link to /account/profile.
 *
 * Per UI-SPEC Image Strategy: if photoUrl is absent, render the user's initial
 * in a navy circle using Cormorant Garamond display font.
 * NO inline styles (CONSTRAINT-CODE-001). NO animations (CONSTRAINT-CODE-004).
 */
import { Link } from 'react-router-dom';
import { cn } from '../../lib/cn.js';

const ROLE_LABELS = {
  USER:  'Participant',
  ADMIN: 'Admin',
};

const ROLE_CLASSES = {
  USER:  'bg-teal/10 text-teal',
  ADMIN: 'bg-gold/15 text-ink',
};

export function ProfileCard({ user }) {
  if (!user) return null;

  const initial = (user.name || user.email || '?')[0].toUpperCase();
  const roleLabel = ROLE_LABELS[user.role] || user.role;
  const roleClass = ROLE_CLASSES[user.role] || 'bg-soft text-muted';

  return (
    <div className="flex items-center gap-4 p-4 bg-soft rounded-lg">
      {/* Avatar */}
      <div className="flex-shrink-0">
        {user.photoUrl ? (
          <img
            src={user.photoUrl}
            alt={user.name || 'Profile photo'}
            className="w-14 h-14 rounded-full object-cover border border-soft"
          />
        ) : (
          <div
            className="w-14 h-14 rounded-full bg-navy flex items-center justify-center"
            aria-label={`${user.name || 'User'}'s avatar`}
          >
            <span className="font-display text-2xl font-light text-pearl">
              {initial}
            </span>
          </div>
        )}
      </div>

      {/* Name + role */}
      <div className="flex-1 min-w-0">
        <p className="font-sans font-medium text-ink truncate">
          {user.name || 'Your name'}
        </p>
        <p className="font-mono text-xs text-muted tracking-widest uppercase mt-0.5 truncate">
          {user.email}
        </p>
        <span
          className={cn(
            'inline-block mt-1 px-2 py-0.5 rounded text-xs font-sans font-medium',
            roleClass
          )}
        >
          {roleLabel}
        </span>
      </div>

      {/* Edit link */}
      <Link
        to="/account/profile"
        className="flex-shrink-0 text-teal text-sm font-sans hover:text-teal-light underline-offset-4 hover:underline"
      >
        Edit profile&nbsp;→
      </Link>
    </div>
  );
}
