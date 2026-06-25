/**
 * BigFooterCta — forest-green closing band with the brand line in large type.
 */
import { Link } from 'react-router-dom';
import { BIG_FOOTER } from '../../lib/content.js';
import { FadeIn } from '../animations/FadeIn.jsx';

export function BigFooterCta() {
  return (
    <section className="bg-ink text-pearl py-[var(--section-y)] px-[var(--section-x)]">
      <div className="max-w-default mx-auto">
        <FadeIn>
          <h2 className="font-display mb-8" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)' }}>
            {BIG_FOOTER.headline[0]}
            <br />
            {BIG_FOOTER.headline[1]}
          </h2>
          <nav className="flex flex-wrap gap-x-8 gap-y-2 mb-12 font-sans text-pearl/85">
            {BIG_FOOTER.links.map((l) => (
              <Link key={l.label} to={l.href} className="hover:text-gold transition-colors">
                {l.label}
              </Link>
            ))}
          </nav>
        </FadeIn>
        <div className="border-t border-pearl/15 pt-8">
          <p
            className="font-sans font-[1000] tracking-[-0.02em] text-pearl mb-3"
            style={{ fontSize: 'clamp(2rem, 6vw, 4.5rem)' }}
          >
            {BIG_FOOTER.brandLine}
          </p>
          <p className="font-mono text-xs text-pearl/60">{BIG_FOOTER.credit}</p>
        </div>
      </div>
    </section>
  );
}
