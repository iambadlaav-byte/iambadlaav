/**
 * SearchInput — debounced text search input.
 *
 * Calls onSearch(value) after the user stops typing for `delay` ms (default 300).
 * Keeps a local controlled value so the input never reads as stale.
 */
import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { cn } from '../../lib/cn.js';

export function SearchInput({
  value: initialValue = '',
  onSearch,
  placeholder = 'Search…',
  delay = 300,
  className,
}) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    const handle = setTimeout(() => {
      onSearch?.(value.trim());
    }, delay);
    return () => clearTimeout(handle);
  }, [value, delay, onSearch]);

  return (
    <div className={cn('relative', className)}>
      <Search
        size={14}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
        aria-hidden="true"
      />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'pl-9 pr-3 py-2 rounded border border-muted/40 bg-cream',
          'font-sans text-sm text-charcoal w-full min-h-[40px]',
          'focus:border-teal focus:outline focus:outline-2 focus:outline-teal focus:outline-offset-2'
        )}
      />
    </div>
  );
}
