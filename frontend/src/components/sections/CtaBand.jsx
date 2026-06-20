/**
 * CtaBand — closing call to action. Warm blush band, terracotta pill + quiet secondary
 * (mirrors LBD's light closing CTA).
 */
import { Link } from 'react-router-dom';
import { FadeIn } from '../animations/FadeIn.jsx';

export function CtaBand({
  eyebrow = 'The next step',
  heading = 'Three days could change the direction.',
  body = 'A seat at Badlaav is the distance between where you are and where you have been meaning to go.',
  primary = { label: 'Register', href: '/register?program=badlaav' },
  secondary = { label: 'Talk to Arjun Dada', href: '/contact' },
}) {
  return (
    <section className="bg-soft text-charcoal py-[var(--section-y)] px-[var(--section-x)]">
      <div className="max-w-narrow mx-auto text-center">
        <FadeIn>
          <p className="font-mono text-xs uppercase tracking-widest text-ochre mb-4">{eyebrow}</p>
          <h2 className="font-display font-semibold text-ink mb-5" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}>
            {heading}
          </h2>
          <p className="font-sans text-charcoal/80 leading-body max-w-[520px] mx-auto mb-9">{body}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {primary && (
              <Link
                to={primary.href}
                className="inline-flex items-center justify-center rounded-full font-sans font-semibold bg-ochre text-on-ochre hover:bg-ochre/90 px-7 py-3.5 min-h-[44px] shadow-sm hover:shadow-md transition-all"
              >
                {primary.label}
              </Link>
            )}
            {secondary && (
              <Link
                to={secondary.href}
                className="inline-flex items-center justify-center rounded-full font-sans font-semibold text-charcoal hover:text-ochre border border-charcoal/20 hover:border-ochre px-7 py-3.5 min-h-[44px] transition-colors"
              >
                {secondary.label}
              </Link>
            )}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
