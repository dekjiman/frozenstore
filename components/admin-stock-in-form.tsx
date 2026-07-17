"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, PackagePlus } from "lucide-react";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/client-api";
import type { Product } from "@/types/product";

export function AdminStockInForm({ initialProductId = "" }: { initialProductId?: string }) {
  const [productId, setProductId] = useState(initialProductId);
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("Restock pemasok");
  const [reference, setReference] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ before: number; after: number } | null>(null);
  const product = products.find((item) => item.id === productId);
  const parsedQuantity = Number(quantity);
  const validQuantity = Number.isInteger(parsedQuantity) && parsedQuantity > 0 && parsedQuantity <= 100_000;

  useEffect(() => { apiFetch<{ products: Product[] }>("/api/admin/products", { cache: "no-store" }).then((payload) => setProducts(payload.products)).catch((caught) => setError(caught instanceof Error ? caught.message : "Gagal memuat produk")); }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!product) return setError("Pilih produk yang akan ditambahkan stoknya");
    if (!validQuantity) return setError("Jumlah stok masuk harus bilangan bulat antara 1 dan 100.000");
    if (reason.trim().length < 3) return setError("Alasan stok masuk wajib diisi");
    setError(null); setIsSubmitting(true);
    try {
      const payload = await apiFetch<{ product: Product; movement: { stockBefore: number; stockAfter: number } }>(`/api/admin/products/${encodeURIComponent(product.id)}/stock`, { method: "POST", body: JSON.stringify({ quantity: parsedQuantity, reason, reference }) });
      setProducts((items) => items.map((item) => item.id === product.id ? payload.product : item));
      setResult({ before: payload.movement.stockBefore, after: payload.movement.stockAfter });
      setSubmitted(true); setQuantity(""); setReference("");
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Gagal mencatat stok"); }
    finally { setIsSubmitting(false); }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin/produk" className="inline-flex items-center gap-2 text-sm font-semibold text-stone-600 hover:text-orange-700"><ArrowLeft size={16} />Kembali ke produk</Link>
      <div className="mt-6"><p className="text-sm font-semibold text-orange-700">Pergerakan gudang</p><h1 className="mt-1 font-serif text-4xl tracking-tight">Tambah stok masuk</h1><p className="mt-2 text-sm text-stone-500">Catat penerimaan barang agar stok terkini dan riwayat gudang tetap sinkron.</p></div>

      {submitted && product && result ? <div role="status" className="mt-7 rounded-2xl border border-emerald-200 bg-emerald-50 p-5"><div className="flex gap-3"><CheckCircle2 className="shrink-0 text-emerald-600" size={22} /><div><p className="font-semibold text-emerald-900">Stok masuk berhasil dicatat</p><p className="mt-1 text-sm text-emerald-800">{product.name}: {result.before} → {result.after} unit.</p></div></div></div> : null}

      <form onSubmit={submit} className="mt-7 rounded-3xl border border-stone-200 bg-white p-6 sm:p-8">
        <div className="flex items-center gap-3 border-b border-stone-100 pb-5"><span className="grid size-11 place-items-center rounded-xl bg-emerald-100 text-emerald-700"><PackagePlus size={20} /></span><div><h2 className="font-serif text-2xl">Detail penerimaan</h2><p className="text-xs text-stone-500">Perubahan akan menambah stok produk.</p></div></div>
        {error ? <p role="alert" className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p> : null}
        <div className="mt-6 space-y-5">
          <div><label htmlFor="stock-product" className="text-sm font-semibold">Produk</label><select id="stock-product" value={productId} onChange={(event) => { setProductId(event.target.value); setSubmitted(false); setError(null); }} className="mt-2 h-12 w-full rounded-xl border border-stone-300 bg-white px-4 text-sm outline-none focus:border-orange-600"><option value="">Pilih produk</option>{products.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.sku}</option>)}</select></div>
          <div className="grid gap-5 sm:grid-cols-2"><div><label htmlFor="stock-quantity" className="text-sm font-semibold">Jumlah masuk</label><input id="stock-quantity" type="number" min="1" max="100000" step="1" value={quantity} onChange={(event) => { setQuantity(event.target.value); setSubmitted(false); setError(null); }} placeholder="Contoh: 20" className="mt-2 h-12 w-full rounded-xl border border-stone-300 px-4 text-sm outline-none focus:border-orange-600" /></div><div><label htmlFor="stock-reference" className="text-sm font-semibold">Referensi (opsional)</label><input id="stock-reference" value={reference} onChange={(event) => setReference(event.target.value)} placeholder="PO-2026-001" className="mt-2 h-12 w-full rounded-xl border border-stone-300 px-4 text-sm outline-none focus:border-orange-600" /></div></div>
          <div><label htmlFor="stock-reason" className="text-sm font-semibold">Alasan / sumber stok</label><input id="stock-reason" value={reason} onChange={(event) => setReason(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-stone-300 px-4 text-sm outline-none focus:border-orange-600" /></div>
        </div>

        {product ? <div className="mt-7 rounded-2xl bg-stone-100 p-5"><p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Pratinjau perubahan</p><div className="mt-4 flex items-center justify-center gap-5"><div className="text-center"><p className="text-xs text-stone-500">Stok sekarang</p><p className="mt-1 text-3xl font-bold">{product.stock}</p></div><ArrowRight className="text-stone-400" /><div className="text-center"><p className="text-xs text-stone-500">Stok setelah masuk</p><p className="mt-1 text-3xl font-bold text-emerald-700">{product.stock + (validQuantity ? parsedQuantity : 0)}</p></div></div></div> : null}
        <button type="submit" disabled={isSubmitting} className="mt-7 w-full rounded-full bg-stone-900 px-6 py-3.5 text-sm font-semibold text-white hover:bg-orange-700 disabled:bg-stone-400">{isSubmitting ? "Mencatat..." : "Catat stok masuk"}</button>
      </form>
    </div>
  );
}
