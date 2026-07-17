"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle2, ImagePlus, PackagePlus } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, apiFetch } from "@/lib/client-api";

type ProductFormData = { sku: string; name: string; category: string; description: string; price: string; stock: string; imageUrl: string };
type Errors = Partial<Record<keyof ProductFormData, string>>;
const inputClass = "mt-2 h-12 w-full rounded-xl border border-stone-300 bg-white px-4 text-sm outline-none focus:border-orange-600 focus:ring-4 focus:ring-orange-600/10";

export function AdminProductForm() {
  const router = useRouter();
  const [data, setData] = useState<ProductFormData>({ sku: "", name: "", category: "", description: "", price: "", stock: "", imageUrl: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function update(field: keyof ProductFormData, value: string) {
    setData((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setSubmitted(false);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next: Errors = {};
    const normalizedSku = data.sku.trim().toUpperCase();
    if (!/^[A-Z0-9-]{3,30}$/.test(normalizedSku)) next.sku = "SKU harus 3–30 karakter (huruf, angka, atau tanda hubung)";
    if (data.name.trim().length < 3) next.name = "Nama produk minimal 3 karakter";
    if (data.category.trim().length < 3) next.category = "Kategori wajib diisi";
    if (data.description.trim().length < 10) next.description = "Deskripsi minimal 10 karakter";
    if (!Number.isInteger(Number(data.price)) || Number(data.price) < 1) next.price = "Harga harus berupa bilangan bulat positif";
    if (!Number.isInteger(Number(data.stock)) || Number(data.stock) < 0) next.stock = "Stok awal harus bilangan bulat non-negatif";
    if (!/^https?:\/\//.test(data.imageUrl)) next.imageUrl = "Masukkan URL gambar yang valid";
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await apiFetch("/api/admin/products", { method: "POST", body: JSON.stringify({ ...data, sku: normalizedSku, price: Number(data.price), stock: Number(data.stock) }) });
      setSubmitted(true);
      window.setTimeout(() => { router.push("/admin/produk"); router.refresh(); }, 800);
    } catch (caught) {
      if (caught instanceof ApiError && caught.code === "PRODUCT_SKU_EXISTS") setErrors((current) => ({ ...current, sku: caught.message }));
      setSubmitError(caught instanceof Error ? caught.message : "Gagal menyimpan produk");
    } finally { setIsSubmitting(false); }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/admin/produk" className="inline-flex items-center gap-2 text-sm font-semibold text-stone-600 hover:text-orange-700"><ArrowLeft size={16} />Kembali ke daftar produk</Link>
      <div className="mt-6"><p className="text-sm font-semibold text-orange-700">Katalog baru</p><h1 className="mt-1 font-serif text-4xl tracking-tight">Tambah produk</h1><p className="mt-2 text-sm text-stone-500">Lengkapi informasi produk dan stok awal untuk menerbitkannya ke katalog.</p></div>

      {submitted ? <div role="status" className="mt-7 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-800"><CheckCircle2 size={21} /><span><strong>Produk berhasil disimpan.</strong> Mengarahkan ke daftar produk...</span></div> : null}
      {submitError ? <p role="alert" className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{submitError}</p> : null}

      <form onSubmit={submit} noValidate className="mt-7 rounded-3xl border border-stone-200 bg-white p-6 sm:p-8">
        <div className="flex items-center gap-3 border-b border-stone-100 pb-5"><span className="grid size-10 place-items-center rounded-xl bg-orange-100 text-orange-700"><PackagePlus size={19} /></span><div><h2 className="font-serif text-2xl">Informasi produk</h2><p className="text-xs text-stone-500">Semua field wajib diisi.</p></div></div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <Field name="sku" label="SKU unik" error={errors.sku}><input id="sku" value={data.sku} onChange={(event) => update("sku", event.target.value.toUpperCase())} placeholder="Contoh: RF-TS-009" className={inputClass} aria-invalid={Boolean(errors.sku)} /></Field>
          <Field name="name" label="Nama produk" error={errors.name}><input id="name" value={data.name} onChange={(event) => update("name", event.target.value)} placeholder="Nama yang tampil di katalog" className={inputClass} aria-invalid={Boolean(errors.name)} /></Field>
          <Field name="category" label="Kategori" error={errors.category}><input id="category" value={data.category} onChange={(event) => update("category", event.target.value)} placeholder="Contoh: Tas & Aksesori" className={inputClass} aria-invalid={Boolean(errors.category)} /></Field>
          <Field name="price" label="Harga (Rp)" error={errors.price}><input id="price" type="number" min="1" step="1" value={data.price} onChange={(event) => update("price", event.target.value)} placeholder="189000" className={inputClass} aria-invalid={Boolean(errors.price)} /></Field>
          <Field name="stock" label="Stok awal" error={errors.stock}><input id="stock" type="number" min="0" step="1" value={data.stock} onChange={(event) => update("stock", event.target.value)} placeholder="0" className={inputClass} aria-invalid={Boolean(errors.stock)} /></Field>
          <Field name="imageUrl" label="URL langsung gambar produk" error={errors.imageUrl}><div className="relative"><ImagePlus className="absolute left-4 top-6 text-stone-400" size={17} /><input id="imageUrl" value={data.imageUrl} onChange={(event) => update("imageUrl", event.target.value)} placeholder="https://.../foto-produk.jpg" className={`${inputClass} pl-11`} aria-invalid={Boolean(errors.imageUrl)} /></div></Field>
          <div className="sm:col-span-2"><Field name="description" label="Deskripsi" error={errors.description}><textarea id="description" rows={5} value={data.description} onChange={(event) => update("description", event.target.value)} placeholder="Jelaskan bahan, fungsi, dan keunggulan produk" className="mt-2 w-full resize-y rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none focus:border-orange-600 focus:ring-4 focus:ring-orange-600/10" aria-invalid={Boolean(errors.description)} /></Field></div>
        </div>
        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-stone-100 pt-6 sm:flex-row sm:justify-end"><Link href="/admin/produk" className="inline-flex h-11 items-center justify-center rounded-full border border-stone-300 px-5 text-sm font-semibold text-stone-700">Batal</Link><button type="submit" disabled={isSubmitting} className="h-11 rounded-full bg-stone-900 px-6 text-sm font-semibold text-white hover:bg-orange-700 disabled:bg-stone-400">{isSubmitting ? "Menyimpan..." : "Simpan produk"}</button></div>
      </form>
    </div>
  );
}

function Field({ name, label, error, children }: { name: string; label: string; error?: string; children: React.ReactNode }) {
  return <div><label htmlFor={name} className="text-sm font-semibold text-stone-800">{label}</label>{children}{error ? <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p> : null}</div>;
}
