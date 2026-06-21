/**
 * AdminStoriesPage — /admin/stories
 *
 * Retreat Story CMS: list + create/edit modal with a photo uploader.
 * Photos upload one-at-a-time to Cloudinary via /admin/stories/upload, and the
 * returned secure_url is pushed into the story's photos[] before saving.
 * [Archive] replaces "Delete" (CONSTRAINT-SCHEMA-002 — soft-delete only).
 * NO animations (CONSTRAINT-CODE-004).
 */
import { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import * as Dialog from '@radix-ui/react-dialog';
import { AdminTable } from '../../components/admin/AdminTable.jsx';
import { StatusBadge } from '../../components/admin/StatusBadge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { ErrorBanner } from '../../components/ui/ErrorBanner.jsx';
import {
  listStories,
  createStory,
  updateStory,
  archiveStory,
  uploadStoryPhoto,
} from '../../api/admin.js';

const COLUMNS = [
  { key: 'title',     header: 'Title' },
  { key: 'batchName', header: 'Batch', render: (v) => v || '—' },
  { key: 'date',      header: 'Date', render: (v) => (v ? new Date(v).toLocaleDateString('en-IN') : '—') },
  {
    key: 'status',
    header: 'Status',
    render: (v) => <StatusBadge status={v} tone={v === 'PUBLISHED' ? 'positive' : v === 'ARCHIVED' ? 'muted' : 'warn'} />,
  },
  { key: 'createdAt', header: 'Created', render: (v) => new Date(v).toLocaleDateString('en-IN') },
];

const EMPTY_FORM = {
  title: '', subtitle: '', batchName: '', date: '', passage: '', status: 'DRAFT', photos: [],
};

// Format an ISO/Date value into a yyyy-mm-dd string for <input type="date">.
function toDateInput(value) {
  if (!value) return '';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
}

export default function AdminStoriesPage() {
  const [rows, setRows]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing]     = useState(null); // null = create, obj = edit
  const [form, setForm]           = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError]   = useState('');
  const [uploading, setUploading]   = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [archiveTarget, setArchiveTarget] = useState(null);
  const [archiving, setArchiving]   = useState(false);

  const fetchRows = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listStories();
      setRows(data.rows ?? []);
    } catch {
      setError("Couldn't reach our server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRows(); }, [fetchRows]);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setUploadError('');
    setModalOpen(true);
  }

  function openEdit(row) {
    setEditing(row);
    setForm({
      title:     row.title ?? '',
      subtitle:  row.subtitle ?? '',
      batchName: row.batchName ?? '',
      date:      toDateInput(row.date),
      passage:   row.passage ?? '',
      status:    row.status ?? 'DRAFT',
      photos:    Array.isArray(row.photos) ? row.photos : [],
    });
    setFormError('');
    setUploadError('');
    setModalOpen(true);
  }

  async function handlePhotoSelect(e) {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting the same file
    if (!file) return;
    setUploading(true);
    setUploadError('');
    try {
      const url = await uploadStoryPhoto(file);
      setForm((prev) => ({ ...prev, photos: [...prev.photos, url] }));
    } catch (err) {
      setUploadError(err.response?.data?.message ?? err.response?.data?.error ?? "Couldn't upload that image.");
    } finally {
      setUploading(false);
    }
  }

  function removePhoto(url) {
    setForm((prev) => ({ ...prev, photos: prev.photos.filter((p) => p !== url) }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');
    try {
      const payload = {
        title:   form.title,
        passage: form.passage,
        status:  form.status,
        photos:  form.photos,
      };
      if (form.subtitle)  payload.subtitle  = form.subtitle;
      if (form.batchName) payload.batchName = form.batchName;
      if (form.date)      payload.date      = form.date;

      if (editing) {
        await updateStory(editing.id, payload);
      } else {
        await createStory(payload);
      }
      setModalOpen(false);
      fetchRows();
    } catch (err) {
      setFormError(err.response?.data?.message ?? err.response?.data?.errors?.[0]?.message ?? "Couldn't save. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleArchive() {
    if (!archiveTarget) return;
    setArchiving(true);
    try {
      await archiveStory(archiveTarget.id);
      setArchiveTarget(null);
      fetchRows();
    } catch {
      setArchiving(false);
    }
  }

  const columnsWithActions = [
    ...COLUMNS,
    {
      key: '_actions',
      header: '',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); openEdit(row); }}
            className="text-xs font-sans text-teal hover:underline"
          >
            Edit
          </button>
          {row.status !== 'ARCHIVED' && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setArchiveTarget(row); }}
              className="text-xs font-sans text-muted hover:underline"
            >
              Archive
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <Helmet>
        <title>Stories — Badlaav Admin</title>
      </Helmet>

      <div className="p-6 max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-sans text-xl font-semibold text-charcoal">Stories</h1>
          <Button variant="primary" size="sm" onClick={openCreate}>
            + New Story
          </Button>
        </div>

        {error && <ErrorBanner message={error} onRetry={fetchRows} className="mb-4" />}

        <AdminTable
          columns={columnsWithActions}
          rows={rows}
          isLoading={loading}
          emptyState="No stories yet."
        />
      </div>

      {/* Create / Edit modal */}
      <Dialog.Root open={modalOpen} onOpenChange={setModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-ink/40 z-50" />
          <Dialog.Content className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-pearl rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6">
              <Dialog.Title className="font-sans font-semibold text-charcoal text-lg mb-4">
                {editing ? 'Edit story' : 'New story'}
              </Dialog.Title>

              <form onSubmit={handleSubmit} className="space-y-3 text-sm font-sans">
                <div>
                  <label className="block font-mono text-xs text-muted uppercase tracking-widest mb-1">Title</label>
                  <input
                    type="text"
                    className="w-full border border-ink/20 rounded px-3 py-2 text-charcoal"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    maxLength={300}
                    required
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs text-muted uppercase tracking-widest mb-1">Subtitle</label>
                  <input
                    type="text"
                    className="w-full border border-ink/20 rounded px-3 py-2 text-charcoal"
                    value={form.subtitle}
                    onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                    maxLength={300}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-mono text-xs text-muted uppercase tracking-widest mb-1">Batch</label>
                    <input
                      type="text"
                      className="w-full border border-ink/20 rounded px-3 py-2 text-charcoal"
                      value={form.batchName}
                      onChange={(e) => setForm({ ...form, batchName: e.target.value })}
                      maxLength={200}
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-xs text-muted uppercase tracking-widest mb-1">Date</label>
                    <input
                      type="date"
                      className="w-full border border-ink/20 rounded px-3 py-2 text-charcoal"
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-mono text-xs text-muted uppercase tracking-widest mb-1">Passage</label>
                  <textarea
                    className="w-full border border-ink/20 rounded px-3 py-2 text-charcoal resize-y"
                    rows={10}
                    value={form.passage}
                    onChange={(e) => setForm({ ...form, passage: e.target.value })}
                    maxLength={20000}
                    placeholder="Tell the story..."
                    required
                  />
                </div>

                {/* Photo uploader */}
                <div>
                  <label className="block font-mono text-xs text-muted uppercase tracking-widest mb-1">Photos</label>
                  {form.photos.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mb-2">
                      {form.photos.map((url) => (
                        <div key={url} className="relative aspect-[4/3] rounded overflow-hidden bg-ink/10">
                          <img src={url} alt="" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removePhoto(url)}
                            className="absolute top-1 right-1 bg-ink/70 text-pearl rounded-full w-5 h-5 flex items-center justify-center text-xs leading-none"
                            aria-label="Remove photo"
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-sans text-teal hover:underline">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={handlePhotoSelect}
                      disabled={uploading || form.photos.length >= 20}
                    />
                    {uploading ? 'Uploading…' : '+ Add photo'}
                  </label>
                  {uploadError && <p className="text-xs text-danger mt-1">{uploadError}</p>}
                </div>

                <div>
                  <label className="block font-mono text-xs text-muted uppercase tracking-widest mb-1">Status</label>
                  <select
                    className="w-full border border-ink/20 rounded px-3 py-2 text-charcoal bg-pearl"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    {['DRAFT', 'PUBLISHED', 'ARCHIVED'].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {formError && <ErrorBanner message={formError} />}

                <div className="flex items-center justify-end gap-3 pt-2">
                  <Dialog.Close asChild>
                    <Button variant="ghost" size="sm" type="button">Cancel</Button>
                  </Dialog.Close>
                  <Button variant="primary" size="sm" type="submit" loading={submitting}>
                    {editing ? 'Save changes' : 'Create story'}
                  </Button>
                </div>
              </form>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Archive confirm dialog */}
      <Dialog.Root open={!!archiveTarget} onOpenChange={(v) => { if (!v) setArchiveTarget(null); }}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-ink/40 z-50" />
          <Dialog.Content className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-pearl rounded-lg shadow-xl w-full max-w-sm p-6">
              <Dialog.Title className="font-sans font-semibold text-charcoal text-lg mb-3">
                Archive this story?
              </Dialog.Title>
              <p className="font-sans text-sm text-charcoal mb-6">
                It will be hidden from the public site but kept on file.
              </p>
              <div className="flex items-center justify-end gap-3">
                <Dialog.Close asChild>
                  <Button variant="ghost" size="sm">Cancel</Button>
                </Dialog.Close>
                <Button variant="secondary" size="sm" loading={archiving} onClick={handleArchive}>
                  Archive
                </Button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
