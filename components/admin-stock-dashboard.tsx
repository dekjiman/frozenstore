"use client";

import Link from "next/link";
import { AlertTriangle, Boxes, CircleDollarSign, PackageCheck, TrendingDown } from "lucide-react";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/client-api";

type StockItem = { id: string; sku: string; name: string; price: number; stock: number; status: string };
type Summary = { totalProducts: number; totalUnits: number; inventoryValue: number; lowStockCount: number; outOfStockCount: number };
const rupiahFormatter = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });

export function AdminStockDashboard() {
  const [stock, setStock] = useState<StockItem[]>([]);
  const [summary, setSummary] = useState<Summary>({ totalProducts: 0, totalUnits: 0, inventoryValue: 0, lowStockCount: 0, outOfStockCount: 0 });
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { apiFetch<{ stock: StockItem[]; summary: Summary }>("/api/admin/stock", { cache: "no-store" }).then((payload) => { setStock(payload.stock); setSummary(payload.summary); }).catch((caught) => setError(caught instanceof Error ? caught.message : "Gagal memuat stok")); }, []);
  const lowStock = stock.filter((item) => item.stock <= 10);
  const healthyStock = summary.totalProducts - summary.lowStockCount;

  return <div className="mx-auto max-w-7xl">
    <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-semibold text-orange-700">Ringkasan gudang</p><h1 className="mt-1 font-serif text-4xl tracking-tight">Stok terkini</h1><p className="mt-2 text-sm text-stone-500">Pantau ketersediaan produk dan prioritaskan restock sebelum kehabisan.</p></div><Link href="/admin/stok/masuk" className="inline-flex h-11 items-center justify-center rounded-full bg-stone-900 px-5 text-sm font-semibold text-white">Catat stok masuk</Link></div>
    {error ? <p className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p> : null}
    <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric icon={Boxes} label="Total unit" value={String(summary.totalUnits)} detail={`${summary.totalProducts} SKU aktif`} tone="stone" /><Metric icon={PackageCheck} label="Stok sehat" value={String(healthyStock)} detail="Di atas batas minimum" tone="emerald" /><Metric icon={AlertTriangle} label="Stok rendah" value={String(summary.lowStockCount)} detail={`${summary.outOfStockCount} habis`} tone="amber" /><Metric icon={CircleDollarSign} label="Nilai inventaris" value={rupiahFormatter.format(summary.inventoryValue)} detail="Berdasarkan harga jual" tone="orange" /></div>
    <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]"><section className="rounded-3xl border border-stone-200 bg-white p-5 sm:p-6"><div className="flex items-end justify-between"><div><p className="text-xs text-stone-500">Semua produk</p><h2 className="font-serif text-2xl">Kesehatan stok</h2></div><Link href="/admin/produk" className="text-sm font-semibold text-orange-700">Kelola produk</Link></div><div className="mt-6 space-y-5">{stock.map((product) => { const percentage = Math.min(100, Math.round(product.stock / 30 * 100)); const low = product.stock <= 10; return <div key={product.id}><div className="flex justify-between"><div><p className="text-sm font-semibold">{product.name}</p><p className="font-mono text-[11px] text-stone-500">{product.sku}</p></div><p className={`text-sm font-bold ${low ? "text-amber-700" : ""}`}>{product.stock} unit</p></div><div className="mt-2 h-2 rounded-full bg-stone-100"><div className={`h-full rounded-full ${low ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${percentage}%` }} /></div></div>; })}</div></section><aside className="rounded-3xl border border-amber-200 bg-amber-50 p-5 sm:p-6"><span className="grid size-11 place-items-center rounded-xl bg-amber-500 text-white"><TrendingDown size={20} /></span><h2 className="mt-5 font-serif text-2xl">Prioritas restock</h2><div className="mt-5 space-y-3">{lowStock.map((product) => <div key={product.id} className="rounded-2xl border border-amber-200 bg-white p-4"><div className="flex justify-between"><div><p className="text-sm font-semibold">{product.name}</p><p className="font-mono text-xs text-stone-500">{product.sku}</p></div><span className="text-xs font-bold text-amber-800">{product.stock} unit</span></div><Link href={`/admin/produk/${product.id}/stok`} className="mt-3 inline-flex text-xs font-semibold text-orange-700">Tambah stok →</Link></div>)}</div><Link href="/admin/stok/riwayat" className="mt-5 inline-flex text-sm font-semibold text-amber-900">Lihat riwayat stok</Link></aside></div>
  </div>;
}

function Metric({ icon: Icon, label, value, detail, tone }: { icon: typeof Boxes; label: string; value: string; detail: string; tone: "stone" | "emerald" | "amber" | "orange" }) { const tones = { stone: "bg-stone-100 text-stone-700", emerald: "bg-emerald-100 text-emerald-700", amber: "bg-amber-100 text-amber-700", orange: "bg-orange-100 text-orange-700" }; return <div className="rounded-2xl border border-stone-200 bg-white p-5"><span className={`grid size-10 place-items-center rounded-xl ${tones[tone]}`}><Icon size={19} /></span><p className="mt-4 text-xs text-stone-500">{label}</p><p className="mt-1 truncate text-2xl font-bold">{value}</p><p className="text-xs text-stone-400">{detail}</p></div>; }
