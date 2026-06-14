/**
 * BadlaavPage — /badlaav (ARCH §7.2).
 * Sections: ProgramHero · What Is Badlaav · The 3 Days · Who It's For ·
 * Highlights · Testimonials · Pricing · FAQ · Gallery teaser
 */
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { getSeoForRoute } from '../../lib/seo.js';
import { CorporateEnquiryForm } from '../../components/forms/CorporateEnquiryForm.jsx';
import { ProgramHero } from '../../components/sections/ProgramHero.jsx';
import { GeometricViz } from '../../components/animations/GeometricViz.jsx';
import { Pricing3Plans } from '../../components/sections/Pricing3Plans.jsx';
import { TestimonialCard } from '../../components/cards/TestimonialCard.jsx';
import { FadeIn } from '../../components/animations/FadeIn.jsx';
import { StaggerChildren, StaggerItem } from '../../components/animations/StaggerChildren.jsx';

const WHO_CHIPS = [
  'Founders & leadership teams',
  'Mid-career professionals',
  'Team leads under pressure',
  'Couples wanting clarity together',
];

const HIGHLIGHTS = [
  { title: 'Residential setting', body: 'Three days away from everything. Ambajogai, Marathwada. The distance is part of the design.' },
  { title: 'Structured silence', body: 'Mornings begin in quiet. No phones in sessions. The atmosphere is the intervention.' },
  { title: 'Small group', body: 'Max 20 participants per batch. Enough for real conversation; small enough for each person to be seen.' },
  { title: 'Follow-through design', body: 'The retreat ends; the framework stays. One accountability check-in 30 days after.' },
];

const TESTIMONIALS = [
  {
    quote: 'I came thinking it would be a team-building exercise. I left having made a decision I had been avoiding for two years.',
    author: 'Suresh Naik',
    designation: 'Operations Director',
    program: 'badlaav',
    year: '2024',
    photoUrl: '/images/officer_1.jpg',
  },
  {
    quote: 'The environment did the work. Three days and more clarity than six months of weekend workshops.',
    author: 'Meena Thokal',
    designation: 'Startup Founder',
    program: 'badlaav',
    year: '2023',
    photoUrl: '/images/officer_2.jpg',
  },
  {
    quote: 'Arjun does not perform a retreat. He holds a space. That is a different thing entirely.',
    author: 'Prakash Shinde',
    designation: 'Senior Manager, BFSI',
    program: 'badlaav',
    year: '2024',
    photoUrl: '/images/officer_3.jpg',
  },
];

const BADLAAV_PLANS = [
  {
    name: 'Individual',
    price: 18000,
    features: [
      '3-day residential retreat',
      'All meals and accommodation',
      'Structured sessions with Arjun',
      '30-day follow-through check-in',
    ],
    cta: { label: 'Enquire', href: '/register?program=badlaav&plan=individual' },
  },
  {
    name: 'Couple',
    price: 30000,
    features: [
      'Everything in Individual',
      'Partner attends together',
      'Shared room accommodation',
      'Couples-specific session',
    ],
    cta: { label: 'Enquire', href: '/register?program=badlaav&plan=couple' },
    isPopular: true,
  },
  {
    name: 'Corporate',
    price: null,
    features: [
      'Exclusive batch for your team',
      'Custom session design',
      'Pre-retreat team assessment',
      'Post-retreat leadership debrief',
    ],
    cta: { label: 'Get a Quote', href: '/contact' },
  },
];

const FAQS = [
  {
    q: 'Is this a Vipassana retreat?',
    a: 'No. Badlaav is a structured professional retreat. It draws on principles of focused environments and deliberate reflection, but it is not a meditation program.',
  },
  {
    q: 'What do I need to bring?',
    a: 'Comfortable clothes, an open mind, and no work calls. We will share a detailed pre-arrival note after you register.',
  },
  {
    q: 'Can my whole company come?',
    a: 'Yes. The corporate plan is designed for teams of 8–20. We design the sessions around your team\'s specific challenges.',
  },
  {
    q: 'What is the refund policy?',
    a: 'Full refund up to 14 days before the retreat. 50% refund between 7–14 days. No refund within 7 days — but you can transfer your seat to the next available batch.',
  },
  {
    q: 'Where exactly is Ambajogai?',
    a: 'Ambajogai is in Beed district, Marathwada, Maharashtra — roughly 160 km from Aurangabad and 450 km from Pune. We share detailed travel instructions after registration.',
  },
];

export default function BadlaavPage() {
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

      {/* Hero with FallingLeaves + BreathingPulse (showAmbient=true) */}
      <ProgramHero
        program="Badlaav"
        headline="Trip नाही — Turning Point."
        subHeadline="A 3-day residential retreat for professionals who need a real reset, not another workshop."
        heroImage="/images/program_badlaav.jpg"
        heroImageAlt="Atmospheric study desk with old books representing Badlaav"
        primaryCta={{ label: 'Enquire as Corporate', href: '/contact' }}
        secondaryCta={{ label: 'Register as Individual or Couple', href: '/register?program=badlaav' }}
        showAmbient
      />

      {/* What Is Badlaav */}
      <section className="bg-cream py-[var(--section-y)] px-[var(--section-x)] overflow-hidden" id="about">
        <div className="max-w-default mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left side: Text */}
            <FadeIn>
              <p className="font-mono text-xs uppercase tracking-widest text-teal mb-4">What is Badlaav</p>
              <h2 className="font-display font-light text-ink mb-6" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}>
                You cannot think clearly in a noisy environment.
              </h2>
              <div className="space-y-4 font-sans text-charcoal leading-body">
                <p>
                  Badlaav means change. Not a seminar about change — a three-day immersion in an environment designed for it. Ambajogai provides the distance from ordinary life that makes real reflection possible.
                </p>
                <p>
                  The sessions are structured but not scripted. Arjun works with each participant and each team where they actually are, not where a curriculum says they should be. The goals are clarity, decision, and a concrete plan for what comes next.
                </p>
                <p>
                  Accommodation, meals, and all sessions are included. You come; you focus; you leave with more than you arrived with.
                </p>
              </div>
            </FadeIn>

            {/* Right side: Animation */}
            <div className="flex items-center justify-center lg:justify-end">
              <div className="w-full max-w-[420px] lg:max-w-[500px] aspect-square rounded-full bg-ink flex items-center justify-center relative shadow-2xl overflow-hidden group">
                <GeometricViz hovered={false} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The 3 Days */}
      <section className="bg-soft py-[var(--section-y)] px-[var(--section-x)]" id="schedule">
        <div className="max-w-default mx-auto">
          <FadeIn>
            <p className="font-mono text-xs uppercase tracking-widest text-muted text-center mb-3">Programme</p>
            <h2 className="font-display font-light text-ink text-center mb-10" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}>
              Three days
            </h2>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { day: 'Day 1', title: 'Arrive and slow down', body: 'Check-in from 3pm. Evening session: where are you actually? Diagnostic conversations, no projectors, no slides. Dinner together.' },
              { day: 'Day 2', title: 'The work', body: 'Full-day structured reflection. Morning: your environment. Afternoon: your patterns. Evening: the decision you have been avoiding. No phones all day.' },
              { day: 'Day 3', title: 'What comes next', body: 'Morning: a specific plan for the next 90 days. Group debrief. Check-out by 2pm. One follow-up call 30 days later.' },
            ].map(({ day, title, body }) => (
              <FadeIn key={day} className="h-full">
                <div className="bg-cream rounded-lg p-6 h-full flex flex-col">
                  <p className="font-mono text-xs uppercase tracking-widest text-teal mb-2">{day}</p>
                  <h3 className="font-display text-xl font-semibold text-ink mb-3">{title}</h3>
                  <p className="font-sans text-sm text-charcoal leading-body flex-1">{body}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Who It's For */}
      <section className="bg-cream py-[var(--section-y)] px-[var(--section-x)]">
        <div className="max-w-default mx-auto">
          <FadeIn>
            <p className="font-mono text-xs uppercase tracking-widest text-muted text-center mb-3">Is this for you?</p>
            <h2 className="font-display font-light text-ink text-center mb-8" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}>
              Who comes to Badlaav
            </h2>
            <div className="flex flex-wrap gap-3 justify-center">
              {WHO_CHIPS.map((chip) => (
                <span key={chip} className="font-mono text-xs uppercase tracking-widest bg-soft text-charcoal px-4 py-2 rounded-full border border-muted/20">
                  {chip}
                </span>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Highlights */}
      <section className="bg-soft py-[var(--section-y)] px-[var(--section-x)]">
        <div className="max-w-default mx-auto">
          <FadeIn>
            <h2 className="font-display font-light text-ink text-center mb-10" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}>
              What to expect
            </h2>
          </FadeIn>
          <StaggerChildren className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {HIGHLIGHTS.map((h) => (
              <StaggerItem key={h.title} className="h-full">
                <div className="bg-cream rounded-lg p-6 h-full flex flex-col">
                  <h3 className="font-display text-lg font-semibold text-ink mb-2">{h.title}</h3>
                  <p className="font-sans text-sm text-charcoal leading-body flex-1">{h.body}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-cream py-[var(--section-y)] px-[var(--section-x)]">
        <div className="max-w-default mx-auto">
          <FadeIn>
            <p className="font-mono text-xs uppercase tracking-widest text-muted text-center mb-3">In their words</p>
            <h2 className="font-display font-light text-ink text-center mb-10" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}>
              What participants say
            </h2>
          </FadeIn>
          <StaggerChildren className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t) => (
              <StaggerItem key={t.author} className="h-full">
                <TestimonialCard {...t} />
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* Pricing */}
      <Pricing3Plans program="Badlaav" plans={BADLAAV_PLANS} />

      {/* FAQ */}
      <section className="bg-cream py-[var(--section-y)] px-[var(--section-x)]" id="faq">
        <div className="max-w-narrow mx-auto">
          <FadeIn>
            <p className="font-mono text-xs uppercase tracking-widest text-muted mb-3">Questions</p>
            <h2 className="font-display font-light text-ink mb-10" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}>
              Common questions
            </h2>
          </FadeIn>
          <div className="space-y-6">
            {FAQS.map((faq) => (
              <FadeIn key={faq.q}>
                <div className="border-b border-muted/20 pb-6">
                  <h3 className="font-display text-lg font-semibold text-ink mb-2">{faq.q}</h3>
                  <p className="font-sans text-sm text-charcoal leading-body">{faq.a}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Corporate Enquiry — FORM-01 */}
      <section className="bg-cream py-[var(--section-y)] px-[var(--section-x)]" id="enquire">
        <div className="max-w-narrow mx-auto">
          <FadeIn>
            <CorporateEnquiryForm />
          </FadeIn>
        </div>
      </section>

      {/* Gallery teaser */}
      <section className="bg-soft py-[var(--section-y)] px-[var(--section-x)]">
        <div className="max-w-default mx-auto">
          <FadeIn>
            <p className="font-mono text-xs uppercase tracking-widest text-muted text-center mb-3">Photos</p>
            <h2 className="font-display font-light text-ink text-center mb-8" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}>
              From the retreat
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {['/images/badlaav_day1.jpg', '/images/badlaav_day2.jpg', '/images/badlaav_day3.jpg'].map((photoUrl, idx) => (
                <div key={idx} className="aspect-video sm:aspect-square bg-ink/10 rounded-lg overflow-hidden">
                  <img
                    src={photoUrl}
                    alt={`Badlaav retreat activity ${idx + 1}`}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
            <div className="text-center mt-6">
              <Link
                to="/about#gallery"
                className="font-sans text-sm font-medium text-teal hover:text-teal-light transition-colors duration-150"
              >
                See full gallery →
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
