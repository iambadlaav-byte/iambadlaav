/**
 * CommunityPreview — Section 7 of 10 (ARCH §7.1).
 * Four community cards (ochre accent, per UI-SPEC §Color reserved-for warmth).
 * CTA "Join the Circle" links to the respective sub-page.
 */
import { FadeIn } from '../animations/FadeIn.jsx';
import { StaggerChildren, StaggerItem } from '../animations/StaggerChildren.jsx';
import { CommunityCard } from '../cards/CommunityCard.jsx';

const COMMUNITIES = [
  {
    initiative: 'vachan-vari',
    eyebrow: 'Reading Circle',
    body: 'A weekly reading circle for people who want to read more and actually finish books. Ambajogai, every week.',
    image: '/images/comm_civil.jpg',
  },
  {
    initiative: 'antrang',
    eyebrow: 'Inner Work',
    body: 'A quiet space for reflection and journaling. For people doing the inner work that makes everything else possible.',
    image: '/images/comm_forest.jpg',
  },
  {
    initiative: '5am-club',
    eyebrow: 'Early Morning',
    body: 'Start before the world wakes up. Morning routine, accountability, and a calm beginning to every day.',
    image: '/images/comm_defence.jpg',
  },
  {
    initiative: 'get-together',
    eyebrow: 'Monthly Gathering',
    body: 'Open monthly gatherings for connection and conversation. No agenda other than being present.',
    image: '/images/comm_police.jpg',
  },
];

export function CommunityPreview() {
  return (
    <section
      className="bg-soft py-[var(--section-y)] px-[var(--section-x)]"
      aria-label="Community circles"
    >
      <div className="max-w-default mx-auto">
        <FadeIn>
          <p className="font-mono text-xs uppercase tracking-widest text-teal text-center mb-3">
            Free — open to all
          </p>
          <h2
            className="font-display font-light text-ink text-center mb-4"
            style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}
          >
            Four community circles
          </h2>
          <p className="font-sans text-charcoal text-center max-w-narrow mx-auto leading-body mb-12">
            Alongside the programs, Dnyanpith runs four free community circles in Ambajogai.
            No registration fee. No commitment. Just people choosing to show up.
          </p>
        </FadeIn>

        <StaggerChildren className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {COMMUNITIES.map((community) => (
            <StaggerItem key={community.initiative}>
              <CommunityCard {...community} />
            </StaggerItem>
          ))}
        </StaggerChildren>
      </div>
    </section>
  );
}
