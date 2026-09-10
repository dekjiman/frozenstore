"use client";

import Link from "next/link";
import { ArrowDownLeft, ArrowUpRight, Download, Filter, History, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/client-api";
import type { Product } from "@/types/product";

type Movement = { id: string; productId: string; productName: string; sku: string; type: "in" | "out" | "adjustment"; quantity: number; stockBefore: number; stockAfter: number; reason: string; reference: string | null; createdAt: string };
const dateFormatter = new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" });

export function AdminStockHistory() {
  const [productId, setProductId] = useState("");
  const [type, setType] = useState("");
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { apiFetch<{ products: Product[] }>("/api/admin/products", { cache: "no-store" }).then((payload) => setProducts(payload.products)).catch(() => undefined); }, []);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams();
      if (productId) params.set("productId", productId);
      if (type) params.set("type", type);
      if (query.trim()) params.set("q", query.trim());
      apiFetch<{ movements: Movement[] }>(`/api/admin/stock/movements?${params}`, { cache: "no-store" }).then((payload) => { setMovements(payload.movements); setError(null); }).catch((caught) => setError(caught instanceof Error ? caught.message : "Gagal memuat riwayat"));
    }, 250);
    return () => window.clearTimeout(timer);
  }, [productId, query, type]);
  const totals = useMemo(() => ({ incoming: movements.filter((item) => item.type === "in").reduce((sum, item) => sum + item.quantity, 0), outgoing: movements.filter((item) => item.type === "out").reduce((sum, item) => sum + item.quantity, 0) }), [movements]);

  function exportCsv() {
    const rows = [["Waktu", "SKU", "Produk", "Tipe", "Jumlah", "Stok Sebelum", "Stok Sesudah", "Alasan", "Referensi"], ...movements.map((item) => [item.createdAt, item.sku, item.productName, item.type, String(item.quantity), String(item.stockBefore), String(item.stockAfter), item.reason, item.reference ?? ""])];
    const csv = rows.map((row) => row.map((value) => `"${value.replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a"); link.href = url; link.download = "riwayat-stok.csv"; link.click(); URL.revokeObjectURL(url);
  }

  return <div className="mx-auto max-w-7xl">
    <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-semibold text-[var(--brand-600)]">Stock ledger</p><h1 className="mt-1 font-serif text-4xl tracking-tight">Riwayat perubahan stok</h1><p className="mt-2 text-sm text-stone-500">Audit setiap barang masuk, keluar, dan penyesuaian gudang.</p></div><div className="flex gap-2"><button type="button" onClick={exportCsv} className="inline-flex h-11 items-center gap-2 rounded-full border border-stone-300 bg-white px-5 text-sm font-semibold"><Download size={16} />Ekspor</button><Link href="/admin/stok/masuk" className="inline-flex h-11 items-center rounded-full bg-stone-900 px-5 text-sm font-semibold text-white">Tambah stok</Link></div></div>
    {error ? <p className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p> : null}
    <div className="mt-8 grid gap-4 sm:grid-cols-3"><Summary icon={History} label="Total mutasi" value={String(movements.length)} color="stone" /><Summary icon={ArrowDownLeft} label="Unit masuk" value={`+${totals.incoming}`} color="emerald" /><Summary icon={ArrowUpRight} label="Unit keluar" value={`-${totals.outgoing}`} color="red" /></div>
    <section className="mt-8 overflow-hidden rounded-3xl border border-stone-200 bg-white"><div className="border-b border-stone-200 p-5"><div className="flex items-center gap-2 text-sm font-semibold"><Filter size={16} />Filter riwayat</div><div className="mt-4 grid gap-3 md:grid-cols-[1fr_180px_180px]"><label className="relative"><Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" size={17} /><input aria-label="Cari riwayat" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari SKU, alasan, atau referensi..." className="h-11 w-full rounded-xl border border-stone-300 pl-10 pr-4 text-sm" /></label><select aria-label="Filter produk" value={productId} onChange={(event) => setProductId(event.target.value)} className="h-11 rounded-xl border bg-white px-3 text-sm"><option value="">Semua produk</option>{products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}</select><select aria-label="Filter tipe" value={type} onChange={(event) => setType(event.target.value)} className="h-11 rounded-xl border bg-white px-3 text-sm"><option value="">Semua tipe</option><option value="in">Stok masuk</option><option value="out">Stok keluar</option><option value="adjustment">Penyesuaian</option></select></div></div><div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead className="bg-stone-50 text-xs uppercase text-stone-500"><tr><th className="px-5 py-4">Waktu</th><th className="px-5 py-4">Produk</th><th className="px-5 py-4">Tipe</th><th className="px-5 py-4">Jumlah</th><th className="px-5 py-4">Stok</th><th className="px-5 py-4">Alasan</th><th className="px-5 py-4">Referensi</th></tr></thead><tbody className="divide-y divide-stone-100">{movements.map((item) => <tr key={item.id}><td className="px-5 py-4">{dateFormatter.format(new Date(item.createdAt))}</td><td className="px-5 py-4"><p className="font-semibold">{item.productName}</p><p className="font-mono text-xs text-stone-500">{item.sku}</p></td><td className="px-5 py-4">{item.type}</td><td className={`px-5 py-4 font-bold ${item.type === "in" ? "text-emerald-700" : "text-red-600"}`}>{item.type === "in" ? "+" : "-"}{item.quantity}</td><td className="px-5 py-4">{item.stockBefore} → {item.stockAfter}</td><td className="px-5 py-4">{item.reason}</td><td className="px-5 py-4 font-mono text-xs">{item.reference ?? "—"}</td></tr>)}</tbody></table>{movements.length === 0 ? <p className="py-12 text-center text-sm text-stone-500">Belum ada mutasi stok.</p> : null}</div></section>
  </div>;
}

function Summary({ icon: Icon, label, value, color }: { icon: typeof History; label: string; value: string; color: "stone" | "emerald" | "red" }) { const colors = { stone: "bg-stone-100 text-stone-700", emerald: "bg-emerald-100 text-emerald-700", red: "bg-red-100 text-red-600" }; return <div className="flex items-center gap-4 rounded-2xl border border-stone-200 bg-white p-5"><span className={`grid size-11 place-items-center rounded-xl ${colors[color]}`}><Icon size={20} /></span><div><p className="text-xs text-stone-500">{label}</p><p className="mt-1 text-2xl font-bold">{value}</p></div></div>; }
