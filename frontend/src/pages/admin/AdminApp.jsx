/**
 * AdminApp — role-gated admin router per RESEARCH Pattern 8.
 *
 * Lazy-loaded via React.lazy in routes.jsx so admin code is NEVER bundled
 * for public visitors (Pattern 8 — code splitting at the auth boundary).
 *
 * Gate logic:
 *   loading?           → FullPageSpinner (auth state being restored from refresh cookie)
 *   !user?             → redirect /admin/login
 *   user.role !== 'ADMIN' → redirect / (non-admin users can't access admin panel)
 *   else               → render AdminLayout with Outlet
 *
 * NO ambient animations (CONSTRAINT-CODE-004).
 * This component is the default export for React.lazy compatibility.
 */
import { Navigate, Outlet, Routes, Route } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { AdminSidebar } from '../../components/admin/AdminSidebar.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';

// Lazy-load all admin pages inside the lazy boundary so they split further
import AdminDashboardPage     from './AdminDashboardPage.jsx';
import AdminEnquiriesPage     from './AdminEnquiriesPage.jsx';
import AdminRegistrationsPage from './AdminRegistrationsPage.jsx';
import AdminBatchesPage       from './AdminBatchesPage.jsx';
import AdminCommunityPage     from './AdminCommunityPage.jsx';
import AdminInvoicesPage      from './AdminInvoicesPage.jsx';
import AdminBlogPage          from './AdminBlogPage.jsx';
import AdminEventsPage        from './AdminEventsPage.jsx';
import AdminAuditPage         from './AdminAuditPage.jsx';

function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-cream">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}

export default function AdminApp() {
  const { user, loading } = useAuth();

  // Auth state being restored from refresh cookie — wait before deciding
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size={32} />
      </div>
    );
  }

  // Not authenticated — send to admin login
  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  // Authenticated but not admin-tier — redirect to public homepage
  if (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN') {
    return <Navigate to="/" replace />;
  }

  // Admin — render the full panel
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard"     element={<AdminDashboardPage />} />
        <Route path="enquiries"     element={<AdminEnquiriesPage />} />
        <Route path="registrations" element={<AdminRegistrationsPage />} />
        <Route path="batches"       element={<AdminBatchesPage />} />
        <Route path="community"     element={<AdminCommunityPage />} />
        <Route path="invoices"      element={<AdminInvoicesPage />} />
        <Route path="blog"          element={<AdminBlogPage />} />
        <Route path="events"        element={<AdminEventsPage />} />
        <Route path="audit"         element={<AdminAuditPage />} />
        {/* Catch-all within admin — redirect to dashboard */}
        <Route path="*"             element={<Navigate to="dashboard" replace />} />
      </Route>
    </Routes>
  );
}
