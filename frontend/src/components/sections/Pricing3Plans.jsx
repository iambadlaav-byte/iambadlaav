/**
 * Pricing3Plans — displays up to 3 pricing plan cards.
 * Props: program, plans = [{ name, price, features[], cta, isPopular? }]
 * Coupon input slot is visual-only in Phase 1 — live wiring arrives in Plan 05 (PAY-02).
 * "Community" plans that are free show an ochre "Free" badge.
 */
import { FadeIn } from '../animations/FadeIn.jsx';
import { cn } from '../../lib/cn.js';

function PlanCard({ name, price, features, cta, isPopular, isFree }) {
  return (
    <div
      className={cn(
        'bg-pearl rounded-2xl p-7 flex flex-col border transition-all duration-300 shadow-sm hover:shadow-xl h-full',
        isPopular ? 'border-gold' : 'border-charcoal/10 hover:border-ochre/40',
      )}
    >
      {isPopular && (
        <div className="font-mono text-xs uppercase tracking-widest text-teal mb-3">
          Most popular
        </div>
      )}

      <h3 className="font-display text-xl font-semibold text-ink mb-2">{name}</h3>

      <div className="mb-5">
        {isFree ? (
          <span className="font-mono text-xs uppercase tracking-widest bg-ochre/20 text-ochre px-2 py-1 rounded">
            Free
          </span>
        ) : (
          <p className="font-display text-3xl font-semibold text-ink">
            {typeof price === 'number'
              ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(price)
              : price}
            <span className="font-sans text-sm text-muted ml-1">per person</span>
          </p>
        )}
      </div>

      {features && features.length > 0 && (
        <ul className="space-y-2 mb-6 flex-1">
          {features.map((feature, i) => (
            <li key={i} className="flex items-start gap-2 font-sans text-sm text-charcoal">
              <span className="text-sage mt-0.5 flex-shrink-0">✓</span>
              {feature}
            </li>
          ))}
        </ul>
      )}

      {/* Coupon input slot — visual only Phase 1 */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Coupon code"
          readOnly
          title="Coupon wiring arrives in Plan 05"
          className="w-full border border-muted/30 rounded px-3 py-2 font-sans text-sm bg-cream text-muted
                     cursor-not-allowed"
        />
        <p className="font-mono text-xs text-muted mt-1">Coupon support coming soon</p>
      </div>

      <a
        href={cta?.href || '#'}
        className="inline-flex items-center justify-center gap-2 rounded-full font-sans font-semibold
                   bg-ochre text-on-ochre hover:bg-ochre/90 px-5 py-3 min-h-[44px]
                   shadow-sm hover:shadow-md transition-all duration-150 text-center
                   focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ochre"
      >
        {cta?.label || 'Enquire'}
      </a>
    </div>
  );
}

export function Pricing3Plans({ program, plans = [] }) {
  return (
    <section
      className="bg-cream py-[var(--section-y)] px-[var(--section-x)]"
      aria-label={`${program} pricing plans`}
    >
      <div className="max-w-default mx-auto">
        <FadeIn>
          <p className="font-mono text-xs uppercase tracking-widest text-muted text-center mb-3">
            Pricing
          </p>
          <h2
            className="font-display font-semibold text-ink text-center mb-12"
            style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}
          >
            {program} plans
          </h2>
        </FadeIn>

        <div className={cn(
          'grid gap-6',
          plans.length === 1 ? 'max-w-sm mx-auto' : '',
          plans.length === 2 ? 'grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto' : '',
          plans.length >= 3 ? 'grid-cols-1 md:grid-cols-3' : '',
        )}>
          {plans.map((plan) => (
            <FadeIn key={plan.name} className="h-full">
              <PlanCard {...plan} />
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
