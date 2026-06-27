/**
 * PhotoCollage — an asymmetric six-image grid band.
 */
import { COLLAGE } from '../../lib/content.js';
import { cn } from '../../lib/cn.js';
import { FadeIn } from '../animations/FadeIn.jsx';
import { SlideUp } from '../animations/SlideUp.jsx';
import { ScaleOnHover } from '../animations/ScaleOnHover.jsx';

export function PhotoCollage() {
  return (
    <section className="bg-cream px-[var(--section-x)] pb-[var(--section-y)]">
      <div className="max-w-wide mx-auto">
        <FadeIn>
          <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[180px] md:auto-rows-[220px] gap-3">
            {COLLAGE.images.map((img, index) => (
              <SlideUp 
                key={img.src} 
                className={cn('w-full h-full overflow-hidden rounded-2xl', img.span)}
                delay={0.1 * index}
                yOffset={30}
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
        </FadeIn>
      </div>
    </section>
  );
}
