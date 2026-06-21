/**
 * LoginPage — /login route.
 * Two-tab login: Email + OTP (default), Email + Password (fallback).
 *
 * Per UI-SPEC §Components Page Inventory /login.
 * SEO: title "Sign in — Badlaav".
 * AmbientMotionBoundary already disables ambient motion on /login (CONSTRAINT-CODE-004).
 * NO animations on this page.
 *
 * If user is already authenticated, redirect to /account/dashboard.
 */
import { Navigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../../context/AuthContext.jsx';
import { LoginForm } from '../../components/forms/LoginForm.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';

export default function LoginPage() {
  const { user, loading } = useAuth();
  const [searchParams] = useSearchParams();

  // Show spinner while auth state is being restored from refresh cookie
  if (loading) {
    return (
      <main className="flex items-center justify-center min-h-[60vh]">
        <Spinner size={24} />
      </main>
    );
  }

  // Already authenticated — redirect to next or the role-appropriate dashboard.
  if (user) {
    const next = searchParams.get('next');
    const fallback = (user.role === 'ADMIN' || user.role === 'SUPERADMIN') ? '/admin/dashboard' : '/';
    return <Navigate to={next && next.startsWith('/') ? next : fallback} replace />;
  }

  return (
    <>
      <Helmet>
        <title>Sign in — Badlaav</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <main className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-12">
        <div className="w-full max-w-sm">
          {/* Page heading */}
          <div className="mb-8 text-center">
            <h1 className="font-display text-[length:var(--text-subheading)] font-light text-charcoal mb-1">
              Welcome back.
            </h1>
            <p className="font-sans text-sm text-muted">
              Sign in to your Badlaav account.
            </p>
          </div>

          {/* Login form (OTP + password tabs) */}
          <div className="bg-soft rounded-lg p-6 shadow-sm">
            <LoginForm />
          </div>

          {/* Account creation note */}
          <p className="mt-4 text-center font-sans text-xs text-muted">
            New here? Your account is created automatically when you register for a program.
          </p>
        </div>
      </main>
    </>
  );
}
