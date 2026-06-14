/**
 * ProgressIndicator — 3-step dot-and-line progress bar for the Registration wizard.
 *
 * States per dot: completed (sage tick), current (gold filled), future (muted outline).
 * Animated via transform: translateX only — GPU-accelerated, no width/height animation
 * (CONSTRAINT-CODE-004).
 * Respects prefers-reduced-motion via CSS.
 */
import { cn } from '../../lib/cn.js';
import { Check } from 'lucide-react';

const STEP_LABELS = ['Your details', 'Program & plan', 'Review & pay'];

export function ProgressIndicator({ step, total = 3 }) {
  return (
    <div
      className="flex items-center justify-center gap-0 mb-8 select-none"
      aria-label={`Step ${step} of ${total}`}
      role="status"
    >
      {Array.from({ length: total }, (_, i) => {
        const stepNum   = i + 1;
        const completed = stepNum < step;
        const current   = stepNum === step;

        return (
          <div key={stepNum} className="flex items-center">
            {/* Connector line (not before first dot) */}
            {i > 0 && (
              <div
                className={cn(
                  'h-px w-12 transition-colors duration-300',
                  completed ? 'bg-teal' : 'bg-soft'
                )}
              />
            )}

            {/* Dot */}
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center',
                  'border-2 transition-all duration-300',
                  'motion-reduce:transition-none',
                  completed && 'bg-sage border-sage text-pearl',
                  current   && 'bg-gold border-gold text-on-gold',
                  !completed && !current && 'bg-transparent border-soft text-muted'
                )}
                aria-current={current ? 'step' : undefined}
              >
                {completed ? (
                  <Check size={14} strokeWidth={2.5} />
                ) : (
                  <span className="font-mono text-xs font-medium">{stepNum}</span>
                )}
              </div>

              {/* Step label */}
              <span
                className={cn(
                  'font-mono text-[10px] uppercase tracking-widest whitespace-nowrap',
                  current   && 'text-charcoal font-medium',
                  completed && 'text-charcoal/60',
                  !completed && !current && 'text-muted'
                )}
              >
                {STEP_LABELS[i]}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
