/**
 * Sidebar — authenticated account navigation.
 *
 * Desktop: fixed 240px navy sidebar, full height.
 * Mobile: hidden by default; toggled via hamburger into a slide-over drawer.
 *
 * Nav items: Dashboard · Profile · My Registrations · My Community ·
 *   Upcoming Events · Volunteer Portal (greyed if courses_completed < 1) · Sign out.
 *
 * Sign-out: calls auth.logout() + toasts "Signed out." per UI-SPEC §Destructive actions.
 * NO confirmation dialog on logout (UI-SPEC: "No confirm. Toast: Signed out.").
 * NO inline styles (CONSTRAINT-CODE-001). NO animations beyond opacity transitions
 * used for drawer visibility (transform/opacity only — CONSTRAINT-CODE-004).
 */
import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { cn } from '../../lib/cn.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../ui/Toast.jsx';

const NAV_ITEMS = [
  { to: '/account/dashboard',        label: 'Dashboard' },
  { to: '/account/profile',          label: 'Profile' },
  { to: '/account/my-registrations', label: 'My Registrations' },
  { to: '/account/my-community',     label: 'My Community' },
  { to: '/account/upcoming-events',  label: 'Upcoming Events' },
];

export function Sidebar() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isVolunteerEligible = user && user.coursesCompleted >= 1;
  const initial = user ? (user.name || user.email || '?')[0].toUpperCase() : '?';

  async function handleSignOut() {
    setDrawerOpen(false);
    await logout();
    toast('Signed out.', 'default');
    navigate('/');
  }

  function closeDrawer() {
    setDrawerOpen(false);
  }

  const navContent = (
    <nav className="flex flex-col h-full" aria-label="Account navigation">
      {/* Profile summary at top */}
      <div className="px-6 py-6 border-b border-pearl/10">
        <div className="flex items-center gap-3">
          {user?.photoUrl ? (
            <img
              src={user.photoUrl}
              alt={user.name || 'Profile photo'}
              className="w-10 h-10 rounded-full object-cover border border-pearl/20"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-pearl/10 flex items-center justify-center flex-shrink-0">
              <span className="font-display text-lg font-light text-pearl">{initial}</span>
            </div>
          )}
          <div className="min-w-0">
            <p className="font-sans font-medium text-pearl text-sm truncate">
              {user?.name || 'Your account'}
            </p>
            <p className="font-mono text-xs text-pearl/50 tracking-widest uppercase truncate">
              {user?.role === 'ADMIN' ? 'Admin' : 'Participant'}
            </p>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <ul className="flex-1 px-3 py-4 space-y-0.5" role="list">
        {NAV_ITEMS.map(({ to, label }) => (
          <li key={to}>
            <NavLink
              to={to}
              onClick={closeDrawer}
              className={({ isActive }) =>
                cn(
                  'flex items-center px-3 py-2.5 rounded font-sans text-sm transition-colors duration-150',
                  isActive
                    ? 'bg-pearl/15 text-pearl font-medium'
                    : 'text-pearl/70 hover:bg-pearl/10 hover:text-pearl'
                )
              }
            >
              {label}
            </NavLink>
          </li>
        ))}

        {/* Volunteer Portal — gated */}
        <li>
          {isVolunteerEligible ? (
            <NavLink
              to="/account/volunteer"
              onClick={closeDrawer}
              className={({ isActive }) =>
                cn(
                  'flex items-center px-3 py-2.5 rounded font-sans text-sm transition-colors duration-150',
                  isActive
                    ? 'bg-gold/20 text-gold font-medium'
                    : 'text-pearl/70 hover:bg-pearl/10 hover:text-pearl'
                )
              }
            >
              Volunteer Portal
            </NavLink>
          ) : (
            <span
              className="flex items-center px-3 py-2.5 rounded font-sans text-sm text-pearl/30 cursor-not-allowed select-none"
              title="Complete one Badlaav batch first."
              aria-disabled="true"
            >
              Volunteer Portal
            </span>
          )}
        </li>
      </ul>

      {/* Sign out */}
      <div className="px-3 py-4 border-t border-pearl/10">
        <button
          type="button"
          onClick={handleSignOut}
          className="w-full flex items-center px-3 py-2.5 rounded font-sans text-sm text-pearl/70 hover:bg-pearl/10 hover:text-pearl transition-colors duration-150 text-left"
        >
          Sign out
        </button>
      </div>
    </nav>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-60 flex-shrink-0 bg-navy min-h-screen">
        {navContent}
      </aside>

      {/* Mobile: hamburger trigger */}
      <div className="md:hidden fixed top-4 left-4 z-40">
        <button
          type="button"
          aria-label="Open navigation menu"
          aria-expanded={drawerOpen}
          onClick={() => setDrawerOpen(true)}
          className="p-2 rounded bg-navy text-pearl focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
        >
          {/* Hamburger icon — 3 lines */}
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <rect x="2" y="5" width="16" height="1.5" rx="0.75" fill="currentColor" />
            <rect x="2" y="9.25" width="16" height="1.5" rx="0.75" fill="currentColor" />
            <rect x="2" y="13.5" width="16" height="1.5" rx="0.75" fill="currentColor" />
          </svg>
        </button>
      </div>

      {/* Mobile: backdrop */}
      {drawerOpen && (
        <div
          className="md:hidden fixed inset-0 z-30 bg-ink/60"
          aria-hidden="true"
          onClick={closeDrawer}
        />
      )}

      {/* Mobile: drawer */}
      <aside
        className={cn(
          'md:hidden fixed top-0 left-0 z-40 h-full w-64 bg-navy',
          'transition-transform duration-200',
          drawerOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        aria-label="Account navigation drawer"
      >
        {/* Close button inside drawer */}
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={closeDrawer}
          className="absolute top-4 right-4 p-1 text-pearl/60 hover:text-pearl focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold rounded"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <line x1="3" y1="3" x2="15" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="15" y1="3" x2="3" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
        {navContent}
      </aside>
    </>
  );
}
