/**
 * ResumePaymentPage — /pay/:registrationId
 *
 * The "pay from waitlist invite" flow. A waitlisted invitee follows the link in
 * their invite email, signs in with the email they registered with (OTP — which
 * proves ownership), and pays for their EXISTING registration without re-filling
 * the form. The webhook promotes them to a confirmed candidate on capture.
 *
 * Auth is required because POST /payments/create-order enforces ownership. OTP is
 * the lightest proof: the code lands in the same inbox the invite did.
 * NO animations. No alert() — inline feedback only.
 */
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { apiClient } from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { openCheckout } from '../../lib/razorpay.js';
import { Button } from '../../components/ui/Button.jsx';
import { ErrorBanner } from '../../components/ui/ErrorBanner.jsx';

const inputCls =
  'w-full rounded-md border border-muted/30 bg-white px-3 py-2.5 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-ochre/40';

export default function ResumePaymentPage() {
  const { registrationId } = useParams();
  const navigate = useNavigate();
  const { user, login } = useAuth();

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  async function requestCode(e) {
    e.preventDefault();
    setBusy(true); setError(''); setInfo('');
    try {
      await apiClient.post('/auth/otp/request', { email: email.trim() });
      setOtpSent(true);
      setInfo('We sent a 6-digit code to your email. Enter it below.');
    } catch {
      setError('Could not send the code. Check the email and try again.');
    } finally {
      setBusy(false);
    }
  }

  async function verifyCode(e) {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      const { data } = await apiClient.post('/auth/otp/verify', { email: email.trim(), code: code.trim() });
      login(data.accessToken, data.user);
      setInfo('');
    } catch (err) {
      setError(err.response?.data?.error === 'INVALID_OTP'
        ? 'That code is incorrect or expired. Request a new one.'
        : 'Could not verify the code. Try again.');
    } finally {
      setBusy(false);
    }
  }

  async function payNow() {
    setBusy(true); setError('');
    try {
      const { data } = await apiClient.post('/payments/create-order', { registrationId });
      openCheckout({
        key:            data.key,
        amount:         Math.round(Number(data.amount) * 100), // paise
        orderId:        data.razorpayOrderId,
        registrationId,
        userName:       user?.name || '',
        userEmail:      user?.email || '',
        userPhone:      '',
        onSuccess: async (resp) => {
          // UX-only verify; the webhook is the authoritative channel.
          try {
            await apiClient.post('/payments/verify', { ...resp, registrationId });
          } catch { /* non-critical */ }
          navigate('/payment-success');
        },
        onDismiss: () => setBusy(false),
      });
    } catch (err) {
      const code = err.response?.data?.error;
      if (err.response?.status === 409) {
        navigate('/payment-success');
        return;
      }
      setError(
        err.response?.status === 403
          ? 'This payment link belongs to a different account. Sign in with the email you registered with.'
          : code === 'Registration not found.'
            ? 'We could not find this registration.'
            : 'Could not start the payment. Please try again.'
      );
      setBusy(false);
    }
  }

  return (
    <section className="bg-cream min-h-[70vh] py-[var(--section-y)] px-[var(--section-x)]">
      <Helmet><title>Complete your payment — Badlaav</title></Helmet>

      <div className="max-w-narrow mx-auto">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-navy mb-3">Complete your registration</h1>
        <p className="text-charcoal/80 mb-8">
          A seat has opened up for you. Sign in with the email you registered with, then pay to lock it in.
        </p>

        {error && <ErrorBanner message={error} className="mb-4" />}
        {info && (
          <div role="status" className="mb-4 rounded border border-teal/40 bg-teal/5 p-3 text-sm text-charcoal">
            {info}
          </div>
        )}

        <div className="bg-white rounded-lg border border-muted/20 shadow-sm p-6">
          {user ? (
            <>
              <p className="text-sm text-muted mb-1">Signed in as</p>
              <p className="text-charcoal font-medium mb-6">{user.name} · {user.email}</p>
              <Button onClick={payNow} loading={busy} disabled={busy} className="w-full sm:w-auto">
                Continue to payment
              </Button>
            </>
          ) : !otpSent ? (
            <form onSubmit={requestCode} className="space-y-4">
              <label className="block">
                <span className="block text-[11px] uppercase tracking-widest text-muted mb-1">Your registered email</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className={inputCls}
                />
              </label>
              <Button type="submit" loading={busy} disabled={busy || !email.trim()}>Send sign-in code</Button>
            </form>
          ) : (
            <form onSubmit={verifyCode} className="space-y-4">
              <label className="block">
                <span className="block text-[11px] uppercase tracking-widest text-muted mb-1">6-digit code</span>
                <input
                  inputMode="numeric"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="123456"
                  className={inputCls + ' tracking-[0.3em] text-center text-lg'}
                />
              </label>
              <div className="flex items-center gap-3">
                <Button type="submit" loading={busy} disabled={busy || code.length !== 6}>Verify & continue</Button>
                <button type="button" onClick={requestCode} disabled={busy} className="text-sm text-teal hover:underline">
                  Resend code
                </button>
              </div>
            </form>
          )}
        </div>

        <p className="text-xs text-muted mt-6">
          Trouble paying? Email <a className="text-teal hover:underline" href="mailto:iambadlaav@gmail.com">iambadlaav@gmail.com</a> or message 7409339740.
        </p>
      </div>
    </section>
  );
}
