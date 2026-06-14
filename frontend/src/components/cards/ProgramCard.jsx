/**
 * ProgramCard — displays a program summary (Badlaav / Mission Udaan / FR).
 * Props: title, eyebrow, body, image, href, accent ('gold' | 'ochre' | 'teal')
 * Links to the program detail page via React Router Link.
 * Image placeholder: sage-square monogram if no image provided.
 */
import { Link } from 'react-router-dom';
import { cn } from '../../lib/cn.js';

const accentBorder = {
  gold:  'border-t-4 border-gold',
  ochre: 'border-t-4 border-ochre',
  teal:  'border-t-4 border-teal',
};

const accentText = {
  gold:  'text-teal',
  ochre: 'text-teal',
  teal:  'text-teal',
};

export function ProgramCard({ title, eyebrow, body, image, href, accent = 'gold' }) {
  return (
    <Link
      to={href}
      className={cn(
        'group block bg-soft rounded-lg overflow-hidden',
        'hover:shadow-md transition-shadow duration-200',
        accentBorder[accent]
      )}
    >
      {/* Image */}
      <div className="aspect-[16/9] bg-navy/10 overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={`${title} program`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-soft">
            <span className="font-display text-5xl font-light text-muted">
              {title.charAt(0)}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {eyebrow && (
          <p className={cn('font-mono text-xs uppercase tracking-widest mb-2', accentText[accent])}>
            {eyebrow}
          </p>
        )}
        <h3 className="font-display text-xl font-semibold text-ink mb-3 leading-snug group-hover:text-teal transition-colors duration-150">
          {title}
        </h3>
        {body && (
          <p className="font-sans text-sm text-charcoal leading-body line-clamp-3">{body}</p>
        )}
        <span className={cn('inline-block mt-4 font-sans text-sm font-medium', accentText[accent])}>
          Learn more →
        </span>
      </div>
    </Link>
  );
}
