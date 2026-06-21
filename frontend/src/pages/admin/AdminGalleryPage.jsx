/**
 * AdminGalleryPage — /admin/gallery
 *
 * Gallery CMS: upload images to Cloudinary (one at a time via /admin/gallery/upload),
 * then save each as a GalleryItem with mandatory alt text. Inline edit + delete per
 * card. NO animations (CONSTRAINT-CODE-004); no alert() — inline feedback only.
 */
import { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { ErrorBanner } from '../../components/ui/ErrorBanner.jsx';
import {
  listGalleryItems,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
  uploadGalleryImage,
} from '../../api/admin.js';
import {
  CONTENT_CATEGORY_OPTIONS,
  DEFAULT_CONTENT_CATEGORY,
  contentCategoryLabel,
} from '../../lib/contentCategory.js';

const EMPTY_NEW = { url: '', altText: '', caption: '', category: DEFAULT_CONTENT_CATEGORY, sortOrder: 0 };

export default function AdminGalleryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');

  const [draft, setDraft] = useState(EMPTY_NEW);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const rows = await listGalleryItems(filter ? { category: filter } : {});
      setItems(rows);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not load gallery items.');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const url = await uploadGalleryImage(file);
      setDraft((d) => ({ ...d, url }));
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed. Use a JPG, PNG, or WEBP under 2MB.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!draft.url) { setError('Upload an image first.'); return; }
    if (!draft.altText.trim()) { setError('Alt text is required.'); return; }
    setSaving(true);
    setError('');
    try {
      await createGalleryItem({
        url:       draft.url,
        altText:   draft.altText.trim(),
        caption:   draft.caption.trim() || undefined,
        category:  draft.category,
        sortOrder: Number(draft.sortOrder) || 0,
      });
      setDraft(EMPTY_NEW);
      await load();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not save the gallery item.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Helmet><title>Gallery — Badlaav Admin</title></Helmet>

      <AdminPageHeader
        title="Gallery"
        subtitle="Upload and arrange the photos shown on the public gallery page."
      />

      {error && <ErrorBanner message={error} className="mb-4" />}

      {/* Add image */}
      <form onSubmit={handleCreate} className="bg-cream rounded-lg border border-muted/20 shadow-sm p-5 mb-8">
        <h2 className="font-display text-lg text-charcoal mb-4">Add an image</h2>
        <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] gap-5">
          <div>
            <div className="aspect-[4/3] rounded-lg overflow-hidden bg-ink/10 mb-2 flex items-center justify-center">
              {uploading ? <Spinner size={18} />
                : draft.url ? <img src={draft.url} alt="Preview" className="w-full h-full object-cover" />
                : <span className="text-xs text-muted px-2 text-center">No image yet</span>}
            </div>
            <label className="block">
              <span className="sr-only">Choose image</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleUpload}
                disabled={uploading}
                className="block w-full text-xs text-muted file:mr-2 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:bg-ochre file:text-cream file:cursor-pointer"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Alt text (required)" className="sm:col-span-2">
              <input
                type="text"
                value={draft.altText}
                onChange={(e) => setDraft({ ...draft, altText: e.target.value })}
                placeholder="Describe the photo for screen readers"
                className={inputCls}
                maxLength={300}
              />
            </Field>
            <Field label="Caption (optional)" className="sm:col-span-2">
              <input
                type="text"
                value={draft.caption}
                onChange={(e) => setDraft({ ...draft, caption: e.target.value })}
                className={inputCls}
                maxLength={300}
              />
            </Field>
            <Field label="Category">
              <select value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} className={inputCls}>
                {CONTENT_CATEGORY_OPTIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </Field>
            <Field label="Sort order">
              <input
                type="number"
                min={0}
                value={draft.sortOrder}
                onChange={(e) => setDraft({ ...draft, sortOrder: e.target.value })}
                className={inputCls}
              />
            </Field>
            <div className="sm:col-span-2">
              <Button type="submit" disabled={saving || uploading || !draft.url}>
                {saving ? 'Saving…' : 'Add to gallery'}
              </Button>
            </div>
          </div>
        </div>
      </form>

      {/* Filter */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs uppercase tracking-widest text-muted">Filter</span>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className={inputCls + ' max-w-[240px]'}>
          <option value="">All categories</option>
          {CONTENT_CATEGORY_OPTIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-16"><Spinner size={20} /></div>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted py-8">No gallery items yet. Upload one above.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <GalleryCard key={item.id} item={item} onChanged={load} onError={setError} />
          ))}
        </div>
      )}
    </>
  );
}

function GalleryCard({ item, onChanged, onError }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    altText: item.altText, caption: item.caption ?? '', category: item.category, sortOrder: item.sortOrder,
  });
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function save() {
    if (!form.altText.trim()) { onError('Alt text is required.'); return; }
    setBusy(true);
    try {
      await updateGalleryItem(item.id, {
        altText:   form.altText.trim(),
        caption:   form.caption.trim() || undefined,
        category:  form.category,
        sortOrder: Number(form.sortOrder) || 0,
      });
      setEditing(false);
      await onChanged();
    } catch (err) {
      onError(err.response?.data?.error || 'Could not update the item.');
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setBusy(true);
    try {
      await deleteGalleryItem(item.id);
      await onChanged();
    } catch (err) {
      onError(err.response?.data?.error || 'Could not delete the item.');
      setBusy(false);
    }
  }

  return (
    <div className="bg-cream rounded-lg border border-muted/20 shadow-sm overflow-hidden">
      <div className="aspect-[4/3] bg-ink/10">
        <img src={item.url} alt={item.altText} loading="lazy" className="w-full h-full object-cover" />
      </div>
      <div className="p-3 space-y-2">
        {editing ? (
          <div className="space-y-2">
            <input value={form.altText} onChange={(e) => setForm({ ...form, altText: e.target.value })} placeholder="Alt text" className={inputCls} maxLength={300} />
            <input value={form.caption} onChange={(e) => setForm({ ...form, caption: e.target.value })} placeholder="Caption" className={inputCls} maxLength={300} />
            <div className="flex gap-2">
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputCls}>
                {CONTENT_CATEGORY_OPTIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
              <input type="number" min={0} value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} className={inputCls + ' w-20'} />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Save'}</Button>
              <Button size="sm" variant="ghost" onClick={() => setEditing(false)} disabled={busy}>Cancel</Button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm text-charcoal line-clamp-2">{item.caption || <span className="text-muted">No caption</span>}</p>
            <p className="text-[11px] text-muted">{item.altText}</p>
            <div className="flex items-center justify-between text-[11px] text-muted">
              <span className="uppercase tracking-wide">{contentCategoryLabel(item.category)}</span>
              <span>#{item.sortOrder}</span>
            </div>
            <div className="flex gap-2 pt-1">
              <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>Edit</Button>
              {confirmDelete ? (
                <>
                  <Button size="sm" variant="danger" onClick={remove} disabled={busy}>{busy ? '…' : 'Confirm'}</Button>
                  <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(false)} disabled={busy}>No</Button>
                </>
              ) : (
                <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(true)}>Delete</Button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const inputCls = 'w-full rounded-md border border-muted/30 bg-white px-3 py-2 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-ochre/40';

function Field({ label, className = '', children }) {
  return (
    <label className={`block ${className}`}>
      <span className="block text-[10px] uppercase tracking-widest text-muted mb-1">{label}</span>
      {children}
    </label>
  );
}
