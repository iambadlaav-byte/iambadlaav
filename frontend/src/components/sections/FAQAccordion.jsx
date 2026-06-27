/**
 * FAQAccordion — collapsible common questions on the left, a calm ambient
 * ripple visual on the right (desktop). Single-open accordion; keyboard
 * accessible via native <button>.
 */
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/cn.js';
import { FadeIn } from '../animations/FadeIn.jsx';
import { QuietRipple } from '../animations/QuietRipple.jsx';
import { useAmbientMotion } from '../animations/AmbientMotionBoundary.jsx';
import { FAQS } from '../../lib/content.js';

export function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState(0);
  const ambientDisabled = useAmbientMotion();

  return (
    <section className="bg-cream py-[var(--section-y)] px-[var(--section-x)]" id="faq">
      <div className="max-w-default mx-auto grid items-center gap-12 lg:grid-cols-2 lg:gap-16">

        {/* Left — the questions */}
        <div>
          <FadeIn>
            <p className="font-mono text-xs uppercase tracking-widest text-muted mb-3">Questions</p>
            <h2
              className="font-display font-semibold text-ink mb-10"
              style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}
            >
              Common questions
            </h2>
          </FadeIn>
          <div className="divide-y divide-muted/20 border-t border-b border-muted/20">
            {FAQS.map((faq, i) => {
              const open = openIndex === i;
              return (
                <div key={faq.q}>
                  <button
                    type="button"
                    onClick={() => setOpenIndex(open ? -1 : i)}
                    aria-expanded={open}
                    className="w-full flex items-center justify-between gap-4 text-left py-5 min-h-[44px]"
                  >
                    <span className="font-display text-lg font-semibold text-ink">{faq.q}</span>
                    <ChevronDown
                      size={18}
                      className={cn('flex-shrink-0 text-teal transition-transform', open && 'rotate-180')}
                      aria-hidden="true"
                    />
                  </button>
                  {open && (
                    <p className="font-sans text-sm text-charcoal leading-body pb-6 -mt-1">{faq.a}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right — calm ambient ripple (desktop only) */}
        <div className="hidden lg:flex items-center justify-center">
          <QuietRipple disabled={ambientDisabled} />
        </div>
      </div>
    </section>
  );
}
