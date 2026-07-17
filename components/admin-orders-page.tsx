"use client";

import { CheckCircle2, ExternalLink, ImageIcon, PackageCheck, X } from "lucide-react";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/client-api";

type Order = {
  id: string;
  orderNumber: string;
  recipientName: string;
  totalAmount: number;
  paymentStatus: "pending" | "awaiting_verification" | "paid" | "failed";
  orderStatus: "waiting_payment" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentProofUrl: string | null;
  createdAt: string;
};

type SelectedProof = Pick<Order, "orderNumber" | "recipientName" | "paymentProofUrl">;

const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});
const date = new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" });

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedProof, setSelectedProof] = useState<SelectedProof | null>(null);

  useEffect(() => {
    apiFetch<{ orders: Order[] }>("/api/admin/orders", { cache: "no-store" })
      .then((payload) => setOrders(payload.orders))
      .catch((caught) =>
        setError(caught instanceof Error ? caught.message : "Gagal memuat pesanan"),
      );
  }, []);

  useEffect(() => {
    if (!selectedProof) return;

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setSelectedProof(null);
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [selectedProof]);

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

  return (
    <div className="mx-auto max-w-7xl">
      <p className="text-sm font-semibold text-orange-700">Operasional pesanan</p>
      <h1 className="mt-1 font-serif text-4xl">Pesanan pelanggan</h1>
      <p className="mt-2 text-sm text-stone-500">
        Verifikasi pembayaran dan perbarui proses pengiriman.
      </p>

      {error ? (
        <p className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>
      ) : null}

      <div className="mt-8 overflow-x-auto rounded-3xl border border-stone-200 bg-white">
        <table className="w-full min-w-[1050px] text-left text-sm">
          <thead className="bg-stone-50 text-xs uppercase text-stone-500">
            <tr>
              <th className="p-4">Pesanan</th>
              <th className="p-4">Pelanggan</th>
              <th className="p-4">Total</th>
              <th className="p-4">Bukti transfer</th>
              <th className="p-4">Pembayaran</th>
              <th className="p-4">Proses</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {orders.map((order) => (
              <tr key={order.id} className="align-middle">
                <td className="p-4">
                  <p className="font-mono font-semibold">{order.orderNumber}</p>
                  <p className="text-xs text-stone-500">
                    {date.format(new Date(order.createdAt))}
                  </p>
                </td>
                <td className="p-4">{order.recipientName}</td>
                <td className="p-4 font-semibold">{rupiah.format(order.totalAmount)}</td>
                <td className="p-4">
                  {order.paymentProofUrl ? (
                    <button
                      type="button"
                      onClick={() => setSelectedProof(order)}
                      aria-label={`Lihat bukti transfer pesanan ${order.orderNumber}`}
                      className="group flex items-center gap-3 rounded-xl text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-600 focus-visible:ring-offset-2"
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
                        <span className="flex items-center gap-1 text-xs font-semibold text-orange-700 group-hover:underline">
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
                    className="rounded-lg border p-2 text-xs"
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
                    className="rounded-lg border p-2 text-xs"
                  >
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
          <p className="py-12 text-center text-sm text-stone-500">Belum ada pesanan.</p>
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
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-orange-700">
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
                className="rounded-full p-2 text-stone-500 hover:bg-stone-100 hover:text-stone-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-600"
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
                className="inline-flex items-center gap-2 rounded-full bg-stone-950 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700"
              >
                Buka gambar asli
                <ExternalLink size={15} />
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
