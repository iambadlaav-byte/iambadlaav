/**
 * PhotoCollage — an asymmetric six-image grid band.
 */
import { COLLAGE } from '../../lib/content.js';
import { cn } from '../../lib/cn.js';
import { FadeIn } from '../animations/FadeIn.jsx';

export function PhotoCollage() {
  return (
    <section className="bg-cream px-[var(--section-x)] pb-[var(--section-y)]">
      <div className="max-w-wide mx-auto">
        <FadeIn>
          <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[180px] md:auto-rows-[220px] gap-3">
            {COLLAGE.images.map((img) => (
              <img
                key={img.src}
                src={img.src}
                alt={img.alt}
                className={cn('w-full h-full object-cover rounded-2xl', img.span)}
              />
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
