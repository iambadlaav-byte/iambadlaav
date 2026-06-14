/**
 * ContactPage — /contact. Corporate / team enquiry form plus direct ways to reach us.
 */
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { Mail, MessageCircle, MapPin } from 'lucide-react';
import { getSeoForRoute } from '../../lib/seo.js';
import { ProgramHero } from '../../components/sections/ProgramHero.jsx';
import { CorporateEnquiryForm } from '../../components/forms/CorporateEnquiryForm.jsx';
import { FadeIn } from '../../components/animations/FadeIn.jsx';
import { CONTACT_EMAIL, WHATSAPP_NUMBER, CONTACT_ADDRESS } from '../../lib/constants.js';

export default function ContactPage() {
  const { pathname } = useLocation();
  const seo = getSeoForRoute(pathname);
  const waLink = `https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, '')}`;

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
        subHeadline="Bringing a team or a whole company? Tell us a little and we will design the retreat around you."
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
      </section>

      {/* Enquiry form */}
      <section className="bg-cream py-[var(--section-y)] px-[var(--section-x)]" id="enquire">
        <div className="max-w-narrow mx-auto">
          <FadeIn>
            <CorporateEnquiryForm />
          </FadeIn>
        </div>
      </section>
    </>
  );
}
