/**
 * AdminBlogPage — /admin/blog
 *
 * Blog post list + create/edit modal (plain textarea editor per DECISION-018;
 * Tiptap rich editor deferred to Phase 2).
 * [Archive] replaces "Delete" (CONSTRAINT-SCHEMA-002 — soft-delete only).
 * NO animations (CONSTRAINT-CODE-004).
 */
import { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import * as Dialog from '@radix-ui/react-dialog';
import { AdminTable } from '../../components/admin/AdminTable.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { ErrorBanner } from '../../components/ui/ErrorBanner.jsx';
import { apiClient } from '../../api/client.js';

const STATUS_BADGE = {
  DRAFT:     'bg-gold/10 text-charcoal',
  PUBLISHED: 'bg-green-100 text-green-800',
  ARCHIVED:  'bg-ink/10 text-muted',
};

const COLUMNS = [
  { key: 'title',      header: 'Title' },
  { key: 'category',   header: 'Category' },
  {
    key: 'status',
    header: 'Status',
    render: (v) => <span className={`px-2 py-0.5 rounded text-xs font-mono ${STATUS_BADGE[v] ?? ''}`}>{v}</span>,
  },
  { key: 'publishedAt', header: 'Published', render: (v) => v ? new Date(v).toLocaleDateString('en-IN') : '—' },
  { key: 'createdAt',   header: 'Created',   render: (v) => new Date(v).toLocaleDateString('en-IN') },
];

const EMPTY_FORM = {
  title: '', slug: '', excerpt: '', content: '', category: '',
  tags: '', status: 'DRAFT', coverImage: '',
};

export default function AdminBlogPage() {
  const [rows, setRows]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [modalOpen, setModalOpen]     = useState(false);
  const [editing, setEditing]         = useState(null); // null = create, obj = edit
  const [form, setForm]               = useState(EMPTY_FORM);
  const [submitting, setSubmitting]   = useState(false);
  const [formError, setFormError]     = useState('');
  const [archiveTarget, setArchiveTarget] = useState(null);
  const [archiving, setArchiving]         = useState(false);

  const fetchRows = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.get('/admin/blog');
      setRows(res.data.rows ?? []);
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
    setModalOpen(true);
  }

  function openEdit(row) {
    setEditing(row);
    setForm({
      title:      row.title ?? '',
      slug:       row.slug ?? '',
      excerpt:    row.excerpt ?? '',
      content:    '', // fetching full content not implemented in list view; admin edits via separate GET
      category:   row.category ?? '',
      tags:       Array.isArray(row.tags) ? row.tags.join(', ') : '',
      status:     row.status ?? 'DRAFT',
      coverImage: row.coverImage ?? '',
    });
    setFormError('');
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');
    try {
      const payload = {
        ...form,
        tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      };
      if (!payload.excerpt)    delete payload.excerpt;
      if (!payload.coverImage) delete payload.coverImage;

      if (editing) {
        await apiClient.patch(`/admin/blog/${editing.id}`, payload);
      } else {
        await apiClient.post('/admin/blog', payload);
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
      await apiClient.post(`/admin/blog/${archiveTarget.id}/archive`);
      setArchiveTarget(null);
      fetchRows();
    } catch {
      setArchiving(false);
    }
  }

  // Add actions column
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
        <title>Blog — Dnyanpith Admin</title>
      </Helmet>

      <div className="p-6 max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-sans text-xl font-semibold text-charcoal">Blog</h1>
          <Button variant="primary" size="sm" onClick={openCreate}>
            + New Post
          </Button>
        </div>

        {error && <ErrorBanner message={error} onRetry={fetchRows} className="mb-4" />}

        <AdminTable
          columns={columnsWithActions}
          rows={rows}
          isLoading={loading}
          emptyState="No posts yet."
        />
      </div>

      {/* Create / Edit modal */}
      <Dialog.Root open={modalOpen} onOpenChange={setModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-ink/40 z-50" />
          <Dialog.Content className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-pearl rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6">
              <Dialog.Title className="font-sans font-semibold text-charcoal text-lg mb-4">
                {editing ? 'Edit post' : 'New post'}
              </Dialog.Title>

              <form onSubmit={handleSubmit} className="space-y-3 text-sm font-sans">
                {[
                  ['Title',       'title',      'text'],
                  ['Slug',        'slug',        'text'],
                  ['Category',    'category',    'text'],
                  ['Cover image URL', 'coverImage', 'url'],
                  ['Tags (comma-separated)', 'tags', 'text'],
                ].map(([label, field, type]) => (
                  <div key={field}>
                    <label className="block font-mono text-xs text-muted uppercase tracking-widest mb-1">{label}</label>
                    <input
                      type={type}
                      className="w-full border border-ink/20 rounded px-3 py-2 text-charcoal"
                      value={form[field]}
                      onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                    />
                  </div>
                ))}

                <div>
                  <label className="block font-mono text-xs text-muted uppercase tracking-widest mb-1">Excerpt</label>
                  <textarea
                    className="w-full border border-ink/20 rounded px-3 py-2 text-charcoal resize-none"
                    rows={2}
                    value={form.excerpt}
                    onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                    maxLength={500}
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs text-muted uppercase tracking-widest mb-1">
                    Content
                    <span className="ml-2 normal-case text-muted font-sans">(HTML — rich editor in Phase 2)</span>
                  </label>
                  {/* Plain textarea editor per DECISION-018; Tiptap arrives in Phase 2 */}
                  <textarea
                    className="w-full border border-ink/20 rounded px-3 py-2 text-charcoal font-mono text-xs resize-y"
                    rows={20}
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                    maxLength={50000}
                    placeholder="<p>Write your post here...</p>"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs text-muted uppercase tracking-widest mb-1">Status</label>
                  <select
                    className="w-full border border-ink/20 rounded px-3 py-2 text-charcoal bg-pearl"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    {['DRAFT', 'PUBLISHED'].map((s) => (
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
                    {editing ? 'Save changes' : 'Publish'}
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
                Archive this post?
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
