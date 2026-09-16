"use client";

import { ArrowDown, ArrowUp, Edit3, Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { ApiError, apiFetch } from "@/lib/client-api";

type ResellerPackage = {
  id: string;
  slug: string;
  title: string;
  planLabel: string;
  description: string;
  minOrder: number;
  discountMinPercent: number;
  discountMaxPercent: number;
  marginMin: number;
  marginMax: number;
  freeVariantMix: boolean;
  isRecommended: boolean;
  simulateDailyPcs: number | null;
  simulateProfitPerPcs: number | null;
  sortOrder: number;
  isActive: boolean;
};

type FormData = {
  slug: string;
  title: string;
  planLabel: string;
  description: string;
  minOrder: string;
  discountMinPercent: string;
  discountMaxPercent: string;
  marginMin: string;
  marginMax: string;
  freeVariantMix: boolean;
  isRecommended: boolean;
  simulateDailyPcs: string;
  simulateProfitPerPcs: string;
  sortOrder: string;
  isActive: boolean;
};

const emptyForm: FormData = {
  slug: "",
  title: "",
  planLabel: "",
  description: "",
  minOrder: "10",
  discountMinPercent: "0",
  discountMaxPercent: "0",
  marginMin: "0",
  marginMax: "0",
  freeVariantMix: true,
  isRecommended: false,
  simulateDailyPcs: "",
  simulateProfitPerPcs: "",
  sortOrder: "1",
  isActive: true,
};

function toFormValue(item: ResellerPackage): FormData {
  return {
    slug: item.slug,
    title: item.title,
    planLabel: item.planLabel ?? "",
    description: item.description ?? "",
    minOrder: String(item.minOrder),
    discountMinPercent: String(item.discountMinPercent),
    discountMaxPercent: String(item.discountMaxPercent),
    marginMin: String(item.marginMin),
    marginMax: String(item.marginMax),
    freeVariantMix: item.freeVariantMix,
    isRecommended: item.isRecommended,
    simulateDailyPcs: item.simulateDailyPcs === null ? "" : String(item.simulateDailyPcs),
    simulateProfitPerPcs: item.simulateProfitPerPcs === null ? "" : String(item.simulateProfitPerPcs),
    sortOrder: String(item.sortOrder),
    isActive: item.isActive,
  };
}

const formatRupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

export function AdminResellerPackagesPage() {
  const [items, setItems] = useState<ResellerPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null | undefined>(undefined);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    apiFetch<{ data: ResellerPackage[] }>("/api/admin/reseller-packages", { cache: "no-store" })
      .then((payload) => { setItems(payload.data); setError(null); })
      .catch((caught) => setError(caught instanceof Error ? caught.message : "Gagal memuat paket kemitraan"))
      .finally(() => setLoading(false));
  }, []);

  function openNew() {
    setEditingId(null);
    setForm({ ...emptyForm, sortOrder: String(items.length + 1) });
    setFormError(null);
    setFieldErrors({});
    setNotice(null);
  }

  function openEdit(item: ResellerPackage) {
    setEditingId(item.id);
    setForm(toFormValue(item));
    setFormError(null);
    setFieldErrors({});
    setNotice(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.title.trim()) { setFormError("Nama paket wajib diisi."); return; }
    if (!form.slug.trim()) { setFormError("Slug wajib diisi."); return; }
    try {
      const body = {
        slug: form.slug.trim().toLowerCase(),
        title: form.title.trim(),
        planLabel: form.planLabel.trim(),
        description: form.description.trim(),
        minOrder: Number(form.minOrder),
        discountMinPercent: Number(form.discountMinPercent),
        discountMaxPercent: Number(form.discountMaxPercent),
        marginMin: Number(form.marginMin),
        marginMax: Number(form.marginMax),
        freeVariantMix: form.freeVariantMix,
        isRecommended: form.isRecommended,
        simulateDailyPcs: form.simulateDailyPcs.trim() === "" ? null : Number(form.simulateDailyPcs),
        simulateProfitPerPcs: form.simulateProfitPerPcs.trim() === "" ? null : Number(form.simulateProfitPerPcs),
        sortOrder: Number(form.sortOrder),
        isActive: form.isActive,
      };
      const payload = await apiFetch<{ data: { id: string } }>(
        editingId ? `/api/admin/reseller-packages/${editingId}` : "/api/admin/reseller-packages",
        { method: editingId ? "PATCH" : "POST", body: JSON.stringify(body) },
      );
      const saved: ResellerPackage = { id: editingId ?? payload.data.id, ...body };
      setItems((prev) => editingId ? prev.map((i) => i.id === editingId ? saved : i) : [...prev, saved]);
      setNotice(`Paket "${saved.title}" berhasil ${editingId ? "diperbarui" : "ditambahkan"}.`);
      setEditingId(undefined);
    } catch (caught) {
      if (caught instanceof ApiError && caught.fields) {
        setFieldErrors(caught.fields);
        setFormError(null);
      } else {
        setFormError(caught instanceof Error ? caught.message : "Gagal menyimpan paket kemitraan");
      }
    }
  }

  async function handleDelete(item: ResellerPackage) {
    if (!window.confirm(`Hapus paket "${item.title}"?`)) return;
    try {
      await apiFetch(`/api/admin/reseller-packages/${item.id}`, { method: "DELETE" });
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      setNotice(`Paket "${item.title}" berhasil dihapus.`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Gagal menghapus paket kemitraan");
    }
  }

  async function moveItem(item: ResellerPackage, direction: "up" | "down") {
    const sorted = [...items].sort((a, b) => a.sortOrder - b.sortOrder);
    const idx = sorted.findIndex((i) => i.id === item.id);
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= sorted.length) return;
    const target = sorted[targetIdx];
    try {
      await apiFetch(`/api/admin/reseller-packages/${item.id}`, { method: "PATCH", body: JSON.stringify({ sortOrder: target.sortOrder }) });
      await apiFetch(`/api/admin/reseller-packages/${target.id}`, { method: "PATCH", body: JSON.stringify({ sortOrder: item.sortOrder }) });
      setItems((prev) => prev.map((i) => {
        if (i.id === item.id) return { ...i, sortOrder: target.sortOrder };
        if (i.id === target.id) return { ...i, sortOrder: item.sortOrder };
        return i;
      }));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Gagal mengubah urutan");
    }
  }

  async function toggleActive(item: ResellerPackage) {
    try {
      await apiFetch(`/api/admin/reseller-packages/${item.id}`, { method: "PATCH", body: JSON.stringify({ isActive: !item.isActive }) });
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
          <h1 className="mt-1 font-serif text-4xl tracking-tight">Paket Kemitraan</h1>
          <p className="mt-2 text-sm text-stone-500">Kelola paket Reseller / Agen yang tampil di halaman katalog.</p>
        </div>
        <button type="button" onClick={openNew} className="inline-flex h-11 items-center gap-2 rounded-full bg-stone-900 px-5 text-sm font-semibold text-white hover:bg-[var(--brand-700)]">
          <Plus size={17} />Tambah paket
        </button>
      </div>

      {error ? <p role="alert" className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
      {notice ? <p role="status" className="mt-5 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">{notice}</p> : null}

      <section className="mt-8 overflow-hidden rounded-3xl border border-stone-200 bg-white">
        <div className="border-b border-stone-200 p-5">
          <h2 className="font-serif text-2xl">Daftar paket kemitraan</h2>
          <p className="mt-1 text-xs text-stone-500">{loading ? "Memuat..." : `${items.length} paket`}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Urutan</th>
                <th className="px-5 py-3 font-semibold">Paket</th>
                <th className="px-5 py-3 font-semibold">Min. Order</th>
                <th className="px-5 py-3 font-semibold">Diskon</th>
                <th className="px-5 py-3 font-semibold">Margin / Pcs</th>
                <th className="px-5 py-3 font-semibold">Status</th>
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
                  <td className="px-5 py-3">
                    <div className="font-semibold text-stone-900">{item.title}</div>
                    <div className="text-xs text-stone-500">{item.planLabel}</div>
                    {item.isRecommended ? <span className="mt-1 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 uppercase">Rekomendasi</span> : null}
                  </td>
                  <td className="px-5 py-3 text-stone-700">{item.minOrder} pcs</td>
                  <td className="px-5 py-3 font-semibold text-emerald-600">{item.discountMinPercent}% – {item.discountMaxPercent}%</td>
                  <td className="px-5 py-3 text-stone-700">{formatRupiah(item.marginMin)} – {formatRupiah(item.marginMax)}</td>
                  <td className="px-5 py-3">
                    <button type="button" onClick={() => void toggleActive(item)} className={`rounded-full px-2.5 py-1 text-xs font-semibold ${item.isActive ? "bg-emerald-100 text-emerald-800" : "bg-stone-100 text-stone-500"}`}>
                      {item.isActive ? "Aktif" : "Nonaktif"}
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
                <tr><td colSpan={7} className="px-5 py-12 text-center text-sm text-stone-400">Belum ada paket kemitraan.</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      {editingId !== undefined ? (
        <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-stone-950/55 p-5" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) setEditingId(undefined); }}>
          <form onSubmit={handleSubmit} role="dialog" aria-modal="true" aria-labelledby="package-form-title" className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--brand-600)]">Paket Kemitraan</p>
                <h2 id="package-form-title" className="mt-1 font-serif text-3xl">{editingId ? "Edit paket" : "Tambah paket"}</h2>
              </div>
              <button type="button" onClick={() => setEditingId(undefined)} aria-label="Tutup form" className="grid size-9 place-items-center rounded-full text-stone-500 hover:bg-stone-100"><X size={18} /></button>
            </div>

            {formError ? <p role="alert" className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{formError}</p> : null}

            <div className="mt-6 space-y-5">
              <p className="text-xs font-bold uppercase tracking-wide text-stone-400">Info Paket</p>
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField label="Nama Paket" error={fieldErrors.title}>
                  <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Starter (Pemula)" className="mt-1 h-10 w-full rounded-xl border border-stone-300 bg-white px-4 text-sm" />
                </FormField>
                <FormField label="Slug" error={fieldErrors.slug}>
                  <input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} placeholder="starter" className="mt-1 h-10 w-full rounded-xl border border-stone-300 bg-white px-4 text-sm" />
                </FormField>
              </div>
              <FormField label="Label Plan (badge)" error={fieldErrors.planLabel}>
                <input value={form.planLabel} onChange={(e) => setForm((f) => ({ ...f, planLabel: e.target.value }))} placeholder="Paket Modal Pemula" className="mt-1 h-10 w-full rounded-xl border border-stone-300 bg-white px-4 text-sm" />
              </FormField>
              <FormField label="Deskripsi" error={fieldErrors.description}>
                <textarea rows={2} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm" />
              </FormField>

              <p className="pt-2 text-xs font-bold uppercase tracking-wide text-stone-400">Syarat & Margin</p>
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField label="Min. Order (pcs)" error={fieldErrors.minOrder}>
                  <input type="number" min="0" value={form.minOrder} onChange={(e) => setForm((f) => ({ ...f, minOrder: e.target.value }))} className="mt-1 h-10 w-full rounded-xl border border-stone-300 bg-white px-4 text-sm" />
                </FormField>
                <FormField label="Urutan" error={fieldErrors.sortOrder}>
                  <input type="number" min="0" value={form.sortOrder} onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))} className="mt-1 h-10 w-full rounded-xl border border-stone-300 bg-white px-4 text-sm" />
                </FormField>
                <FormField label="Diskon dari HET (%)" error={fieldErrors.discountMaxPercent || fieldErrors.discountMinPercent}>
                  <div className="mt-1 grid grid-cols-2 gap-2">
                    <input type="number" min="0" max="100" value={form.discountMinPercent} onChange={(e) => setForm((f) => ({ ...f, discountMinPercent: e.target.value }))} placeholder="Min" className="h-10 w-full rounded-xl border border-stone-300 bg-white px-4 text-sm" />
                    <input type="number" min="0" max="100" value={form.discountMaxPercent} onChange={(e) => setForm((f) => ({ ...f, discountMaxPercent: e.target.value }))} placeholder="Maks" className="h-10 w-full rounded-xl border border-stone-300 bg-white px-4 text-sm" />
                  </div>
                </FormField>
                <FormField label="Potensi Margin / Pcs (Rp)" error={fieldErrors.marginMax || fieldErrors.marginMin}>
                  <div className="mt-1 grid grid-cols-2 gap-2">
                    <input type="number" min="0" value={form.marginMin} onChange={(e) => setForm((f) => ({ ...f, marginMin: e.target.value }))} placeholder="Min" className="h-10 w-full rounded-xl border border-stone-300 bg-white px-4 text-sm" />
                    <input type="number" min="0" value={form.marginMax} onChange={(e) => setForm((f) => ({ ...f, marginMax: e.target.value }))} placeholder="Maks" className="h-10 w-full rounded-xl border border-stone-300 bg-white px-4 text-sm" />
                  </div>
                </FormField>
              </div>
              <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-3">
                  <input type="checkbox" checked={form.freeVariantMix} onChange={(e) => setForm((f) => ({ ...f, freeVariantMix: e.target.checked }))} className="size-4 rounded border-stone-300" />
                  <span className="text-sm font-semibold text-stone-800">Bebas campur varian</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" checked={form.isRecommended} onChange={(e) => setForm((f) => ({ ...f, isRecommended: e.target.checked }))} className="size-4 rounded border-stone-300" />
                  <span className="text-sm font-semibold text-stone-800">Rekomendasi</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} className="size-4 rounded border-stone-300" />
                  <span className="text-sm font-semibold text-stone-800">Aktif</span>
                </label>
              </div>

              <p className="pt-2 text-xs font-bold uppercase tracking-wide text-stone-400">Simulasi Penghasilan (opsional)</p>
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField label="Penjualan rata-rata (pcs/hari)" error={fieldErrors.simulateDailyPcs}>
                  <input type="number" min="0" value={form.simulateDailyPcs} onChange={(e) => setForm((f) => ({ ...f, simulateDailyPcs: e.target.value }))} placeholder="10" className="mt-1 h-10 w-full rounded-xl border border-stone-300 bg-white px-4 text-sm" />
                </FormField>
                <FormField label="Keuntungan bersih / pcs (Rp)" error={fieldErrors.simulateProfitPerPcs}>
                  <input type="number" min="0" value={form.simulateProfitPerPcs} onChange={(e) => setForm((f) => ({ ...f, simulateProfitPerPcs: e.target.value }))} placeholder="9000" className="mt-1 h-10 w-full rounded-xl border border-stone-300 bg-white px-4 text-sm" />
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