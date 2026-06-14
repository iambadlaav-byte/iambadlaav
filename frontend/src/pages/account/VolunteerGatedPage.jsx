/**
 * VolunteerGatedPage — /account/volunteer
 *
 * If user.coursesCompleted >= 1:
 *   Phase 2 placeholder card — volunteer form ships in Phase 2.
 * If user.coursesCompleted < 1:
 *   Redirect to /account/dashboard (not eligible yet).
 *
 * Greyed-out copy per UI-SPEC §Empty states §11.4 + brand voice rules:
 *   Title: "Complete one Badlaav batch first."
 *   Body: "The Volunteer Portal opens once you've attended a retreat.
 *          We'll email you the day it unlocks."
 *
 * Phase 2 eligible copy approved in PLAN.md §action:
 *   "Volunteer application form ships in Phase 2 —
 *    for now you'll receive an email when Arjun publishes the application window."
 *
 * NO inline styles (CONSTRAINT-CODE-001). NO animations (CONSTRAINT-CODE-004).
 */
import { Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../../context/AuthContext.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';

export default function VolunteerGatedPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Spinner size={28} />
      </div>
    );
  }

  // Not eligible — redirect silently to dashboard
  if (!user || user.coursesCompleted < 1) {
    return <Navigate to="/account/dashboard" replace />;
  }

  // Eligible — Phase 2 placeholder
  return (
    <>
      <Helmet>
        <title>Volunteer Portal — Dnyanpith</title>
      </Helmet>

      <div className="max-w-lg space-y-6">
        <h1 className="font-display text-3xl font-light text-ink">Volunteer Portal</h1>

        <div className="p-6 rounded-lg border border-gold/30 bg-gold/5 space-y-3">
          <p className="font-display text-xl font-light text-ink">
            You're in the Volunteer cohort.
          </p>
          <p className="text-base text-ink font-sans leading-relaxed">
            Volunteer application form ships in Phase 2 — for now you'll receive an email
            when Arjun publishes the application window.
          </p>
          <p className="text-sm text-muted font-sans">
            Questions? Reach Arjun directly at{' '}
            <a
              href="mailto:hello@dnyanpith.org"
              className="text-teal hover:text-teal-light underline-offset-4 hover:underline"
            >
              hello@dnyanpith.org
            </a>
            .
          </p>
        </div>
      </div>
    </>
  );
}
