/**
 * ProfilePage — /account/profile
 *
 * RHF form bound to profileUpdateSchema.
 * Fields: name, phone, city, state, occupation, age.
 * Email shown read-only with helper "Change email? Contact support."
 *
 * Photo upload:
 *   - <input type="file" accept="image/jpeg,image/png,image/webp"> + drag-drop zone
 *   - Client-side size check (≤ 2MB) before POST
 *   - POST /api/v1/users/me/photo — on success calls auth.refresh() to reload user
 *   - On 415 magic-byte rejection: "Only JPG/PNG/WEBP files accepted. (You uploaded a {type}.)"
 *   - On 413 size limit: "That file is too large. Keep it under 2MB."
 *
 * [Save changes] submits via PATCH /api/v1/users/me.
 * Success toast: "Profile saved."
 * NO inline styles (CONSTRAINT-CODE-001). NO animations (CONSTRAINT-CODE-004).
 */
import { useEffect, useRef, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Helmet } from 'react-helmet-async';
import { z } from 'zod';
import { useAuth } from '../../context/AuthContext.jsx';
import { apiClient } from '../../api/client.js';
import { FormField } from '../../components/ui/FormField.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { ErrorBanner } from '../../components/ui/ErrorBanner.jsx';
import { useToast } from '../../components/ui/Toast.jsx';
import { cn } from '../../lib/cn.js';
import { MAX_PHOTO_MB } from '../../lib/constants.js';

// ── Inline profile schema (mirrors backend profileUpdateSchema) ──
// Defined here for frontend-only usage; backend re-validates via Zod.
const profileUpdateSchema = z.object({
  name:       z.string().trim().min(2, 'Name must be at least two characters.').max(120).optional().or(z.literal('')),
  phone:      z.string().trim().regex(/^[6-9]\d{9}$/, 'Use a valid 10-digit WhatsApp number.').optional().or(z.literal('')),
  city:       z.string().trim().min(2).max(80).optional().or(z.literal('')),
  state:      z.string().trim().min(2).max(80).optional().or(z.literal('')),
  occupation: z.string().trim().max(80).optional().or(z.literal('')),
  age:        z.coerce.number().int().min(13, 'Must be at least 13.').max(99, 'Must be under 100.').optional().or(z.literal('')),
});

const MAX_PHOTO_BYTES = MAX_PHOTO_MB * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// ── Photo upload sub-component ────────────────────────────────
function PhotoUpload({ currentPhotoUrl, onUploadSuccess }) {
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(currentPhotoUrl || null);
  const [pendingFile, setPendingFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [photoError, setPhotoError] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  // Keep preview in sync when parent user data refreshes
  useEffect(() => {
    if (currentPhotoUrl && !pendingFile) setPreview(currentPhotoUrl);
  }, [currentPhotoUrl, pendingFile]);

  function handleFile(file) {
    setPhotoError(null);
    if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
      setPhotoError(`Only JPG/PNG/WEBP files accepted. (You uploaded a ${file.type || 'unknown'} file.)`);
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setPhotoError(`That file is ${(file.size / (1024 * 1024)).toFixed(1)}MB. Keep it under ${MAX_PHOTO_MB}MB.`);
      return;
    }
    setPendingFile(file);
    setPreview(URL.createObjectURL(file));
  }

  function onInputChange(e) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function onDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  async function handleUpload() {
    if (!pendingFile) return;
    setUploading(true);
    setPhotoError(null);
    try {
      const form = new FormData();
      form.append('photo', pendingFile);
      await apiClient.post('/users/me/photo', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setPendingFile(null);
      onUploadSuccess();
    } catch (err) {
      const status = err?.response?.status;
      if (status === 415) {
        const detected = err?.response?.data?.detectedType || 'unknown';
        setPhotoError(`Only JPG/PNG/WEBP files accepted. (You uploaded a ${detected} file.)`);
      } else if (status === 413) {
        setPhotoError(`That file is too large. Keep it under ${MAX_PHOTO_MB}MB.`);
      } else {
        setPhotoError('Photo upload failed. Check your connection and try again.');
      }
    } finally {
      setUploading(false);
    }
  }

  const initial = '?'; // fallback before user data loads

  return (
    <div className="space-y-3">
      <p className="font-mono text-xs uppercase tracking-widest text-muted">Profile photo</p>

      {/* Drop zone */}
      <div
        className={cn(
          'flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-6 text-center cursor-pointer',
          'transition-colors duration-150',
          dragOver ? 'border-teal bg-teal/5' : 'border-muted/30 hover:border-teal/40'
        )}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="Upload profile photo — click or drop a file here"
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
      >
        {/* Preview or initial */}
        {preview ? (
          <img
            src={preview}
            alt="Profile preview"
            className="w-20 h-20 rounded-full object-cover border border-soft"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-navy flex items-center justify-center">
            <span className="font-display text-3xl font-light text-pearl">{initial}</span>
          </div>
        )}
        <p className="text-sm text-muted font-sans">
          {pendingFile ? pendingFile.name : 'Drop a photo here or click to choose'}
        </p>
        <p className="text-xs text-muted font-sans">JPG, PNG, or WEBP · max {MAX_PHOTO_MB}MB</p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={onInputChange}
        tabIndex={-1}
        aria-hidden="true"
      />

      {photoError && (
        <p className="text-danger text-sm font-sans" role="alert">{photoError}</p>
      )}

      {pendingFile && (
        <Button
          variant="secondary"
          size="sm"
          loading={uploading}
          onClick={handleUpload}
          type="button"
        >
          {uploading ? 'Uploading...' : 'Upload photo'}
        </Button>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────
export default function ProfilePage() {
  const { user, refresh } = useAuth();
  const { toast } = useToast();
  const [serverError, setServerError] = useState(null);

  const methods = useForm({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      name:       user?.name       || '',
      phone:      user?.phone      || '',
      city:       user?.city       || '',
      state:      user?.state      || '',
      occupation: user?.occupation || '',
      age:        user?.age        || '',
    },
  });

  const { handleSubmit, formState: { isSubmitting } } = methods;

  // Re-populate when user object refreshes (e.g. after photo upload)
  useEffect(() => {
    if (user) {
      methods.reset({
        name:       user.name       || '',
        phone:      user.phone      || '',
        city:       user.city       || '',
        state:      user.state      || '',
        occupation: user.occupation || '',
        age:        user.age        || '',
      });
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  async function onSubmit(data) {
    setServerError(null);
    // Strip empty strings so backend strictObject doesn't choke
    const payload = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== '' && v !== undefined)
    );
    if (Object.keys(payload).length === 0) {
      toast('No changes to save.', 'default');
      return;
    }
    try {
      await apiClient.patch('/users/me', payload);
      await refresh();
      toast('Profile saved.', 'success');
    } catch (err) {
      const msg = err?.response?.data?.message;
      setServerError(msg || 'Couldn\'t reach our server. Check your connection and try again.');
    }
  }

  return (
    <>
      <Helmet>
        <title>Profile — Dnyanpith</title>
      </Helmet>

      <div className="max-w-lg space-y-8">
        <h1 className="font-display text-3xl font-light text-ink">Profile</h1>

        {/* Photo upload */}
        <PhotoUpload
          currentPhotoUrl={user?.photoUrl}
          onUploadSuccess={refresh}
        />

        {/* Profile form */}
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            {/* Email — read-only */}
            <div className="flex flex-col gap-1">
              <label className="font-mono text-xs uppercase tracking-widest text-muted">
                Email
              </label>
              <input
                type="email"
                value={user?.email || ''}
                readOnly
                disabled
                className="font-sans text-base text-muted bg-soft py-3 px-4 rounded min-h-[44px] w-full border border-muted/20 cursor-not-allowed"
                aria-describedby="email-helper"
              />
              <p id="email-helper" className="text-muted text-xs mt-0.5">
                Change email? Contact support.
              </p>
            </div>

            <FormField name="name"       label="Full name"   required />
            <FormField name="phone"      label="WhatsApp number" type="tel" helper="10-digit Indian mobile number" />
            <FormField name="city"       label="City" />
            <FormField name="state"      label="State" />
            <FormField name="occupation" label="Occupation" />
            <FormField name="age"        label="Age" type="number" />

            {serverError && (
              <ErrorBanner message={serverError} onRetry={() => setServerError(null)} />
            )}

            <Button type="submit" variant="primary" loading={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save changes'}
            </Button>
          </form>
        </FormProvider>
      </div>
    </>
  );
}
