/**
 * TermsPage — /terms
 * Narrow 700px container, body line-height 1.7 (UI-SPEC Typography lock).
 * Real placeholder content per CONSTRAINT-VOICE-001 (direct, short paragraphs).
 */
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { getSeoForRoute } from '../../lib/seo.js';

export default function TermsPage() {
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
        <meta name="twitter:card" content={seo.twitterCard} />
      </Helmet>

      <section className="bg-cream py-[var(--section-y)] px-[var(--section-x)]">
        <div className="max-w-narrow mx-auto">
          <p className="font-mono text-xs uppercase tracking-widest text-muted mb-3">Legal</p>
          <h1 className="font-display font-light text-ink mb-2" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
            Terms of Service
          </h1>
          <p className="font-mono text-xs text-muted mb-12">
            Dnyanpith Abhyasika Pvt. Ltd. · Last updated May 2026
          </p>

          <div className="space-y-8 font-sans text-charcoal leading-body">
            <div>
              <h2 className="font-display text-xl font-semibold text-ink mb-3">Use of this site</h2>
              <p>By using dnyanpith.org, you agree to these terms. The site is provided for information about Dnyanpith programs, community circles, and events — and to accept registrations and enquiries.</p>
            </div>

            <div>
              <h2 className="font-display text-xl font-semibold text-ink mb-3">Registrations and payment</h2>
              <p>Registrations for Badlaav, Mission Udaan, and Future Readiness are confirmed only after payment is received and verified. Payments are processed by Razorpay on their secure platform. We do not store card details.</p>
            </div>

            <div>
              <h2 className="font-display text-xl font-semibold text-ink mb-3">Refund policy</h2>
              <p>Badlaav retreats: full refund up to 14 days before the batch date; 50% refund between 7–14 days; no refund within 7 days of the batch. Mission Udaan: one month's fee refunded if cancelled before the 5th of the current month.</p>
              <p className="mt-3">In exceptional circumstances (medical, bereavement), we handle refunds case by case. Email us at <a href="mailto:hello@dnyanpith.org" className="text-teal underline">hello@dnyanpith.org</a>.</p>
            </div>

            <div>
              <h2 className="font-display text-xl font-semibold text-ink mb-3">Community circles</h2>
              <p>Community circles (Vachan Vari, Antrang, 5am Club, Get Together) are free and voluntary. Membership can be ended at any time by either party.</p>
            </div>

            <div>
              <h2 className="font-display text-xl font-semibold text-ink mb-3">Content</h2>
              <p>All content on this site — text, images, programs — is owned by Dnyanpith Abhyasika Pvt. Ltd. You may not reproduce it without written permission.</p>
            </div>

            <div>
              <h2 className="font-display text-xl font-semibold text-ink mb-3">Limitation of liability</h2>
              <p>Our liability for any claim arising from use of this site or attendance at a program is limited to the amount you paid for that program.</p>
            </div>

            <div>
              <h2 className="font-display text-xl font-semibold text-ink mb-3">Governing law</h2>
              <p>These terms are governed by the laws of India. Disputes are subject to the exclusive jurisdiction of courts in Beed district, Maharashtra.</p>
            </div>

            <div>
              <h2 className="font-display text-xl font-semibold text-ink mb-3">Questions</h2>
              <p>
                <a href="mailto:hello@dnyanpith.org" className="text-teal underline">hello@dnyanpith.org</a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
