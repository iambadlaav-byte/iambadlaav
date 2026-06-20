/**
 * BadlaavExperiencePage — /badlaav-experience
 * The lighter, second programme. Client-supplied copy lives in content.js (EXPERIENCE).
 * Reuses ProgramHero + the warm card/section system (LBD look).
 */
import { Helmet } from 'react-helmet-async';
import { ProgramHero } from '../../components/sections/ProgramHero.jsx';
import { CtaBand } from '../../components/sections/CtaBand.jsx';
import { FadeIn } from '../../components/animations/FadeIn.jsx';
import { NumberBadge } from '../../components/ui/NumberBadge.jsx';
import { Highlight } from '../../components/ui/Highlight.jsx';
import { EXPERIENCE } from '../../lib/content.js';

const REGISTER_HREF = '/register?program=badlaav-experience';

export default function BadlaavExperiencePage() {
  const { hero, intro, learn, audience, highlights, outcomes, process } = EXPERIENCE;

  return (
    <>
      <Helmet>
        <title>The Badlaav Experience — Badlaav</title>
        <meta
          name="description"
          content="A guided experience to break through limiting patterns, gain clarity, and move forward with confidence and purpose."
        />
      </Helmet>

      <ProgramHero
        program={hero.program}
        headline={hero.headline}
        subHeadline={hero.sub}
        heroImage="/images/badlaav_day2.jpg"
        heroImageAlt="A working session at a Badlaav batch"
        primaryCta={{ label: 'Register', href: REGISTER_HREF }}
        secondaryCta={{ label: 'Talk to Arjun Dada', href: '/contact' }}
      />

      {/* Intro */}
      <section className="bg-cream py-[var(--section-y)] px-[var(--section-x)]">
        <div className="max-w-narrow mx-auto">
          <FadeIn>
            <p className="font-mono text-xs uppercase tracking-widest text-ochre mb-4">About this programme</p>
            <div className="space-y-4 font-sans text-charcoal leading-body text-lg">
              {intro.map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* What you will learn */}
      <section className="bg-soft py-[var(--section-y)] px-[var(--section-x)]">
        <div className="max-w-default mx-auto">
          <FadeIn>
            <h2 className="font-display font-semibold text-ink text-center mb-10" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}>
              What you will <Highlight>learn</Highlight>
            </h2>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {learn.map((item, i) => (
              <FadeIn key={item.title} className="h-full">
                <div className="bg-pearl rounded-2xl p-7 h-full flex flex-col border border-charcoal/5 shadow-sm hover:shadow-lg transition-shadow">
                  <NumberBadge label={String(i + 1).padStart(2, '0')} index={i} className="mb-4" />
                  <h3 className="font-display text-xl font-semibold text-ink mb-2">{item.title}</h3>
                  <p className="font-sans text-sm text-charcoal leading-body flex-1">{item.body}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section className="bg-cream py-[var(--section-y)] px-[var(--section-x)]">
        <div className="max-w-default mx-auto">
          <FadeIn>
            <p className="font-mono text-xs uppercase tracking-widest text-muted text-center mb-3">Who is this for</p>
            <h2 className="font-display font-semibold text-ink text-center mb-8" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}>
              Made for people ready to move
            </h2>
            <div className="flex flex-wrap gap-3 justify-center">
              {audience.map((chip) => (
                <span key={chip} className="font-mono text-xs uppercase tracking-widest bg-pearl text-charcoal px-4 py-2 rounded-full border border-charcoal/10 shadow-sm">
                  {chip}
                </span>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Highlights + Outcomes */}
      <section className="bg-soft py-[var(--section-y)] px-[var(--section-x)]">
        <div className="max-w-default mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { label: 'Programme highlights', items: highlights },
            { label: 'What you can expect', items: outcomes },
          ].map((col) => (
            <FadeIn key={col.label} className="h-full">
              <div className="bg-pearl rounded-2xl p-8 h-full border border-charcoal/5 shadow-sm">
                <h3 className="font-display text-xl font-semibold text-ink mb-5">{col.label}</h3>
                <ul className="space-y-3">
                  {col.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 font-sans text-sm text-charcoal">
                      <span className="text-ochre mt-0.5 flex-shrink-0">●</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* How registration works */}
      <section className="bg-cream py-[var(--section-y)] px-[var(--section-x)]">
        <div className="max-w-narrow mx-auto">
          <FadeIn>
            <h2 className="font-display font-semibold text-ink mb-3" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}>
              How registration works
            </h2>
            <p className="font-sans text-charcoal/80 mb-10 leading-body">
              Dates, fee, seats, venue, and facilitator details are shown on the registration form for the open batch.
            </p>
            <ol className="space-y-5">
              {process.map((step, i) => (
                <li key={step} className="flex items-start gap-4">
                  <NumberBadge label={String(i + 1)} index={i} className="w-10 h-10 text-base flex-shrink-0" />
                  <p className="font-sans text-charcoal leading-body pt-1.5">{step}</p>
                </li>
              ))}
            </ol>
          </FadeIn>
        </div>
      </section>

      <CtaBand
        eyebrow="Ready when you are"
        heading="Join the next Experience."
        body="One programme, real tools, and a room of people moving in the same direction."
        primary={{ label: 'Register', href: REGISTER_HREF }}
        secondary={{ label: 'Talk to Arjun Dada', href: '/contact' }}
      />
    </>
  );
}
