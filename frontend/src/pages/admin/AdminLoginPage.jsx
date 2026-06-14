/**
 * AdminLoginPage — /admin/login
 *
 * Password-only login for admin. No OTP tab (DECISION-018 + UI-SPEC §Authenticated /admin/login).
 * On success, checks user.role === 'ADMIN' before allowing entry. Non-admin gets inline error.
 * On 423 lockout: full-page lockout card per UI-SPEC §Error states.
 * NO animations (CONSTRAINT-CODE-004).
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../../context/AuthContext.jsx';
import { apiClient } from '../../api/client.js';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { FormField } from '../../components/ui/FormField.jsx';
import { ErrorBanner } from '../../components/ui/ErrorBanner.jsx';

const schema = z.object({
  email:    z.string().email('Check the email format.').max(254),
  password: z.string().min(1, 'Password is required.'),
});

export default function AdminLoginPage() {
  const { login, logout } = useAuth();
  const navigate          = useNavigate();
  const [serverError, setServerError] = useState('');
  const [lockout, setLockout]         = useState(null); // { until: Date }

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data) {
    setServerError('');
    setLockout(null);
    try {
      const res = await apiClient.post('/auth/login-password', data);
      const { accessToken, user } = res.data;

      // Validate role before granting admin access
      if (user.role !== 'ADMIN') {
        // Sign out the non-admin session immediately
        try { await apiClient.post('/auth/logout'); } catch { /* ignore */ }
        setServerError("You're not an admin.");
        return;
      }

      login(accessToken, user);
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      if (err.response?.status === 423) {
        const until = err.response.data?.lockedUntil
          ? new Date(err.response.data.lockedUntil)
          : null;
        setLockout({ until });
        return;
      }
      setServerError(
        err.response?.data?.message ?? "Couldn't reach our server. Check your connection and try again."
      );
    }
  }

  // Lockout state — full-page card per UI-SPEC §Error states
  if (lockout) {
    return (
      <>
        <Helmet>
          <title>Account locked — Dnyanpith Admin</title>
          <meta name="robots" content="noindex" />
        </Helmet>
        <main className="flex items-center justify-center min-h-screen bg-cream px-4">
          <div className="w-full max-w-sm bg-pearl border border-ink/10 rounded-lg p-8 text-center">
            <p className="font-sans font-semibold text-charcoal text-lg mb-2">
              Account locked for security.
            </p>
            <p className="font-sans text-sm text-muted">
              {lockout.until
                ? `Try again after ${lockout.until.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}.`
                : 'Try again in 30 minutes.'}
            </p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Admin sign in — Dnyanpith</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <main className="flex items-center justify-center min-h-screen bg-cream px-4">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <p className="font-mono text-xs uppercase tracking-widest text-muted mb-2">
              Dnyanpith Admin
            </p>
            <h1 className="font-display text-2xl font-light text-charcoal">
              Sign in
            </h1>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="bg-pearl border border-ink/10 rounded-lg p-6 space-y-4"
            noValidate
          >
            {serverError && (
              <ErrorBanner message={serverError} />
            )}

            <FormField label="Email" error={errors.email?.message}>
              <Input
                type="email"
                autoComplete="email"
                {...register('email')}
              />
            </FormField>

            <FormField label="Password" error={errors.password?.message}>
              <Input
                type="password"
                autoComplete="current-password"
                {...register('password')}
              />
            </FormField>

            <Button
              type="submit"
              variant="secondary"
              size="md"
              loading={isSubmitting}
              className="w-full"
            >
              Sign in
            </Button>
          </form>
        </div>
      </main>
    </>
  );
}
