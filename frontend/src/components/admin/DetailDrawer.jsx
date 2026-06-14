/**
 * DetailDrawer — slide-from-right detail panel using Radix Dialog.
 *
 * 320px wide on desktop; full-width on mobile.
 * Used by every admin list page for row detail + actions.
 * NO animations except Radix's built-in show/hide (not ambient — CONSTRAINT-CODE-004 ok).
 *
 * Props:
 *   open         — boolean
 *   onOpenChange — callback(boolean)
 *   title        — string drawer heading
 *   children     — content rendered inside the drawer
 */
import * as Dialog from '@radix-ui/react-dialog';

export function DetailDrawer({ open, onOpenChange, title, children }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        {/* Backdrop */}
        <Dialog.Overlay className="fixed inset-0 bg-ink/40 z-40" />

        {/* Drawer panel */}
        <Dialog.Content
          className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm bg-pearl shadow-xl flex flex-col overflow-y-auto focus:outline-none"
          aria-label={title}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-ink/10 shrink-0">
            <Dialog.Title className="font-sans font-semibold text-charcoal text-base">
              {title}
            </Dialog.Title>
            <Dialog.Close
              className="text-muted hover:text-charcoal text-xl leading-none focus-visible:outline-gold rounded px-1"
              aria-label="Close"
            >
              ×
            </Dialog.Close>
          </div>

          {/* Body */}
          <div className="flex-1 px-5 py-4">
            {children}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
