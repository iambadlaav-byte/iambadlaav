/**
 * StatTile — dashboard stat widget.
 *
 * DM Mono uppercase label + DM Sans 600 number.
 * Clicking navigates to the related admin page.
 * NO animations (CONSTRAINT-CODE-004 — admin tree).
 */
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/cn.js';

/**
 * @param {object}   props
 * @param {string}   props.label     - short uppercase label (e.g. "Registrations")
 * @param {string|number} props.value - stat value (e.g. 142, "₹1,20,000")
 * @param {string}   [props.sublabel] - optional context string
 * @param {string}   [props.to]      - navigate target on click
 * @param {string}   [props.className]
 */
export function StatTile({ label, value, sublabel, to, className }) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (to) navigate(to);
  };

  return (
    <div
      role={to ? 'button' : undefined}
      tabIndex={to ? 0 : undefined}
      onClick={handleClick}
      onKeyDown={to ? (e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(); } : undefined}
      className={cn(
        'bg-pearl border border-ink/10 rounded-lg p-5',
        to ? 'cursor-pointer hover:border-gold/40 focus-visible:outline-2 focus-visible:outline-gold' : '',
        className
      )}
    >
      <p className="font-mono text-xs uppercase tracking-widest text-muted mb-2">
        {label}
      </p>
      <p className="font-sans text-2xl font-semibold text-charcoal leading-none">
        {value ?? '—'}
      </p>
      {sublabel && (
        <p className="font-sans text-xs text-muted mt-1">
          {sublabel}
        </p>
      )}
    </div>
  );
}
