/**
 * CommunityCard — displays a community initiative summary.
 * Props: initiative (slug), eyebrow, body, image, accent ('ochre')
 * Ochre accent per UI-SPEC §Color reserved-for warmth rule.
 */
import { Link } from 'react-router-dom';
import { cn } from '../../lib/cn.js';

const INITIATIVE_LABELS = {
  'vachan-vari': 'Vachan Vari',
  'antrang': 'Antrang',
  '5am-club': '5am Club',
  'get-together': 'Get Together',
};

export function CommunityCard({ initiative, eyebrow, body, image, className }) {
  const label = INITIATIVE_LABELS[initiative] || initiative;

  return (
    <Link
      to={`/community/${initiative}`}
      className={cn(
        'group block bg-soft rounded-lg overflow-hidden border-t-4 border-ochre',
        'hover:shadow-md transition-shadow duration-200',
        className
      )}
    >
      {/* Image */}
      <div className="aspect-[16/9] bg-ochre/10 overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={`${label} community circle`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-ochre/10">
            <span className="font-display text-5xl font-light text-teal/50">
              {label.charAt(0)}
            </span>
          </div>
        )}
      </div>

      <div className="p-5">
        {eyebrow && (
          <p className="font-mono text-xs uppercase tracking-widest text-teal mb-1">
            {eyebrow}
          </p>
        )}
        <h3 className="font-display text-xl font-semibold text-ink mb-2 leading-snug group-hover:text-teal transition-colors duration-150">
          {label}
        </h3>
        {body && (
          <p className="font-sans text-sm text-charcoal leading-body line-clamp-3">{body}</p>
        )}
        <span className="inline-block mt-3 font-sans text-sm font-medium text-teal">
          Join the Circle →
        </span>
      </div>
    </Link>
  );
}
