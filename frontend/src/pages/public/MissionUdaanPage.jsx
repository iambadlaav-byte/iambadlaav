/**
 * MissionUdaanPage — /mission-udaan (ARCH §7.3).
 */
import { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { getSeoForRoute } from '../../lib/seo.js';
import { MissionUdaanStudentForm } from '../../components/forms/MissionUdaanStudentForm.jsx';
import { ProgramHero } from '../../components/sections/ProgramHero.jsx';
import { Pricing3Plans } from '../../components/sections/Pricing3Plans.jsx';
import { OfficerCard } from '../../components/cards/OfficerCard.jsx';
import { TestimonialCard } from '../../components/cards/TestimonialCard.jsx';
import { FadeIn } from '../../components/animations/FadeIn.jsx';
import { StaggerChildren, StaggerItem } from '../../components/animations/StaggerChildren.jsx';
import { UdaanViz } from '../../components/animations/UdaanViz.jsx';

const EXAM_TYPES = ['All', 'MPSC', 'UPSC', 'PSI', 'STI', 'RTS'];

const PLACEHOLDER_OFFICERS = [
  { name: 'Priya Desai', exam: 'MPSC', year: '2023', consented: true, photoUrl: '/images/officer_1.jpg' },
  { name: 'Rahul Mane', exam: 'UPSC', year: '2022', consented: true, photoUrl: '/images/officer_2.jpg' },
  { name: 'Sneha Patil', exam: 'PSI', year: '2023', consented: true, photoUrl: '/images/officer_3.jpg' },
  { name: 'Vijay Kulkarni', exam: 'STI', year: '2024', consented: true, photoUrl: '/images/officer_4.jpg' },
  { name: 'Amruta Bhosale', exam: 'MPSC', year: '2024', consented: true, photoUrl: '/images/officer_5.jpg' },
  { name: 'Rohit Kale', exam: 'RTS', year: '2023', consented: true, photoUrl: '/images/officer_6.jpg' },
];

const TRACKS = [
  { code: 'UPSC', label: 'UPSC Civil Services', body: 'IAS, IPS, IFS, and allied services. Resident study facility with dedicated mentorship.', stars: 5 },
  { code: 'MPSC', label: 'MPSC State Service', body: 'Maharashtra Public Service Commission — Deputy Collector, DSP, and allied services.', stars: 4 },
  { code: 'PSI', label: 'PSI / STI / ASO', body: 'Police Sub-Inspector, State Tax Inspector, Assistant Section Officer and other Grade B/C services.', stars: 3 },
  { code: 'STI', label: 'RTS / Other', body: 'Revenue Talati, other state-level examinations. Foundation batch for first-time aspirants.', stars: 2 },
];

const MU_PLANS = [
  {
    name: 'Monthly',
    price: 8000,
    features: ['Residential facility access', 'Guided study schedule', 'Weekly review with mentor', 'Library access'],
    cta: { label: 'Apply as Student', href: '/register?program=mission-udaan&plan=monthly' },
  },
  {
    name: 'Quarterly',
    price: 21000,
    features: ['Everything in Monthly', 'Save ₹3,000 vs monthly', 'Mid-quarter progress report', 'Priority seat allocation'],
    cta: { label: 'Apply as Student', href: '/register?program=mission-udaan&plan=quarterly' },
    isPopular: true,
  },
  {
    name: 'Annual',
    price: 72000,
    features: ['Everything in Quarterly', 'Save ₹24,000 vs monthly', 'Dedicated mentor pairing', 'Mock interview preparation'],
    cta: { label: 'Apply as Student', href: '/register?program=mission-udaan&plan=annual' },
  },
];

const TESTIMONIALS = [
  {
    quote: 'The residential environment removed every excuse. I cleared in my second attempt after joining Mission Udaan.',
    author: 'Amol Jadhav',
    designation: 'MPSC State Service 2023',
    program: 'mission-udaan',
    year: '2023',
    photoUrl: '/images/officer_8.jpg',
  },
  {
    quote: 'Structure and accountability. That is what most aspirants lack. Mission Udaan provides both.',
    author: 'Kavita Sawant',
    designation: 'UPSC Civil Services 2022',
    program: 'mission-udaan',
    year: '2022',
    photoUrl: '/images/officer_1.jpg',
  },
];

function TrackCard({ track }) {
  const [hovered, setHovered] = useState(false);

  // Stars in a single horizontal line at top-right, like rank insignia
  const stars = useMemo(
    () =>
      Array.from({ length: track.stars }, (_, i) => ({
        id: i,
        delay: i * 80,
      })),
    [track.stars]
  );

  return (
    <div
      className="relative bg-soft rounded-lg p-5 overflow-hidden"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        transform: hovered ? 'translateY(-6px) scale(1.02)' : 'translateY(0) scale(1)',
        boxShadow: hovered ? '0 12px 28px rgba(0,0,0,0.10)' : '0 0 0 rgba(0,0,0,0)',
        transition: 'transform 300ms ease, box-shadow 300ms ease',
      }}
    >
      {/* Rank stars — single line, top-right corner */}
      <div
        aria-hidden="true"
        className="absolute top-3 right-4 flex gap-[3px] pointer-events-none"
      >
        {stars.map((star) => (
          <span
            key={star.id}
            className="select-none"
            style={{
              fontSize: '13px',
              color: 'rgb(var(--color-gold))',
              opacity: hovered ? 1 : 0,
              transition: `opacity 300ms ease ${star.delay}ms`,
              lineHeight: 1,
            }}
          >
            ★
          </span>
        ))}
      </div>
      <span className="relative z-10 font-mono text-xs uppercase tracking-widest text-teal">{track.code}</span>
      <h3 className="relative z-10 font-display text-lg font-semibold text-ink mt-2 mb-2">{track.label}</h3>
      <p className="relative z-10 font-sans text-sm text-charcoal leading-body">{track.body}</p>
    </div>
  );
}

export default function MissionUdaanPage() {
  const { pathname } = useLocation();
  const seo = getSeoForRoute(pathname);
  const [examFilter, setExamFilter] = useState('All');

  const filteredOfficers = examFilter === 'All'
    ? PLACEHOLDER_OFFICERS
    : PLACEHOLDER_OFFICERS.filter((o) => o.exam === examFilter);

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
        program="Mission Udaan"
        headline="50+ officers cleared. The environment made the difference."
        subHeadline="Residential preparation for MPSC, UPSC, PSI, STI, and RTS. Ambajogai, Marathwada."
        heroImage="/images/program_udaan.jpg"
        heroImageAlt="Quiet empty study hall at dawn representing Mission Udaan"
        primaryCta={{ label: 'Apply as Student', href: '/register?program=mission-udaan' }}
        secondaryCta={{ label: 'College Association', href: '/join-us?tab=college' }}
      />

      {/* About section */}
      <section className="bg-cream py-[var(--section-y)] px-[var(--section-x)] overflow-hidden">
        <div className="max-w-default mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left side: Text */}
            <FadeIn>
              <p className="font-mono text-xs uppercase tracking-widest text-teal mb-4">What is Mission Udaan</p>
              <h2 className="font-display font-light text-ink mb-6" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}>
                A deliberate environment for serious aspirants
              </h2>
              <div className="space-y-4 font-sans text-charcoal leading-body">
                <p>
                  Most competitive exam aspirants fail not because they lack intelligence — they fail because their environment works against them. Distractions, inconsistent schedules, no accountability, no community.
                </p>
                <p>
                  Mission Udaan is a residential study facility that removes those variables. A structured schedule, a library, weekly mentor reviews, and a community of people doing the same work — that is the environment.
                </p>
                <p>
                  Over 50 officers have cleared MPSC, UPSC, and allied services from here. They are not statistics. They are people who chose to change their environment.
                </p>
              </div>
            </FadeIn>

            {/* Right side: Animation */}
            <div className="flex items-center justify-center lg:justify-end">
              <div className="w-full max-w-[420px] lg:max-w-[500px] aspect-square rounded-full bg-ink flex items-center justify-center relative shadow-2xl overflow-hidden group">
                <UdaanViz hovered={false} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Officers gallery */}
      <section className="bg-soft py-[var(--section-y)] px-[var(--section-x)]" id="officers">
        <div className="max-w-default mx-auto">
          <FadeIn>
            <p className="font-mono text-xs uppercase tracking-widest text-muted text-center mb-3">Alumni</p>
            <h2 className="font-display font-light text-ink text-center mb-6" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}>
              Officers who cleared
            </h2>

            {/* Filter bar */}
            <div className="flex flex-wrap gap-2 justify-center mb-8">
              {EXAM_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => setExamFilter(type)}
                  className={`font-mono text-xs uppercase tracking-widest px-4 py-2 rounded-full border transition-colors duration-150
                    ${examFilter === type
                      ? 'bg-teal text-pearl border-teal'
                      : 'bg-cream text-muted border-muted/30 hover:border-teal hover:text-teal'
                    }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </FadeIn>

          {filteredOfficers.length > 0 ? (
            <StaggerChildren className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {filteredOfficers.map((officer) => (
                <StaggerItem key={`${officer.name}-${officer.year}`}>
                  <OfficerCard {...officer} />
                </StaggerItem>
              ))}
            </StaggerChildren>
          ) : (
            <div className="text-center py-8">
              <p className="font-sans text-charcoal font-medium mb-1">No officers match this filter.</p>
              <p className="font-sans text-muted text-sm">Try a different exam type or year.</p>
            </div>
          )}
        </div>
      </section>

      {/* Tracks */}
      <section className="bg-cream py-[var(--section-y)] px-[var(--section-x)]">
        <div className="max-w-default mx-auto">
          <FadeIn>
            <p className="font-mono text-xs uppercase tracking-widest text-muted text-center mb-3">Streams</p>
            <h2 className="font-display font-light text-ink text-center mb-10" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}>
              Five tracks
            </h2>
          </FadeIn>
          <StaggerChildren className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {TRACKS.map((track) => (
              <StaggerItem key={track.code}>
                <TrackCard track={track} />
              </StaggerItem>
            ))}
          </StaggerChildren>
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
          <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto">
            {TESTIMONIALS.map((t) => (
              <StaggerItem key={t.author} className="h-full">
                <TestimonialCard {...t} />
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      <Pricing3Plans program="Mission Udaan" plans={MU_PLANS} />

      {/* Student Application — FORM-05 (Navigation Form) */}
      <section className="bg-cream py-[var(--section-y)] px-[var(--section-x)]" id="student">
        <div className="max-w-narrow mx-auto">
          <FadeIn>
            <MissionUdaanStudentForm />
          </FadeIn>
        </div>
      </section>
    </>
  );
}
