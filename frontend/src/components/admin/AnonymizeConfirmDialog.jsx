/**
 * AnonymizeConfirmDialog — typed-confirmation destructive dialog.
 *
 * Per UI-SPEC §Destructive actions "Admin: anonymize user".
 * Admin must type the literal string 'ANONYMIZE' before the confirm button enables.
 * This matches the Zod `confirm: z.literal('ANONYMIZE')` server validator.
 *
 * Body copy preserves brand voice: calm, factual, no corporate phrases.
 * NO animations (CONSTRAINT-CODE-004).
 *
 * Props:
 *   open            — boolean
 *   onOpenChange    — callback(boolean)
 *   userId          — string target user ID
 *   userName        — string displayed in body copy
 *   onSuccess       — callback() after successful anonymization
 */
import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Button } from '../ui/Button.jsx';
import { ErrorBanner } from '../ui/ErrorBanner.jsx';
import { apiClient } from '../../api/client.js';

const REQUIRED_CONFIRM = 'ANONYMIZE';

export function AnonymizeConfirmDialog({
  open,
  onOpenChange,
  userId,
  userName,
  onSuccess,
}) {
  const [confirmText, setConfirmText] = useState('');
  const [reason, setReason]           = useState('');
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');

  const isConfirmed = confirmText === REQUIRED_CONFIRM && reason.trim().length >= 2;

  function handleClose(val) {
    onOpenChange(val);
    if (!val) {
      setConfirmText('');
      setReason('');
      setError('');
    }
  }

  async function handleAnonymize() {
    if (!isConfirmed) return;
    setLoading(true);
    setError('');
    try {
      await apiClient.post(`/admin/users/${userId}/anonymize`, {
        confirm: REQUIRED_CONFIRM,
        reason:  reason.trim(),
      });
      handleClose(false);
      onSuccess?.();
    } catch (err) {
      setError(
        err.response?.data?.message ?? "Couldn't reach our server. Check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-ink/40 z-50" />
        <Dialog.Content className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-pearl rounded-lg shadow-xl w-full max-w-sm p-6">
            <Dialog.Title className="font-sans font-semibold text-charcoal text-lg mb-3">
              Anonymize this account
            </Dialog.Title>

            <p className="font-sans text-sm text-charcoal mb-4">
              This removes {userName}'s PII (name, email, phone, city) and keeps payment and
              audit records for 7 years per Indian tax law (§28.8). Cannot be undone.
            </p>

            <label className="block font-sans text-xs text-muted uppercase tracking-widest mb-1">
              Reason <span className="text-danger">*</span>
            </label>
            <textarea
              className="w-full border border-ink/20 rounded px-3 py-2 text-sm font-sans text-charcoal mb-4 resize-none focus:outline-gold"
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              maxLength={280}
              placeholder="e.g. Participant requested data erasure"
            />

            <label className="block font-sans text-xs text-muted uppercase tracking-widest mb-1">
              Type <span className="font-mono font-semibold text-charcoal">ANONYMIZE</span> to confirm
            </label>
            <input
              type="text"
              className="w-full border border-ink/20 rounded px-3 py-2 text-sm font-mono text-charcoal mb-4 focus:outline-gold"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              autoComplete="off"
              spellCheck={false}
              placeholder="ANONYMIZE"
            />

            {error && <ErrorBanner message={error} className="mb-4" />}

            <div className="flex items-center justify-end gap-3">
              <Dialog.Close asChild>
                <Button variant="ghost" size="sm" disabled={loading}>
                  Cancel
                </Button>
              </Dialog.Close>
              <Button
                variant="danger"
                size="sm"
                loading={loading}
                disabled={!isConfirmed}
                onClick={handleAnonymize}
              >
                Anonymize account
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
