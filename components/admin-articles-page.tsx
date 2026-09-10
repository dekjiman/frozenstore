"use client";

import { Edit3, Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { ApiError, apiFetch } from "@/lib/client-api";
import { AdminImageUpload } from "@/components/admin-image-upload";

type Article = {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage: string | null;
  authorName: string;
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
};

type ArticleFormData = {
  title: string;
  content: string;
  excerpt: string;
  coverImage: string;
  authorName: string;
  isPublished: boolean;
};

const emptyForm: ArticleFormData = { title: "", content: "", excerpt: "", coverImage: "", authorName: "Admin", isPublished: true };

export function AdminArticlesPage() {
  const [items, setItems] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null | undefined>(undefined);
  const [form, setForm] = useState<ArticleFormData>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    apiFetch<{ data: Article[] }>("/api/admin/articles", { cache: "no-store" })
      .then((payload) => { setItems(payload.data); setError(null); })
      .catch((caught) => setError(caught instanceof Error ? caught.message : "Gagal memuat artikel"))
      .finally(() => setLoading(false));
  }, []);

  function openNew() {
    setEditingId(null);
    setForm(emptyForm);
    setFormError(null);
    setFieldErrors({});
    setNotice(null);
  }

  function openEdit(item: Article) {
    setEditingId(item.id);
    setForm({
      title: item.title,
      content: item.content,
      excerpt: item.excerpt,
      coverImage: item.coverImage ?? "",
      authorName: item.authorName,
      isPublished: item.isPublished,
    });
    setFormError(null);
    setFieldErrors({});
    setNotice(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = form.title.trim();
    if (!title) { setFormError("Judul wajib diisi."); return; }
    if (!form.content.trim()) { setFormError("Konten wajib diisi."); return; }
    try {
      const body = {
        title,
        content: form.content.trim(),
        excerpt: form.excerpt.trim(),
        coverImage: form.coverImage.trim() || null,
        authorName: form.authorName.trim(),
        isPublished: form.isPublished,
      };
      
      if (editingId) {
        await apiFetch(`/api/admin/articles/${editingId}`, { method: "PATCH", body: JSON.stringify(body) });
        setItems((prev) => prev.map((i) => i.id === editingId ? { ...i, ...body } : i));
        setNotice(`Artikel "${title}" berhasil diperbarui.`);
      } else {
        const payload = await apiFetch<{ id: string }>("/api/admin/articles", { method: "POST", body: JSON.stringify(body) });
        const saved: Article = {
          id: payload.id,
          slug: "", // akan di-generate di server
          ...body,
          publishedAt: body.isPublished ? new Date().toISOString() : null,
          createdAt: new Date().toISOString(),
        };
        // reload to get exact slug
        apiFetch<{ data: Article[] }>("/api/admin/articles", { cache: "no-store" })
          .then((payload) => setItems(payload.data));
        setNotice(`Artikel "${title}" berhasil ditambahkan.`);
      }
      
      setEditingId(undefined);
    } catch (caught) {
      if (caught instanceof ApiError && caught.fields) {
        setFieldErrors(caught.fields);
        setFormError(null);
      } else {
        setFormError(caught instanceof Error ? caught.message : "Gagal menyimpan artikel");
      }
    }
  }

  async function handleDelete(item: Article) {
    if (!window.confirm(`Hapus artikel "${item.title}"?`)) return;
    try {
      await apiFetch(`/api/admin/articles/${item.id}`, { method: "DELETE" });
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      setNotice(`Artikel "${item.title}" berhasil dihapus.`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Gagal menghapus artikel");
    }
  }

  async function togglePublished(item: Article) {
    try {
      await apiFetch(`/api/admin/articles/${item.id}`, { method: "PATCH", body: JSON.stringify({ isPublished: !item.isPublished }) });
      setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, isPublished: !i.isPublished } : i));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Gagal mengubah status");
    }
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-[var(--brand-600)]">Konten</p>
          <h1 className="mt-1 font-serif text-4xl tracking-tight">Artikel & Tips</h1>
          <p className="mt-2 text-sm text-stone-500">Atur artikel dan tips panduan memasak untuk pengguna.</p>
        </div>
        <button type="button" onClick={openNew} className="inline-flex h-11 items-center gap-2 rounded-full bg-stone-900 px-5 text-sm font-semibold text-white hover:bg-[var(--brand-700)]">
          <Plus size={17} />Tambah artikel
        </button>
      </div>

      {error ? <p role="alert" className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
      {notice ? <p role="status" className="mt-5 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">{notice}</p> : null}

      <section className="mt-8 overflow-hidden rounded-3xl border border-stone-200 bg-white">
        <div className="border-b border-stone-200 p-5">
          <h2 className="font-serif text-2xl">Daftar artikel</h2>
          <p className="mt-1 text-xs text-stone-500">{loading ? "Memuat..." : `${items.length} artikel`}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Judul</th>
                <th className="px-5 py-3 font-semibold">Slug</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3"><span className="sr-only">Aksi</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-stone-50/80">
                  <td className="px-5 py-3 font-semibold text-stone-900">{item.title}</td>
                  <td className="px-5 py-3 font-mono text-xs text-stone-600">{item.slug}</td>
                  <td className="px-5 py-3">
                    <button type="button" onClick={() => void togglePublished(item)} className={`rounded-full px-2.5 py-1 text-xs font-semibold ${item.isPublished ? "bg-emerald-100 text-emerald-800" : "bg-stone-100 text-stone-500"}`}>
                      {item.isPublished ? "Published" : "Draft"}
                    </button>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-1">
                      <button type="button" onClick={() => openEdit(item)} aria-label={`Edit ${item.title}`} className="grid size-9 place-items-center rounded-full text-stone-500 hover:bg-stone-200"><Edit3 size={16} /></button>
                      <button type="button" onClick={() => void handleDelete(item)} aria-label={`Hapus ${item.title}`} className="grid size-9 place-items-center rounded-full text-stone-400 hover:bg-red-50 hover:text-red-600"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && items.length === 0 ? (
                <tr><td colSpan={4} className="px-5 py-12 text-center text-sm text-stone-400">Belum ada artikel.</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      {editingId !== undefined ? (
        <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-stone-950/55 p-5" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) setEditingId(undefined); }}>
          <form onSubmit={handleSubmit} role="dialog" aria-modal="true" aria-labelledby="cat-form-title" className="w-full max-w-4xl rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--brand-600)]">Artikel</p>
                <h2 id="cat-form-title" className="mt-1 font-serif text-3xl">{editingId ? "Edit artikel" : "Tambah artikel"}</h2>
              </div>
              <button type="button" onClick={() => setEditingId(undefined)} aria-label="Tutup form" className="grid size-9 place-items-center rounded-full text-stone-500 hover:bg-stone-100"><X size={18} /></button>
            </div>

            {formError ? <p role="alert" className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{formError}</p> : null}

            <div className="mt-6 space-y-5">
              <FormField label="Judul" error={fieldErrors.title}>
                <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Contoh: Resep Chicken Katsu" className="mt-1 h-10 w-full rounded-xl border border-stone-300 bg-white px-4 text-sm" />
              </FormField>
              <FormField label="Excerpt (Singkat)" error={fieldErrors.excerpt}>
                <input value={form.excerpt} onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))} placeholder="Ringkasan singkat untuk list artikel..." className="mt-1 h-10 w-full rounded-xl border border-stone-300 bg-white px-4 text-sm" />
              </FormField>
              <FormField label="Konten (Mendukung Markdown)" error={fieldErrors.content}>
                <textarea rows={10} value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm font-mono" />
              </FormField>
              <AdminImageUpload value={form.coverImage} onChange={(url) => setForm((f) => ({ ...f, coverImage: url }))} folder="articles" accept="image/jpeg,image/png,image/webp,image/avif" maxSizeMB={5} error={fieldErrors.coverImage} />
              
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField label="Nama Penulis" error={fieldErrors.authorName}>
                  <input value={form.authorName} onChange={(e) => setForm((f) => ({ ...f, authorName: e.target.value }))} className="mt-1 h-10 w-full rounded-xl border border-stone-300 bg-white px-4 text-sm" />
                </FormField>
              </div>
              <label className="flex items-center gap-3">
                <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm((f) => ({ ...f, isPublished: e.target.checked }))} className="size-4 rounded border-stone-300" />
                <span className="text-sm font-semibold text-stone-800">Publish ke Publik</span>
              </label>
            </div>

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setEditingId(undefined)} className="h-11 rounded-full border border-stone-300 px-5 text-sm font-semibold text-stone-700">Batal</button>
              <button type="submit" className="h-11 rounded-full bg-stone-900 px-5 text-sm font-semibold text-white hover:bg-[var(--brand-700)]">{editingId ? "Simpan" : "Tambah"}</button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}

function FormField({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="text-sm font-semibold text-stone-800">
      {label}
      {children}
      {error ? <span className="mt-1 block text-xs font-normal text-[var(--error)]">{error}</span> : null}
    </label>
  );
}
