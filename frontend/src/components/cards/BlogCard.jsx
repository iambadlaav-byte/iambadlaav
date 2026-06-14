/**
 * BlogCard — displays a blog post summary.
 * Props: title, slug, excerpt, coverImage, category, publishedAt, readingTime
 * Date + readingTime in DM Mono caption style.
 */
import { Link } from 'react-router-dom';
import { cn } from '../../lib/cn.js';
/**
 * formatBlogDate — local formatter avoiding dayjs dependency on frontend.
 * Uses native Intl.DateTimeFormat (IST, Asia/Kolkata).
 */
function formatBlogDate(dateStr) {
  if (!dateStr) return '';
  try {
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'Asia/Kolkata',
    }).format(new Date(dateStr));
  } catch {
    return '';
  }
}

export function BlogCard({ title, slug, excerpt, coverImage, category, publishedAt, readingTime, className }) {
  return (
    <Link
      to={`/blog/${slug}`}
      className={cn(
        'group flex flex-col h-full bg-soft rounded-lg overflow-hidden',
        'hover:shadow-md transition-shadow duration-200',
        className
      )}
    >
      {/* Cover image */}
      <div className="aspect-[16/9] bg-navy/10 overflow-hidden">
        {coverImage ? (
          <img
            src={coverImage}
            alt={`Cover for ${title}`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-navy/5 flex items-center justify-center">
            <span className="font-display text-4xl font-light text-muted opacity-40">D</span>
          </div>
        )}
      </div>

      <div className="p-5 flex-1 flex flex-col">
        {/* Eyebrow metadata */}
        <div className="flex items-center gap-3 mb-2">
          {category && (
            <span className="font-mono text-xs uppercase tracking-widest text-teal">
              {category}
            </span>
          )}
          {publishedAt && (
            <span className="font-mono text-xs text-muted">
              {formatBlogDate(publishedAt)}
            </span>
          )}
          {readingTime && (
            <span className="font-mono text-xs text-muted">
              {readingTime} min read
            </span>
          )}
        </div>

        <h3 className="font-display text-lg font-semibold text-ink mb-2 leading-snug group-hover:text-teal transition-colors duration-150">
          {title}
        </h3>

        {excerpt && (
          <p className="font-sans text-sm text-charcoal leading-body line-clamp-2">{excerpt}</p>
        )}

        <span className="inline-block mt-auto pt-3 font-sans text-sm font-medium text-teal">
          Read →
        </span>
      </div>
    </Link>
  );
}
