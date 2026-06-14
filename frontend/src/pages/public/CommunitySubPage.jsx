/**
 * CommunitySubPage — /community/:slug
 * Single component rendering all 4 community initiative pages.
 * Reads useParams().slug and looks up content from INITIATIVE_CONFIG.
 * If slug is not one of the 4 known values → renders NotFoundPage.
 *
 * AmbientMotionBoundary: FallingLeaves + BreathingPulse on /community/antrang only.
 */
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { getSeoForRoute } from '../../lib/seo.js';
import { FallingLeaves } from '../../components/animations/FallingLeaves.jsx';
import { BreathingPulse } from '../../components/animations/BreathingPulse.jsx';
import { FadeIn } from '../../components/animations/FadeIn.jsx';
import { StaggerChildren, StaggerItem } from '../../components/animations/StaggerChildren.jsx';
import NotFoundPage from './NotFoundPage.jsx';
import { WHATSAPP_NUMBER } from '../../lib/constants.js';
import { CommunityJoinForm } from '../../components/forms/CommunityJoinForm.jsx';

/**
 * INITIATIVE_CONFIG — single source of truth for all 4 community pages.
 * CTA copy, hero body, what-it-is, when/how, photos (placeholder).
 * whatsAppCta links to the group via whatsapp.com/send.
 */
const INITIATIVE_CONFIG = {
  'vachan-vari': {
    title: 'Vachan Vari',
    eyebrow: 'Reading Circle',
    heroBody: 'A weekly reading circle for people who want to read more — and actually finish books. Ambajogai, every week. Free to join.',
    whatItIs: [
      'Vachan Vari (literally "reading lane") is a group that reads together and talks about what they read. Each week, a short passage or chapter. Then conversation.',
      'The structure is minimal by design. No presentations, no one testing you. Just a group of people choosing to read and think together, once a week.',
      'Over time, the reading habit becomes real because the environment supports it — the same people, the same time, the same quiet room.',
    ],
    whenHow: 'Every Saturday, 8am–9:30am. Dnyanpith facility, Ambajogai. Online joining available on request.',
    whatsAppCtaCopy: 'Join Vachan Vari on WhatsApp',
    showAmbient: false,
    accentColor: 'ochre',
    photos: ['/images/comm_civil.jpg', '/images/gallery_1.jpg', '/images/gallery_2.jpg'],
  },
  'antrang': {
    title: 'Antrang',
    eyebrow: 'Inner Work',
    heroBody: 'A quiet space for reflection, journaling, and the inner work that makes everything else possible. Ambajogai.',
    whatItIs: [
      'Antrang means "inner space." It is a guided journaling and reflection circle for people doing the quieter kind of work — the kind that does not show up on a CV but determines everything.',
      'Each session begins with a short reading or prompt, followed by silent journaling, followed by optional sharing. There is no pressure to speak.',
      'The intention is simple: a regular practice of looking inward, in the company of people doing the same thing.',
    ],
    whenHow: 'Every Sunday, 7am–8:30am. Dnyanpith facility, Ambajogai.',
    whatsAppCtaCopy: 'Join Antrang on WhatsApp',
    showAmbient: true, // falling leaves + breathing pulse on Antrang hero
    accentColor: 'teal',
    photos: ['/images/comm_forest.jpg', '/images/gallery_3.jpg', '/images/gallery_4.jpg'],
  },
  '5am-club': {
    title: '5am Club',
    eyebrow: 'Early Morning',
    heroBody: 'Start before the world wakes up. Morning routine, accountability, and a calm beginning to every day.',
    whatItIs: [
      '5am Club is exactly what it sounds like. A group that meets at 5am, Monday to Saturday, to start the day together.',
      'The first hour is structured: ten minutes of movement, twenty minutes of reading or journaling, thirty minutes of focused work. Consistent routine, every morning.',
      'The accountability is the group. When you know others are waking up at 5am with you, the alarm is easier to hear.',
    ],
    whenHow: 'Monday to Saturday, 5am–6am. Dnyanpith courtyard, Ambajogai.',
    whatsAppCtaCopy: 'Join 5am Club on WhatsApp',
    showAmbient: false,
    accentColor: 'gold',
    photos: ['/images/comm_defence.jpg', '/images/hero_home.jpg', '/images/gallery_2.jpg'],
  },
  'get-together': {
    title: 'Get Together',
    eyebrow: 'Monthly Gathering',
    heroBody: 'Monthly gatherings for connection, conversation, and belonging. Open to all. Free. Ambajogai.',
    whatItIs: [
      'Get Together is a monthly open gathering at the Dnyanpith space. No agenda. No speakers. No networking goals.',
      'People come who have heard about Dnyanpith, alumni who have attended programs, community members from other circles, and anyone who wants to be in a room with interesting people for an evening.',
      'Food, chai, conversation. The simplest form of community.',
    ],
    whenHow: 'Last Saturday of every month, 6pm–9pm. Dnyanpith facility, Ambajogai.',
    whatsAppCtaCopy: 'Join the Get Together group',
    showAmbient: false,
    accentColor: 'ochre',
    photos: ['/images/comm_police.jpg', '/images/gallery_1.jpg', '/images/gallery_4.jpg'],
  },
};

const ACCENT_CLASSES = {
  gold:  { border: 'border-t-4 border-gold',  text: 'text-teal', badge: 'text-teal' },
  ochre: { border: 'border-t-4 border-ochre', text: 'text-teal', badge: 'text-teal' },
  teal:  { border: 'border-t-4 border-teal',  text: 'text-teal', badge: 'text-teal' },
};

export default function CommunitySubPage() {
  const { slug } = useParams();
  const config = INITIATIVE_CONFIG[slug];

  if (!config) {
    return <NotFoundPage />;
  }

  const seo = getSeoForRoute(`/community/${slug}`);
  const accent = ACCENT_CLASSES[config.accentColor] || ACCENT_CLASSES.ochre;
  const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, '')}?text=Hi%2C%20I%20want%20to%20join%20${encodeURIComponent(config.title)}`;

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
      <section className="relative min-h-[50vh] flex items-center bg-ink overflow-hidden">
        {/* Ambient — only on /community/antrang per UI-SPEC §Animation Contract */}
        {config.showAmbient && (
          <>
            <BreathingPulse disabled={false} />
            <FallingLeaves disabled={false} />
          </>
        )}
        <div className="relative z-10 max-w-default mx-auto px-[var(--section-x)] py-[var(--section-y)]">
          <p className={`font-mono text-xs uppercase tracking-widest mb-4 ${accent.badge}`}>
            {config.eyebrow}
          </p>
          <h1 className="font-display font-light text-pearl mb-5" style={{ fontSize: 'clamp(2.8rem, 7vw, 5rem)' }}>
            {config.title}
          </h1>
          <p className="font-sans text-pearl/80 leading-body max-w-[560px] text-lg mb-10">
            {config.heroBody}
          </p>
          <a
            href="#join"
            className="inline-flex items-center justify-center gap-2 rounded font-sans font-medium
                       bg-ochre text-on-ochre hover:bg-ochre/90 px-6 py-3 min-h-[44px]
                       transition-colors duration-150
                       focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ochre"
          >
            Join the Circle
          </a>
        </div>
      </section>

      {/* What it is */}
      <section className="bg-cream py-[var(--section-y)] px-[var(--section-x)]">
        <div className="max-w-narrow mx-auto">
          <FadeIn>
            <p className={`font-mono text-xs uppercase tracking-widest mb-4 ${accent.text}`}>What it is</p>
            <h2 className="font-display font-light text-ink mb-6" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}>
              About {config.title}
            </h2>
            <div className="space-y-4 font-sans text-charcoal leading-body">
              {config.whatItIs.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* When / How */}
      <section className="bg-soft py-[var(--section-y)] px-[var(--section-x)]">
        <div className="max-w-narrow mx-auto">
          <FadeIn>
            <p className="font-mono text-xs uppercase tracking-widest text-muted mb-4">When and how</p>
            <p className="font-sans text-charcoal leading-body text-lg">{config.whenHow}</p>
          </FadeIn>
        </div>
      </section>

      {/* Photos placeholder */}
      <section className="bg-cream py-[var(--section-y)] px-[var(--section-x)]">
        <div className="max-w-default mx-auto">
          <FadeIn>
            <StaggerChildren className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {(config.photos || []).map((photoUrl, i) => (
                <StaggerItem key={i}>
                  <div className="aspect-[4/3] bg-soft rounded-lg overflow-hidden">
                    <img
                      src={photoUrl}
                      alt={`${config.title} community activity ${i + 1}`}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                </StaggerItem>
              ))}
            </StaggerChildren>
          </FadeIn>
        </div>
      </section>

      {/* Join form — FORM-04 (CommunityJoinForm — single component, 4 variants) */}
      <section className="bg-soft py-[var(--section-y)] px-[var(--section-x)]" id="join">
        <div className="max-w-narrow mx-auto">
          <FadeIn>
            <CommunityJoinForm />
            <div className="mt-6 text-center">
              <Link
                to="/contact"
                className="font-sans text-sm text-muted hover:text-teal transition-colors duration-150"
              >
                Or reach us by email →
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
