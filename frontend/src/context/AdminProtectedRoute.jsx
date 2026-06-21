/**
 * AdminProtectedRoute — guards every /admin/* route.
 *
 * Behaviour:
 *   1. While AuthContext is restoring the session (refresh-cookie roundtrip),
 *      render a centered spinner. We must NOT render the admin shell here,
 *      otherwise an unauthenticated visitor briefly sees the sidebar/links
 *      before the redirect lands.
 *   2. No user after restore → redirect to /login?next=<current-path>.
 *   3. User present but not a staff tier → redirect to "/" (no access page
 *      surface for non-staff; they shouldn't even confirm /admin exists).
 *   4. Staff user (Admin/Contributor/Viewer) → render the nested route (<Outlet />).
 *
 * Server-side `requireStaff` middleware enforces the same rule on every
 * /api/v1/admin/* endpoint (with requireEditor/requireAdmin for writes), so this
 * guard is purely a UX layer (defense in depth).
 */
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';
import { Spinner } from '../components/ui/Spinner.jsx';

const STAFF_ROLES = ['ADMIN', 'CONTRIBUTOR', 'VIEWER'];

export function AdminProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <Spinner size={28} />
      </div>
    );
  }

  if (!user) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?next=${next}`} replace />;
  }

  if (!STAFF_ROLES.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
