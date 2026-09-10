"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle2, ImagePlus, PackagePlus } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ApiError, apiFetch } from "@/lib/client-api";
import { AdminImageUpload } from "@/components/admin-image-upload";

type FormData = {
  sku: string;
  name: string;
  category: string;
  description: string;
  price: string;
  stock: string;
  imageUrl: string;
  slug: string;
  shortDescription: string;
  compareAtPrice: string;
  weightValue: string;
  weightUnit: string;
  piecesMin: string;
  piecesMax: string;
  isFeatured: boolean;
  isBestSeller: boolean;
  isNew: boolean;
  isPromo: boolean;
  articleId: string;
  storageInstructions: string;
  seoTitle: string;
  seoDescription: string;
};

type Errors = Partial<Record<keyof FormData, string>>;

const inputClass = "mt-2 h-10 w-full rounded-xl border border-stone-300 bg-white px-4 text-sm outline-none focus:border-[var(--brand-600)] focus:ring-4 focus:ring-[var(--brand-600)]/10";
const textareaClass = "mt-2 w-full resize-y rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none focus:border-[var(--brand-600)] focus:ring-4 focus:ring-[var(--brand-600)]/10";

const initialData: FormData = {
  sku: "",
  name: "",
  category: "",
  description: "",
  price: "",
  stock: "",
  imageUrl: "",
  slug: "",
  shortDescription: "",
  compareAtPrice: "",
  weightValue: "",
  weightUnit: "g",
  piecesMin: "",
  piecesMax: "",
  isFeatured: false,
  isBestSeller: false,
  isNew: false,
  isPromo: false,
  articleId: "",
  storageInstructions: "",
  seoTitle: "",
  seoDescription: "",
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function AdminProductForm() {
  const router = useRouter();
  const [data, setData] = useState<FormData>(initialData);
  const [articles, setArticles] = useState<{ id: string; title: string }[]>([]);

  useEffect(() => {
    fetch("/api/admin/articles")
      .then((r) => r.json())
      .then((json) => {
        if (json.data) setArticles(json.data);
      })
      .catch(() => {});
  }, []);
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  function update<K extends keyof FormData>(field: K, value: FormData[K]) {
    setData((current) => {
      const next = { ...current, [field]: value };
      if (field === "name" && !slugManuallyEdited) {
        next.slug = slugify(value as string);
      }
      return next;
    });
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
    if (!/^(https?:\/\/|\/)/.test(data.imageUrl)) next.imageUrl = "Masukkan URL gambar yang valid";
    if (data.compareAtPrice && (!Number.isInteger(Number(data.compareAtPrice)) || Number(data.compareAtPrice) < 0)) next.compareAtPrice = "Harga banding harus bilangan bulat non-negatif";
    if (data.weightValue && (!Number.isInteger(Number(data.weightValue)) || Number(data.weightValue) < 0)) next.weightValue = "Berat harus bilangan bulat non-negatif";
    if (data.piecesMin && (!Number.isInteger(Number(data.piecesMin)) || Number(data.piecesMin) < 0)) next.piecesMin = "Minimal piece harus bilangan bulat non-negatif";
    if (data.piecesMax && (!Number.isInteger(Number(data.piecesMax)) || Number(data.piecesMax) < 0)) next.piecesMax = "Maksimal piece harus bilangan bulat non-negatif";
    if (data.piecesMin && data.piecesMax && Number(data.piecesMin) > Number(data.piecesMax)) next.piecesMax = "Maksimal piece harus ≥ minimal piece";
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await apiFetch("/api/admin/products", {
        method: "POST",
        body: JSON.stringify({
          sku: normalizedSku,
          name: data.name,
          category: data.category,
          description: data.description,
          price: Number(data.price),
          stock: Number(data.stock),
          imageUrl: data.imageUrl,
          slug: data.slug || null,
          shortDescription: data.shortDescription,
          compareAtPrice: data.compareAtPrice ? Number(data.compareAtPrice) : null,
          weightValue: data.weightValue ? Number(data.weightValue) : null,
          weightUnit: data.weightUnit,
          piecesMin: data.piecesMin ? Number(data.piecesMin) : null,
          piecesMax: data.piecesMax ? Number(data.piecesMax) : null,
          isFeatured: data.isFeatured,
          isBestSeller: data.isBestSeller,
          isNew: data.isNew,
          isPromo: data.isPromo,
          articleId: data.articleId || null,
          storageInstructions: data.storageInstructions,
          seoTitle: data.seoTitle || null,
          seoDescription: data.seoDescription || null,
        }),
      });
      setSubmitted(true);
      window.setTimeout(() => { router.push("/admin/produk"); router.refresh(); }, 800);
    } catch (caught) {
      if (caught instanceof ApiError && caught.code === "PRODUCT_SKU_EXISTS") setErrors((current) => ({ ...current, sku: caught.message }));
      setSubmitError(caught instanceof Error ? caught.message : "Gagal menyimpan produk");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/admin/produk" className="inline-flex items-center gap-2 text-sm font-semibold text-stone-600 hover:text-[var(--brand-600)]"><ArrowLeft size={16} />Kembali ke daftar produk</Link>
      <div className="mt-6"><p className="text-sm font-semibold text-[var(--brand-600)]">Katalog baru</p><h1 className="mt-1 font-serif text-4xl tracking-tight">Tambah produk</h1><p className="mt-2 text-sm text-stone-500">Lengkapi informasi produk dan stok awal untuk menerbitkannya ke katalog.</p></div>

      {submitted ? <div role="status" className="mt-7 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-800"><CheckCircle2 size={21} /><span><strong>Produk berhasil disimpan.</strong> Mengarahkan ke daftar produk...</span></div> : null}
      {submitError ? <p role="alert" className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{submitError}</p> : null}

      <form onSubmit={submit} noValidate className="mt-7 space-y-6">
        <Section title="Informasi Dasar" icon={<PackagePlus size={19} />}>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field name="name" label="Nama produk" error={errors.name}>
              <input id="name" value={data.name} onChange={(e) => update("name", e.target.value)} placeholder="Nama yang tampil di katalog" className={inputClass} aria-invalid={Boolean(errors.name)} />
            </Field>
            <Field name="sku" label="SKU unik" error={errors.sku}>
              <input id="sku" value={data.sku} onChange={(e) => update("sku", e.target.value.toUpperCase())} placeholder="Contoh: RF-TS-009" className={inputClass} aria-invalid={Boolean(errors.sku)} />
            </Field>
            <Field name="slug" label="Slug" error={errors.slug}>
              <input id="slug" value={data.slug} onChange={(e) => { setSlugManuallyEdited(true); update("slug", e.target.value); }} placeholder="otomatis dari nama" className={inputClass} aria-invalid={Boolean(errors.slug)} />
            </Field>
            <Field name="category" label="Kategori" error={errors.category}>
              <input id="category" value={data.category} onChange={(e) => update("category", e.target.value)} placeholder="Contoh: Bakso & Sosis" className={inputClass} aria-invalid={Boolean(errors.category)} />
            </Field>
            <div className="sm:col-span-2">
              <Field name="shortDescription" label="Deskripsi singkat" error={errors.shortDescription}>
                <input id="shortDescription" value={data.shortDescription} onChange={(e) => update("shortDescription", e.target.value)} placeholder="Ringkasan produk untuk kartu katalog" className={inputClass} aria-invalid={Boolean(errors.shortDescription)} />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field name="description" label="Deskripsi lengkap" error={errors.description}>
                <textarea id="description" rows={5} value={data.description} onChange={(e) => update("description", e.target.value)} placeholder="Jelaskan bahan, fungsi, dan keunggulan produk" className={textareaClass} aria-invalid={Boolean(errors.description)} />
              </Field>
            </div>
          </div>
        </Section>

        <Section title="Harga & Stok" icon={null}>
          <div className="grid gap-5 sm:grid-cols-3">
            <Field name="price" label="Harga jual (Rp)" error={errors.price}>
              <input id="price" type="number" min="1" step="1" value={data.price} onChange={(e) => update("price", e.target.value)} placeholder="189000" className={inputClass} aria-invalid={Boolean(errors.price)} />
            </Field>
            <Field name="compareAtPrice" label="Harga banding (Rp)" error={errors.compareAtPrice}>
              <input id="compareAtPrice" type="number" min="0" step="1" value={data.compareAtPrice} onChange={(e) => update("compareAtPrice", e.target.value)} placeholder="Opsional" className={inputClass} aria-invalid={Boolean(errors.compareAtPrice)} />
            </Field>
            <Field name="stock" label="Stok awal" error={errors.stock}>
              <input id="stock" type="number" min="0" step="1" value={data.stock} onChange={(e) => update("stock", e.target.value)} placeholder="0" className={inputClass} aria-invalid={Boolean(errors.stock)} />
            </Field>
          </div>
        </Section>

        <Section title="Detail Produk" icon={null}>
          <div className="grid gap-5 sm:grid-cols-4">
            <Field name="weightValue" label="Berat" error={errors.weightValue}>
              <input id="weightValue" type="number" min="0" step="1" value={data.weightValue} onChange={(e) => update("weightValue", e.target.value)} placeholder="500" className={inputClass} aria-invalid={Boolean(errors.weightValue)} />
            </Field>
            <Field name="weightUnit" label="Satuan" error={errors.weightUnit}>
              <select id="weightUnit" value={data.weightUnit} onChange={(e) => update("weightUnit", e.target.value)} className={inputClass}>
                <option value="g">gram (g)</option>
                <option value="kg">kilogram (kg)</option>
              </select>
            </Field>
            <Field name="piecesMin" label="Min piece/pack" error={errors.piecesMin}>
              <input id="piecesMin" type="number" min="0" step="1" value={data.piecesMin} onChange={(e) => update("piecesMin", e.target.value)} placeholder="Opsional" className={inputClass} aria-invalid={Boolean(errors.piecesMin)} />
            </Field>
            <Field name="piecesMax" label="Maks piece/pack" error={errors.piecesMax}>
              <input id="piecesMax" type="number" min="0" step="1" value={data.piecesMax} onChange={(e) => update("piecesMax", e.target.value)} placeholder="Opsional" className={inputClass} aria-invalid={Boolean(errors.piecesMax)} />
            </Field>
          </div>
        </Section>

        <Section title="Penanda" icon={null}>
          <div className="flex flex-wrap gap-6">
            <Checkbox label="Produk Unggulan" checked={data.isFeatured} onChange={(v) => update("isFeatured", v)} />
            <Checkbox label="Best Seller" checked={data.isBestSeller} onChange={(v) => update("isBestSeller", v)} />
            <Checkbox label="Produk Baru" checked={data.isNew} onChange={(v) => update("isNew", v)} />
            <Checkbox label="Sedang Promo" checked={data.isPromo} onChange={(v) => update("isPromo", v)} />
          </div>
        </Section>

        <Section title="Media" icon={<ImagePlus size={19} />}>
          <div className="sm:col-span-2">
            <AdminImageUpload
              value={data.imageUrl}
              onChange={(url) => update("imageUrl", url)}
              folder="products"
              error={errors.imageUrl}
            />
          </div>
        </Section>

        <Section title="Instruksi & Panduan" icon={null}>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field name="articleId" label="Artikel Panduan Memasak" error={errors.articleId}>
              <select id="articleId" value={data.articleId} onChange={(e) => update("articleId", e.target.value)} className={inputClass}>
                <option value="">— Tidak ada panduan —</option>
                {articles.map(a => (
                  <option key={a.id} value={a.id}>{a.title}</option>
                ))}
              </select>
            </Field>
            <Field name="storageInstructions" label="Cara penyimpanan" error={errors.storageInstructions}>
              <textarea id="storageInstructions" rows={4} value={data.storageInstructions} onChange={(e) => update("storageInstructions", e.target.value)} placeholder="Contoh: Simpan di suhu -18°C..." className={textareaClass} />
            </Field>
          </div>
        </Section>

        <Section title="SEO" icon={null}>
          <div className="space-y-5">
            <Field name="seoTitle" label="Judul SEO" error={errors.seoTitle}>
              <input id="seoTitle" value={data.seoTitle} onChange={(e) => update("seoTitle", e.target.value)} placeholder="Judul halaman produk untuk mesin pencari" className={inputClass} />
            </Field>
            <Field name="seoDescription" label="Deskripsi SEO" error={errors.seoDescription}>
              <textarea id="seoDescription" rows={3} value={data.seoDescription} onChange={(e) => update("seoDescription", e.target.value)} placeholder="Deskripsi meta untuk mesin pencari (120–160 karakter)" className={textareaClass} />
            </Field>
          </div>
        </Section>

        <div className="flex flex-col-reverse gap-3 border-t border-stone-100 pt-6 sm:flex-row sm:justify-end">
          <Link href="/admin/produk" className="inline-flex h-11 items-center justify-center rounded-full border border-stone-300 px-5 text-sm font-semibold text-stone-700">Batal</Link>
          <button type="submit" disabled={isSubmitting} className="h-11 rounded-full bg-stone-900 px-6 text-sm font-semibold text-white hover:bg-[var(--brand-700)] disabled:bg-stone-400">{isSubmitting ? "Menyimpan..." : "Simpan produk"}</button>
        </div>
      </form>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-stone-200 bg-white p-6">
      <div className="flex items-center gap-2 border-b border-stone-100 pb-4">
        {icon ? <span className="grid size-9 place-items-center rounded-xl bg-[var(--brand-50)] text-[var(--brand-600)]">{icon}</span> : null}
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--ink-700)]">{title}</h2>
      </div>
      <div className="pt-5">{children}</div>
    </div>
  );
}

function Field({ name, label, error, children }: { name: string; label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={name} className="text-sm font-medium text-[var(--ink-950)]">{label}</label>
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
