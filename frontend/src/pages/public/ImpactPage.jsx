/**
 * ImpactPage — /impact (ARCH §7.5).
 * Headline stats (animated NumberCounters), officer gallery (filterable),
 * corporate clients placeholder, testimonials.
 */
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { getSeoForRoute } from '../../lib/seo.js';
import { NumberCounter } from '../../components/animations/NumberCounter.jsx';
import { OfficerCard } from '../../components/cards/OfficerCard.jsx';
import { TestimonialCard } from '../../components/cards/TestimonialCard.jsx';
import { FadeIn } from '../../components/animations/FadeIn.jsx';
import { StaggerChildren, StaggerItem } from '../../components/animations/StaggerChildren.jsx';

const EXAM_TYPES = ['All', 'MPSC', 'UPSC', 'PSI', 'STI', 'RTS'];

const OFFICERS = [
  { name: 'Priya Desai', exam: 'MPSC', year: '2023', consented: true, photoUrl: '/images/officer_1.jpg' },
  { name: 'Rahul Mane', exam: 'UPSC', year: '2022', consented: true, photoUrl: '/images/officer_2.jpg' },
  { name: 'Sneha Patil', exam: 'PSI', year: '2023', consented: true, photoUrl: '/images/officer_3.jpg' },
  { name: 'Vijay Kulkarni', exam: 'STI', year: '2024', consented: true, photoUrl: '/images/officer_4.jpg' },
  { name: 'Amruta Bhosale', exam: 'MPSC', year: '2024', consented: true, photoUrl: '/images/officer_5.jpg' },
  { name: 'Rohit Kale', exam: 'RTS', year: '2023', consented: true, photoUrl: '/images/officer_6.jpg' },
  { name: 'Deepa Jadhav', exam: 'MPSC', year: '2022', consented: true, photoUrl: '/images/officer_7.jpg' },
  { name: 'Sanjay More', exam: 'UPSC', year: '2023', consented: true, photoUrl: '/images/officer_8.jpg' },
];

const TESTIMONIALS = [
  {
    quote: 'Mission Udaan didn\'t give me motivation. It gave me structure. That is what I needed.',
    author: 'Ananya Shirke',
    designation: 'MPSC State Service 2024',
    program: 'mission-udaan',
    year: '2024',
    photoUrl: '/images/officer_5.jpg',
  },
  {
    quote: 'The Badlaav retreat helped me realise I had been busy, not productive. Different things.',
    author: 'Kiran Patil',
    designation: 'Product Manager',
    program: 'badlaav',
    year: '2023',
    photoUrl: '/images/officer_6.jpg',
  },
  {
    quote: 'Three days removed two years of inertia. I don\'t know how to explain it except to say: go.',
    author: 'Swati Deshmukh',
    designation: 'Startup Founder',
    program: 'badlaav',
    year: '2024',
    photoUrl: '/images/officer_7.jpg',
  },
];

export default function ImpactPage() {
  const { pathname } = useLocation();
  const seo = getSeoForRoute(pathname);
  const [examFilter, setExamFilter] = useState('All');

  const filteredOfficers = examFilter === 'All'
    ? OFFICERS
    : OFFICERS.filter((o) => o.exam === examFilter);

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

      {/* Headline stats */}
      <section className="bg-ink py-[var(--section-y)] px-[var(--section-x)]">
        <div className="max-w-default mx-auto">
          <FadeIn>
            <h1 className="font-display font-light text-pearl text-center mb-12" style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)' }}>
              The numbers behind the work
            </h1>
          </FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            {[
              { target: 50, suffix: '+', label: 'officers cleared MPSC / UPSC', eyebrow: 'Mission Udaan' },
              { target: 200, suffix: '+', label: 'Badlaav participants', eyebrow: 'Corporate Retreat' },
              { target: 4, suffix: '', label: 'community circles', eyebrow: 'Community' },
            ].map((stat, i) => (
              <FadeIn key={stat.eyebrow} delay={i * 0.1}>
                <p className="font-mono text-xs uppercase tracking-widest text-pearl/40 mb-2">{stat.eyebrow}</p>
                <div className="font-display font-light text-pearl leading-none mb-2" style={{ fontSize: 'clamp(3rem, 8vw, 6rem)' }}>
                  <NumberCounter target={stat.target} suffix={stat.suffix} className="text-gold" />
                </div>
                <p className="font-sans text-sm text-pearl/70 leading-snug">{stat.label}</p>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Officer gallery */}
      <section className="bg-cream py-[var(--section-y)] px-[var(--section-x)]">
        <div className="max-w-default mx-auto">
          <FadeIn>
            <p className="font-mono text-xs uppercase tracking-widest text-muted text-center mb-3">Mission Udaan alumni</p>
            <h2 className="font-display font-light text-ink text-center mb-6" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}>
              Officers who cleared
            </h2>
            <div className="flex flex-wrap gap-2 justify-center mb-8">
              {EXAM_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => setExamFilter(type)}
                  className={`font-mono text-xs uppercase tracking-widest px-4 py-2 rounded-full border transition-colors duration-150
                    ${examFilter === type
                      ? 'bg-teal text-pearl border-teal'
                      : 'bg-soft text-muted border-muted/30 hover:border-teal hover:text-teal'
                    }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </FadeIn>

          {filteredOfficers.length > 0 ? (
            <StaggerChildren className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-4">
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

      {/* Corporate clients */}
      <section className="bg-soft py-[var(--section-y)] px-[var(--section-x)]">
        <div className="max-w-default mx-auto">
          <FadeIn>
            <p className="font-mono text-xs uppercase tracking-widest text-muted text-center mb-3">Badlaav</p>
            <h2 className="font-display font-light text-ink text-center mb-8" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}>
              Corporate participants
            </h2>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
              {["/images/badlaav_day1.jpg", "/images/badlaav_day2.jpg", "/images/badlaav_day3.jpg", "/images/gallery_1.jpg", "/images/gallery_2.jpg", "/images/gallery_3.jpg"].map((src, i) => (
                <div key={i} className="aspect-[3/2] bg-cream/80 rounded flex items-center justify-center border border-muted/20 select-none hover:border-teal/30 transition-all duration-300 overflow-hidden">
                  <img src={src} alt="Corporate participant" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" />
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-cream py-[var(--section-y)] px-[var(--section-x)]">
        <div className="max-w-default mx-auto">
          <FadeIn>
            <p className="font-mono text-xs uppercase tracking-widest text-muted text-center mb-3">In their words</p>
            <h2 className="font-display font-light text-ink text-center mb-10" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}>
              What people say
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
    </>
  );
}
