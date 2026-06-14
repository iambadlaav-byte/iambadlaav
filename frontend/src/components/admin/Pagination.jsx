/**
 * Pagination — cursor-stack pagination for the admin list endpoints.
 *
 * Backend lists return { rows, nextCursor }. We keep a stack of previous cursors
 * so the user can step back. The current "page" is a count derived from stack depth.
 *
 * Usage:
 *   const { cursor, page, next, prev, reset } = usePaginator();
 *   const { rows, nextCursor } = await listX({ cursor, ...filters });
 *   <Pagination page={page} nextCursor={nextCursor} onNext={...} onPrev={...} />
 */
import { useCallback, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/Button.jsx';

export function usePaginator() {
  // Stack of cursors used so far. First entry is `null` (page 1).
  const [stack, setStack] = useState([null]);

  const cursor = stack[stack.length - 1];
  const page = stack.length;

  const next = useCallback((newCursor) => {
    if (newCursor) setStack((s) => [...s, newCursor]);
  }, []);

  const prev = useCallback(() => {
    setStack((s) => (s.length > 1 ? s.slice(0, -1) : s));
  }, []);

  const reset = useCallback(() => setStack([null]), []);

  return { cursor, page, next, prev, reset };
}

export function Pagination({ page, nextCursor, onNext, onPrev, total }) {
  const hasPrev = page > 1;
  const hasNext = !!nextCursor;

  return (
    <div className="flex items-center justify-between gap-3 pt-3">
      <p className="text-xs text-muted font-sans">
        Page {page}
        {typeof total === 'number' ? ` · ${total} item${total === 1 ? '' : 's'}` : ''}
      </p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onPrev}
          disabled={!hasPrev}
        >
          <ChevronLeft size={14} /> Prev
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onNext}
          disabled={!hasNext}
        >
          Next <ChevronRight size={14} />
        </Button>
      </div>
    </div>
  );
}
