/**
 * RegisterPage — /register?program=X
 * Programme-aware: The Retreat gets the deep 5-step questionnaire; The Badlaav
 * Experience gets the lighter form. Default is The Retreat.
 *
 * No animations on form pages (CONSTRAINT-CODE-004).
 */
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { RetreatRegistrationForm } from '../../components/forms/RetreatRegistrationForm.jsx';
import { ExperienceRegistrationForm } from '../../components/forms/ExperienceRegistrationForm.jsx';

export default function RegisterPage() {
  const [searchParams] = useSearchParams();
  const slug = (searchParams.get('program') || 'badlaav').toLowerCase();
  const isExperience = slug === 'badlaav-experience' || slug === 'experience';

  return (
    <>
      <Helmet>
        <title>{isExperience ? 'Register — The Badlaav Experience' : 'Register — The Retreat'} · Badlaav</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <main>
        {isExperience ? (
          <ExperienceRegistrationForm />
        ) : (
          <RetreatRegistrationForm program="BADLAAV" programLabel="The Retreat" />
        )}
      </main>
    </>
  );
}
