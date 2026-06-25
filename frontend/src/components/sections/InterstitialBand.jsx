/**
 * InterstitialBand — a quiet peach band with a single provocation + CTA.
 */
import { Link } from 'react-router-dom';
import { INTERSTITIAL } from '../../lib/content.js';
import { FadeIn } from '../animations/FadeIn.jsx';

export function InterstitialBand() {
  return (
    <section className="bg-soft py-[var(--section-y)] px-[var(--section-x)] text-center">
      <FadeIn>
        <h2
          className="font-display text-ochre max-w-narrow mx-auto mb-8"
          style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)' }}
        >
          {INTERSTITIAL.line1}
          <br />
          {INTERSTITIAL.line2}
        </h2>
        <Link
          to={INTERSTITIAL.ctaHref}
          className="inline-block font-sans font-semibold bg-ochre text-on-ochre rounded-full px-7 py-3 hover:opacity-90 transition-opacity"
        >
          {INTERSTITIAL.ctaLabel}
        </Link>
      </FadeIn>
    </section>
  );
}
