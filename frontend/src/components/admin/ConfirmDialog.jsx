/**
 * ConfirmDialog — opinionated wrapper around Modal for destructive actions.
 *
 * Default Confirm variant uses the danger token. Caller passes onConfirm
 * (async) — the dialog disables both buttons while the promise resolves.
 */
import { useState } from 'react';
import { Modal } from './Modal.jsx';
import { Button } from '../ui/Button.jsx';

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel  = 'Cancel',
  variant      = 'danger',
  onConfirm,
}) {
  const [busy, setBusy] = useState(false);

  async function handleConfirm() {
    setBusy(true);
    try {
      await onConfirm?.();
      onOpenChange?.(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      onOpenChange={(v) => { if (!busy) onOpenChange?.(v); }}
      title={title}
      size="sm"
      footer={
        <>
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange?.(false)}
            disabled={busy}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={variant === 'danger' ? 'danger' : 'primary'}
            onClick={handleConfirm}
            loading={busy}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-sm text-charcoal font-sans leading-relaxed">{message}</p>
    </Modal>
  );
}
