/**
 * VideoBanner — a full-bleed poster with a play affordance. Static (no
 * autoplay, no particle effects). The play button is a placeholder until a
 * real video URL is wired.
 */
import { VIDEO } from '../../lib/content.js';
import { FadeIn } from '../animations/FadeIn.jsx';

export function VideoBanner() {
  return (
    <section className="relative h-[60vh] min-h-[380px] overflow-hidden flex items-center justify-center">
      <img src={VIDEO.image} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-ink/55" />
      <FadeIn className="relative z-10 text-center text-pearl px-[var(--section-x)]">
        <h2 className="font-display mb-2" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}>
          {VIDEO.heading}
        </h2>
        <p className="font-sans text-pearl/85 mb-6">{VIDEO.sub}</p>
        <button
          type="button"
          className="inline-flex items-center gap-2 font-sans font-semibold bg-gold text-on-gold rounded-full px-6 py-3 hover:opacity-90 transition-opacity"
        >
          <span aria-hidden="true">▶</span> {VIDEO.cta}
        </button>
      </FadeIn>
    </section>
  );
}
