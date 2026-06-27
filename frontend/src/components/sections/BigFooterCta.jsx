/**
 * BigFooterCta — forest-green closing band with the brand line in large type.
 */
import { BIG_FOOTER } from '../../lib/content.js';
import { FadeIn } from '../animations/FadeIn.jsx';

export function BigFooterCta() {
  return (
    <section className="bg-ink text-pearl py-[var(--section-y)] px-[var(--section-x)]">
      <div className="max-w-default mx-auto">
        <FadeIn>
          <h2 className="font-display" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)' }}>
            {BIG_FOOTER.headline[0]}
            <br />
            {BIG_FOOTER.headline[1]}
          </h2>
        </FadeIn>
      </div>
    </section>
  );
}
