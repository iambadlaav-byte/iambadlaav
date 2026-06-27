/**
 * ContactPage — /contact. Corporate / team enquiry form plus direct ways to reach us.
 */
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation, useSearchParams } from 'react-router-dom';
import { Mail, MessageCircle, MapPin } from 'lucide-react';
import { getSeoForRoute } from '../../lib/seo.js';
import { ProgramHero } from '../../components/sections/ProgramHero.jsx';
import { HeroGeometry, HERO_FIGURE } from '../../components/animations/HeroGeometry.jsx';
import { CorporateEnquiryForm } from '../../components/forms/CorporateEnquiryForm.jsx';
import { GenericContactForm } from '../../components/forms/GenericContactForm.jsx';
import { FadeIn } from '../../components/animations/FadeIn.jsx';
import { SocialLinks } from '../../components/ui/SocialLinks.jsx';
import { cn } from '../../lib/cn.js';
import { CONTACT_EMAIL, WHATSAPP_NUMBER, CONTACT_ADDRESS } from '../../lib/constants.js';

export default function ContactPage() {
  const { pathname } = useLocation();
  const seo = getSeoForRoute(pathname);
  const waLink = `https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, '')}`;

  // Two audiences, one page: an individual reaching out vs. a company bringing a team.
  // ?type=corporate (e.g. from a pricing CTA) opens straight on the corporate tab.
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState(
    searchParams.get('type') === 'corporate' ? 'corporate' : 'personal',
  );

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
        program="Contact"
        headline="Talk to Arjun Dada"
        headlineClassName="max-w-none md:whitespace-nowrap"
        subHeadline="Reaching out for yourself, or bringing a whole team? Pick what fits and we'll take it from there."
        heroImage="/images/proto_dawn.png"
        heroImageAlt="First light over the Badlaav retreat"
        aside={<HeroGeometry variant={HERO_FIGURE.CONTACT} />}
      />

      {/* Direct contact strip */}
      <section className="bg-cream pt-[var(--section-y)] px-[var(--section-x)]">
        <div className="max-w-default mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6">
          <FadeIn>
            <a href={`mailto:${CONTACT_EMAIL}`} className="flex items-start gap-3 group">
              <Mail size={18} className="text-teal mt-1 shrink-0" />
              <span>
                <span className="block font-mono text-xs uppercase tracking-widest text-muted">Email</span>
                <span className="font-sans text-charcoal group-hover:text-teal transition-colors">{CONTACT_EMAIL}</span>
              </span>
            </a>
          </FadeIn>
          <FadeIn>
            <a href={waLink} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 group">
              <MessageCircle size={18} className="text-teal mt-1 shrink-0" />
              <span>
                <span className="block font-mono text-xs uppercase tracking-widest text-muted">WhatsApp</span>
                <span className="font-sans text-charcoal group-hover:text-teal transition-colors">Message us</span>
              </span>
            </a>
          </FadeIn>
          <FadeIn>
            <div className="flex items-start gap-3">
              <MapPin size={18} className="text-teal mt-1 shrink-0" />
              <span>
                <span className="block font-mono text-xs uppercase tracking-widest text-muted">Where</span>
                <span className="font-sans text-charcoal">{CONTACT_ADDRESS}</span>
              </span>
            </div>
          </FadeIn>
        </div>

        {/* Social — same set as the footer */}
        <FadeIn>
          <div className="max-w-default mx-auto mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <span className="font-mono text-xs uppercase tracking-widest text-muted">Follow along</span>
            <SocialLinks iconSize={22} />
          </div>
        </FadeIn>
      </section>

      {/* Enquiry form — personal message or corporate enquiry */}
      <section className="bg-cream py-[var(--section-y)] px-[var(--section-x)]" id="enquire">
        <div className="max-w-narrow mx-auto">
          {/* Audience toggle */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex rounded-full border border-charcoal/15 bg-soft p-1" role="tablist" aria-label="Who is contacting us">
              {[
                { key: 'personal',  label: 'Personal' },
                { key: 'corporate', label: 'Corporate / team' },
              ].map((t) => (
                <button
                  key={t.key}
                  type="button"
                  role="tab"
                  aria-selected={mode === t.key}
                  onClick={() => setMode(t.key)}
                  className={cn(
                    'rounded-full px-5 py-2 font-sans text-sm font-semibold transition-colors min-h-[40px]',
                    mode === t.key ? 'bg-ochre text-on-ochre shadow-sm' : 'text-charcoal hover:text-ink',
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <FadeIn key={mode}>
            {mode === 'corporate' ? <CorporateEnquiryForm /> : <GenericContactForm />}
          </FadeIn>
        </div>
      </section>
    </>
  );
}
