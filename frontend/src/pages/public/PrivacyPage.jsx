/**
 * PrivacyPage — /privacy
 * Narrow 700px container, body line-height 1.7 (UI-SPEC Typography lock).
 * Real placeholder content per CONSTRAINT-VOICE-001 (no placeholder filler text).
 * References §28.8 anonymization policy.
 */
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { getSeoForRoute } from '../../lib/seo.js';

export default function PrivacyPage() {
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
            Privacy Policy
          </h1>
          <p className="font-mono text-xs text-muted mb-12">
            Dnyanpith Abhyasika Pvt. Ltd. · Last updated May 2026
          </p>

          <div className="space-y-8 font-sans text-charcoal leading-body">
            <div>
              <h2 className="font-display text-xl font-semibold text-ink mb-3">What we collect</h2>
              <p>When you register for a program, enquire about Badlaav or Mission Udaan, or join a community circle, we collect the information you provide: name, email address, phone number, city, and in some forms, occupation and dietary notes.</p>
              <p className="mt-3">We also collect technical data automatically: IP address, browser type, and page visits — for security logging and analytics.</p>
            </div>

            <div>
              <h2 className="font-display text-xl font-semibold text-ink mb-3">How we use it</h2>
              <p>We use your information to process registrations, send confirmations and invoices, communicate about upcoming programs and events, and manage community membership. We do not sell your data. We do not share it with third parties except where required to operate: Razorpay (payment processing), Brevo (email delivery), and Cloudinary (media storage).</p>
            </div>

            <div>
              <h2 className="font-display text-xl font-semibold text-ink mb-3">Cookies and tracking</h2>
              <p>We use cookies to keep you logged in (authentication) and to measure site performance via Sentry error tracking. We do not use advertising trackers or remarketing pixels.</p>
            </div>

            <div>
              <h2 className="font-display text-xl font-semibold text-ink mb-3">Your data</h2>
              <p>You can request a copy of your personal data, ask us to correct it, or ask us to delete it. If you exercise the right to erasure, we anonymize your personal data (name, email, phone, city) while retaining payment and audit records for seven years as required by Indian tax law.</p>
              <p className="mt-3">To make a data request, email us at <a href="mailto:hello@dnyanpith.org" className="text-teal underline">hello@dnyanpith.org</a>.</p>
            </div>

            <div>
              <h2 className="font-display text-xl font-semibold text-ink mb-3">Data retention</h2>
              <p>We keep your registration and payment records for seven years (Indian tax compliance). Community membership records are kept until you request removal. Log files are retained for 90 days.</p>
            </div>

            <div>
              <h2 className="font-display text-xl font-semibold text-ink mb-3">Security</h2>
              <p>All data is transmitted over HTTPS. Passwords are hashed using bcrypt. Authentication tokens are short-lived. We log and monitor for suspicious access patterns.</p>
            </div>

            <div>
              <h2 className="font-display text-xl font-semibold text-ink mb-3">Contact</h2>
              <p>
                Dnyanpith Abhyasika Pvt. Ltd.<br />
                Ambajogai, Dist. Beed, Maharashtra 431517<br />
                <a href="mailto:hello@dnyanpith.org" className="text-teal underline">hello@dnyanpith.org</a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
