"use client";

import Link from "next/link";
import { AlertTriangle, ArrowLeft, CheckCircle2, LockKeyhole, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { ApiError, apiFetch } from "@/lib/client-api";
import { AdminImageUpload } from "@/components/admin-image-upload";
import type { Product } from "@/types/product";

type Category = { id: string; name: string };

const inputClass = "mt-2 h-10 w-full rounded-xl border border-stone-300 bg-white px-4 text-sm outline-none focus:border-[var(--brand-600)] focus:ring-4 focus:ring-[var(--brand-600)]/10 disabled:cursor-not-allowed disabled:bg-stone-100 disabled:text-stone-500";
const textareaClass = "mt-2 w-full resize-y rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none focus:border-[var(--brand-600)] focus:ring-4 focus:ring-[var(--brand-600)]/10";

export function AdminEditProductForm({ product }: { product: Product }) {
  const [data, setData] = useState(product);
  const [skuUnlocked, setSkuUnlocked] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [articles, setArticles] = useState<{ id: string; title: string }[]>([]);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((json: { data?: Category[] }) => {
        if (json.data) setCategories(json.data);
      })
      .catch(() => {});
    fetch("/api/admin/articles")
      .then((r) => r.json())
      .then((json: { data?: { id: string; title: string }[] }) => {
        if (json.data) setArticles(json.data);
      })
      .catch(() => {});
  }, []);

  function update<K extends keyof Product>(field: K, value: Product[K]) {
    setData((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
    setSaved(false);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next: Record<string, string> = {};
    const sku = data.sku.trim().toUpperCase();
    if (!/^[A-Z0-9-]{3,30}$/.test(sku)) next.sku = "Format SKU tidak valid";
    if (data.name.trim().length < 3) next.name = "Nama minimal 3 karakter";
    if (data.category.trim().length < 3) next.category = "Kategori wajib diisi";
    if (data.description.trim().length < 10) next.description = "Deskripsi minimal 10 karakter";
    if (!Number.isInteger(data.price) || data.price < 1) next.price = "Harga harus bilangan bulat positif";
    if (!/^(https?:\/\/|\/)/.test(data.imageUrl)) next.imageUrl = "URL gambar tidak valid";
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const payload = await apiFetch<{ product: Product }>(`/api/admin/products/${encodeURIComponent(product.id)}`, {
        method: "PATCH",
        body: JSON.stringify({
          sku,
          name: data.name,
          category: data.category,
          description: data.description,
          price: data.price,
          imageUrl: data.imageUrl,
          slug: data.slug || null,
          shortDescription: data.shortDescription,
          compareAtPrice: data.compareAtPrice,
          weightValue: data.weightValue,
          weightUnit: data.weightUnit,
          piecesMin: data.piecesMin,
          piecesMax: data.piecesMax,
          isFeatured: data.isFeatured,
          isBestSeller: data.isBestSeller,
          isNew: data.isNew,
          isPromo: data.isPromo,
          isActive: data.isActive,
          articleId: data.articleId || null,
          storageInstructions: data.storageInstructions,
          seoTitle: data.seoTitle,
          seoDescription: data.seoDescription,
          categoryId: data.categoryId,
        }),
      });
      setData(payload.product);
      setSaved(true);
    } catch (caught) {
      if (caught instanceof ApiError && caught.code === "PRODUCT_SKU_EXISTS") setErrors((current) => ({ ...current, sku: caught.message }));
      setSubmitError(caught instanceof Error ? caught.message : "Gagal menyimpan perubahan");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/admin/produk" className="inline-flex items-center gap-2 text-sm font-semibold text-stone-600 hover:text-[var(--brand-600)]"><ArrowLeft size={16} />Kembali ke produk</Link>
      <div className="mt-6"><p className="text-sm font-semibold text-[var(--brand-600)]">{product.sku}</p><h1 className="mt-1 font-serif text-4xl tracking-tight">Edit produk</h1><p className="mt-2 text-sm text-stone-500">Perbarui informasi katalog tanpa mengubah stok dari halaman ini.</p></div>
      {saved ? <div role="status" className="mt-7 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-800"><CheckCircle2 size={20} /><strong>Perubahan produk berhasil disimpan.</strong></div> : null}
      {submitError ? <p role="alert" className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{submitError}</p> : null}

      <form onSubmit={submit} className="mt-7 space-y-6">
        <Section title="Informasi Dasar">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="SKU produk" error={errors.sku}>
              <div className="relative">
                <input id="edit-sku" disabled={!skuUnlocked} value={data.sku} onChange={(e) => update("sku", e.target.value.toUpperCase())} className={`${inputClass} pr-12`} />
                <LockKeyhole className="absolute right-4 top-[11px] text-stone-400" size={17} />
              </div>
              {errors.sku ? <p className="mt-1.5 text-xs font-medium text-red-600">{errors.sku}</p> : null}
              <label className="mt-3 flex cursor-pointer items-start gap-2 text-xs leading-5 text-stone-500">
                <input type="checkbox" checked={skuUnlocked} onChange={(e) => setSkuUnlocked(e.target.checked)} className="mt-0.5 accent-[var(--brand-600)]" />
                <span>Izinkan perubahan SKU. Perubahan dapat memengaruhi proses gudang.</span>
              </label>
            </Field>
            <Field label="Nama produk" error={errors.name}>
              <input value={data.name} onChange={(e) => update("name", e.target.value)} className={inputClass} />
            </Field>
            <Field label="Slug" error={errors.slug}>
              <input value={data.slug ?? ""} onChange={(e) => update("slug", e.target.value || null)} placeholder="otomatis dari nama" className={inputClass} />
            </Field>
            <Field label="Kategori (teks)" error={errors.category}>
              <input value={data.category} onChange={(e) => update("category", e.target.value)} className={inputClass} />
            </Field>
            <Field label="ID Kategori" error={errors.categoryId}>
              <select value={data.categoryId ?? ""} onChange={(e) => update("categoryId", e.target.value || null)} className={inputClass}>
                <option value="">— Pilih kategori —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </Field>
            <div className="sm:col-span-2">
              <Field label="Deskripsi singkat" error={errors.shortDescription}>
                <input value={data.shortDescription} onChange={(e) => update("shortDescription", e.target.value)} placeholder="Ringkasan produk untuk kartu katalog" className={inputClass} />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Deskripsi lengkap" error={errors.description}>
                <textarea rows={5} value={data.description} onChange={(e) => update("description", e.target.value)} className={textareaClass} />
              </Field>
            </div>
          </div>
        </Section>

        <Section title="Harga & Stok">
          <div className="grid gap-5 sm:grid-cols-3">
            <Field label="Harga jual (Rp)" error={errors.price}>
              <input type="number" min="1" value={data.price} onChange={(e) => update("price", Number(e.target.value))} className={inputClass} />
            </Field>
            <Field label="Harga banding (Rp)" error={errors.compareAtPrice}>
              <input type="number" min="0" value={data.compareAtPrice ?? ""} onChange={(e) => update("compareAtPrice", e.target.value ? Number(e.target.value) : null)} placeholder="Opsional" className={inputClass} />
            </Field>
            <Field label="Stok saat ini">
              <div className="mt-2 flex h-10 items-center justify-between rounded-xl bg-stone-100 px-4 text-sm">
                <span className="font-semibold">{data.stock} unit</span>
                <Link href={`/admin/produk/${product.id}/stok`} className="font-semibold text-[var(--brand-600)]">Kelola stok</Link>
              </div>
            </Field>
          </div>
        </Section>

        <Section title="Detail Produk">
          <div className="grid gap-5 sm:grid-cols-4">
            <Field label="Berat">
              <input type="number" min="0" step="1" value={data.weightValue ?? ""} onChange={(e) => update("weightValue", e.target.value ? Number(e.target.value) : null)} placeholder="500" className={inputClass} />
            </Field>
            <Field label="Satuan">
              <select value={data.weightUnit} onChange={(e) => update("weightUnit", e.target.value)} className={inputClass}>
                <option value="g">gram (g)</option>
                <option value="kg">kilogram (kg)</option>
              </select>
            </Field>
            <Field label="Min piece/pack">
              <input type="number" min="0" step="1" value={data.piecesMin ?? ""} onChange={(e) => update("piecesMin", e.target.value ? Number(e.target.value) : null)} placeholder="Opsional" className={inputClass} />
            </Field>
            <Field label="Maks piece/pack">
              <input type="number" min="0" step="1" value={data.piecesMax ?? ""} onChange={(e) => update("piecesMax", e.target.value ? Number(e.target.value) : null)} placeholder="Opsional" className={inputClass} />
            </Field>
          </div>
        </Section>

        <Section title="Status">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={data.isActive}
              onChange={(e) => update("isActive", e.target.checked)}
              className="mt-0.5 accent-[var(--brand-600)]"
            />
            <span>
              <span className="block text-sm font-semibold text-[var(--ink-950)]">Produk aktif</span>
              <span className="block text-xs leading-5 text-stone-500">Tampilkan produk di toko. Stok masuk hanya dapat dicatat untuk produk aktif dan berharga di atas 0.</span>
            </span>
          </label>
        </Section>

        <Section title="Penanda">
          <div className="flex flex-wrap gap-6">
            <Checkbox label="Produk Unggulan" checked={data.isFeatured} onChange={(v) => update("isFeatured", v)} />
            <Checkbox label="Best Seller" checked={data.isBestSeller} onChange={(v) => update("isBestSeller", v)} />
            <Checkbox label="Produk Baru" checked={data.isNew} onChange={(v) => update("isNew", v)} />
            <Checkbox label="Sedang Promo" checked={data.isPromo} onChange={(v) => update("isPromo", v)} />
          </div>
        </Section>

        <Section title="Media">
          <AdminImageUpload
            value={data.imageUrl}
            onChange={(url) => update("imageUrl", url)}
            folder="products"
            error={errors.imageUrl}
          />
        </Section>

        <Section title="Instruksi & Panduan">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Artikel Panduan Memasak">
              <select value={data.articleId ?? ""} onChange={(e) => update("articleId", e.target.value || null)} className={inputClass}>
                <option value="">— Tidak ada panduan —</option>
                {articles.map(a => (
                  <option key={a.id} value={a.id}>{a.title}</option>
                ))}
              </select>
            </Field>
            <Field label="Cara penyimpanan">
              <textarea rows={4} value={data.storageInstructions} onChange={(e) => update("storageInstructions", e.target.value)} placeholder="Contoh: Simpan di suhu -18°C..." className={textareaClass} />
            </Field>
          </div>
        </Section>

        <Section title="SEO">
          <div className="space-y-5">
            <Field label="Judul SEO">
              <input value={data.seoTitle ?? ""} onChange={(e) => update("seoTitle", e.target.value || null)} placeholder="Judul halaman produk untuk mesin pencari" className={inputClass} />
            </Field>
            <Field label="Deskripsi SEO">
              <textarea rows={3} value={data.seoDescription ?? ""} onChange={(e) => update("seoDescription", e.target.value || null)} placeholder="Deskripsi meta untuk mesin pencari (120–160 karakter)" className={textareaClass} />
            </Field>
          </div>
        </Section>

        {skuUnlocked ? <div className="flex gap-3 rounded-xl bg-amber-50 p-4 text-xs leading-5 text-amber-800"><AlertTriangle className="shrink-0" size={18} /><p>Pastikan label fisik gudang ikut diperbarui jika SKU diubah.</p></div> : null}

        <div className="flex justify-end border-t border-stone-100 pt-6">
          <button type="submit" disabled={isSubmitting} className="inline-flex h-11 items-center gap-2 rounded-full bg-stone-900 px-6 text-sm font-semibold text-white hover:bg-[var(--brand-700)] disabled:bg-stone-400"><Save size={16} />{isSubmitting ? "Menyimpan..." : "Simpan perubahan"}</button>
        </div>
      </form>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-stone-200 bg-white p-6">
      <div className="border-b border-stone-100 pb-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--ink-700)]">{title}</h2>
      </div>
      <div className="pt-5">{children}</div>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-sm font-medium text-[var(--ink-950)]">{label}</label>
      {children}
      {error ? <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p> : null}
    </div>
  );
}

function Checkbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-[var(--ink-950)]">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="accent-[var(--brand-600)]" />
      {label}
    </label>
  );
}
