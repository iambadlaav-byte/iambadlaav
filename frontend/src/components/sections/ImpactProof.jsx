/**
 * ImpactProof — Section 5 of 10 (ARCH §7.1).
 * Officer gallery teaser — 4 OfficerCards, link to /impact for all 50+.
 */
import { Link } from 'react-router-dom';
import { FadeIn } from '../animations/FadeIn.jsx';
import { StaggerChildren, StaggerItem } from '../animations/StaggerChildren.jsx';
import { OfficerCard } from '../cards/OfficerCard.jsx';

/** Placeholder officers — real data managed in /admin (Plan 07). */
const PLACEHOLDER_OFFICERS = [
  { name: 'Priya Desai', exam: 'MPSC State Service', year: '2023', consented: true, photoUrl: '/images/officer_1.jpg' },
  { name: 'Rahul Mane', exam: 'UPSC Civil Services', year: '2022', consented: true, photoUrl: '/images/officer_2.jpg' },
  { name: 'Sneha Patil', exam: 'MPSC PSI', year: '2023', consented: true, photoUrl: '/images/officer_3.jpg' },
  { name: 'Vijay Kulkarni', exam: 'MPSC STI', year: '2024', consented: true, photoUrl: '/images/officer_4.jpg' },
];

export function ImpactProof() {
  return (
    <section
      className="bg-soft py-[var(--section-y)] px-[var(--section-x)]"
      aria-label="Officers who cleared"
    >
      <div className="max-w-default mx-auto">
        <FadeIn>
          <p className="font-mono text-xs uppercase tracking-widest text-muted text-center mb-3">
            Mission Udaan
          </p>
          <h2
            className="font-display font-light text-ink text-center mb-4"
            style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}
          >
            Officers who cleared
          </h2>
          <p className="font-sans text-charcoal text-center max-w-narrow mx-auto leading-body mb-10">
            Over 50 officers cleared MPSC and UPSC through Mission Udaan.
            These are not statistics — they are people who walked the same road
            and chose to change their environment.
          </p>
        </FadeIn>

        <StaggerChildren className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {PLACEHOLDER_OFFICERS.map((officer) => (
            <StaggerItem key={officer.name}>
              <OfficerCard {...officer} />
            </StaggerItem>
          ))}
        </StaggerChildren>

        <div className="text-center">
          <Link
            to="/impact"
            className="inline-flex items-center gap-2 font-sans text-sm font-medium text-teal
                       hover:text-teal-light transition-colors duration-150
                       focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
          >
            See all 50+ officers →
          </Link>
        </div>
      </div>
    </section>
  );
}
