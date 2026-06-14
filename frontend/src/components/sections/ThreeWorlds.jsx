/**
 * ThreeWorlds — Section 3 of 10 (ARCH §7.1).
 * Three-pillar split: Badlaav · Mission Udaan · Future Readiness.
 * Three ProgramCards in a responsive grid.
 */
import { FadeIn } from '../animations/FadeIn.jsx';
import { StaggerChildren, StaggerItem } from '../animations/StaggerChildren.jsx';
import { ProgramCard } from '../cards/ProgramCard.jsx';

const PROGRAMS = [
  {
    title: 'Badlaav',
    eyebrow: 'Corporate Retreat',
    body: 'A 3-day residential reset for professionals and teams. Not a team-building exercise — a turning point. Ambajogai, Marathwada.',
    href: '/badlaav',
    accent: 'gold',
    image: '/images/program_badlaav.jpg',
  },
  {
    title: 'Mission Udaan',
    eyebrow: 'MPSC / UPSC Preparation',
    body: '50+ officers cleared. A focused residential environment for MPSC, UPSC, PSI, STI, and RTS aspirants who are serious about clearing.',
    href: '/mission-udaan',
    accent: 'teal',
    image: '/images/program_udaan.jpg',
  },
  {
    title: 'Future Readiness',
    eyebrow: 'Youth Workshops',
    body: 'Workshops for students and young professionals on focus, habits, and the kind of clarity that makes a career actually work.',
    href: '/future-readiness',
    accent: 'ochre',
    image: '/images/program_readiness.jpg',
  },
];

export function ThreeWorlds() {
  return (
    <section
      className="bg-soft py-[var(--section-y)] px-[var(--section-x)]"
      aria-label="Our three programs"
    >
      <div className="max-w-default mx-auto">
        <FadeIn>
          <p className="font-mono text-xs uppercase tracking-widest text-muted text-center mb-3">
            Three ways to change your environment
          </p>
          <h2
            className="font-display font-light text-ink text-center mb-12"
            style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}
          >
            Choose your path
          </h2>
        </FadeIn>

        <StaggerChildren className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PROGRAMS.map((program) => (
            <StaggerItem key={program.title}>
              <ProgramCard {...program} />
            </StaggerItem>
          ))}
        </StaggerChildren>
      </div>
    </section>
  );
}
