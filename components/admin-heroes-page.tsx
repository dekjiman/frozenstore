"use client";

import { ArrowDown, ArrowUp, Edit3, Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { ApiError, apiFetch } from "@/lib/client-api";
import { AdminImageUpload } from "@/components/admin-image-upload";

type Hero = {
  id: string;
  eyebrow: string;
  title: string;
  highlightedText: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  primaryCtaLabel: string;
  primaryCtaUrl: string;
  secondaryCtaLabel: string;
  secondaryCtaUrl: string;
  sortOrder: number;
  isActive: boolean;
  startsAt: string | null;
  endsAt: string | null;
};

type FormData = {
  eyebrow: string;
  title: string;
  highlightedText: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  primaryCtaLabel: string;
  primaryCtaUrl: string;
  secondaryCtaLabel: string;
  secondaryCtaUrl: string;
  sortOrder: string;
  isActive: boolean;
  startsAt: string;
  endsAt: string;
};

const emptyForm: FormData = { eyebrow: "", title: "", highlightedText: "", description: "", imageUrl: "", imageAlt: "", primaryCtaLabel: "", primaryCtaUrl: "", secondaryCtaLabel: "", secondaryCtaUrl: "", sortOrder: "1", isActive: true, startsAt: "", endsAt: "" };

function toFormValue(item: Hero): FormData {
  return {
    eyebrow: item.eyebrow ?? "",
    title: item.title,
    highlightedText: item.highlightedText ?? "",
    description: item.description ?? "",
    imageUrl: item.imageUrl,
    imageAlt: item.imageAlt ?? "",
    primaryCtaLabel: item.primaryCtaLabel ?? "",
    primaryCtaUrl: item.primaryCtaUrl ?? "",
    secondaryCtaLabel: item.secondaryCtaLabel ?? "",
    secondaryCtaUrl: item.secondaryCtaUrl ?? "",
    sortOrder: String(item.sortOrder),
    isActive: item.isActive,
    startsAt: item.startsAt ? item.startsAt.slice(0, 10) : "",
    endsAt: item.endsAt ? item.endsAt.slice(0, 10) : "",
  };
}

export function AdminHeroesPage() {
  const [items, setItems] = useState<Hero[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null | undefined>(undefined);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    apiFetch<{ data: Hero[] }>("/api/admin/heroes", { cache: "no-store" })
      .then((payload) => { setItems(payload.data); setError(null); })
      .catch((caught) => setError(caught instanceof Error ? caught.message : "Gagal memuat hero"))
      .finally(() => setLoading(false));
  }, []);

  function openNew() {
    setEditingId(null);
    setForm({ ...emptyForm, sortOrder: String(items.length + 1) });
    setFormError(null);
    setFieldErrors({});
    setNotice(null);
  }

  function openEdit(item: Hero) {
    setEditingId(item.id);
    setForm(toFormValue(item));
    setFormError(null);
    setFieldErrors({});
    setNotice(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.title.trim()) { setFormError("Judul wajib diisi."); return; }
    if (!form.imageUrl.trim()) { setFormError("URL gambar wajib diisi."); return; }
    const sortOrder = Number(form.sortOrder);
    if (!Number.isInteger(sortOrder) || sortOrder < 0) { setFormError("Urutan harus bilangan bulat positif."); return; }
    try {
      const body = {
        eyebrow: form.eyebrow.trim(),
        title: form.title.trim(),
        highlightedText: form.highlightedText.trim(),
        description: form.description.trim(),
        imageUrl: form.imageUrl.trim(),
        imageAlt: form.imageAlt.trim(),
        primaryCtaLabel: form.primaryCtaLabel.trim(),
        primaryCtaUrl: form.primaryCtaUrl.trim(),
        secondaryCtaLabel: form.secondaryCtaLabel.trim(),
        secondaryCtaUrl: form.secondaryCtaUrl.trim(),
        sortOrder,
        isActive: form.isActive,
        startsAt: form.startsAt || null,
        endsAt: form.endsAt || null,
      };
      const payload = await apiFetch<{ data: { id: string } }>(
        editingId ? `/api/admin/heroes/${editingId}` : "/api/admin/heroes",
        { method: editingId ? "PATCH" : "POST", body: JSON.stringify(body) },
      );
      const saved: Hero = { id: editingId ?? payload.data.id, ...body };
      setItems((prev) => editingId ? prev.map((i) => i.id === editingId ? saved : i) : [...prev, saved]);
      setNotice(`Hero "${saved.title}" berhasil ${editingId ? "diperbarui" : "ditambahkan"}.`);
      setEditingId(undefined);
    } catch (caught) {
      if (caught instanceof ApiError && caught.fields) {
        setFieldErrors(caught.fields);
        setFormError(null);
      } else {
        setFormError(caught instanceof Error ? caught.message : "Gagal menyimpan hero");
      }
    }
  }

  async function handleDelete(item: Hero) {
    if (!window.confirm(`Hapus hero "${item.title}"?`)) return;
    try {
      await apiFetch(`/api/admin/heroes/${item.id}`, { method: "DELETE" });
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      setNotice(`Hero "${item.title}" berhasil dihapus.`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Gagal menghapus hero");
    }
  }

  async function moveItem(item: Hero, direction: "up" | "down") {
    const sorted = [...items].sort((a, b) => a.sortOrder - b.sortOrder);
    const idx = sorted.findIndex((i) => i.id === item.id);
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= sorted.length) return;
    const target = sorted[targetIdx];
    try {
      await apiFetch(`/api/admin/heroes/${item.id}`, { method: "PATCH", body: JSON.stringify({ sortOrder: target.sortOrder }) });
      await apiFetch(`/api/admin/heroes/${target.id}`, { method: "PATCH", body: JSON.stringify({ sortOrder: item.sortOrder }) });
      setItems((prev) => prev.map((i) => {
        if (i.id === item.id) return { ...i, sortOrder: target.sortOrder };
        if (i.id === target.id) return { ...i, sortOrder: item.sortOrder };
        return i;
      }));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Gagal mengubah urutan");
    }
  }

  async function toggleActive(item: Hero) {
    try {
      await apiFetch(`/api/admin/heroes/${item.id}`, { method: "PATCH", body: JSON.stringify({ isActive: !item.isActive }) });
      setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, isActive: !i.isActive } : i));
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
          <h1 className="mt-1 font-serif text-4xl tracking-tight">Hero campaign</h1>
          <p className="mt-2 text-sm text-stone-500">Kelola banner utama di halaman beranda.</p>
        </div>
        <button type="button" onClick={openNew} className="inline-flex h-11 items-center gap-2 rounded-full bg-stone-900 px-5 text-sm font-semibold text-white hover:bg-[var(--brand-700)]">
          <Plus size={17} />Tambah hero
        </button>
      </div>

      {error ? <p role="alert" className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
      {notice ? <p role="status" className="mt-5 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">{notice}</p> : null}

      <section className="mt-8 overflow-hidden rounded-3xl border border-stone-200 bg-white">
        <div className="border-b border-stone-200 p-5">
          <h2 className="font-serif text-2xl">Daftar hero</h2>
          <p className="mt-1 text-xs text-stone-500">{loading ? "Memuat..." : `${items.length} hero`}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Urutan</th>
                <th className="px-5 py-3 font-semibold">Judul</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Jendela publish</th>
                <th className="px-5 py-3"><span className="sr-only">Aksi</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {sorted.map((item, idx) => (
                <tr key={item.id} className="hover:bg-stone-50/80">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1">
                      <span className="w-8 text-center text-sm font-semibold text-stone-700">{item.sortOrder}</span>
                      <div className="flex flex-col">
                        <button type="button" onClick={() => void moveItem(item, "up")} disabled={idx === 0} aria-label="Pindah ke atas" className="grid size-6 place-items-center rounded text-stone-400 hover:bg-stone-200 disabled:opacity-30"><ArrowUp size={13} /></button>
                        <button type="button" onClick={() => void moveItem(item, "down")} disabled={idx === sorted.length - 1} aria-label="Pindah ke bawah" className="grid size-6 place-items-center rounded text-stone-400 hover:bg-stone-200 disabled:opacity-30"><ArrowDown size={13} /></button>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 font-semibold text-stone-900">{item.title}</td>
                  <td className="px-5 py-3">
                    <button type="button" onClick={() => void toggleActive(item)} className={`rounded-full px-2.5 py-1 text-xs font-semibold ${item.isActive ? "bg-emerald-100 text-emerald-800" : "bg-stone-100 text-stone-500"}`}>
                      {item.isActive ? "Aktif" : "Nonaktif"}
                    </button>
                  </td>
                  <td className="px-5 py-3 text-xs text-stone-500">
                    {item.startsAt || item.endsAt ? `${item.startsAt ? new Date(item.startsAt).toLocaleDateString("id-ID") : "—"} – ${item.endsAt ? new Date(item.endsAt).toLocaleDateString("id-ID") : "∞"}` : "Tanpa batas"}
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
                <tr><td colSpan={5} className="px-5 py-12 text-center text-sm text-stone-400">Belum ada hero.</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      {editingId !== undefined ? (
        <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-stone-950/55 p-5" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) setEditingId(undefined); }}>
          <form onSubmit={handleSubmit} role="dialog" aria-modal="true" aria-labelledby="hero-form-title" className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--brand-600)]">Hero</p>
                <h2 id="hero-form-title" className="mt-1 font-serif text-3xl">{editingId ? "Edit hero" : "Tambah hero"}</h2>
              </div>
              <button type="button" onClick={() => setEditingId(undefined)} aria-label="Tutup form" className="grid size-9 place-items-center rounded-full text-stone-500 hover:bg-stone-100"><X size={18} /></button>
            </div>

            {formError ? <p role="alert" className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{formError}</p> : null}

            <div className="mt-6 space-y-5">
              <FormField label="Eyebrow" error={fieldErrors.eyebrow}>
                <input value={form.eyebrow} onChange={(e) => setForm((f) => ({ ...f, eyebrow: e.target.value }))} placeholder="Promo spesial" className="mt-1 h-10 w-full rounded-xl border border-stone-300 bg-white px-4 text-sm" />
              </FormField>
              <FormField label="Judul" error={fieldErrors.title}>
                <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Judul hero" className="mt-1 h-10 w-full rounded-xl border border-stone-300 bg-white px-4 text-sm" />
              </FormField>
              <FormField label="Teks Highlight" error={fieldErrors.highlightedText}>
                <input value={form.highlightedText} onChange={(e) => setForm((f) => ({ ...f, highlightedText: e.target.value }))} className="mt-1 h-10 w-full rounded-xl border border-stone-300 bg-white px-4 text-sm" />
              </FormField>
              <FormField label="Deskripsi" error={fieldErrors.description}>
                <textarea rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm" />
              </FormField>
              <AdminImageUpload value={form.imageUrl} onChange={(url) => setForm((f) => ({ ...f, imageUrl: url }))} folder="heroes" accept="image/jpeg,image/png,image/webp,image/avif,video/mp4" error={fieldErrors.imageUrl} />
              <FormField label="Alt Gambar" error={fieldErrors.imageAlt}>
                <input value={form.imageAlt} onChange={(e) => setForm((f) => ({ ...f, imageAlt: e.target.value }))} className="mt-1 h-10 w-full rounded-xl border border-stone-300 bg-white px-4 text-sm" />
              </FormField>
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField label="CTA Utama Label" error={fieldErrors.primaryCtaLabel}>
                  <input value={form.primaryCtaLabel} onChange={(e) => setForm((f) => ({ ...f, primaryCtaLabel: e.target.value }))} className="mt-1 h-10 w-full rounded-xl border border-stone-300 bg-white px-4 text-sm" />
                </FormField>
                <FormField label="CTA Utama URL" error={fieldErrors.primaryCtaUrl}>
                  <input value={form.primaryCtaUrl} onChange={(e) => setForm((f) => ({ ...f, primaryCtaUrl: e.target.value }))} className="mt-1 h-10 w-full rounded-xl border border-stone-300 bg-white px-4 text-sm" />
                </FormField>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField label="CTA Sekunder Label" error={fieldErrors.secondaryCtaLabel}>
                  <input value={form.secondaryCtaLabel} onChange={(e) => setForm((f) => ({ ...f, secondaryCtaLabel: e.target.value }))} className="mt-1 h-10 w-full rounded-xl border border-stone-300 bg-white px-4 text-sm" />
                </FormField>
                <FormField label="CTA Sekunder URL" error={fieldErrors.secondaryCtaUrl}>
                  <input value={form.secondaryCtaUrl} onChange={(e) => setForm((f) => ({ ...f, secondaryCtaUrl: e.target.value }))} className="mt-1 h-10 w-full rounded-xl border border-stone-300 bg-white px-4 text-sm" />
                </FormField>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField label="Urutan" error={fieldErrors.sortOrder}>
                  <input type="number" min="0" value={form.sortOrder} onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))} className="mt-1 h-10 w-full rounded-xl border border-stone-300 bg-white px-4 text-sm" />
                </FormField>
                <label className="flex items-center gap-3 self-end pb-2">
                  <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} className="size-4 rounded border-stone-300" />
                  <span className="text-sm font-semibold text-stone-800">Aktif</span>
                </label>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField label="Mulai" error={fieldErrors.startsAt}>
                  <input type="date" value={form.startsAt} onChange={(e) => setForm((f) => ({ ...f, startsAt: e.target.value }))} className="mt-1 h-10 w-full rounded-xl border border-stone-300 bg-white px-4 text-sm" />
                </FormField>
                <FormField label="Berakhir" error={fieldErrors.endsAt}>
                  <input type="date" value={form.endsAt} onChange={(e) => setForm((f) => ({ ...f, endsAt: e.target.value }))} className="mt-1 h-10 w-full rounded-xl border border-stone-300 bg-white px-4 text-sm" />
                </FormField>
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
