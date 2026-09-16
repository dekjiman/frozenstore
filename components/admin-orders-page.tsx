"use client";

import {
  CheckCircle2,
  ExternalLink,
  Hammer,
  ImageIcon,
  Loader2,
  PackageCheck,
  ReceiptText,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/client-api";

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
  recipientPhone: string | null;
  shippingAddress: string | null;
  shippingCity: string | null;
  shippingProvince: string | null;
  shippingPostalCode: string | null;
  shippingNotes: string | null;
  subtotalAmount: number;
  shippingAmount: number;
  totalAmount: number;
  shippingMethod: ShippingMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  paymentProofUrl: string | null;
  createdAt: string;
};

type OrderItem = {
  id: string;
  productSku: string | null;
  productName: string;
  quantity: number;
  priceAtPurchase: number;
};

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

type SelectedProof = Pick<Order, "orderNumber" | "recipientName" | "paymentProofUrl">;

const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});
const date = new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" });

function formatDay(iso: string) {
  const parsed = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return iso;
  return parsed.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

function toDateInputValue(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function defaultRange() {
  const today = new Date();
  const from = new Date(today);
  from.setDate(today.getDate() - 6);
  return { from: toDateInputValue(from), to: toDateInputValue(today) };
}

const methodLabels: Record<ShippingMethod, string> = {
  regular: "Reguler",
  same_day: "Same Day (Grab / GoSend)",
  instant: "Instan",
};

export function AdminOrdersPage() {
  const [initialFrom, initialTo] = (() => {
    const { from, to } = defaultRange();
    return [from, to];
  })();
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedProof, setSelectedProof] = useState<SelectedProof | null>(null);
  const [feeOrder, setFeeOrder] = useState<Order | null>(null);
  const [feeInput, setFeeInput] = useState("");
  const [feeSaving, setFeeSaving] = useState(false);
  const [feeError, setFeeError] = useState<string | null>(null);
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);
  const [detailItems, setDetailItems] = useState<OrderItem[] | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [dateFrom, setDateFrom] = useState(initialFrom);
  const [dateTo, setDateTo] = useState(initialTo);
  const [appliedFrom, setAppliedFrom] = useState(initialFrom);
  const [appliedTo, setAppliedTo] = useState(initialTo);
  const [appliedPayment, setAppliedPayment] = useState<PaymentStatus | "">("");
  const [appliedProgress, setAppliedProgress] = useState<OrderStatus | "">("");

  const loadOrders = useCallback(
    (from: string, to: string, payment: PaymentStatus | "", status: OrderStatus | "") => {
      const params = new URLSearchParams();
      if (from) {
        const start = new Date(`${from}T00:00:00`);
        if (!Number.isNaN(start.getTime())) params.set("from", start.toISOString());
      }
      if (to) {
        const end = new Date(`${to}T23:59:59.999`);
        if (!Number.isNaN(end.getTime())) params.set("to", end.toISOString());
      }
      if (payment) params.set("payment", payment);
      if (status) params.set("status", status);
      const query = params.toString();
      apiFetch<{ orders: Order[] }>(`/api/admin/orders${query ? `?${query}` : ""}`, { cache: "no-store" })
        .then((payload) => setOrders(payload.orders))
        .catch((caught) =>
          setError(caught instanceof Error ? caught.message : "Gagal memuat pesanan"),
        )
        .finally(() => setLoadingOrders(false));
    },
    [],
  );

  useEffect(() => {
    loadOrders(initialFrom, initialTo, "", "");
  }, [loadOrders, initialFrom, initialTo]);

  useEffect(() => {
    if (!selectedProof && !detailOrder) return;

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSelectedProof(null);
        setDetailOrder(null);
      }
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [selectedProof, detailOrder]);

  function openFeeModal(order: Order) {
    setFeeOrder(order);
    setFeeInput(order.shippingAmount > 0 ? String(order.shippingAmount) : "");
    setFeeError(null);
  }

  function applyRange() {
    if (dateFrom && dateTo && dateFrom > dateTo) return;
    setLoadingOrders(true);
    setAppliedFrom(dateFrom || "");
    setAppliedTo(dateTo || "");
    loadOrders(dateFrom, dateTo, appliedPayment, appliedProgress);
  }

  function selectPayment(value: PaymentStatus | "") {
    setAppliedPayment(value);
    setLoadingOrders(true);
    loadOrders(appliedFrom, appliedTo, value, appliedProgress);
  }

  function selectProgress(value: OrderStatus | "") {
    setAppliedProgress(value);
    setLoadingOrders(true);
    loadOrders(appliedFrom, appliedTo, appliedPayment, value);
  }

  function resetFilters() {
    setLoadingOrders(true);
    setDateFrom(initialFrom);
    setDateTo(initialTo);
    setAppliedFrom(initialFrom);
    setAppliedTo(initialTo);
    setAppliedPayment("");
    setAppliedProgress("");
    loadOrders(initialFrom, initialTo, "", "");
  }

  function openDetail(order: Order) {
    setDetailOrder(order);
    setDetailItems(null);
    setDetailLoading(true);
    setDetailError(null);
    apiFetch<{ order: Order; items: OrderItem[] }>(`/api/admin/orders/${order.id}`, { cache: "no-store" })
      .then((payload) => setDetailItems(payload.items))
      .catch((caught) =>
        setDetailError(caught instanceof Error ? caught.message : "Gagal memuat detail pesanan"),
      )
      .finally(() => setDetailLoading(false));
  }

  async function updateOrder(
    id: string,
    updates: Partial<Pick<Order, "paymentStatus" | "orderStatus">>,
  ) {
    try {
      const payload = await apiFetch<{ order: Order }>(`/api/admin/orders/${id}`, {
        method: "PATCH",
        body: JSON.stringify(updates),
      });
      setOrders((items) =>
        items.map((item) => (item.id === id ? payload.order : item)),
      );
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Gagal memperbarui pesanan");
    }
  }

  async function saveShippingFee() {
    if (!feeOrder) return;
    setFeeSaving(true);
    setFeeError(null);
    try {
      const payload = await apiFetch<{ order: Order }>(`/api/admin/orders/${feeOrder.id}`, {
        method: "PATCH",
        body: JSON.stringify({ shippingAmount: Number(feeInput) || 0 }),
      });
      setOrders((items) =>
        items.map((item) => (item.id === feeOrder.id ? payload.order : item)),
      );
      if (detailOrder && detailOrder.id === feeOrder.id) {
        setDetailOrder(payload.order);
      }
      setFeeOrder(null);
    } catch (caught) {
      setFeeError(caught instanceof Error ? caught.message : "Gagal menyimpan ongkir");
    } finally {
      setFeeSaving(false);
    }
  }

  const rangeSummary = appliedFrom || appliedTo
    ? appliedFrom && appliedTo
      ? `${formatDay(appliedFrom)} – ${formatDay(appliedTo)}`
      : appliedFrom
        ? `sejak ${formatDay(appliedFrom)}`
        : appliedTo
          ? `sampai ${formatDay(appliedTo)}`
          : ""
    : "";

  const filterSummary = [
    rangeSummary,
    appliedPayment ? `Pembayaran: ${paymentLabels[appliedPayment]}` : "",
    appliedProgress ? `Proses: ${statusLabels[appliedProgress]}` : "",
  ]
    .filter(Boolean)
    .join(" · ");

  const hasAnyFilter = Boolean(
    appliedFrom || appliedTo || appliedPayment || appliedProgress,
  );

  return (
    <div className="mx-auto max-w-7xl">
      <p className="text-sm font-semibold text-[var(--brand-600)]">Operasional pesanan</p>
      <h1 className="mt-1 font-serif text-4xl">Pesanan pelanggan</h1>
      <p className="mt-2 text-sm text-stone-500">
        Verifikasi pembayaran dan perbarui proses pengiriman.
      </p>

      {error ? (
        <p className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>
      ) : null}

      <div className="mt-8 flex flex-col gap-4 rounded-3xl border border-stone-200 bg-white p-4 lg:flex-row lg:flex-wrap lg:items-end lg:justify-between">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="order-date-from" className="block text-xs font-semibold text-stone-600">
              Dari
            </label>
            <input
              id="order-date-from"
              type="date"
              value={dateFrom}
              max={dateTo || undefined}
              onChange={(event) => setDateFrom(event.target.value)}
              className="mt-1.5 h-10 rounded-xl border border-stone-300 bg-white px-3 text-sm text-stone-900 outline-none transition focus:border-[var(--brand-600)] focus:ring-4 focus:ring-[var(--brand-600)]/10"
            />
          </div>
          <div>
            <label htmlFor="order-date-to" className="block text-xs font-semibold text-stone-600">
              Sampai
            </label>
            <input
              id="order-date-to"
              type="date"
              value={dateTo}
              min={dateFrom || undefined}
              onChange={(event) => setDateTo(event.target.value)}
              className="mt-1.5 h-10 rounded-xl border border-stone-300 bg-white px-3 text-sm text-stone-900 outline-none transition focus:border-[var(--brand-600)] focus:ring-4 focus:ring-[var(--brand-600)]/10"
            />
          </div>
          <div>
            <label htmlFor="order-payment-filter" className="block text-xs font-semibold text-stone-600">
              Pembayaran
            </label>
            <select
              id="order-payment-filter"
              value={appliedPayment}
              onChange={(event) =>
                selectPayment(event.target.value as PaymentStatus | "")
              }
              className="mt-1.5 h-10 rounded-xl border border-stone-300 bg-white px-3 text-sm text-stone-900 outline-none transition focus:border-[var(--brand-600)] focus:ring-4 focus:ring-[var(--brand-600)]/10"
            >
              <option value="">Semua</option>
              <option value="pending">Menunggu</option>
              <option value="awaiting_verification">Verifikasi</option>
              <option value="paid">Lunas</option>
              <option value="failed">Ditolak</option>
            </select>
          </div>
          <div>
            <label htmlFor="order-progress-filter" className="block text-xs font-semibold text-stone-600">
              Proses
            </label>
            <select
              id="order-progress-filter"
              value={appliedProgress}
              onChange={(event) =>
                selectProgress(event.target.value as OrderStatus | "")
              }
              className="mt-1.5 h-10 rounded-xl border border-stone-300 bg-white px-3 text-sm text-stone-900 outline-none transition focus:border-[var(--brand-600)] focus:ring-4 focus:ring-[var(--brand-600)]/10"
            >
              <option value="">Semua</option>
              <option value="waiting_shipping_fee">Menunggu ongkir</option>
              <option value="waiting_payment">Menunggu bayar</option>
              <option value="processing">Diproses</option>
              <option value="shipped">Dikirim</option>
              <option value="delivered">Selesai</option>
              <option value="cancelled">Dibatalkan</option>
            </select>
          </div>
          <button
            type="button"
            onClick={applyRange}
            disabled={Boolean(
              (!dateFrom && !dateTo) || (dateFrom && dateTo && dateFrom > dateTo),
            )}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-[var(--brand-600)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--brand-900)] disabled:cursor-not-allowed disabled:bg-stone-300"
          >
            Terapkan
          </button>
          {hasAnyFilter ? (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex h-10 items-center rounded-full border border-stone-300 px-4 text-sm font-semibold text-stone-700 transition hover:bg-stone-100"
            >
              Reset
            </button>
          ) : null}
        </div>
        <p className="text-xs text-stone-500">
          {loadingOrders ? (
            <span className="flex items-center gap-1.5">
              <Loader2 size={13} className="animate-spin" /> Memuat pesanan...
            </span>
          ) : (
            <>
              {orders.length} pesanan{filterSummary ? ` · ${filterSummary}` : ""}
            </>
          )}
        </p>
      </div>

      <div className="mt-4 overflow-x-auto rounded-3xl border border-stone-200 bg-white">
        <table className="w-full min-w-[1200px] text-left text-sm">
          <thead className="bg-stone-50 text-xs uppercase text-stone-500">
            <tr>
              <th className="p-4">Pesanan</th>
              <th className="p-4">Pelanggan</th>
              <th className="p-4">Metode</th>
              <th className="p-4">Total</th>
              <th className="p-4">Bukti transfer</th>
              <th className="p-4">Pembayaran</th>
              <th className="p-4">Proses</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {orders.map((order) => (
              <tr key={order.id} className="align-top">
                <td className="p-4">
                  <button
                    type="button"
                    onClick={() => openDetail(order)}
                    aria-label={`Buka detail transaksi ${order.orderNumber}`}
                    className="text-left font-mono font-semibold text-[var(--brand-600)] transition hover:text-[var(--brand-900)] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-600)] focus-visible:ring-offset-2"
                  >
                    {order.orderNumber}
                  </button>
                  <p className="mt-0.5 text-xs text-stone-500">
                    {date.format(new Date(order.createdAt))}
                  </p>
                  <button
                    type="button"
                    onClick={() => openDetail(order)}
                    className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-[var(--brand-600)] transition hover:text-[var(--brand-900)] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-600)]"
                  >
                    <ReceiptText size={13} />
                    Detail transaksi
                  </button>
                </td>
                <td className="p-4">{order.recipientName}</td>
                <td className="p-4">
                  <p className="font-medium">{methodLabels[order.shippingMethod]}</p>
                  {order.shippingMethod === "instant" && order.orderStatus === "waiting_shipping_fee" ? (
                    <div className="mt-2 space-y-1.5">
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-800">
                        Menunggu ongkir
                      </span>
                      <button
                        type="button"
                        onClick={() => openFeeModal(order)}
                        className="inline-flex items-center gap-1 rounded-lg border border-amber-300 bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-800 transition hover:bg-amber-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-600)]"
                      >
                        <Hammer size={12} />
                        Atur ongkir
                      </button>
                    </div>
                  ) : (
                    <p className="mt-1 text-xs text-stone-500">
                      {order.shippingAmount > 0
                        ? rupiah.format(order.shippingAmount)
                        : "Gratis"}
                    </p>
                  )}
                </td>
                <td className="p-4 font-semibold">{rupiah.format(order.totalAmount)}</td>
                <td className="p-4">
                  {order.paymentProofUrl ? (
                    <button
                      type="button"
                      onClick={() => setSelectedProof(order)}
                      aria-label={`Lihat bukti transfer pesanan ${order.orderNumber}`}
                      className="group flex items-center gap-3 rounded-xl text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-600)] focus-visible:ring-offset-2"
                    >
                      <span className="relative block h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-stone-200 bg-stone-100">
                        {/* Bukti transfer adalah URL unggahan dinamis, jadi tidak dibatasi host next/image. */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={order.paymentProofUrl}
                          alt={`Bukti transfer ${order.orderNumber}`}
                          className="h-full w-full object-cover transition group-hover:scale-105"
                        />
                      </span>
                      <span>
                        <span className="flex items-center gap-1 text-xs font-semibold text-[var(--brand-600)] group-hover:underline">
                          <CheckCircle2 size={14} />
                          Lihat bukti
                        </span>
                        <span className="mt-1 block text-xs text-stone-500">Klik untuk perbesar</span>
                      </span>
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-2 rounded-xl bg-stone-50 px-3 py-2 text-xs text-stone-400">
                      <PackageCheck size={16} />
                      Belum ada bukti
                    </span>
                  )}
                </td>
                <td className="p-4">
                  <select
                    value={order.paymentStatus}
                    onChange={(event) =>
                      void updateOrder(order.id, {
                        paymentStatus: event.target.value as Order["paymentStatus"],
                      })
                    }
                    aria-label={`Status pembayaran ${order.orderNumber}`}
                    className="w-full rounded-lg border p-2 text-xs"
                  >
                    <option value="pending">Menunggu</option>
                    <option value="awaiting_verification">Verifikasi</option>
                    <option value="paid">Lunas</option>
                    <option value="failed">Ditolak</option>
                  </select>
                </td>
                <td className="p-4">
                  <select
                    value={order.orderStatus}
                    onChange={(event) =>
                      void updateOrder(order.id, {
                        orderStatus: event.target.value as Order["orderStatus"],
                      })
                    }
                    aria-label={`Status proses ${order.orderNumber}`}
                    className="w-full rounded-lg border p-2 text-xs"
                  >
                    {order.shippingMethod === "instant" ? (
                      <option value="waiting_shipping_fee">Menunggu ongkir</option>
                    ) : null}
                    <option value="waiting_payment">Menunggu bayar</option>
                    <option value="processing">Diproses</option>
                    <option value="shipped">Dikirim</option>
                    <option value="delivered">Selesai</option>
                    <option value="cancelled">Dibatalkan</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {orders.length === 0 ? (
          <p className="py-12 text-center text-sm text-stone-500">
            {loadingOrders
              ? "Memuat pesanan..."
              : hasAnyFilter
                ? "Tidak ada pesanan yang cocok dengan filter ini."
                : "Belum ada pesanan."}
          </p>
        ) : null}
      </div>

      {selectedProof?.paymentProofUrl ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/75 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="payment-proof-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedProof(null);
          }}
        >
          <div className="w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-stone-200 px-5 py-4">
              <div>
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--brand-600)]">
                  <ImageIcon size={15} />
                  Bukti transfer
                </p>
                <h2 id="payment-proof-title" className="mt-1 font-serif text-2xl">
                  {selectedProof.orderNumber}
                </h2>
                <p className="text-sm text-stone-500">{selectedProof.recipientName}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProof(null)}
                aria-label="Tutup bukti transfer"
                className="rounded-full p-2 text-stone-500 hover:bg-stone-100 hover:text-stone-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-600)]"
              >
                <X size={22} />
              </button>
            </div>
            <div className="flex max-h-[70vh] min-h-72 items-center justify-center bg-stone-100 p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedProof.paymentProofUrl}
                alt={`Bukti transfer ${selectedProof.orderNumber}`}
                className="max-h-[65vh] max-w-full rounded-xl object-contain shadow-sm"
              />
            </div>
            <div className="flex justify-end px-5 py-4">
              <a
                href={selectedProof.paymentProofUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-stone-950 px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--brand-700)]"
              >
                Buka gambar asli
                <ExternalLink size={15} />
              </a>
            </div>
          </div>
        </div>
      ) : null}

      {detailOrder ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/75 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="order-detail-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setDetailOrder(null);
          }}
        >
          <div className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-stone-200 px-5 py-4">
              <div>
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--brand-600)]">
                  <ReceiptText size={15} />
                  Detail transaksi
                </p>
                <h2 id="order-detail-title" className="mt-1 font-mono text-xl font-bold text-[var(--ink-950)]">
                  {detailOrder.orderNumber}
                </h2>
                <p className="text-sm text-stone-500">
                  {detailOrder.recipientName} · {date.format(new Date(detailOrder.createdAt))}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDetailOrder(null)}
                aria-label="Tutup detail transaksi"
                className="rounded-full p-2 text-stone-500 hover:bg-stone-100 hover:text-stone-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-600)]"
              >
                <X size={22} />
              </button>
            </div>

            <div className="max-h-[calc(90vh-96px)] space-y-6 overflow-y-auto px-5 py-5 sm:px-6">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-700">
                  Pembayaran: {paymentLabels[detailOrder.paymentStatus]}
                </span>
                <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-700">
                  Proses: {statusLabels[detailOrder.orderStatus]}
                </span>
                <span className="rounded-full bg-[var(--brand-50)] px-3 py-1 text-xs font-semibold text-[var(--brand-700)]">
                  {methodLabels[detailOrder.shippingMethod]}
                </span>
              </div>

              {detailOrder.shippingMethod === "instant" &&
              detailOrder.orderStatus === "waiting_shipping_fee" ? (
                <button
                  type="button"
                  onClick={() => openFeeModal(detailOrder)}
                  className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800 transition hover:bg-amber-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-600)]"
                >
                  <Hammer size={15} />
                  Atur ongkir
                </button>
              ) : null}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-stone-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Penerima</p>
                  <div className="mt-2 space-y-1 text-sm">
                    <p className="font-semibold text-stone-900">{detailOrder.recipientName}</p>
                    <p className="text-stone-600">{detailOrder.recipientPhone ?? "—"}</p>
                    <p className="pt-1 text-stone-600">{detailOrder.shippingAddress ?? "—"}</p>
                    <p className="text-stone-600">
                      {[detailOrder.shippingCity, detailOrder.shippingProvince, detailOrder.shippingPostalCode]
                        .filter(Boolean)
                        .join(", ") || "—"}
                    </p>
                    {detailOrder.shippingNotes ? (
                      <p className="pt-1 text-xs text-stone-500">Catatan: {detailOrder.shippingNotes}</p>
                    ) : null}
                  </div>
                </div>

                {detailOrder.paymentProofUrl ? (
                  <div className="rounded-2xl bg-stone-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Bukti transfer</p>
                    <button
                      type="button"
                      onClick={() => setSelectedProof(detailOrder)}
                      className="mt-2 flex items-center gap-2 text-sm font-semibold text-[var(--brand-600)] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-600)]"
                    >
                      <CheckCircle2 size={15} />
                      Lihat bukti
                    </button>
                  </div>
                ) : null}
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Item pesanan</p>
                {detailLoading ? (
                  <p className="mt-3 flex items-center gap-2 text-sm text-stone-500">
                    <Loader2 size={15} className="animate-spin" /> Memuat item...
                  </p>
                ) : detailError ? (
                  <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{detailError}</p>
                ) : detailItems && detailItems.length > 0 ? (
                  <div className="mt-3 divide-y divide-stone-100 rounded-2xl border border-stone-200">
                    {detailItems.map((item) => (
                      <div key={item.id} className="flex items-start justify-between gap-4 px-4 py-3 text-sm">
                        <div className="min-w-0">
                          <p className="font-medium text-stone-900">{item.productName}</p>
                          {item.productSku ? (
                            <p className="mt-0.5 text-xs text-stone-400">SKU: {item.productSku}</p>
                          ) : null}
                          <p className="mt-1 text-xs text-stone-500">
                            {item.quantity} × {rupiah.format(item.priceAtPurchase)}
                          </p>
                        </div>
                        <p className="shrink-0 font-semibold text-stone-900">
                          {rupiah.format(item.priceAtPurchase * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-stone-400">Tidak ada item.</p>
                )}
              </div>

              <div className="space-y-2 rounded-2xl bg-stone-50 px-4 py-3 text-sm">
                <div className="flex justify-between gap-4 text-stone-600">
                  <span>Subtotal produk</span>
                  <span className="font-medium text-stone-900">{rupiah.format(detailOrder.subtotalAmount)}</span>
                </div>
                <div className="flex justify-between gap-4 text-stone-600">
                  <span>Ongkir</span>
                  <span className="font-medium text-stone-900">{rupiah.format(detailOrder.shippingAmount)}</span>
                </div>
                <div className="flex justify-between gap-4 border-t border-stone-200 pt-2 text-base font-bold text-[var(--ink-950)]">
                  <span>Total</span>
                  <span>{rupiah.format(detailOrder.totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {feeOrder ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/75 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="shipping-fee-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setFeeOrder(null);
          }}
        >
          <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-stone-200 px-5 py-4">
              <div>
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-amber-700">
                  <Hammer size={15} />
                  Pesanan Instan
                </p>
                <h2 id="shipping-fee-title" className="mt-1 font-serif text-2xl">
                  {feeOrder.orderNumber}
                </h2>
                <p className="text-sm text-stone-500">{feeOrder.recipientName}</p>
              </div>
              <button
                type="button"
                onClick={() => setFeeOrder(null)}
                aria-label="Tutup"
                className="rounded-full p-2 text-stone-500 hover:bg-stone-100 hover:text-stone-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-600)]"
              >
                <X size={22} />
              </button>
            </div>

            <div className="space-y-4 px-5 py-5">
              <div className="flex items-center justify-between rounded-xl bg-stone-50 px-4 py-3 text-sm">
                <span className="text-stone-500">Subtotal produk</span>
                <span className="font-semibold text-stone-900">
                  {rupiah.format(feeOrder.subtotalAmount)}
                </span>
              </div>

              <div>
                <label htmlFor="shipping-fee-input" className="block text-sm font-semibold text-stone-800">
                  Biaya ongkir
                </label>
                <div className="relative mt-2">
                  <input
                    id="shipping-fee-input"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    value={feeInput}
                    onChange={(event) => setFeeInput(event.target.value)}
                    className="mt-2 h-11 w-full rounded-xl border border-stone-300 bg-white pr-12 pl-4 text-sm text-stone-900 outline-none transition focus:border-[var(--brand-600)] focus:ring-4 focus:ring-[var(--brand-600)]/10"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-stone-400">Rp</span>
                </div>
              </div>

              <p className="text-xs leading-5 text-stone-500">
                Setelah disimpan, total pesanan otomatis diperbarui dan pelanggan diarahkan untuk
                melakukan pembayaran.
              </p>

              {feeError ? (
                <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{feeError}</p>
              ) : null}

              <div className="flex items-center justify-between rounded-xl border border-stone-200 px-4 py-3 text-sm">
                <span className="text-stone-500">Total pesanan</span>
                <span className="font-serif text-lg font-bold text-[var(--ink-950)]">
                  {rupiah.format(feeOrder.subtotalAmount + (Number(feeInput) || 0))}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-stone-200 px-5 py-4">
              <button
                type="button"
                onClick={() => setFeeOrder(null)}
                className="inline-flex h-11 items-center rounded-full border border-stone-300 px-5 text-sm font-semibold text-stone-700 hover:bg-stone-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => void saveShippingFee()}
                disabled={feeSaving}
                className="inline-flex h-11 items-center gap-2 rounded-full bg-[var(--brand-600)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--brand-900)] disabled:cursor-not-allowed disabled:bg-stone-300"
              >
                {feeSaving ? <Loader2 size={16} className="animate-spin" /> : <Hammer size={16} />}
                {feeSaving ? "Menyimpan..." : "Simpan ongkir"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}