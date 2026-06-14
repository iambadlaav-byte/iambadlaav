/**
 * Button — primary UI primitive.
 * Per UI-SPEC: gold primary, navy secondary, teal ghost, danger, community (ochre).
 * Loading state disables button + shows Spinner.
 * Min 44×44px touch target on mobile (WCAG 2.5.5).
 * NO inline styles (CONSTRAINT-CODE-001). Use cn() for class composition.
 */
import { cn } from '../../lib/cn.js';
import { Spinner } from './Spinner.jsx';

const variantClasses = {
  primary:   'bg-gold text-on-gold hover:bg-gold/90 focus-visible:outline-gold',
  secondary: 'bg-navy text-pearl hover:bg-navy/90 focus-visible:outline-navy',
  ghost:     'text-teal hover:text-teal-light underline-offset-4 hover:underline focus-visible:outline-teal',
  danger:    'bg-danger text-pearl hover:bg-danger/90 focus-visible:outline-danger',
  // Used only on /community/* pages — ochre warmth vs gold CTA (UI-SPEC §Color §Accent reserved-for #5)
  community: 'bg-ochre text-on-ochre hover:bg-ochre/90 focus-visible:outline-ochre',
};

const sizeClasses = {
  sm: 'px-3 py-2 text-sm min-h-[36px]',
  md: 'px-5 py-3 text-base min-h-[44px]',   // 44px min height for touch target
  lg: 'px-7 py-4 text-lg min-h-[52px]',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  type = 'button',
  children,
  onClick,
  className,
  ...rest
}) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={cn(
        // Base
        'inline-flex items-center justify-center gap-2 rounded font-sans font-medium',
        'transition-colors duration-150',
        // Focus ring (WCAG keyboard nav — never remove)
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
        // Variant
        variantClasses[variant],
        // Size
        sizeClasses[size],
        // Disabled state
        isDisabled && 'opacity-50 cursor-not-allowed pointer-events-none',
        className
      )}
      {...rest}
    >
      {loading && <Spinner size={18} />}
      {children}
    </button>
  );
}
