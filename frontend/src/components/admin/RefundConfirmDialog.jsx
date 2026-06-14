/**
 * RefundConfirmDialog — destructive confirmation dialog for Razorpay refund.
 *
 * Per UI-SPEC §Destructive actions "Admin: refund a payment".
 * Brand voice body copy is calm and factual — no corporate phrases.
 * NO animations (CONSTRAINT-CODE-004).
 *
 * Props:
 *   open         — boolean
 *   onOpenChange — callback(boolean)
 *   registrationId — string
 *   amount       — number (rupees)
 *   participantName — string
 *   onSuccess    — callback() called after successful refund
 */
import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Button } from '../ui/Button.jsx';
import { ErrorBanner } from '../ui/ErrorBanner.jsx';
import { apiClient } from '../../api/client.js';

export function RefundConfirmDialog({
  open,
  onOpenChange,
  registrationId,
  amount,
  participantName,
  onSuccess,
}) {
  const [reason, setReason]   = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  async function handleConfirm() {
    setLoading(true);
    setError('');
    try {
      await apiClient.post(`/admin/invoices/${registrationId}/refund`, {
        amount: amount || undefined,
        reason: reason || undefined,
      });
      onOpenChange(false);
      setReason('');
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
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-ink/40 z-50" />
        <Dialog.Content className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-pearl rounded-lg shadow-xl w-full max-w-sm p-6">
            <Dialog.Title className="font-sans font-semibold text-charcoal text-lg mb-3">
              Refund payment
            </Dialog.Title>

            <p className="font-sans text-sm text-charcoal mb-4">
              Refund ₹{amount?.toLocaleString('en-IN')} to {participantName}? This sends the refund
              request to Razorpay and emails the participant.
            </p>

            <label className="block font-sans text-xs text-muted uppercase tracking-widest mb-1">
              Reason (optional)
            </label>
            <textarea
              className="w-full border border-ink/20 rounded px-3 py-2 text-sm font-sans text-charcoal mb-4 resize-none focus:outline-gold"
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              maxLength={280}
              placeholder="e.g. Participant withdrew before batch start"
            />

            {error && <ErrorBanner message={error} className="mb-4" />}

            <div className="flex items-center justify-end gap-3">
              <Dialog.Close asChild>
                <Button variant="ghost" size="sm" disabled={loading}>
                  Keep payment
                </Button>
              </Dialog.Close>
              <Button
                variant="danger"
                size="sm"
                loading={loading}
                onClick={handleConfirm}
              >
                Refund ₹{amount?.toLocaleString('en-IN')}
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
