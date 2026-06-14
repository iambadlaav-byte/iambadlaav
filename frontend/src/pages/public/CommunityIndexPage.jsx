/**
 * CommunityIndexPage — /community overview hub.
 * Shows hero + 4 community sub-page links via CommunityCard.
 */
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { getSeoForRoute } from '../../lib/seo.js';
import { FadeIn } from '../../components/animations/FadeIn.jsx';
import { StaggerChildren, StaggerItem } from '../../components/animations/StaggerChildren.jsx';
import { CommunityCard } from '../../components/cards/CommunityCard.jsx';

const COMMUNITIES = [
  { initiative: 'vachan-vari', eyebrow: 'Reading Circle', body: 'A weekly reading circle for people who want to read consistently and actually finish books. Free to join.', image: '/images/comm_civil.jpg' },
  { initiative: 'antrang', eyebrow: 'Inner Work', body: 'A quiet space for reflection and journaling. For people doing the inner work that everything else depends on.', image: '/images/comm_forest.jpg' },
  { initiative: '5am-club', eyebrow: 'Early Morning', body: 'Morning routine and accountability. Start the day before the world wakes up. Ambajogai, every day.', image: '/images/comm_defence.jpg' },
  { initiative: 'get-together', eyebrow: 'Monthly Gathering', body: 'Open monthly gatherings for connection and conversation. No agenda other than being present together.', image: '/images/comm_police.jpg' },
];

export default function CommunityIndexPage() {
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

      {/* Hero */}
      <section className="bg-soft py-[var(--section-y)] px-[var(--section-x)]">
        <div className="max-w-default mx-auto text-center">
          <FadeIn>
            <p className="font-mono text-xs uppercase tracking-widest text-teal mb-4">Free — open to all</p>
            <h1 className="font-display font-light text-ink mb-6" style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)' }}>
              Four community circles
            </h1>
            <p className="font-sans text-charcoal leading-body max-w-narrow mx-auto text-lg">
              Alongside the programs, Dnyanpith runs four free community circles in Ambajogai.
              No registration fee. No obligation. Just people choosing to show up.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Community cards grid */}
      <section className="bg-cream py-[var(--section-y)] px-[var(--section-x)]">
        <div className="max-w-default mx-auto">
          <StaggerChildren className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {COMMUNITIES.map((community) => (
              <StaggerItem key={community.initiative}>
                <CommunityCard {...community} />
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>
    </>
  );
}
