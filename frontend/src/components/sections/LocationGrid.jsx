/**
 * LocationGrid — "The Place": copy + a venue image grid (one large, three small).
 */
import { LOCATION } from '../../lib/content.js';
import { cn } from '../../lib/cn.js';
import { SlideUp } from '../animations/SlideUp.jsx';
import { ScaleOnHover } from '../animations/ScaleOnHover.jsx';

export function LocationGrid() {
  return (
    <section className="bg-soft py-[var(--section-y)] px-[var(--section-x)]">
      <div className="max-w-default mx-auto">
        <SlideUp>
          <div className="max-w-narrow mb-10">
            <h2 className="font-display text-ink mb-3" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}>
              {LOCATION.eyebrow}
            </h2>
            <span className="inline-block font-mono text-xs uppercase tracking-widest bg-cream text-ochre px-3 py-1 rounded-full mb-4">
              {LOCATION.badge}
            </span>
            <p className="font-sans text-charcoal leading-body">{LOCATION.copy}</p>
          </div>
        </SlideUp>

        <div className="grid grid-cols-2 md:grid-cols-3 auto-rows-[200px] gap-3">
          {LOCATION.images.map((img, index) => (
            <SlideUp 
              key={img.src}
              delay={0.1 * index}
              className={cn('w-full h-full overflow-hidden rounded-2xl', img.large && 'col-span-2 row-span-2')}
            >
              <ScaleOnHover className="w-full h-full">
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-full h-full object-cover rounded-2xl"
                />
              </ScaleOnHover>
            </SlideUp>
          ))}
        </div>
      </div>
    </section>
  );
}
