/**
 * JoinUsPage — /join-us (ARCH §7.13).
 * Four-tab page: Volunteer · Jobs · College Association · Testimonial.
 * URL hash deep-linking via useSearchParams.
 * College Association (Form 06) — stub for Plan 04.
 * Others are Phase 2 placeholders per ROADMAP.
 */
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { getSeoForRoute } from '../../lib/seo.js';
import { FadeIn } from '../../components/animations/FadeIn.jsx';
import { MissionUdaanCollegeForm } from '../../components/forms/MissionUdaanCollegeForm.jsx';
import { JoinViz } from '../../components/animations/JoinViz.jsx';

const TABS = [
  { id: 'volunteer', label: 'Volunteer' },
  { id: 'job', label: 'Full-time Roles' },
  { id: 'college', label: 'College Association' },
  { id: 'testimonial', label: 'Share Your Story' },
];

function VolunteerTab() {
  return (
    <div className="bg-soft rounded-lg p-8 text-center max-w-lg mx-auto">
      <div className="w-14 h-14 bg-sage/20 rounded-full flex items-center justify-center mx-auto mb-4 text-sage">
        <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
      </div>
      <h3 className="font-display text-xl font-semibold text-ink mb-3">Volunteer Portal</h3>
      <p className="font-sans text-charcoal leading-body text-sm">
        The Volunteer Portal opens once you have attended a retreat.
        Complete one Badlaav batch first — we will email you the day it unlocks.
      </p>
    </div>
  );
}

function JobsTab() {
  return (
    <div className="bg-soft rounded-lg p-8 text-center max-w-lg mx-auto">
      <div className="w-14 h-14 bg-teal/10 rounded-full flex items-center justify-center mx-auto mb-4 text-teal">
        <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
      </div>
      <h3 className="font-display text-xl font-semibold text-ink mb-3">Open Roles</h3>
      <p className="font-sans text-charcoal leading-body text-sm">
        Open roles will appear here. We are a small team and we hire slowly and carefully.
        Check back, or reach out by email if you feel strongly about contributing.
      </p>
    </div>
  );
}

function CollegeTab() {
  return (
    <div className="max-w-lg mx-auto">
      <div className="text-center mb-6">
        <div className="w-14 h-14 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4 text-gold">
          <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>
        </div>
        <p className="font-sans text-charcoal leading-body text-sm">
          Colleges and institutes in Marathwada can associate with Mission Udaan to provide
          their students with access to the residential preparation facility.
        </p>
      </div>
      <MissionUdaanCollegeForm />
    </div>
  );
}

function TestimonialTab() {
  return (
    <div className="bg-soft rounded-lg p-8 text-center max-w-lg mx-auto">
      <div className="w-14 h-14 bg-ochre/10 rounded-full flex items-center justify-center mx-auto mb-4 text-ochre">
        <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
      </div>
      <h3 className="font-display text-xl font-semibold text-ink mb-3">Share Your Story</h3>
      <p className="font-sans text-charcoal leading-body text-sm">
        If Badlaav, Mission Udaan, Future Readiness, or a community circle changed something for you,
        we would like to hear about it. Testimonial submission opens in Phase 2.
      </p>
    </div>
  );
}

const TAB_COMPONENTS = {
  volunteer:   VolunteerTab,
  job:         JobsTab,
  college:     CollegeTab,
  testimonial: TestimonialTab,
};

export default function JoinUsPage() {
  const { pathname } = useLocation();
  const seo = getSeoForRoute(pathname);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'volunteer';

  function handleTab(id) {
    setSearchParams({ tab: id });
  }

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

      {/* Header */}
      <section className="bg-cream py-10 px-[var(--section-x)] border-b border-muted/20 overflow-hidden">
        <div className="max-w-default mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Left side: Text */}
            <FadeIn>
              <p className="font-mono text-xs uppercase tracking-widest text-muted mb-3">Get involved</p>
              <h1 className="font-display font-light text-ink mb-4" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)' }}>
                Join Dnyanpith
              </h1>
              <p className="font-sans text-charcoal/80 leading-body max-w-[480px]">
                Whether you want to volunteer, join our team full-time, partner as an educational institution, or simply share your story — this is where you start.
              </p>
            </FadeIn>
            
            {/* Right side: Animation */}
            <div className="flex items-center justify-center md:justify-end">
              <div className="w-full max-w-[280px] aspect-square rounded-full bg-ink flex items-center justify-center relative shadow-2xl overflow-hidden group">
                <JoinViz hovered={false} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="bg-cream px-[var(--section-x)] border-b border-muted/20">
        <div className="max-w-default mx-auto">
          <div className="flex overflow-x-auto gap-0" role="tablist">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => handleTab(tab.id)}
                className={`font-mono text-xs uppercase tracking-widest px-5 py-4 border-b-2 transition-colors duration-150 whitespace-nowrap
                  ${activeTab === tab.id
                    ? 'border-teal text-teal'
                    : 'border-transparent text-muted hover:text-charcoal'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Tab content */}
      <section className="bg-cream py-[var(--section-y)] px-[var(--section-x)]">
        <div className="max-w-default mx-auto">
          <FadeIn>
            {(() => {
              const TabComponent = TAB_COMPONENTS[activeTab] || TAB_COMPONENTS.volunteer;
              return <TabComponent />;
            })()}
          </FadeIn>
        </div>
      </section>
    </>
  );
}
