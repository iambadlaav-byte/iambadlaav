/**
 * RegisterPage — FORM-02 Universal Registration Wizard.
 * Route: /register?program=X&plan=Y&...
 *
 * Reads `program` from URL search params and passes it to RegistrationForm
 * as `initialProgram`. The full set of URL params (FORM-05 handoff) is consumed
 * inside RegistrationStep1 via useSearchParams.
 *
 * No animations on form pages (CONSTRAINT-CODE-004).
 */
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { RegistrationForm } from '../../components/forms/RegistrationForm.jsx';

export default function RegisterPage() {
  const [searchParams] = useSearchParams();
  const programSlug = searchParams.get('program');

  // Map URL slug to display label for meta
  const programLabels = {
    'badlaav':          'Badlaav',
    'mission-udaan':    'Mission Udaan',
    'future-readiness': 'Future Readiness',
    'antrang':          'Antrang',
  };
  const programDisplay = programLabels[programSlug?.toLowerCase()] ?? 'a program';

  return (
    <>
      <Helmet>
        <title>Register for {programDisplay} — Dnyanpith</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <main>
        <RegistrationForm initialProgram={programSlug} />
      </main>
    </>
  );
}
