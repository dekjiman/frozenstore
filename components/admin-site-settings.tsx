"use client";

import { CheckCircle2, Globe, Phone, Save, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { ApiError, apiFetch } from "@/lib/client-api";
import { AdminImageUpload } from "@/components/admin-image-upload";

type SiteSettings = {
  brandName: string;
  tagline: string;
  logoUrl: string;
  whatsappNumber: string;
  email: string;
  address: string;
  operatingHours: string;
  freeShippingThreshold: string;
  instagramUrl: string;
  tiktokUrl: string;
  youtubeUrl: string;
  facebookUrl: string;
};

const emptyForm: SiteSettings = { brandName: "", tagline: "", logoUrl: "", whatsappNumber: "", email: "", address: "", operatingHours: "", freeShippingThreshold: "", instagramUrl: "", tiktokUrl: "", youtubeUrl: "", facebookUrl: "" };

export function AdminSiteSettings() {
  const [form, setForm] = useState<SiteSettings>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    apiFetch<{ data: Record<string, unknown> }>("/api/admin/site-settings", { cache: "no-store" })
      .then((payload) => {
        const s = payload.data;
        setForm({
          brandName: String(s.brandName ?? ""),
          tagline: String(s.tagline ?? ""),
          logoUrl: String(s.logoUrl ?? ""),
          whatsappNumber: String(s.whatsappNumber ?? ""),
          email: String(s.email ?? ""),
          address: String(s.address ?? ""),
          operatingHours: String(s.operatingHours ?? ""),
          freeShippingThreshold: String(s.freeShippingThreshold ?? ""),
          instagramUrl: String(s.instagramUrl ?? ""),
          tiktokUrl: String(s.tiktokUrl ?? ""),
          youtubeUrl: String(s.youtubeUrl ?? ""),
          facebookUrl: String(s.facebookUrl ?? ""),
        });
        setError(null);
      })
      .catch((caught) => setError(caught instanceof Error ? caught.message : "Gagal memuat pengaturan"))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setNotice(null);
    setError(null);
    setFieldErrors({});
    try {
      const body: Record<string, unknown> = {
        brandName: form.brandName.trim(),
        tagline: form.tagline.trim(),
        logoUrl: form.logoUrl.trim(),
        whatsappNumber: form.whatsappNumber.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
        operatingHours: form.operatingHours.trim(),
        instagramUrl: form.instagramUrl.trim(),
        tiktokUrl: form.tiktokUrl.trim(),
        youtubeUrl: form.youtubeUrl.trim(),
        facebookUrl: form.facebookUrl.trim(),
      };
      const threshold = form.freeShippingThreshold.trim();
      body.freeShippingThreshold = threshold ? Number(threshold) : null;
      await apiFetch("/api/admin/site-settings", { method: "PATCH", body: JSON.stringify(body) });
      setNotice("Pengaturan berhasil disimpan.");
    } catch (caught) {
      if (caught instanceof ApiError && caught.fields) {
        setFieldErrors(caught.fields);
      } else {
        setError(caught instanceof Error ? caught.message : "Gagal menyimpan pengaturan");
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 rounded-xl bg-stone-200" />
          <div className="h-64 rounded-3xl bg-stone-100" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-[var(--brand-600)]">Konfigurasi</p>
          <h1 className="mt-1 font-serif text-4xl tracking-tight">Pengaturan situs</h1>
          <p className="mt-2 text-sm text-stone-500">Atur informasi umum toko, kontak, dan media sosial.</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-xs font-semibold text-emerald-800">
          <CheckCircle2 size={15} />Tersimpan otomatis
        </div>
      </div>

      {error ? <p role="alert" className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
      {notice ? <p role="status" className="mt-5 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">{notice}</p> : null}

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <section className="rounded-3xl border border-stone-200 bg-white p-6">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-stone-100 text-stone-700"><Settings size={18} /></span>
            <div><h2 className="font-serif text-xl">Identitas brand</h2><p className="text-xs text-stone-500">Nama dan tagline toko</p></div>
          </div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <FormField label="Nama Brand" error={fieldErrors.brandName}>
              <input value={form.brandName} onChange={(e) => setForm((f) => ({ ...f, brandName: e.target.value }))} placeholder="FrozenStore" className="mt-1 h-10 w-full rounded-xl border border-stone-300 bg-white px-4 text-sm" />
            </FormField>
            <FormField label="Tagline" error={fieldErrors.tagline}>
              <input value={form.tagline} onChange={(e) => setForm((f) => ({ ...f, tagline: e.target.value }))} placeholder="Frozen food terbaik" className="mt-1 h-10 w-full rounded-xl border border-stone-300 bg-white px-4 text-sm" />
            </FormField>
          </div>
          <div className="mt-5">
            <AdminImageUpload
              value={form.logoUrl}
              onChange={(url) => setForm((f) => ({ ...f, logoUrl: url }))}
              folder="site"
              accept="image/jpeg,image/png,image/webp,image/avif"
              maxSizeMB={5}
              error={fieldErrors.logoUrl}
            />
          </div>
        </section>

        <section className="rounded-3xl border border-stone-200 bg-white p-6">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-stone-100 text-stone-700"><Phone size={18} /></span>
            <div><h2 className="font-serif text-xl">Kontak</h2><p className="text-xs text-stone-500">Informasi hubungan pelanggan</p></div>
          </div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <FormField label="Nomor WhatsApp" error={fieldErrors.whatsappNumber}>
              <input value={form.whatsappNumber} onChange={(e) => setForm((f) => ({ ...f, whatsappNumber: e.target.value }))} placeholder="628123456789" className="mt-1 h-10 w-full rounded-xl border border-stone-300 bg-white px-4 text-sm" />
            </FormField>
            <FormField label="Email" error={fieldErrors.email}>
              <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="info@frozenstore.id" className="mt-1 h-10 w-full rounded-xl border border-stone-300 bg-white px-4 text-sm" />
            </FormField>
          </div>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <FormField label="Alamat" error={fieldErrors.address}>
              <textarea rows={3} value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm" />
            </FormField>
            <FormField label="Jam Operasional" error={fieldErrors.operatingHours}>
              <input value={form.operatingHours} onChange={(e) => setForm((f) => ({ ...f, operatingHours: e.target.value }))} placeholder="Senin–Sabtu 08:00–17:00" className="mt-1 h-10 w-full rounded-xl border border-stone-300 bg-white px-4 text-sm" />
            </FormField>
          </div>
          <div className="mt-5">
            <FormField label="Threshold Gratis Ongkir (Rp)" error={fieldErrors.freeShippingThreshold}>
              <input type="number" min="0" value={form.freeShippingThreshold} onChange={(e) => setForm((f) => ({ ...f, freeShippingThreshold: e.target.value }))} placeholder="100000" className="mt-1 h-10 w-full rounded-xl border border-stone-300 bg-white px-4 text-sm" />
            </FormField>
          </div>
        </section>

        <section className="rounded-3xl border border-stone-200 bg-white p-6">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-stone-100 text-stone-700"><Globe size={18} /></span>
            <div><h2 className="font-serif text-xl">Media sosial</h2><p className="text-xs text-stone-500">Tautan profil media sosial</p></div>
          </div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <FormField label="Instagram" error={fieldErrors.instagramUrl}>
              <input value={form.instagramUrl} onChange={(e) => setForm((f) => ({ ...f, instagramUrl: e.target.value }))} placeholder="https://instagram.com/..." className="mt-1 h-10 w-full rounded-xl border border-stone-300 bg-white px-4 text-sm" />
            </FormField>
            <FormField label="TikTok" error={fieldErrors.tiktokUrl}>
              <input value={form.tiktokUrl} onChange={(e) => setForm((f) => ({ ...f, tiktokUrl: e.target.value }))} placeholder="https://tiktok.com/..." className="mt-1 h-10 w-full rounded-xl border border-stone-300 bg-white px-4 text-sm" />
            </FormField>
            <FormField label="YouTube" error={fieldErrors.youtubeUrl}>
              <input value={form.youtubeUrl} onChange={(e) => setForm((f) => ({ ...f, youtubeUrl: e.target.value }))} placeholder="https://youtube.com/..." className="mt-1 h-10 w-full rounded-xl border border-stone-300 bg-white px-4 text-sm" />
            </FormField>
            <FormField label="Facebook" error={fieldErrors.facebookUrl}>
              <input value={form.facebookUrl} onChange={(e) => setForm((f) => ({ ...f, facebookUrl: e.target.value }))} placeholder="https://facebook.com/..." className="mt-1 h-10 w-full rounded-xl border border-stone-300 bg-white px-4 text-sm" />
            </FormField>
          </div>
        </section>

        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="inline-flex h-11 items-center gap-2 rounded-full bg-stone-900 px-6 text-sm font-semibold text-white hover:bg-[var(--brand-700)] disabled:opacity-60">
            <Save size={16} />{saving ? "Menyimpan..." : "Simpan pengaturan"}
          </button>
        </div>
      </form>
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
