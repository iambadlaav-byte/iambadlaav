/**
 * CookiePolicyPage — /cookies
 * Narrow container, Badlaav-branded. Real content (no placeholder filler).
 */
import { Seo } from '../../components/ui/Seo.jsx';

export default function CookiePolicyPage() {
  return (
    <>
      <Seo
        title="Cookie Policy — Badlaav"
        description="How Badlaav uses cookies — essential authentication, analytics, and error monitoring. No advertising trackers."
      />

      <section className="bg-cream py-[var(--section-y)] px-[var(--section-x)]">
        <div className="max-w-narrow mx-auto">
          <p className="font-mono text-xs uppercase tracking-widest text-muted mb-3">Legal</p>
          <h1 className="font-display font-semibold text-ink mb-2" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
            Cookie Policy
          </h1>
          <p className="font-mono text-xs text-muted mb-12">Badlaav · Last updated June 2026</p>

          <div className="space-y-8 font-sans text-charcoal leading-body">
            <div>
              <h2 className="font-display text-xl font-semibold text-ink mb-3">What cookies are</h2>
              <p>Cookies are small text files a website stores on your device. We use them only to make the site work and to understand, in aggregate, how it is used.</p>
            </div>
            <div>
              <h2 className="font-display text-xl font-semibold text-ink mb-3">How we use them</h2>
              <p><strong>Essential:</strong> to keep you signed in (admin) and to keep forms and payment secure. The site cannot work without these.</p>
              <p className="mt-3"><strong>Analytics:</strong> if enabled, Google Analytics helps us see which pages are useful, using anonymised, aggregated data.</p>
              <p className="mt-3"><strong>Error monitoring:</strong> Sentry records technical errors so we can fix them. It does not track you across the web.</p>
            </div>
            <div>
              <h2 className="font-display text-xl font-semibold text-ink mb-3">No advertising</h2>
              <p>We do not use advertising cookies, remarketing pixels, or third-party trackers that follow you around the internet.</p>
            </div>
            <div>
              <h2 className="font-display text-xl font-semibold text-ink mb-3">Managing cookies</h2>
              <p>You can clear or block cookies in your browser settings. Blocking essential cookies may stop sign-in and payment from working.</p>
            </div>
            <div>
              <h2 className="font-display text-xl font-semibold text-ink mb-3">Third parties</h2>
              <p>Payments are handled by Razorpay and analytics (if enabled) by Google — both set their own cookies under their own policies during those interactions.</p>
            </div>
            <div>
              <h2 className="font-display text-xl font-semibold text-ink mb-3">Contact</h2>
              <p><a href="mailto:iambadlaav@gmail.com" className="text-teal underline">iambadlaav@gmail.com</a> · 7409339740</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
