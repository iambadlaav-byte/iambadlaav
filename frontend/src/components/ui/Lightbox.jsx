/**
 * Lightbox — full-screen image overlay with prev/next + close.
 *
 * Accessible, dependency-free (no third-party lightbox). Used by the public
 * GalleryPage. Navigation wraps within the supplied `images` set (the caller
 * passes the CURRENTLY FILTERED list), so it stays in sync with any active
 * category filter.
 *
 * Behaviour:
 * - Keyboard: ArrowLeft / ArrowRight navigate, Escape closes.
 * - Click the backdrop (not the image/controls) closes.
 * - Body scroll is locked while open.
 * - Fade transitions respect prefers-reduced-motion (CONSTRAINT-CODE-004) —
 *   only opacity is animated, never layout.
 *
 * Props:
 *   images   — array of { url, alt, caption? }
 *   index    — index of the currently shown image (controlled by the parent)
 *   onClose  — () => void
 *   onIndex  — (nextIndex) => void   parent updates the active index
 */
import { useEffect, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useReducedMotion } from '../../hooks/useReducedMotion.js';

export function Lightbox({ images, index, onClose, onIndex }) {
  const open = index != null && index >= 0 && images.length > 0;
  const noMotion = useReducedMotion();
  const closeRef = useRef(null);

  const goPrev = useCallback(() => {
    if (!images.length) return;
    onIndex((index - 1 + images.length) % images.length);
  }, [images.length, index, onIndex]);

  const goNext = useCallback(() => {
    if (!images.length) return;
    onIndex((index + 1) % images.length);
  }, [images.length, index, onIndex]);

  // Keyboard navigation + Escape to close.
  useEffect(() => {
    if (!open) return undefined;

    function onKeyDown(e) {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') goPrev();
      else if (e.key === 'ArrowRight') goNext();
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose, goPrev, goNext]);

  // Lock body scroll while the overlay is open.
  useEffect(() => {
    if (!open) return undefined;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = original; };
  }, [open]);

  // Move focus to the close button when the overlay opens (focus trap-lite).
  useEffect(() => {
    if (open) closeRef.current?.focus();
  }, [open]);

  const fade = noMotion
    ? { initial: false, animate: {}, exit: {} }
    : { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } };

  const current = open ? images[index] : null;
  const hasMany = images.length > 1;

  return (
    <AnimatePresence>
      {open && current && (
        <motion.div
          {...fade}
          transition={{ duration: noMotion ? 0 : 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/90 p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label="Image viewer"
          onClick={onClose}
        >
          {/* Close */}
          <button
            ref={closeRef}
            type="button"
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-cream/10 text-pearl hover:bg-cream/20 focus:outline-none focus:ring-2 focus:ring-pearl/60"
            aria-label="Close"
          >
            <X size={22} />
          </button>

          {/* Previous */}
          {hasMany && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
              className="absolute left-2 sm:left-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-cream/10 text-pearl hover:bg-cream/20 focus:outline-none focus:ring-2 focus:ring-pearl/60"
              aria-label="Previous image"
            >
              <ChevronLeft size={26} />
            </button>
          )}

          {/* Image + caption (click inside must not close) */}
          <figure
            className="flex max-h-full max-w-full flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={current.url}
              alt={current.alt || ''}
              className="max-h-[82vh] max-w-full rounded-lg object-contain shadow-2xl"
            />
            {current.caption && (
              <figcaption className="mt-3 max-w-narrow text-center font-sans text-sm text-pearl/80">
                {current.caption}
              </figcaption>
            )}
            {hasMany && (
              <p className="mt-2 font-mono text-xs tracking-widest text-pearl/50">
                {index + 1} / {images.length}
              </p>
            )}
          </figure>

          {/* Next */}
          {hasMany && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); goNext(); }}
              className="absolute right-2 sm:right-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-cream/10 text-pearl hover:bg-cream/20 focus:outline-none focus:ring-2 focus:ring-pearl/60"
              aria-label="Next image"
            >
              <ChevronRight size={26} />
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
