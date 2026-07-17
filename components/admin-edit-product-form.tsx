"use client";

import Link from "next/link";
import { AlertTriangle, ArrowLeft, CheckCircle2, LockKeyhole, Save } from "lucide-react";
import { useState } from "react";
import { ApiError, apiFetch } from "@/lib/client-api";
import type { Product } from "@/types/product";

export function AdminEditProductForm({ product }: { product: Product }) {
  const [data, setData] = useState(product);
  const [skuUnlocked, setSkuUnlocked] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const inputClass = "mt-2 h-12 w-full rounded-xl border border-stone-300 bg-white px-4 text-sm outline-none focus:border-orange-600 focus:ring-4 focus:ring-orange-600/10 disabled:cursor-not-allowed disabled:bg-stone-100 disabled:text-stone-500";

  function update(field: keyof Product, value: string | number) {
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
    if (!/^https?:\/\//.test(data.imageUrl)) next.imageUrl = "URL gambar tidak valid";
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const payload = await apiFetch<{ product: Product }>(`/api/admin/products/${encodeURIComponent(product.id)}`, { method: "PATCH", body: JSON.stringify({ sku, name: data.name, category: data.category, description: data.description, price: data.price, imageUrl: data.imageUrl }) });
      setData(payload.product);
      setSaved(true);
    } catch (caught) {
      if (caught instanceof ApiError && caught.code === "PRODUCT_SKU_EXISTS") setErrors((current) => ({ ...current, sku: caught.message }));
      setSubmitError(caught instanceof Error ? caught.message : "Gagal menyimpan perubahan");
    } finally { setIsSubmitting(false); }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/admin/produk" className="inline-flex items-center gap-2 text-sm font-semibold text-stone-600 hover:text-orange-700"><ArrowLeft size={16} />Kembali ke produk</Link>
      <div className="mt-6"><p className="text-sm font-semibold text-orange-700">{product.sku}</p><h1 className="mt-1 font-serif text-4xl tracking-tight">Edit produk</h1><p className="mt-2 text-sm text-stone-500">Perbarui informasi katalog tanpa mengubah stok dari halaman ini.</p></div>
      {saved ? <div role="status" className="mt-7 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-800"><CheckCircle2 size={20} /><strong>Perubahan produk berhasil disimpan.</strong></div> : null}
      {submitError ? <p role="alert" className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{submitError}</p> : null}

      <form onSubmit={submit} className="mt-7 rounded-3xl border border-stone-200 bg-white p-6 sm:p-8">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="edit-sku" className="text-sm font-semibold">SKU produk</label>
            <div className="relative"><input id="edit-sku" disabled={!skuUnlocked} value={data.sku} onChange={(event) => update("sku", event.target.value.toUpperCase())} className={`${inputClass} pr-12`} /><LockKeyhole className="absolute right-4 top-6 text-stone-400" size={17} /></div>
            {errors.sku ? <p className="mt-1.5 text-xs font-medium text-red-600">{errors.sku}</p> : null}
            <label className="mt-3 flex cursor-pointer items-start gap-2 text-xs leading-5 text-stone-500"><input type="checkbox" checked={skuUnlocked} onChange={(event) => setSkuUnlocked(event.target.checked)} className="mt-0.5 accent-orange-600" /><span>Izinkan perubahan SKU. Perubahan dapat memengaruhi proses gudang.</span></label>
          </div>
          <Field label="Nama produk" error={errors.name}><input value={data.name} onChange={(event) => update("name", event.target.value)} className={inputClass} /></Field>
          <Field label="Kategori" error={errors.category}><input value={data.category} onChange={(event) => update("category", event.target.value)} className={inputClass} /></Field>
          <Field label="Harga (Rp)" error={errors.price}><input type="number" min="1" value={data.price} onChange={(event) => update("price", Number(event.target.value))} className={inputClass} /></Field>
          <Field label="Stok saat ini"><div className="mt-2 flex h-12 items-center justify-between rounded-xl bg-stone-100 px-4 text-sm"><span className="font-semibold">{data.stock} unit</span><Link href={`/admin/produk/${product.id}/stok`} className="font-semibold text-orange-700">Kelola stok</Link></div></Field>
          <Field label="URL langsung gambar" error={errors.imageUrl}><input value={data.imageUrl} onChange={(event) => update("imageUrl", event.target.value)} placeholder="https://.../foto-produk.jpg" className={inputClass} /></Field>
          <div className="sm:col-span-2"><Field label="Deskripsi" error={errors.description}><textarea rows={5} value={data.description} onChange={(event) => update("description", event.target.value)} className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none focus:border-orange-600 focus:ring-4 focus:ring-orange-600/10" /></Field></div>
        </div>
        {skuUnlocked ? <div className="mt-6 flex gap-3 rounded-xl bg-amber-50 p-4 text-xs leading-5 text-amber-800"><AlertTriangle className="shrink-0" size={18} /><p>Pastikan label fisik gudang ikut diperbarui jika SKU diubah.</p></div> : null}
        <div className="mt-7 flex justify-end"><button type="submit" disabled={isSubmitting} className="inline-flex h-11 items-center gap-2 rounded-full bg-stone-900 px-6 text-sm font-semibold text-white hover:bg-orange-700 disabled:bg-stone-400"><Save size={16} />{isSubmitting ? "Menyimpan..." : "Simpan perubahan"}</button></div>
      </form>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <div><p className="text-sm font-semibold">{label}</p>{children}{error ? <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p> : null}</div>;
}
