/**
 * LoginForm — two-tab login form.
 * Tab 1 (default): Email + OTP path
 * Tab 2: Email + Password path
 *
 * Per UI-SPEC §Copywriting Contract /login:
 *   - Primary CTA: "Send OTP" (OTP tab) / "Sign In" (password tab)
 *   - Secondary: "Use password instead" / "Use OTP instead"
 *
 * Tab implementation: native accessible pattern (role="tablist", aria-selected,
 * keyboard nav) — @radix-ui/react-tabs is not installed; equivalent UX achieved.
 *
 * On 423 lockout: renders full-page lockout card per UI-SPEC §Error states.
 * NO animations (CONSTRAINT-CODE-004 — form page).
 * NO inline styles (CONSTRAINT-CODE-001).
 */
import { useState, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { apiClient } from '../../api/client.js';
import OtpInput from './OtpInput.jsx';
import { Button } from '../ui/Button.jsx';
import { Input } from '../ui/Input.jsx';
import { ErrorBanner } from '../ui/ErrorBanner.jsx';
import { cn } from '../../lib/cn.js';

// ── Zod schemas (light — server validates fully; these are UX-only) ──────────
const emailSchema = z.object({
  email: z.string().email('Email format looks off.').max(254),
});

const passwordSchema = z.object({
  email:    z.string().email('Email format looks off.').max(254),
  password: z.string().min(1, 'Password is required.'),
});

// ── Constants ─────────────────────────────────────────────────────────────────
const OTP_RESEND_COOLDOWN_S = 30;

// ── LockoutCard ───────────────────────────────────────────────────────────────
/**
 * Full-page lockout card per UI-SPEC §Error states "Admin lockout (5 failed → 30 min)".
 * Shown for both password and OTP paths (parity — threat T-06-01 / T-06-02).
 */
function LockoutCard({ lockedUntil, onBack }) {
  const lockedDate = lockedUntil ? new Date(lockedUntil) : null;
  const timeStr = lockedDate
    ? lockedDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' }) + ' IST'
    : 'in 30 minutes';

  return (
    <div className="flex flex-col items-center text-center gap-6 py-8">
      <div className="w-12 h-12 rounded-full bg-danger/10 flex items-center justify-center">
        <span className="w-6 h-6 rounded-full bg-danger" aria-hidden="true" />
      </div>
      <div>
        <h2 className="font-display text-2xl font-light text-charcoal mb-2">Account locked for security.</h2>
        <p className="font-sans text-sm text-muted leading-body">
          Five failed attempts triggered a 30-minute lock.{' '}
          Try again at <strong className="text-charcoal">{timeStr}</strong>, or contact Arjun directly.
        </p>
      </div>
      <button
        type="button"
        onClick={onBack}
        className="font-sans text-sm text-teal hover:text-teal-light underline underline-offset-2 transition-colors duration-150 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
      >
        Back to sign in
      </button>
    </div>
  );
}

// ── OTP Tab ───────────────────────────────────────────────────────────────────
function OtpTab() {
  const { login } = useAuth();
  const navigate    = useNavigate();
  const [searchParams] = useSearchParams();

  const [step, setStep]             = useState('email'); // 'email' | 'otp'
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);
  const [otpError, setOtpError]     = useState('');
  const [rootError, setRootError]   = useState('');
  const [isSending, setIsSending]   = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [lockout, setLockout]       = useState(null); // { lockedUntil }

  const otpRef = useRef(null);
  const resendTimerRef = useRef(null);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(emailSchema),
  });

  function startResendTimer() {
    setResendCountdown(OTP_RESEND_COOLDOWN_S);
    clearInterval(resendTimerRef.current);
    resendTimerRef.current = setInterval(() => {
      setResendCountdown((n) => {
        if (n <= 1) { clearInterval(resendTimerRef.current); return 0; }
        return n - 1;
      });
    }, 1000);
  }

  const sendOtp = useCallback(async (email) => {
    setRootError('');
    setIsSending(true);
    try {
      await apiClient.post('/auth/otp/request', { email });
      setSubmittedEmail(email);
      setStep('otp');
      startResendTimer();
    } catch (err) {
      const status = err.response?.status;
      if (status === 429) {
        const retryAfter = err.response?.data?.retryAfter || 15;
        setRootError(`Too many attempts. Try again in ${retryAfter} minutes.`);
      } else {
        setRootError("Couldn't reach our server. Check your connection and try again.");
      }
    } finally {
      setIsSending(false);
    }
  }, []);

  async function onSubmitEmail({ email }) {
    await sendOtp(email);
  }

  async function handleOtpComplete(code) {
    setOtpError('');
    setRootError('');
    setIsVerifying(true);
    try {
      const { data } = await apiClient.post('/auth/otp/verify', { email: submittedEmail, code });
      login(data.accessToken, data.user);
      const next = searchParams.get('next');
      const fallback = data.user?.role === 'ADMIN' ? '/admin/dashboard' : '/account/dashboard';
      navigate(next && next.startsWith('/') ? next : fallback, { replace: true });
    } catch (err) {
      const status = err.response?.status;
      if (status === 423) {
        setLockout({ lockedUntil: err.response?.data?.lockedUntil });
      } else if (status === 401) {
        setOtpError("That code doesn't match. Try again.");
        otpRef.current?.clear();
      } else if (status === 429) {
        const retryAfter = err.response?.data?.retryAfter || 15;
        setRootError(`Too many attempts. Try again in ${retryAfter} minutes.`);
      } else {
        setRootError("Couldn't reach our server. Check your connection and try again.");
      }
    } finally {
      setIsVerifying(false);
    }
  }

  if (lockout) {
    return <LockoutCard lockedUntil={lockout.lockedUntil} onBack={() => setLockout(null)} />;
  }

  return (
    <div>
      {step === 'email' ? (
        <form onSubmit={handleSubmit(onSubmitEmail)} noValidate>
          {rootError && <ErrorBanner message={rootError} className="mb-4" />}
          <div className="mb-5">
            <Input
              label="Email address"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              required
              error={errors.email?.message}
              {...register('email')}
            />
          </div>
          <Button type="submit" variant="primary" loading={isSending} className="w-full">
            {isSending ? 'Sending…' : 'Send OTP'}
          </Button>
        </form>
      ) : (
        <div>
          {rootError && <ErrorBanner message={rootError} className="mb-4" />}
          <p className="font-sans text-sm text-muted mb-4">
            We sent a 6-digit code to <strong className="text-charcoal">{submittedEmail}</strong>. Expires in 10 minutes.
          </p>
          <div className="flex justify-center mb-3">
            <OtpInput
              ref={otpRef}
              onComplete={handleOtpComplete}
              disabled={isVerifying}
            />
          </div>
          {otpError && (
            <p className="font-sans text-sm text-danger text-center mt-2">{otpError}</p>
          )}
          {isVerifying && (
            <p className="font-sans text-xs text-muted text-center mt-2">Verifying…</p>
          )}
          <div className="mt-5 text-center">
            {resendCountdown > 0 ? (
              <span className="font-sans text-sm text-muted">Resend in {resendCountdown}s</span>
            ) : (
              <button
                type="button"
                onClick={() => sendOtp(submittedEmail)}
                disabled={isSending}
                className="font-sans text-sm text-teal hover:text-teal-light underline underline-offset-2 transition-colors duration-150 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal disabled:opacity-50"
              >
                Resend OTP
              </button>
            )}
          </div>
          <div className="mt-3 text-center">
            <button
              type="button"
              onClick={() => { setStep('email'); setOtpError(''); setRootError(''); }}
              className="font-sans text-xs text-muted hover:text-charcoal underline underline-offset-2 transition-colors duration-150 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
            >
              Change email
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Password Tab ──────────────────────────────────────────────────────────────
function PasswordTab() {
  const { login } = useAuth();
  const navigate    = useNavigate();
  const [searchParams] = useSearchParams();

  const [rootError, setRootError] = useState('');
  const [lockout, setLockout]     = useState(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(passwordSchema),
  });

  async function onSubmit({ email, password }) {
    setRootError('');
    try {
      const { data } = await apiClient.post('/auth/login', { email, password });
      login(data.accessToken, data.user);
      const next = searchParams.get('next');
      const fallback = data.user?.role === 'ADMIN' ? '/admin/dashboard' : '/account/dashboard';
      navigate(next && next.startsWith('/') ? next : fallback, { replace: true });
    } catch (err) {
      const status = err.response?.status;
      if (status === 423) {
        setLockout({ lockedUntil: err.response?.data?.lockedUntil });
      } else if (status === 401) {
        setRootError('Email or password is incorrect. Try again.');
      } else if (status === 429) {
        const retryAfter = err.response?.data?.retryAfter || 15;
        setRootError(`Too many attempts. Try again in ${retryAfter} minutes.`);
      } else {
        setRootError("Couldn't reach our server. Check your connection and try again.");
      }
    }
  }

  if (lockout) {
    return <LockoutCard lockedUntil={lockout.lockedUntil} onBack={() => setLockout(null)} />;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {rootError && <ErrorBanner message={rootError} className="mb-4" />}
      <div className="mb-4">
        <Input
          label="Email address"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
          error={errors.email?.message}
          {...register('email')}
        />
      </div>
      <div className="mb-5">
        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          required
          error={errors.password?.message}
          {...register('password')}
        />
      </div>
      <Button type="submit" variant="primary" loading={isSubmitting} className="w-full">
        {isSubmitting ? 'Signing in…' : 'Sign In'}
      </Button>
    </form>
  );
}

// ── LoginForm (tab switcher) ──────────────────────────────────────────────────
const TABS = [
  { id: 'otp',      label: 'Email + OTP' },
  { id: 'password', label: 'Email + Password' },
];

export function LoginForm() {
  const [activeTab, setActiveTab] = useState('otp');
  const tabRefs = useRef({});

  // Keyboard nav for tablist (WCAG 2.1 §2.1 Keyboard)
  function handleTabKeyDown(e, tabId) {
    const ids = TABS.map((t) => t.id);
    const idx = ids.indexOf(tabId);
    if (e.key === 'ArrowRight') {
      const next = ids[(idx + 1) % ids.length];
      setActiveTab(next);
      tabRefs.current[next]?.focus();
    } else if (e.key === 'ArrowLeft') {
      const prev = ids[(idx - 1 + ids.length) % ids.length];
      setActiveTab(prev);
      tabRefs.current[prev]?.focus();
    }
  }

  return (
    <div>
      {/* Tab switcher */}
      <div
        role="tablist"
        aria-label="Sign in method"
        className="flex mb-6 border-b border-muted/20"
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            ref={(el) => { tabRefs.current[tab.id] = el; }}
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            tabIndex={activeTab === tab.id ? 0 : -1}
            onClick={() => setActiveTab(tab.id)}
            onKeyDown={(e) => handleTabKeyDown(e, tab.id)}
            className={cn(
              'px-4 py-2 font-sans text-sm font-medium border-b-2 -mb-px transition-colors duration-150',
              'focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal',
              activeTab === tab.id
                ? 'border-gold text-charcoal'
                : 'border-transparent text-muted hover:text-charcoal'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab panels */}
      {TABS.map((tab) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`panel-${tab.id}`}
          aria-labelledby={`tab-${tab.id}`}
          hidden={activeTab !== tab.id}
        >
          {activeTab === tab.id && (
            tab.id === 'otp' ? <OtpTab /> : <PasswordTab />
          )}
        </div>
      ))}

      {/* Tab switcher hint text (per UI-SPEC §Copywriting Contract /login) */}
      <p className="mt-5 text-center font-sans text-xs text-muted">
        {activeTab === 'otp' ? (
          <>
            Prefer a password?{' '}
            <button
              type="button"
              onClick={() => setActiveTab('password')}
              className="text-teal hover:text-teal-light underline underline-offset-2 transition-colors duration-150 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
            >
              Use password instead
            </button>
          </>
        ) : (
          <>
            Don't have a password?{' '}
            <button
              type="button"
              onClick={() => setActiveTab('otp')}
              className="text-teal hover:text-teal-light underline underline-offset-2 transition-colors duration-150 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
            >
              Use OTP instead
            </button>
          </>
        )}
      </p>
    </div>
  );
}
