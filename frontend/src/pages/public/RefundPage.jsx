/**
 * RefundPage — /refund. Refund & cancellation policy (required for Razorpay).
 */
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { getSeoForRoute } from '../../lib/seo.js';
import { CONTACT_EMAIL } from '../../lib/constants.js';
import { SITE } from '../../lib/content.js';

export default function RefundPage() {
  const { pathname } = useLocation();
  const seo = getSeoForRoute(pathname);

  return (
    <>
      <Helmet>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        <meta property="og:title" content={seo.title} />
        <meta property="og:description" content={seo.description} />
      </Helmet>

      <section className="bg-cream py-[var(--section-y)] px-[var(--section-x)]">
        <div className="max-w-narrow mx-auto">
          <p className="font-mono text-xs uppercase tracking-widest text-teal mb-3">Policy</p>
          <h1 className="font-display font-light text-ink mb-8" style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)' }}>
            Refund &amp; cancellation
          </h1>

          <div className="space-y-5 font-sans text-charcoal leading-body">
            <p>
              Badlaav retreats are operated by {SITE.legalEntity}. Because batches are small and seats are
              limited, our refund terms are clear and applied consistently.
            </p>

            <h2 className="font-display text-xl font-semibold text-ink pt-2">Cancellation by you</h2>
            <ul className="space-y-2 list-disc pl-5">
              <li>More than 14 days before the retreat start date: full refund.</li>
              <li>Between 7 and 14 days before: 50% refund.</li>
              <li>
                Within 7 days of the start date: no refund — but your seat can be transferred to the
                next available batch at no extra cost.
              </li>
            </ul>

            <h2 className="font-display text-xl font-semibold text-ink pt-2">Transfers</h2>
            <p>
              You may transfer your seat to the next available batch once, subject to availability,
              by writing to us at least 48 hours before your scheduled batch.
            </p>

            <h2 className="font-display text-xl font-semibold text-ink pt-2">Cancellation by us</h2>
            <p>
              If we cancel or reschedule a batch for any reason, you receive a full refund or the
              option to move to another batch — your choice.
            </p>

            <h2 className="font-display text-xl font-semibold text-ink pt-2">How refunds are processed</h2>
            <p>
              Approved refunds are returned to the original payment method via our payment partner,
              typically within 5–7 business days. To request a refund or transfer, email{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-teal hover:text-teal-light">
                {CONTACT_EMAIL}
              </a>{' '}
              with your registration details.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
