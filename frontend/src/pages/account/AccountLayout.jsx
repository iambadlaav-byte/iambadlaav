/**
 * AccountLayout — layout route for all /account/* pages.
 *
 * Gates the entire sub-tree on authentication via RequireAuth.
 * If loading: shows FullPageSpinner.
 * If not authenticated: redirects to /login?next={currentPath}.
 *
 * Renders Sidebar (left) + <Outlet /> (main content area).
 * AmbientMotionBoundary is already applied at the route level in routes.jsx
 * (prefix /account/ is in AMBIENT_DISABLED_PREFIXES), so no double-wrap needed.
 *
 * NO inline styles (CONSTRAINT-CODE-001). NO animations (CONSTRAINT-CODE-004).
 */
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { Sidebar } from '../../components/account/Sidebar.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';

function FullPageSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-cream">
      <Spinner size={32} />
    </div>
  );
}

function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <FullPageSpinner />;
  if (!user) {
    return (
      <Navigate
        to={`/login?next=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }
  return children;
}

export default function AccountLayout() {
  return (
    <RequireAuth>
      <div className="flex min-h-screen bg-cream">
        <Sidebar />
        <main className="flex-1 min-w-0 px-4 py-8 md:px-8 md:py-10">
          <Outlet />
        </main>
      </div>
    </RequireAuth>
  );
}
