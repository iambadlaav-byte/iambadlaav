/**
 * ValueProp — the quiet opening idea band.
 * The core claim ("You cannot think clearly in a noisy environment.")
 * paired with the "what is Badlaav" paragraphs and a calm geometric motif.
 */
import { FadeIn } from '../animations/FadeIn.jsx';
import { GeometricViz } from '../animations/GeometricViz.jsx';
import { ABOUT_PARAGRAPHS, SITE } from '../../lib/content.js';

export function ValueProp() {
  return (
    <section className="bg-cream py-[var(--section-y)] px-[var(--section-x)] overflow-hidden" id="about">
      <div className="max-w-default mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <FadeIn>
            <p className="font-mono text-xs uppercase tracking-widest text-teal mb-4">What is Badlaav</p>
            <h2
              className="font-display font-light text-ink mb-6"
              style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}
            >
              {SITE.coreIdea}
            </h2>
            <div className="space-y-4 font-sans text-charcoal leading-body">
              {ABOUT_PARAGRAPHS.map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
            </div>
          </FadeIn>

          <div className="flex items-center justify-center lg:justify-end">
            <div className="w-full max-w-[420px] lg:max-w-[500px] aspect-square rounded-full bg-ink flex items-center justify-center relative shadow-2xl overflow-hidden">
              <GeometricViz hovered={false} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
