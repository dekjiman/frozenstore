"use client";

import { Edit3, Plus, Star, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { ApiError, apiFetch } from "@/lib/client-api";
import { AdminImageUpload } from "@/components/admin-image-upload";

type Testimonial = {
  id: string;
  customerName: string;
  customerTitle: string;
  quote: string;
  rating: number;
  avatarUrl: string;
  sortOrder: number;
  isPublished: boolean;
};

type FormData = {
  customerName: string;
  customerTitle: string;
  quote: string;
  rating: string;
  avatarUrl: string;
  sortOrder: string;
  isPublished: boolean;
};

const emptyForm: FormData = { customerName: "", customerTitle: "", quote: "", rating: "5", avatarUrl: "", sortOrder: "1", isPublished: true };

function toFormValue(item: Testimonial): FormData {
  return {
    customerName: item.customerName,
    customerTitle: item.customerTitle ?? "",
    quote: item.quote,
    rating: String(item.rating),
    avatarUrl: item.avatarUrl ?? "",
    sortOrder: String(item.sortOrder),
    isPublished: item.isPublished,
  };
}

export function AdminTestimonialsPage() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null | undefined>(undefined);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    apiFetch<{ data: Testimonial[] }>("/api/admin/testimonials", { cache: "no-store" })
      .then((payload) => { setItems(payload.data); setError(null); })
      .catch((caught) => setError(caught instanceof Error ? caught.message : "Gagal memuat testimonial"))
      .finally(() => setLoading(false));
  }, []);

  function openNew() {
    setEditingId(null);
    setForm({ ...emptyForm, sortOrder: String(items.length + 1) });
    setFormError(null);
    setFieldErrors({});
    setNotice(null);
  }

  function openEdit(item: Testimonial) {
    setEditingId(item.id);
    setForm(toFormValue(item));
    setFormError(null);
    setFieldErrors({});
    setNotice(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.customerName.trim()) { setFormError("Nama pelanggan wajib diisi."); return; }
    if (!form.quote.trim()) { setFormError("Kutipan wajib diisi."); return; }
    const rating = Number(form.rating);
    const sortOrder = Number(form.sortOrder);
    if (rating < 1 || rating > 5) { setFormError("Rating harus antara 1–5."); return; }
    if (!Number.isInteger(sortOrder) || sortOrder < 0) { setFormError("Urutan harus bilangan bulat positif."); return; }
    try {
      const body = {
        customerName: form.customerName.trim(),
        customerTitle: form.customerTitle.trim(),
        quote: form.quote.trim(),
        rating,
        avatarUrl: form.avatarUrl.trim(),
        sortOrder,
        isPublished: form.isPublished,
      };
      const payload = await apiFetch<{ data: { id: string } }>(
        editingId ? `/api/admin/testimonials/${editingId}` : "/api/admin/testimonials",
        { method: editingId ? "PATCH" : "POST", body: JSON.stringify(body) },
      );
      const saved: Testimonial = { id: editingId ?? payload.data.id, ...body };
      setItems((prev) => editingId ? prev.map((i) => i.id === editingId ? saved : i) : [...prev, saved]);
      setNotice(`Testimonial "${saved.customerName}" berhasil ${editingId ? "diperbarui" : "ditambahkan"}.`);
      setEditingId(undefined);
    } catch (caught) {
      if (caught instanceof ApiError && caught.fields) {
        setFieldErrors(caught.fields);
        setFormError(null);
      } else {
        setFormError(caught instanceof Error ? caught.message : "Gagal menyimpan testimonial");
      }
    }
  }

  async function handleDelete(item: Testimonial) {
    if (!window.confirm(`Hapus testimonial dari "${item.customerName}"?`)) return;
    try {
      await apiFetch(`/api/admin/testimonials/${item.id}`, { method: "DELETE" });
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      setNotice(`Testimonial "${item.customerName}" berhasil dihapus.`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Gagal menghapus testimonial");
    }
  }

  async function togglePublished(item: Testimonial) {
    try {
      await apiFetch(`/api/admin/testimonials/${item.id}`, { method: "PATCH", body: JSON.stringify({ isPublished: !item.isPublished }) });
      setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, isPublished: !i.isPublished } : i));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Gagal mengubah status");
    }
  }

  const sorted = [...items].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-[var(--brand-600)]">Konten</p>
          <h1 className="mt-1 font-serif text-4xl tracking-tight">Testimoni pelanggan</h1>
          <p className="mt-2 text-sm text-stone-500">Kelola ulasan yang tampil di halaman beranda.</p>
        </div>
        <button type="button" onClick={openNew} className="inline-flex h-11 items-center gap-2 rounded-full bg-stone-900 px-5 text-sm font-semibold text-white hover:bg-[var(--brand-700)]">
          <Plus size={17} />Tambah testimonial
        </button>
      </div>

      {error ? <p role="alert" className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
      {notice ? <p role="status" className="mt-5 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">{notice}</p> : null}

      <section className="mt-8 overflow-hidden rounded-3xl border border-stone-200 bg-white">
        <div className="border-b border-stone-200 p-5">
          <h2 className="font-serif text-2xl">Daftar testimonial</h2>
          <p className="mt-1 text-xs text-stone-500">{loading ? "Memuat..." : `${items.length} testimonial`}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Nama</th>
                <th className="px-5 py-3 font-semibold">Rating</th>
                <th className="px-5 py-3 font-semibold">Kutipan</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3"><span className="sr-only">Aksi</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {sorted.map((item) => (
                <tr key={item.id} className="hover:bg-stone-50/80">
                  <td className="px-5 py-3 font-semibold text-stone-900">{item.customerName}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-0.5 text-amber-500">
                      {Array.from({ length: 5 }, (_, i) => <Star key={i} size={14} fill={i < item.rating ? "currentColor" : "none"} />)}
                    </div>
                  </td>
                  <td className="max-w-xs truncate px-5 py-3 text-stone-600">{item.quote}</td>
                  <td className="px-5 py-3">
                    <button type="button" onClick={() => void togglePublished(item)} className={`rounded-full px-2.5 py-1 text-xs font-semibold ${item.isPublished ? "bg-emerald-100 text-emerald-800" : "bg-stone-100 text-stone-500"}`}>
                      {item.isPublished ? "Publish" : "Draft"}
                    </button>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-1">
                      <button type="button" onClick={() => openEdit(item)} aria-label={`Edit ${item.customerName}`} className="grid size-9 place-items-center rounded-full text-stone-500 hover:bg-stone-200"><Edit3 size={16} /></button>
                      <button type="button" onClick={() => void handleDelete(item)} aria-label={`Hapus ${item.customerName}`} className="grid size-9 place-items-center rounded-full text-stone-400 hover:bg-red-50 hover:text-red-600"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && items.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-12 text-center text-sm text-stone-400">Belum ada testimonial.</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      {editingId !== undefined ? (
        <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-stone-950/55 p-5" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) setEditingId(undefined); }}>
          <form onSubmit={handleSubmit} role="dialog" aria-modal="true" aria-labelledby="testi-form-title" className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--brand-600)]">Testimonial</p>
                <h2 id="testi-form-title" className="mt-1 font-serif text-3xl">{editingId ? "Edit testimonial" : "Tambah testimonial"}</h2>
              </div>
              <button type="button" onClick={() => setEditingId(undefined)} aria-label="Tutup form" className="grid size-9 place-items-center rounded-full text-stone-500 hover:bg-stone-100"><X size={18} /></button>
            </div>

            {formError ? <p role="alert" className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{formError}</p> : null}

            <div className="mt-6 space-y-5">
              <FormField label="Nama Pelanggan" error={fieldErrors.customerName}>
                <input value={form.customerName} onChange={(e) => setForm((f) => ({ ...f, customerName: e.target.value }))} placeholder="Budi Santoso" className="mt-1 h-10 w-full rounded-xl border border-stone-300 bg-white px-4 text-sm" />
              </FormField>
              <FormField label="Jabatan / Kota" error={fieldErrors.customerTitle}>
                <input value={form.customerTitle} onChange={(e) => setForm((f) => ({ ...f, customerTitle: e.target.value }))} placeholder="Jakarta" className="mt-1 h-10 w-full rounded-xl border border-stone-300 bg-white px-4 text-sm" />
              </FormField>
              <FormField label="Kutipan" error={fieldErrors.quote}>
                <textarea rows={4} value={form.quote} onChange={(e) => setForm((f) => ({ ...f, quote: e.target.value }))} placeholder="Kata-kata pelanggan..." className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm" />
              </FormField>
              <FormField label="Rating" error={fieldErrors.rating}>
                <div className="mt-2 flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((v) => (
                    <button key={v} type="button" onClick={() => setForm((f) => ({ ...f, rating: String(v) }))} aria-label={`Rating ${v} dari 5`} className="text-amber-500 hover:scale-110 transition-transform">
                      <Star size={22} fill={v <= Number(form.rating) ? "currentColor" : "none"} />
                    </button>
                  ))}
                </div>
              </FormField>
              <AdminImageUpload value={form.avatarUrl} onChange={(url) => setForm((f) => ({ ...f, avatarUrl: url }))} folder="testimonials" accept="image/jpeg,image/png,image/webp,image/avif" maxSizeMB={5} error={fieldErrors.avatarUrl} />
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField label="Urutan" error={fieldErrors.sortOrder}>
                  <input type="number" min="0" value={form.sortOrder} onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))} className="mt-1 h-10 w-full rounded-xl border border-stone-300 bg-white px-4 text-sm" />
                </FormField>
                <label className="flex items-center gap-3 self-end pb-2">
                  <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm((f) => ({ ...f, isPublished: e.target.checked }))} className="size-4 rounded border-stone-300" />
                  <span className="text-sm font-semibold text-stone-800">Published</span>
                </label>
              </div>
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
