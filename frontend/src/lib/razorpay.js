/**
 * razorpay.js — Razorpay Standard Checkout helper.
 *
 * The checkout SDK is loaded LAZILY — only when openCheckout() is called.
 * This means the wizard renders fully (Steps 1 + 2) without the SDK present
 * and without VITE_RAZORPAY_KEY_ID set (local UI preview mode).
 *
 * The <script> tag in index.html loads checkout.js with `defer`, which runs
 * after DOMContentLoaded. openCheckout() additionally checks window.Razorpay
 * is present before calling new window.Razorpay(). If absent (e.g., ad-blocker
 * or missing key), it throws a friendly error surfaced as an inline banner.
 *
 * ARCHITECTURE.md §23 + RESEARCH Anti-Patterns (never update payment state from handler)
 * T-05-13: onSuccess callback is UX-only. Payment state is set by the webhook.
 */

/**
 * Open the Razorpay Standard Checkout.
 *
 * @param {{
 *   key: string,
 *   amount: number,        — in paise (INR × 100)
 *   currency?: string,
 *   orderId: string,
 *   registrationId: string,
 *   userName: string,
 *   userEmail: string,
 *   userPhone: string,
 *   onSuccess: (response: { razorpay_payment_id, razorpay_order_id, razorpay_signature }) => void,
 *   onDismiss?: () => void
 * }} opts
 * @throws {Error} if window.Razorpay is not available
 */
export function openCheckout({
  key,
  amount,
  currency = 'INR',
  orderId,
  registrationId,
  userName,
  userEmail,
  userPhone,
  onSuccess,
  onDismiss,
}) {
  if (!key) {
    throw new Error(
      'Razorpay not configured. Set VITE_RAZORPAY_KEY_ID in frontend/.env.local and restart the dev server.'
    );
  }

  if (typeof window === 'undefined' || !window.Razorpay) {
    throw new Error(
      'Razorpay checkout script not loaded. Check your internet connection and try again.'
    );
  }

  const options = {
    key,
    amount,
    currency,
    order_id: orderId,
    name: 'Badlaav',
    description: 'Badlaav Registration',
    theme: { color: '#015243' }, // deep green — LBD brand token
    prefill: {
      name:    userName,
      email:   userEmail,
      contact: userPhone,
    },
    notes: {
      registration_id: registrationId,
    },
    handler: (response) => {
      // T-05-13: This callback is UX-only. NEVER update payment state here.
      // The webhook is the authoritative channel.
      if (typeof onSuccess === 'function') onSuccess(response);
    },
    modal: {
      ondismiss: () => {
        // User closed checkout — leave registration as PENDING.
        // The failed-payment cron will send one reminder at the 15-min mark.
        if (typeof onDismiss === 'function') onDismiss();
      },
    },
  };

  const rzp = new window.Razorpay(options);
  rzp.open();
}
