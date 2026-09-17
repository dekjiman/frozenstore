"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  LifeBuoy,
  MapPin,
  Package,
  Phone,
  ReceiptText,
  Truck,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { PaymentProofUpload } from "@/components/payment-proof-upload";
import { TransferGuide } from "@/components/transfer-guide";
import { apiFetch } from "@/lib/client-api";
import { toWaLink } from "@/lib/wa";

type OrderItem = {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  price: number;
  lineTotal: number;
};

type OrderDetail = {
  id: string;
  orderNumber: string;
  createdAt: string;
  shipping: {
    recipientName: string;
    phone: string;
    address: string;
    city: string;
    province: string;
    postalCode: string;
    notes: string;
  };
  items: OrderItem[];
  totals: { subtotal: number; shipping: number; total: number };
  payment: { status: string; statusLabel: string; proofUrl: string | null };
  status: string;
  statusLabel: string;
};

const rupiahFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});
const dateFormatter = new Intl.DateTimeFormat("id-ID", { dateStyle: "long" });

function statusLabel(order: OrderDetail): string {
  if (order.status === "cancelled") return "Dibatalkan";
  if (order.status === "waiting_shipping_fee") return "Menunggu Konfirmasi Ongkir";
  if (order.payment.status === "awaiting_verification") return "Menunggu Verifikasi";
  if (order.payment.status === "failed") return "Pembayaran Ditolak";
  if (order.status === "waiting_payment") return "Menunggu Pembayaran";
  return order.statusLabel;
}

function statusTone(order: OrderDetail): string {
  if (order.status === "cancelled") return "bg-red-100 text-red-700";
  if (order.status === "waiting_shipping_fee") return "bg-amber-100 text-amber-800";
  if (order.payment.status === "awaiting_verification") return "bg-sky-100 text-sky-800";
  if (order.payment.status === "failed") return "bg-red-100 text-red-700";
  if (order.status === "waiting_payment") return "bg-[var(--cream-100)] text-[var(--brand-700)]";
  if (order.status === "processing") return "bg-sky-100 text-sky-800";
  if (order.status === "shipped") return "bg-indigo-100 text-indigo-800";
  if (order.status === "delivered") return "bg-emerald-100 text-emerald-800";
  return "bg-stone-100 text-stone-700";
}

export function AccountOrderDetail({ orderId }: { orderId: string }) {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [adminNumber, setAdminNumber] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/masuk");
      return;
    }
    apiFetch<{ order: OrderDetail }>(`/api/orders/${encodeURIComponent(orderId)}`, {
      cache: "no-store",
    })
      .then((payload) => {
        setOrder(payload.order);
        setError(null);
      })
      .catch((caught) => setError(caught instanceof Error ? caught.message : "Gagal memuat pesanan"))
      .finally(() => setIsLoading(false));
  }, [authLoading, user, router, orderId, reloadKey]);

  useEffect(() => {
    apiFetch<{ data: { whatsappNumber?: string | null } }>("/api/site-settings", {
      cache: "no-store",
    })
      .then((payload) => setAdminNumber((payload.data?.whatsappNumber ?? "").replace(/\D/g, "")))
      .catch(() => {
        setAdminNumber("");
      });
  }, []);

  if (authLoading || isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-16 text-sm text-[var(--ink-700)]">
        Memuat pesanan...
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-16">
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        <Link href="/akun" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--brand-600)]">
          <ArrowLeft size={15} /> Kembali ke akun
        </Link>
      </div>
    );
  }

  if (!order) return null;

  const canPay =
    order.status === "waiting_payment" &&
    (order.payment.status === "pending" || order.payment.status === "failed");
  const waLink =
    order.status === "waiting_shipping_fee" && adminNumber
      ? toWaLink(
          adminNumber,
          `Halo, saya menunggu konfirmasi ongkir untuk pesanan ${order.orderNumber}.`,
        )
      : null;

  return (
    <div className="mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-14">
      <Link href="/akun" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--brand-600)]">
        <ArrowLeft size={15} /> Kembali ke akun
      </Link>

      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-[var(--ink-700)]">Detail pesanan</p>
          <p className="mt-1 font-mono text-2xl font-bold">{order.orderNumber}</p>
          <p className="mt-1 text-xs text-[var(--ink-700)]">
            Dipesan {dateFormatter.format(new Date(order.createdAt))}
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone(order)}`}>
          {statusLabel(order)}
        </span>
      </div>

      <section aria-labelledby="order-items-title" className="mt-8 rounded-2xl border border-[var(--border)] bg-white p-5 sm:p-6">
        <h2 id="order-items-title" className="flex items-center gap-2 text-sm font-semibold">
          <Package size={16} /> Produk ({order.items.reduce((sum, item) => sum + item.quantity, 0)} item)
        </h2>
        <ul className="mt-4 divide-y divide-[var(--cream-100)]">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{item.name}</p>
                <p className="mt-0.5 text-xs text-[var(--ink-700)]">
                  {item.sku} · {item.quantity} × {rupiahFormatter.format(item.price)}
                </p>
              </div>
              <p className="text-sm font-semibold">{rupiahFormatter.format(item.lineTotal)}</p>
            </li>
          ))}
        </ul>

        <dl className="mt-4 space-y-2 border-t border-[var(--cream-100)] pt-4 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-[var(--ink-700)]">Subtotal</dt>
            <dd>{rupiahFormatter.format(order.totals.subtotal)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="flex items-center gap-1.5 text-[var(--ink-700)]">
              <Truck size={14} aria-hidden="true" />
              {order.status === "waiting_shipping_fee" ? "Ongkir" : "Pengiriman"}
            </dt>
            <dd>
              {order.status === "waiting_shipping_fee"
                ? "Dikonfirmasi admin"
                : rupiahFormatter.format(order.totals.shipping)}
            </dd>
          </div>
          <div className="flex justify-between gap-4 border-t border-[var(--cream-100)] pt-3">
            <dt className="font-semibold">Total</dt>
            <dd className="font-bold text-[var(--brand-600)]">{rupiahFormatter.format(order.totals.total)}</dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="order-shipping-title" className="mt-6 rounded-2xl border border-[var(--border)] bg-white p-5 sm:p-6">
        <h2 id="order-shipping-title" className="flex items-center gap-2 text-sm font-semibold">
          <MapPin size={16} /> Pengiriman
        </h2>
        <p className="mt-3 text-sm font-semibold">{order.shipping.recipientName}</p>
        <p className="mt-1 flex items-center gap-1.5 text-xs text-[var(--ink-700)]">
          <Phone size={13} aria-hidden="true" /> {order.shipping.phone}
        </p>
        <p className="mt-2 text-sm leading-6 text-[var(--ink-700)]">
          {order.shipping.address}
          {order.shipping.city ? `, ${order.shipping.city}` : ""}
          {order.shipping.province ? `, ${order.shipping.province}` : ""}
          {order.shipping.postalCode ? ` ${order.shipping.postalCode}` : ""}
        </p>
        {order.shipping.notes ? (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-[var(--ink-700)]">
            <ReceiptText size={13} aria-hidden="true" /> {order.shipping.notes}
          </p>
        ) : null}
      </section>

      {order.status === "waiting_shipping_fee" ? (
        <section aria-label="Menunggu konfirmasi ongkir" className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <p className="flex items-center gap-2 text-sm font-semibold text-amber-900">
            <Clock size={18} aria-hidden="true" /> Menunggu konfirmasi ongkir
          </p>
          <p className="mt-2 text-sm leading-6 text-amber-800">
            Biaya ongkir untuk pengiriman Instan sedang dikonfirmasi admin melalui WhatsApp. Setelah dikonfirmasi,
            halaman ini akan tersedia untuk pembayaran.
          </p>
          {waLink ? (
            <a
              href={waLink}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-amber-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-950"
            >
              <LifeBuoy size={16} /> Hubungi admin via WhatsApp
            </a>
          ) : null}
        </section>
      ) : null}

      {canPay ? (
        <section aria-label="Pembayaran" className="mt-6 rounded-2xl border border-[var(--border)] bg-white p-5 sm:p-6">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <ReceiptText size={16} /> Pembayaran
          </h2>
          {order.payment.status === "failed" ? (
            <p className="mt-3 flex items-center gap-2 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-700">
              <XCircle size={17} aria-hidden="true" /> Pembayaran sebelumnya ditolak. Silakan transfer ulang lalu
              unggah bukti yang baru.
            </p>
          ) : null}
          <TransferGuide total={order.totals.total} />
          <PaymentProofUpload
            orderId={order.id}
            submitLabel="Kirim bukti pembayaran"
            helperText="Wajib diunggah agar pesanan dapat diverifikasi admin."
            onConfirmed={() => setReloadKey((key) => key + 1)}
          />
        </section>
      ) : null}

      {order.payment.status === "awaiting_verification" ? (
        <section aria-label="Menunggu verifikasi" className="mt-6 rounded-2xl border border-sky-200 bg-sky-50 p-6">
          <p className="flex items-center gap-2 text-sm font-semibold text-sky-900">
            <CheckCircle2 size={18} aria-hidden="true" /> Menunggu verifikasi admin
          </p>
          <p className="mt-2 text-sm leading-6 text-sky-800">
            Bukti pembayaran sedang diperiksa admin. Kamu akan diproses setelah pembayaran dinyatakan sah.
          </p>
          {order.payment.proofUrl ? (
            <div className="mt-4">
              <p className="text-xs font-medium text-sky-700">Bukti yang kamu unggah:</p>
              <div className="mt-2 flex flex-wrap gap-3">
                <img
                  src={order.payment.proofUrl}
                  alt="Bukti pembayaran yang diunggah"
                  className="max-h-40 max-w-full rounded-xl border border-sky-100 bg-white object-cover"
                />
                <a
                  href={order.payment.proofUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-sky-300 bg-white px-4 py-2 text-xs font-semibold text-sky-800"
                >
                  Buka gambar
                </a>
              </div>
            </div>
          ) : null}
        </section>
      ) : null}

      {order.status === "processing" ? (
        <section aria-label="Pesanan diproses" className="mt-6 rounded-2xl border border-sky-200 bg-sky-50 p-6">
          <p className="flex items-center gap-2 text-sm font-semibold text-sky-900">
            <Package size={18} aria-hidden="true" /> Pesanan sedang diproses
          </p>
          <p className="mt-2 text-sm leading-6 text-sky-800">
            Pembayaran sudah diterima. Admin sedang menyiapkan pesananmu untuk dikirim.
          </p>
        </section>
      ) : null}

      {order.status === "shipped" ? (
        <section aria-label="Pesanan dikirim" className="mt-6 rounded-2xl border border-indigo-200 bg-indigo-50 p-6">
          <p className="flex items-center gap-2 text-sm font-semibold text-indigo-900">
            <Truck size={18} aria-hidden="true" /> Pesanan sedang dikirim
          </p>
          <p className="mt-2 text-sm leading-6 text-indigo-800">
            Pesananmu sedang dalam perjalanan menuju alamat tujuan.
          </p>
        </section>
      ) : null}

      {order.status === "delivered" ? (
        <section aria-label="Pesanan selesai" className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
          <p className="flex items-center gap-2 text-sm font-semibold text-emerald-900">
            <CheckCircle2 size={18} aria-hidden="true" /> Pesanan selesai
          </p>
          <p className="mt-2 text-sm leading-6 text-emerald-800">
            Pesanan sudah diterima. Terima kasih telah berbelanja di Jasmine Shop Premium Product.
          </p>
        </section>
      ) : null}

      {order.status === "cancelled" ? (
        <section aria-label="Pesanan dibatalkan" className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6">
          <p className="flex items-center gap-2 text-sm font-semibold text-red-900">
            <XCircle size={18} aria-hidden="true" /> Pesanan dibatalkan
          </p>
          <p className="mt-2 text-sm leading-6 text-red-800">Pesanan ini tidak dapat dilanjutkan.</p>
        </section>
      ) : null}
    </div>
  );
}