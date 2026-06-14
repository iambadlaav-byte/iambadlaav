/**
 * FutureReadinessPage — /future-readiness (ARCH §7.4).
 */
import { Helmet } from 'react-helmet-async';
import { useLocation, Link } from 'react-router-dom';
import { getSeoForRoute } from '../../lib/seo.js';
import { ProgramHero } from '../../components/sections/ProgramHero.jsx';
import { TestimonialCard } from '../../components/cards/TestimonialCard.jsx';
import { FadeIn } from '../../components/animations/FadeIn.jsx';
import { StaggerChildren, StaggerItem } from '../../components/animations/StaggerChildren.jsx';

const WORKSHOPS = [
  { title: 'Environment Design', body: 'How to build a physical and digital environment that makes focused work inevitable rather than accidental.', duration: '1 day' },
  { title: 'Career Clarity', body: 'Structured reflection on what kind of work you actually want to do and why. For students approaching graduation or early professionals feeling stuck.', duration: '1 day' },
  { title: 'Deep Work Habits', body: 'The practice of sustained attention. Building habits that last when motivation doesn\'t.', duration: '2 days' },
];

const TESTIMONIALS = [
  {
    quote: 'I was about to take a job I didn\'t want because I had no framework for deciding. One day at Future Readiness changed that.',
    author: 'Neha Chavan',
    designation: 'Engineering Graduate',
    program: 'future-readiness',
    year: '2024',
    photoUrl: '/images/officer_4.jpg',
  },
];

export default function FutureReadinessPage() {
  const { pathname } = useLocation();
  const seo = getSeoForRoute(pathname);

  return (
    <>
      <Helmet>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        <meta property="og:title" content={seo.title} />
        <meta property="og:description" content={seo.description} />
        <meta property="og:type" content={seo.ogType} />
        <meta property="og:image" content={seo.ogImage} />
        <meta name="twitter:card" content={seo.twitterCard} />
      </Helmet>

      <ProgramHero
        program="Future Readiness"
        headline="The habits that make a career actually work."
        subHeadline="Workshops for students and young professionals on focus, clarity, and environment design."
        heroImage="/images/program_readiness.jpg"
        heroImageAlt="Interactive seminar room table with yellow sticky notes representing Future Readiness"
        primaryCta={{ label: 'Apply for Seat', href: '/register?program=future-readiness' }}
        secondaryCta={{ label: 'View Upcoming Dates', href: '#upcoming' }}
      />

      {/* Programs grid */}
      <section className="bg-cream py-[var(--section-y)] px-[var(--section-x)]">
        <div className="max-w-default mx-auto">
          <FadeIn>
            <p className="font-mono text-xs uppercase tracking-widest text-muted text-center mb-3">Workshops</p>
            <h2 className="font-display font-light text-ink text-center mb-10" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}>
              What we run
            </h2>
          </FadeIn>
          <StaggerChildren className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {WORKSHOPS.map((w) => (
              <StaggerItem key={w.title} className="h-full">
                <div className="bg-soft rounded-lg p-6 border-t-4 border-ochre h-full flex flex-col">
                  <span className="font-mono text-xs uppercase tracking-widest text-teal">{w.duration}</span>
                  <h3 className="font-display text-xl font-semibold text-ink mt-2 mb-3">{w.title}</h3>
                  <p className="font-sans text-sm text-charcoal leading-body flex-1">{w.body}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* Format */}
      <section className="bg-soft py-[var(--section-y)] px-[var(--section-x)]">
        <div className="max-w-narrow mx-auto text-center">
          <FadeIn>
            <p className="font-mono text-xs uppercase tracking-widest text-muted mb-3">Format</p>
            <h2 className="font-display font-light text-ink mb-6" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}>
              Residential and online
            </h2>
            <p className="font-sans text-charcoal leading-body">
              Residential workshops run from the Dnyanpith facility in Ambajogai.
              Online formats are available for colleges and organisations booking custom workshops.
              Both formats use the same content. The residential experience goes deeper.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Upcoming dates */}
      <section className="bg-cream py-[var(--section-y)] px-[var(--section-x)]" id="upcoming">
        <div className="max-w-default mx-auto">
          <FadeIn>
            <p className="font-mono text-xs uppercase tracking-widest text-muted text-center mb-3">Schedule</p>
            <h2 className="font-display font-light text-ink text-center mb-8" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}>
              Upcoming dates
            </h2>
            <div className="text-center">
              <p className="font-sans text-muted mb-6">Dates are announced 4–6 weeks in advance.</p>
              <Link
                to="/events"
                className="inline-flex items-center gap-2 font-sans text-sm font-medium text-teal
                           hover:text-teal-light transition-colors duration-150"
              >
                See all upcoming events →
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-soft py-[var(--section-y)] px-[var(--section-x)]">
        <div className="max-w-default mx-auto">
          <FadeIn>
            <h2 className="font-display font-light text-ink text-center mb-10" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}>
              In their words
            </h2>
          </FadeIn>
          <div className="max-w-lg mx-auto">
            {TESTIMONIALS.map((t) => (
              <FadeIn key={t.author}>
                <TestimonialCard {...t} />
              </FadeIn>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
