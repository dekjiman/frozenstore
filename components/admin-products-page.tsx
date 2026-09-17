"use client";

import Link from "next/link";
import { AlertTriangle, Boxes, ChevronDown, Edit3, PackageCheck, Plus, Search, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/client-api";
import type { Product } from "@/types/product";
import { ProductImage } from "@/components/product-image";

const rupiahFormatter = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });

export function AdminProductsPage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const categories = useMemo(
    () => Array.from(new Set(allProducts.map((product) => product.category.trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b, "id")),
    [allProducts],
  );
  const products = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return allProducts.filter((product) => {
      const matchesKeyword = keyword ? [product.name, product.sku, product.category].some((value) => value.toLowerCase().includes(keyword)) : true;
      const matchesCategory = categoryFilter ? product.category.trim() === categoryFilter : true;
      const matchesStatus = statusFilter === "active" ? product.isActive : statusFilter === "inactive" ? !product.isActive : true;
      return matchesKeyword && matchesCategory && matchesStatus;
    });
  }, [allProducts, query, categoryFilter, statusFilter]);
  const totalStock = allProducts.reduce((total, product) => total + product.stock, 0);
  const lowStock = allProducts.filter((product) => product.stock <= 10).length;
  const productToDelete = allProducts.find((product) => product.id === deleteId) ?? null;

  useEffect(() => {
    apiFetch<{ products: Product[] }>("/api/admin/products", { cache: "no-store" })
      .then((payload) => { setAllProducts(payload.products); setError(null); })
      .catch((caught) => setError(caught instanceof Error ? caught.message : "Gagal memuat produk"))
      .finally(() => setIsLoading(false));
  }, []);

  async function deleteProduct(product: Product) {
    try {
      await apiFetch(`/api/admin/products/${encodeURIComponent(product.id)}`, { method: "DELETE" });
      setAllProducts((items) => items.filter((item) => item.id !== product.id));
      setDeleteId(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Gagal menghapus produk");
    }
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-sm font-semibold text-[var(--brand-600)]">Katalog & gudang</p><h1 className="mt-1 font-serif text-4xl tracking-tight">Manajemen produk</h1><p className="mt-2 text-sm text-stone-500">Kelola katalog, SKU, harga, dan stok dalam satu tempat.</p></div>
        <div className="flex flex-col gap-2 sm:flex-row"><Link href="/admin/stok/masuk" className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-stone-300 bg-white px-5 text-sm font-semibold text-stone-700 hover:border-emerald-500 hover:text-emerald-700"><PackageCheck size={17} />Stok masuk</Link><Link href="/admin/produk/baru" className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-stone-900 px-5 text-sm font-semibold text-white hover:bg-[var(--brand-700)]"><Plus size={17} />Tambah produk</Link></div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Stat icon={Boxes} label="Total produk" value={String(allProducts.length)} tone="orange" />
        <Stat icon={PackageCheck} label="Total unit stok" value={String(totalStock)} tone="emerald" />
        <Stat icon={AlertTriangle} label="Stok menipis" value={`${lowStock} produk`} tone="amber" />
      </div>
      {error ? <p role="alert" className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

      <section className="mt-8 overflow-hidden rounded-3xl border border-stone-200 bg-white">
        <div className="flex flex-col gap-4 border-b border-stone-200 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div><h2 className="font-serif text-2xl">Daftar produk</h2><p className="mt-1 text-xs text-stone-500">{isLoading ? "Memuat..." : `${products.length} dari ${allProducts.length} produk`}</p></div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="relative block w-full sm:max-w-xs"><span className="sr-only">Cari produk admin</span><Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari nama atau SKU..." className="h-11 w-full rounded-full border border-stone-300 pl-10 pr-4 text-sm outline-none focus:border-[var(--brand-600)] focus:ring-4 focus:ring-[var(--brand-600)]/10" /></label>
            <label className="relative block w-full sm:w-52"><span className="sr-only">Filter kategori</span><select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="h-11 w-full appearance-none rounded-full border border-stone-300 bg-white pl-4 pr-10 text-sm text-stone-700 outline-none focus:border-[var(--brand-600)] focus:ring-4 focus:ring-[var(--brand-600)]/10"><option value="">Semua kategori</option>{categories.map((category) => <option key={category} value={category}>{category}</option>)}</select><ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400" size={16} /></label>
            <label className="relative block w-full sm:w-44"><span className="sr-only">Filter status produk</span><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="h-11 w-full appearance-none rounded-full border border-stone-300 bg-white pl-4 pr-10 text-sm text-stone-700 outline-none focus:border-[var(--brand-600)] focus:ring-4 focus:ring-[var(--brand-600)]/10"><option value="">Semua status</option><option value="active">Aktif</option><option value="inactive">Nonaktif</option></select><ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400" size={16} /></label>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-500"><tr><th className="px-5 py-4 font-semibold">Produk</th><th className="px-5 py-4 font-semibold">SKU</th><th className="px-5 py-4 font-semibold">Kategori</th><th className="px-5 py-4 font-semibold">Harga</th><th className="px-5 py-4 font-semibold">Stok</th><th className="px-5 py-4 font-semibold">Status</th><th className="px-5 py-4"><span className="sr-only">Aksi</span></th></tr></thead>
            <tbody className="divide-y divide-stone-100">
              {products.map((product) => <tr key={product.id} className="hover:bg-stone-50/80"><td className="px-5 py-4"><div className="flex items-center gap-3"><ProductImage src={product.imageUrl} alt={product.name} variant="admin" /><div className="flex min-w-0 flex-col items-start gap-1"><span className="max-w-52 truncate font-semibold text-stone-900">{product.name}</span><span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${product.isActive ? "bg-emerald-100 text-emerald-800" : "bg-stone-200 text-stone-700"}`}>{product.isActive ? "Aktif" : "Nonaktif"}</span></div></div></td><td className="px-5 py-4 font-mono text-xs text-stone-600">{product.sku}</td><td className="px-5 py-4 text-stone-600">{product.category}</td><td className="px-5 py-4 font-medium">{rupiahFormatter.format(product.price)}</td><td className="px-5 py-4"><span className={product.stock <= 10 ? "font-bold text-amber-700" : "font-semibold text-stone-800"}>{product.stock}</span></td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${product.stock <= 10 ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}`}>{product.stock <= 10 ? "Stok menipis" : "Tersedia"}</span></td><td className="px-5 py-4"><div className="flex justify-end gap-1"><Link href={`/admin/produk/${product.id}/edit`} aria-label={`Edit ${product.name}`} className="grid size-9 place-items-center rounded-full text-stone-500 hover:bg-stone-200"><Edit3 size={16} /></Link><button type="button" onClick={() => setDeleteId(product.id)} aria-label={`Hapus ${product.name}`} className="grid size-9 place-items-center rounded-full text-stone-400 hover:bg-red-50 hover:text-red-600"><Trash2 size={16} /></button></div></td></tr>)}
            </tbody>
          </table>
        </div>
      </section>

      {productToDelete ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-stone-950/55 p-5" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setDeleteId(null); }}>
          <div role="dialog" aria-modal="true" aria-labelledby="delete-title" className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-7">
            <div className="flex items-start justify-between gap-4"><span className="grid size-12 place-items-center rounded-full bg-red-100 text-red-600"><Trash2 size={21} /></span><button type="button" onClick={() => setDeleteId(null)} aria-label="Tutup konfirmasi hapus" className="grid size-9 place-items-center rounded-full text-stone-500 hover:bg-stone-100"><X size={18} /></button></div>
            <h2 id="delete-title" className="mt-5 font-serif text-3xl text-stone-900">Hapus produk?</h2>
            <p className="mt-3 text-sm leading-6 text-stone-600">Produk <strong>{productToDelete.name}</strong> dengan SKU <strong>{productToDelete.sku}</strong> akan dinonaktifkan dan dihapus dari katalog publik.</p>
            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button type="button" onClick={() => setDeleteId(null)} className="h-11 rounded-full border border-stone-300 px-5 text-sm font-semibold text-stone-700">Batal</button><button type="button" onClick={() => void deleteProduct(productToDelete)} className="h-11 rounded-full bg-red-600 px-5 text-sm font-semibold text-white hover:bg-red-700">Ya, hapus produk</button></div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Stat({ icon: Icon, label, value, tone }: { icon: typeof Boxes; label: string; value: string; tone: "orange" | "emerald" | "amber" }) {
  const tones = { orange: "bg-[var(--brand-50)] text-[var(--brand-600)]", emerald: "bg-emerald-100 text-emerald-700", amber: "bg-amber-100 text-amber-700" };
  return <div className="flex items-center gap-4 rounded-2xl border border-stone-200 bg-white p-5"><span className={`grid size-11 place-items-center rounded-xl ${tones[tone]}`}><Icon size={20} /></span><div><p className="text-xs font-medium text-stone-500">{label}</p><p className="mt-1 text-2xl font-bold text-stone-900">{value}</p></div></div>;
}
