/**
 * VolunteerPage — /volunteer
 * Pitch + roles + application form. Copy lives in content.js (VOLUNTEER).
 */
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { ProgramHero } from '../../components/sections/ProgramHero.jsx';
import { VolunteerForm } from '../../components/forms/VolunteerForm.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { FadeIn } from '../../components/animations/FadeIn.jsx';
import { Highlight } from '../../components/ui/Highlight.jsx';
import { VOLUNTEER } from '../../lib/content.js';

export default function VolunteerPage() {
  const { hero, intro, roles, lookingFor } = VOLUNTEER;
  // The form stays hidden until the visitor opts in — a calmer first impression
  // than dropping a long form on the page.
  const [showForm, setShowForm] = useState(false);

  function openForm() {
    setShowForm(true);
    // Bring the freshly-revealed form into view on the next paint.
    setTimeout(() => {
      document.getElementById('apply')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }

  return (
    <>
      <Helmet>
        <title>Volunteer — Badlaav</title>
        <meta
          name="description"
          content="Volunteer with Badlaav. Help hold the space for a batch — arrival, sessions, meals, and follow-through."
        />
      </Helmet>

      <ProgramHero
        program={hero.program}
        headline={hero.headline}
        subHeadline={hero.sub}
        heroImage="/images/gallery_2.jpg"
        heroImageAlt="Volunteers and participants in the open at a Badlaav batch"
        primaryCta={{ label: 'Apply to volunteer', href: '#apply' }}
        secondaryCta={{ label: 'Talk to Arjun Dada', href: '/contact' }}
      />

      {/* Intro */}
      <section className="bg-cream py-[var(--section-y)] px-[var(--section-x)]">
        <div className="max-w-narrow mx-auto">
          <FadeIn>
            <p className="font-mono text-xs uppercase tracking-widest text-ochre mb-4">Why volunteer</p>
            <div className="space-y-4 font-sans text-charcoal leading-body text-lg">
              {intro.map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* What volunteers do */}
      <section className="bg-soft py-[var(--section-y)] px-[var(--section-x)]">
        <div className="max-w-default mx-auto">
          <FadeIn>
            <h2 className="font-display font-semibold text-ink text-center mb-10" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}>
              What volunteers <Highlight>do</Highlight>
            </h2>
          </FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {roles.map((role) => (
              <FadeIn key={role.title} className="h-full">
                <div className="bg-pearl rounded-2xl p-7 h-full flex flex-col border border-charcoal/5 shadow-sm hover:shadow-lg transition-shadow">
                  <h3 className="font-display text-xl font-semibold text-ink mb-2">{role.title}</h3>
                  <p className="font-sans text-sm text-charcoal leading-body flex-1">{role.body}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Who we look for */}
      <section className="bg-cream py-[var(--section-y)] px-[var(--section-x)]">
        <div className="max-w-narrow mx-auto">
          <FadeIn>
            <h2 className="font-display font-semibold text-ink mb-6" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}>
              Who we look for
            </h2>
            <ul className="space-y-3">
              {lookingFor.map((item) => (
                <li key={item} className="flex items-start gap-3 font-sans text-charcoal leading-body">
                  <span className="text-ochre mt-1 flex-shrink-0">●</span>
                  {item}
                </li>
              ))}
            </ul>
          </FadeIn>
        </div>
      </section>

      {/* Application form — revealed on demand */}
      <section id="apply" className="bg-soft py-[var(--section-y)] px-[var(--section-x)] scroll-mt-20">
        <div className="max-w-narrow mx-auto">
          <FadeIn>
            <p className="font-mono text-xs uppercase tracking-widest text-ochre mb-3">Apply</p>
            <h2 className="font-display font-semibold text-ink mb-8" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}>
              Put your name forward
            </h2>
            {showForm ? (
              <div className="bg-pearl rounded-2xl p-6 sm:p-8 border border-charcoal/5 shadow-sm">
                <VolunteerForm />
              </div>
            ) : (
              <div className="bg-pearl rounded-2xl p-8 border border-charcoal/5 shadow-sm text-center">
                <p className="font-sans text-charcoal leading-body mb-6 max-w-[440px] mx-auto">
                  Takes about two minutes. Tell us where you can help and which batch you have in mind.
                </p>
                <Button type="button" size="lg" onClick={openForm}>
                  Apply to volunteer
                </Button>
              </div>
            )}
          </FadeIn>
        </div>
      </section>
    </>
  );
}
