/**
 * AdminDrawer — mobile slide-out menu using Radix Dialog as a sheet.
 *
 * Same nav content as AdminSidebar — renders AdminSidebar inside a fixed
 * left-anchored Dialog Content. Closes on nav, ESC, and backdrop click.
 */
import * as RadixDialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { AdminSidebar } from './AdminSidebar.jsx';
import { cn } from '../../lib/cn.js';

export function AdminDrawer({ open, onOpenChange }) {
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
            'fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw]',
            'shadow-2xl focus:outline-none'
          )}
        >
          <RadixDialog.Title className="sr-only">Admin navigation</RadixDialog.Title>
          <RadixDialog.Description className="sr-only">
            Use the links below to navigate the admin panel.
          </RadixDialog.Description>

          <AdminSidebar onNavigate={() => onOpenChange(false)} />

          <RadixDialog.Close
            aria-label="Close menu"
            className="absolute top-3 right-3 p-1 rounded text-pearl/70 hover:text-pearl focus:outline focus:outline-2 focus:outline-pearl/40"
          >
            <X size={18} />
          </RadixDialog.Close>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}
