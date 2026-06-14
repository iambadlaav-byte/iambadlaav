/**
 * CtaBand — closing call to action. Deep-forest band, gold primary + quiet secondary.
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
    <section className="bg-navy text-pearl py-[var(--section-y)] px-[var(--section-x)]">
      <div className="max-w-narrow mx-auto text-center">
        <FadeIn>
          <p className="font-mono text-xs uppercase tracking-widest text-gold mb-4">{eyebrow}</p>
          <h2 className="font-display font-light text-pearl mb-5" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}>
            {heading}
          </h2>
          <p className="font-sans text-pearl/80 leading-body max-w-[520px] mx-auto mb-9">{body}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {primary && (
              <Link
                to={primary.href}
                className="inline-flex items-center justify-center rounded font-sans font-medium bg-gold text-on-gold hover:bg-gold/90 px-7 py-3 min-h-[44px] transition-colors"
              >
                {primary.label}
              </Link>
            )}
            {secondary && (
              <Link
                to={secondary.href}
                className="inline-flex items-center justify-center rounded font-sans font-medium text-pearl/80 hover:text-teal-light border border-pearl/30 hover:border-teal-light px-7 py-3 min-h-[44px] transition-colors"
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
