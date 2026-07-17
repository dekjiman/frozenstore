import Link from "next/link";
import { CheckCircle2, Clock3, MapPin, PackageCheck, ReceiptText } from "lucide-react";
import type { ShippingData } from "@/components/shipping-form";
import type { CartItem } from "@/types/cart";

type OrderSummaryProps = {
  items: CartItem[];
  shipping: ShippingData;
  subtotal: number;
  order: { id: string; orderNumber: string; totalAmount: number; paymentStatus: string } | null;
};

const rupiahFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export function OrderSummary({ items, shipping, subtotal, order }: OrderSummaryProps) {
  const shippingCost = 20_000;

  return (
    <div className="mt-8">
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 sm:flex sm:items-center sm:gap-4">
        <span className="grid size-12 shrink-0 place-items-center rounded-full bg-emerald-600 text-white">
          <CheckCircle2 aria-hidden="true" size={23} />
        </span>
        <div className="mt-3 sm:mt-0">
          <p className="text-sm font-semibold text-emerald-900">Pesanan berhasil dibuat</p>
          <p className="mt-1 text-xs leading-5 text-emerald-800">
            Bukti pembayaran akan diperiksa admin dalam waktu maksimal 1×24 jam.
          </p>
        </div>
      </div>

      <dl className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-stone-200 p-4">
          <dt className="flex items-center gap-2 text-xs font-medium text-stone-500">
            <ReceiptText aria-hidden="true" size={15} /> Nomor pesanan
          </dt>
          <dd className="mt-2 font-mono text-sm font-bold text-stone-900">{order?.orderNumber ?? "—"}</dd>
        </div>
        <div className="rounded-2xl border border-stone-200 p-4">
          <dt className="flex items-center gap-2 text-xs font-medium text-stone-500">
            <Clock3 aria-hidden="true" size={15} /> Status pembayaran
          </dt>
          <dd className="mt-2 inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
            Menunggu verifikasi
          </dd>
        </div>
      </dl>

      <div className="mt-6 rounded-2xl border border-stone-200 p-5">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-stone-900">
          <MapPin aria-hidden="true" size={17} className="text-orange-700" /> Alamat pengiriman
        </h3>
        <p className="mt-3 text-sm font-semibold text-stone-900">{shipping.recipientName}</p>
        <p className="mt-1 text-sm text-stone-600">{shipping.phone}</p>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          {shipping.address}, {shipping.city}, {shipping.province} {shipping.postalCode}
        </p>
        {shipping.notes ? <p className="mt-2 text-xs italic text-stone-500">Catatan: {shipping.notes}</p> : null}
      </div>

      <div className="mt-6 rounded-2xl border border-stone-200 p-5">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-stone-900">
          <PackageCheck aria-hidden="true" size={17} className="text-orange-700" /> Detail pesanan
        </h3>
        <div className="mt-4 divide-y divide-stone-100">
          {items.map((item) => (
            <div key={item.id} className="flex items-start justify-between gap-4 py-3 text-sm">
              <div className="min-w-0">
                <p className="truncate font-medium text-stone-900">{item.product.name}</p>
                <p className="mt-0.5 text-xs text-stone-500">{item.quantity} × {rupiahFormatter.format(item.product.price)}</p>
              </div>
              <p className="shrink-0 font-medium text-stone-700">
                {rupiahFormatter.format(item.product.price * item.quantity)}
              </p>
            </div>
          ))}
        </div>
        <dl className="mt-3 space-y-2 border-t border-stone-200 pt-4 text-sm">
          <div className="flex justify-between text-stone-600"><dt>Subtotal</dt><dd>{rupiahFormatter.format(subtotal)}</dd></div>
          <div className="flex justify-between text-stone-600"><dt>Pengiriman</dt><dd>{rupiahFormatter.format(shippingCost)}</dd></div>
          <div className="flex justify-between pt-2 font-bold text-stone-950"><dt>Total</dt><dd className="text-orange-700">{rupiahFormatter.format(subtotal + shippingCost)}</dd></div>
        </dl>
      </div>

      <div className="mt-7 flex flex-col gap-3 sm:flex-row">
        <Link href="/akun/pesanan" className="flex flex-1 items-center justify-center rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-700">
          Lihat status pesanan
        </Link>
        <Link href="/" className="flex flex-1 items-center justify-center rounded-full border border-stone-300 px-5 py-3 text-sm font-semibold text-stone-700 hover:bg-stone-100">
          Kembali berbelanja
        </Link>
      </div>
    </div>
  );
}
