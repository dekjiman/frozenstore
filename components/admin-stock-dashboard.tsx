"use client";

import Link from "next/link";
import {
  AlertTriangle,
  Bell,
  Boxes,
  CircleDollarSign,
  ClipboardList,
  Loader2,
  PackageCheck,
  TrendingDown,
} from "lucide-react";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/client-api";

type StockItem = { id: string; sku: string; name: string; price: number; stock: number; status: string };
type Summary = { totalProducts: number; totalUnits: number; inventoryValue: number; lowStockCount: number; outOfStockCount: number };

type ShippingMethod = "regular" | "same_day" | "instant";
type PaymentStatus = "pending" | "awaiting_verification" | "paid" | "failed";
type OrderStatus =
  | "waiting_shipping_fee"
  | "waiting_payment"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

type Order = {
  id: string;
  orderNumber: string;
  recipientName: string;
  totalAmount: number;
  shippingMethod: ShippingMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  createdAt: string;
};

const rupiahFormatter = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });
const orderDate = new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" });

const statusLabels: Record<OrderStatus, string> = {
  waiting_shipping_fee: "Menunggu ongkir",
  waiting_payment: "Menunggu bayar",
  processing: "Diproses",
  shipped: "Dikirim",
  delivered: "Selesai",
  cancelled: "Dibatalkan",
};

const paymentLabels: Record<PaymentStatus, string> = {
  pending: "Menunggu",
  awaiting_verification: "Verifikasi",
  paid: "Lunas",
  failed: "Ditolak",
};

const methodLabels: Record<ShippingMethod, string> = {
  regular: "Reguler",
  same_day: "Same Day",
  instant: "Instan",
};

function needsAdminAction(order: Order) {
  return order.paymentStatus === "awaiting_verification" || order.orderStatus === "waiting_shipping_fee";
}

function actionReason(order: Order) {
  if (order.paymentStatus === "awaiting_verification") return "Verifikasi pembayaran";
  if (order.orderStatus === "waiting_shipping_fee") return "Atur ongkir";
  return statusLabels[order.orderStatus];
}

export function AdminStockDashboard() {
  const [stock, setStock] = useState<StockItem[]>([]);
  const [summary, setSummary] = useState<Summary>({ totalProducts: 0, totalUnits: 0, inventoryValue: 0, lowStockCount: 0, outOfStockCount: 0 });
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    apiFetch<{ stock: StockItem[]; summary: Summary }>("/api/admin/stock", { cache: "no-store" })
      .then((payload) => { setStock(payload.stock); setSummary(payload.summary); })
      .catch((caught) => setError(caught instanceof Error ? caught.message : "Gagal memuat stok"));
  }, []);

  useEffect(() => {
    let active = true;
    const load = () =>
      apiFetch<{ orders: Order[] }>("/api/admin/orders", { cache: "no-store" })
        .then((payload) => { if (active) { setOrders(payload.orders); setOrdersError(null); } })
        .catch((caught) => { if (active) setOrdersError(caught instanceof Error ? caught.message : "Gagal memuat pesanan"); })
        .finally(() => { if (active) setLoadingOrders(false); });
    load();
    const timer = setInterval(load, 60000);
    return () => { active = false; clearInterval(timer); };
  }, []);

  const lowStock = stock.filter((item) => item.stock <= 10);
  const healthyStock = summary.totalProducts - summary.lowStockCount;

  const awaitingVerification = orders.filter((order) => order.paymentStatus === "awaiting_verification");
  const waitingShippingFee = orders.filter((order) => order.orderStatus === "waiting_shipping_fee");
  const waitingPayment = orders.filter((order) => order.orderStatus === "waiting_payment");
  const actionOrders = orders.filter(needsAdminAction);
  const recentOrders = orders.slice(0, 5);
  const actionCount = actionOrders.length;

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-[var(--brand-600)]">Ringkasan gudang</p>
          <h1 className="mt-1 font-serif text-4xl tracking-tight">Stok terkini</h1>
          <p className="mt-2 text-sm text-stone-500">Pantau pesanan masuk dan ketersediaan produk sebelum kehabisan.</p>
        </div>
        <Link href="/admin/stok/masuk" className="inline-flex h-11 items-center justify-center rounded-full bg-stone-900 px-5 text-sm font-semibold text-white">Catat stok masuk</Link>
      </div>

      {error ? <p className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p> : null}

      {actionCount > 0 ? (
        <div className="mt-6 rounded-2xl border border-amber-300 bg-amber-50 p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="relative grid size-10 shrink-0 place-items-center rounded-xl bg-amber-500 text-white">
                <Bell size={19} />
                <span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">{actionCount}</span>
              </span>
              <div>
                <p className="font-serif text-lg font-bold text-amber-900">{actionCount} pesanan perlu tindakan</p>
                <ul className="mt-1.5 space-y-1 text-sm text-amber-800">
                  {actionOrders.slice(0, 3).map((order) => (
                    <li key={order.id}>
                      <Link href={`/admin/pesanan?order=${order.id}`} className="font-semibold underline-offset-2 hover:underline">
                        {order.orderNumber}
                      </Link>
                      {" · "}{actionReason(order)}{" · "}{order.recipientName}
                    </li>
                  ))}
                </ul>
                {actionCount > 3 ? <p className="mt-1 text-xs text-amber-700">+{actionCount - 3} pesanan lainnya</p> : null}
              </div>
            </div>
            <Link href="/admin/pesanan" className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full bg-amber-600 px-4 text-sm font-semibold text-white transition hover:bg-amber-700">
              Kelola pesanan
            </Link>
          </div>
        </div>
      ) : null}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric icon={Boxes} label="Total unit" value={String(summary.totalUnits)} detail={`${summary.totalProducts} SKU aktif`} tone="stone" />
        <Metric icon={PackageCheck} label="Stok sehat" value={String(healthyStock)} detail="Di atas batas minimum" tone="emerald" />
        <Metric icon={AlertTriangle} label="Stok rendah" value={String(summary.lowStockCount)} detail={`${summary.outOfStockCount} habis`} tone="amber" />
        <Metric icon={CircleDollarSign} label="Nilai inventaris" value={rupiahFormatter.format(summary.inventoryValue)} detail="Berdasarkan harga jual" tone="orange" />
      </div>

      <section className="mt-8 overflow-hidden rounded-3xl border border-stone-200 bg-white">
        <div className="flex flex-col gap-3 border-b border-stone-200 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-[var(--brand-50)] text-[var(--brand-600)]">
              <ClipboardList size={19} />
            </span>
            <div>
              <h2 className="font-serif text-2xl">Pesanan terbaru</h2>
              <p className="text-xs text-stone-500">
                {loadingOrders ? "Memuat pesanan..." : `${orders.length} pesanan${actionCount > 0 ? ` · ${actionCount} perlu tindakan` : ""}`}
              </p>
            </div>
          </div>
          <Link href="/admin/pesanan" className="text-sm font-semibold text-[var(--brand-600)]">Lihat semua pesanan</Link>
        </div>

        <div className="grid gap-3 border-b border-stone-200 bg-stone-50/60 p-5 sm:grid-cols-3 sm:p-6">
          <NotificationStat label="Perlu verifikasi bayar" count={awaitingVerification.length} tone="amber" />
          <NotificationStat label="Menunggu ongkir" count={waitingShippingFee.length} tone="orange" />
          <NotificationStat label="Menunggu bayar" count={waitingPayment.length} tone="stone" />
        </div>

        {ordersError ? <p className="p-5 text-sm text-red-700">{ordersError}</p> : null}

        {loadingOrders ? (
          <p className="flex items-center justify-center gap-2 p-8 text-sm text-stone-500">
            <Loader2 size={15} className="animate-spin" /> Memuat pesanan...
          </p>
        ) : recentOrders.length === 0 ? (
          <p className="p-8 text-center text-sm text-stone-500">Belum ada pesanan.</p>
        ) : (
          <div className="divide-y divide-stone-100">
            {recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/admin/pesanan?order=${order.id}`}
                className="flex flex-col gap-2 p-4 transition hover:bg-stone-50 sm:flex-row sm:items-center sm:justify-between sm:px-6"
              >
                <div className="min-w-0">
                  <p className="font-mono text-sm font-semibold text-[var(--brand-600)]">{order.orderNumber}</p>
                  <p className="mt-0.5 truncate text-xs text-stone-500">{order.recipientName} · {orderDate.format(new Date(order.createdAt))}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                  <span className="rounded-full bg-stone-100 px-2.5 py-1 text-[11px] font-semibold text-stone-600">{methodLabels[order.shippingMethod]}</span>
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${order.paymentStatus === "paid" ? "bg-emerald-100 text-emerald-800" : order.paymentStatus === "awaiting_verification" ? "bg-amber-100 text-amber-800" : order.paymentStatus === "failed" ? "bg-red-100 text-red-700" : "bg-stone-100 text-stone-600"}`}>
                    {paymentLabels[order.paymentStatus]}
                  </span>
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${order.orderStatus === "delivered" ? "bg-emerald-100 text-emerald-800" : order.orderStatus === "cancelled" ? "bg-red-100 text-red-700" : order.orderStatus === "waiting_shipping_fee" ? "bg-amber-100 text-amber-800" : "bg-stone-100 text-stone-600"}`}>
                    {statusLabels[order.orderStatus]}
                  </span>
                  <span className="ml-1 text-sm font-bold text-stone-900">{rupiahFormatter.format(order.totalAmount)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="rounded-3xl border border-stone-200 bg-white p-5 sm:p-6">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs text-stone-500">Semua produk</p>
              <h2 className="font-serif text-2xl">Kesehatan stok</h2>
            </div>
            <Link href="/admin/produk" className="text-sm font-semibold text-[var(--brand-600)]">Kelola produk</Link>
          </div>
          <div className="mt-6 space-y-5">
            {stock.map((product) => {
              const percentage = Math.min(100, Math.round(product.stock / 30 * 100));
              const low = product.stock <= 10;
              return (
                <div key={product.id}>
                  <div className="flex justify-between">
                    <div>
                      <p className="text-sm font-semibold">{product.name}</p>
                      <p className="font-mono text-[11px] text-stone-500">{product.sku}</p>
                    </div>
                    <p className={`text-sm font-bold ${low ? "text-amber-700" : ""}`}>{product.stock} unit</p>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-stone-100">
                    <div className={`h-full rounded-full ${low ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${percentage}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
        <aside className="rounded-3xl border border-amber-200 bg-amber-50 p-5 sm:p-6">
          <span className="grid size-11 place-items-center rounded-xl bg-amber-500 text-white"><TrendingDown size={20} /></span>
          <h2 className="mt-5 font-serif text-2xl">Prioritas restock</h2>
          <div className="mt-5 space-y-3">
            {lowStock.map((product) => (
              <div key={product.id} className="rounded-2xl border border-amber-200 bg-white p-4">
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm font-semibold">{product.name}</p>
                    <p className="font-mono text-xs text-stone-500">{product.sku}</p>
                  </div>
                  <span className="text-xs font-bold text-amber-800">{product.stock} unit</span>
                </div>
                <Link href={`/admin/produk/${product.id}/stok`} className="mt-3 inline-flex text-xs font-semibold text-[var(--brand-600)]">Tambah stok →</Link>
              </div>
            ))}
          </div>
          <Link href="/admin/stok/riwayat" className="mt-5 inline-flex text-sm font-semibold text-amber-900">Lihat riwayat stok</Link>
        </aside>
      </div>
    </div>
  );
}

function NotificationStat({ label, count, tone }: { label: string; count: number; tone: "amber" | "orange" | "stone" }) {
  const tones = { amber: "text-amber-700", orange: "text-[var(--brand-600)]", stone: "text-stone-600" };
  return (
    <div className="rounded-2xl border border-stone-200 bg-white px-4 py-3">
      <p className="text-xs text-stone-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${tones[tone]}`}>{count}</p>
    </div>
  );
}

function Metric({ icon: Icon, label, value, detail, tone }: { icon: typeof Boxes; label: string; value: string; detail: string; tone: "stone" | "emerald" | "amber" | "orange" }) {
  const tones = { stone: "bg-stone-100 text-stone-700", emerald: "bg-emerald-100 text-emerald-700", amber: "bg-amber-100 text-amber-700", orange: "bg-[var(--brand-50)] text-[var(--brand-600)]" };
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5">
      <span className={`grid size-10 place-items-center rounded-xl ${tones[tone]}`}><Icon size={19} /></span>
      <p className="mt-4 text-xs text-stone-500">{label}</p>
      <p className="mt-1 truncate text-2xl font-bold">{value}</p>
      <p className="text-xs text-stone-400">{detail}</p>
    </div>
  );
}
