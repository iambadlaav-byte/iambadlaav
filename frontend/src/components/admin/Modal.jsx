/**
 * Modal — Radix Dialog wrapper with brand styling.
 *
 * Accessible: focus is trapped, ESC closes, backdrop click closes, returns focus
 * to the trigger on close. Use ConfirmDialog for destructive confirmations.
 *
 * Usage:
 *   <Modal open={open} onOpenChange={setOpen} title="..." description="...">
 *     ...content
 *   </Modal>
 *
 * NO inline styles (CONSTRAINT-CODE-001).
 * NO animations beyond opacity (CONSTRAINT-CODE-004).
 */
import * as RadixDialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '../../lib/cn.js';

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  size = 'md',
}) {
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay
          className={cn(
            'fixed inset-0 z-50 bg-ink/60',
            'data-[state=open]:opacity-100 data-[state=closed]:opacity-0',
            'transition-opacity duration-150'
          )}
        />
        <RadixDialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2',
            'w-[calc(100%-2rem)]',
            sizes[size] || sizes.md,
            'bg-cream rounded-lg shadow-2xl',
            'max-h-[calc(100vh-2rem)] flex flex-col',
            'focus:outline-none'
          )}
        >
          {/* Header */}
          {(title || description) && (
            <div className="px-6 pt-5 pb-4 border-b border-muted/20">
              {title && (
                <RadixDialog.Title className="font-display text-xl font-light text-charcoal">
                  {title}
                </RadixDialog.Title>
              )}
              {description && (
                <RadixDialog.Description className="mt-1 text-sm text-muted font-sans">
                  {description}
                </RadixDialog.Description>
              )}
            </div>
          )}

          {/* Body */}
          <div className="px-6 py-5 overflow-y-auto flex-1">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="px-6 py-4 border-t border-muted/20 flex items-center justify-end gap-2">
              {footer}
            </div>
          )}

          {/* Close button */}
          <RadixDialog.Close
            aria-label="Close"
            className={cn(
              'absolute top-3 right-3 p-1 rounded text-muted hover:text-charcoal',
              'focus:outline focus:outline-2 focus:outline-teal focus:outline-offset-2',
              'transition-colors duration-150'
            )}
          >
            <X size={18} aria-hidden="true" />
          </RadixDialog.Close>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}
