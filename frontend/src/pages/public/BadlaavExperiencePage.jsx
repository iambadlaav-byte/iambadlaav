/**
 * BadlaavExperiencePage — /badlaav-experience
 * The second programme, presented with the same First Light "programme" template
 * as /retreat: hero → centered intro → alternating image/copy blocks → audience
 * → how-to-register → upcoming dates. Copy lives in content.js (EXPERIENCE).
 */
import { Helmet } from 'react-helmet-async';
import { ProgramHero } from '../../components/sections/ProgramHero.jsx';
import { HeroGeometry, HERO_FIGURE } from '../../components/animations/HeroGeometry.jsx';
import { DayBlock } from '../../components/sections/DayBlock.jsx';
import { UpcomingBatches } from '../../components/sections/UpcomingBatches.jsx';
import { FadeIn } from '../../components/animations/FadeIn.jsx';
import { NumberBadge } from '../../components/ui/NumberBadge.jsx';
import { EXPERIENCE } from '../../lib/content.js';

const REGISTER_HREF = '/register?program=badlaav-experience';

export default function BadlaavExperiencePage() {
  const { hero, intro, learn, audience, highlights, outcomes, process } = EXPERIENCE;

  // Same alternating image/copy rhythm as /retreat's day blocks, carrying the
  // Experience's own content (learn pillars, highlights, outcomes).
  const blocks = [
    {
      day: 'Learn',
      title: 'What you will learn',
      subtitle: 'Awareness to action',
      accent: 'gold',
      image: '/images/proto_day1.png',
      list: learn,
    },
    {
      day: 'Inside',
      title: 'Programme highlights',
      subtitle: 'How the room runs',
      accent: 'sage',
      image: '/images/proto_day3.png',
      list: highlights,
    },
    {
      day: 'Outcomes',
      title: 'What you can expect',
      subtitle: 'What you take home',
      accent: 'gold',
      image: '/images/proto_day5.png',
      list: outcomes,
    },
  ];

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
        headlinePrefix={hero.headlinePrefix}
        headlineWords={hero.headlineWords}
        subHeadline={hero.sub}
        heroImage="/images/badlaav_day2.jpg"
        heroImageAlt="A working session at a Badlaav batch"
        primaryCta={{ label: 'Register', href: REGISTER_HREF }}
        secondaryCta={{ label: 'Talk to Arjun Dada', href: '/contact' }}
        aside={<HeroGeometry variant={HERO_FIGURE.EXPERIENCE} />}
      />

      {/* Intro — mirrors /retreat's centered opener */}
      <section className="bg-cream pt-[var(--section-y)] text-center px-[var(--section-x)]">
        <FadeIn>
          <h2 className="font-display text-ink" style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)' }}>
            The Experience
          </h2>
          <div className="max-w-narrow mx-auto mt-3 space-y-4 font-sans text-charcoal/80 leading-body">
            {intro.map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
          </div>
        </FadeIn>
      </section>

      {/* Alternating image/copy blocks — the same look as the retreat day blocks */}
      {blocks.map((block, i) => (
        <DayBlock key={block.title} day={block} reverse={i % 2 === 1} />
      ))}

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

      <UpcomingBatches program="FUTURE_READINESS" title="Upcoming Experience dates" />
    </>
  );
}
