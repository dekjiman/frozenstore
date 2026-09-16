"use client";

import Link from "next/link";
import { ArrowLeft, Check, ClipboardCheck, CreditCard, MapPin, PackageCheck, ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/client-api";
import { useCart } from "@/components/cart-provider";
import { toWaLink } from "@/lib/wa";
import {
  ShippingForm,
  type ShippingData,
  type ShippingErrors,
  type ShippingMethod,
  type ShippingMethodsConfig,
} from "@/components/shipping-form";
import { TransferGuide } from "@/components/transfer-guide";
import { PaymentProofUpload } from "@/components/payment-proof-upload";
import { OrderSummary } from "@/components/order-summary";
import { SavedAddressPicker, type SavedAddress } from "@/components/saved-address-picker";

const steps = [
  { id: 1, title: "Pengiriman", description: "Alamat penerima", icon: MapPin },
  { id: 2, title: "Pembayaran", description: "Transfer / QRIS", icon: CreditCard },
  { id: 3, title: "Konfirmasi", description: "Bukti pembayaran", icon: PackageCheck },
  { id: 4, title: "Ringkasan", description: "Status pesanan", icon: ClipboardCheck },
] as const;

const rupiahFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const DEFAULT_METHODS: ShippingMethodsConfig = {
  enableRegular: true,
  enableSameDay: true,
  enableInstant: true,
  defaultMethod: "regular",
  sameDayFixedCost: 25000,
  flatDeliveryCost: 20000,
};

const METHOD_ORDER: ShippingMethod[] = ["regular", "same_day", "instant"];

function isShippingMethod(value: unknown): value is ShippingMethod {
  return value === "regular" || value === "same_day" || value === "instant";
}

function enabledMethods(settings: ShippingMethodsConfig): ShippingMethod[] {
  return METHOD_ORDER.filter((entry) => {
    if (entry === "regular") return settings.enableRegular;
    if (entry === "same_day") return settings.enableSameDay;
    return settings.enableInstant;
  });
}

type OrderResponse = {
  id: string;
  orderNumber: string;
  totalAmount: number;
  paymentStatus: string;
  orderStatus: string;
  shippingMethod: ShippingMethod;
};

const METHOD_LABELS: Record<ShippingMethod, string> = {
  regular: "Reguler",
  same_day: "Same Day (Grab / GoSend)",
  instant: "Instan (Grab / GoSend)",
};

export function CheckoutFlow() {
  const { items, itemCount, subtotal, refreshCart } = useCart();
  const [currentStep, setCurrentStep] = useState(1);
  const [maxStep, setMaxStep] = useState(1);
  const [shippingData, setShippingData] = useState<ShippingData>({
    recipientName: "",
    phone: "",
    address: "",
    city: "",
    province: "",
    postalCode: "",
    notes: "",
  });
  const [shippingErrors, setShippingErrors] = useState<ShippingErrors>({});
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderedItems, setOrderedItems] = useState(items);
  const [orderedSubtotal, setOrderedSubtotal] = useState(subtotal);

  const [methods, setMethods] = useState<ShippingMethodsConfig>(DEFAULT_METHODS);
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [method, setMethod] = useState<ShippingMethod>("regular");
  const [feePending, setFeePending] = useState(false);
  const methodTouchedRef = useRef(false);

  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    apiFetch<ShippingMethodsConfig & { whatsappNumber?: string }>("/api/shipping/methods")
      .then((payload) => {
        if (!active) return;
        const merged: ShippingMethodsConfig = { ...DEFAULT_METHODS, ...payload };
        setMethods(merged);
        if (payload.whatsappNumber) setWhatsappNumber(payload.whatsappNumber);
        if (!methodTouchedRef.current) {
          const available = enabledMethods(merged);
          const preferred = isShippingMethod(payload.defaultMethod)
            ? payload.defaultMethod
            : null;
          const target =
            preferred && available.includes(preferred)
              ? preferred
              : available[0] ?? "regular";
          setMethod(target);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    apiFetch<{ addresses: SavedAddress[] }>("/api/account/addresses", { cache: "no-store" })
      .then((payload) => {
        if (!active) return;
        setSavedAddresses(payload.addresses);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  function updateShipping(field: keyof ShippingData, value: string) {
    setShippingData((data) => ({ ...data, [field]: value }));
    setShippingErrors((errors) => ({ ...errors, [field]: undefined }));
  }

  function selectSavedAddress(address: SavedAddress) {
    setSelectedAddressId(address.id);
    setShippingData({
      recipientName: address.recipientName,
      phone: address.phone,
      address: address.address,
      city: address.city,
      province: address.province,
      postalCode: address.postalCode,
      notes: address.notes,
    });
    setShippingErrors({});
  }

  function resetSavedAddress() {
    setSelectedAddressId(null);
    setShippingData({ recipientName: "", phone: "", address: "", city: "", province: "", postalCode: "", notes: "" });
    setShippingErrors({});
  }

  function handleSelectMethod(next: ShippingMethod) {
    methodTouchedRef.current = true;
    setMethod(next);
    setShippingErrors((errors) => ({ ...errors, method: undefined }));
  }

  function validateShipping() {
    const errors: ShippingErrors = {};
    if (shippingData.recipientName.trim().length < 3) errors.recipientName = "Nama penerima minimal 3 karakter";
    if (!/^(?:\+62|62|0)8\d{8,12}$/.test(shippingData.phone.replace(/[\s-]/g, ""))) {
      errors.phone = "Masukkan nomor WhatsApp Indonesia yang valid";
    }
    if (shippingData.address.trim().length < 15) errors.address = "Alamat lengkap minimal 15 karakter";
    if (shippingData.city.trim().length < 3) errors.city = "Kota atau kabupaten wajib diisi";
    if (shippingData.province.trim().length < 3) errors.province = "Provinsi wajib diisi";
    if (shippingData.postalCode && !/^\d{5}$/.test(shippingData.postalCode)) errors.postalCode = "Kode pos harus terdiri dari 5 digit";
    setShippingErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function goToStep(step: number) {
    if (step <= maxStep) setCurrentStep(step);
  }

  async function continueCheckout() {
    if (currentStep === 1 && !validateShipping()) return;
    if (currentStep === 1 && !order) {
      if (items.length === 0) { setCheckoutError("Keranjang masih kosong"); return; }
      if (method === "regular" && !methods.enableRegular) { setCheckoutError("Metode Reguler sedang tidak tersedia."); return; }
      if (method === "same_day" && !methods.enableSameDay) { setCheckoutError("Metode Same Day sedang tidak tersedia."); return; }
      if (method === "instant" && !methods.enableInstant) { setCheckoutError("Metode Instan sedang tidak tersedia."); return; }
      setIsSubmitting(true);
      setCheckoutError(null);
      try {
        const payload = await apiFetch<{ order: OrderResponse }>("/api/checkout/shipping", {
          method: "POST",
          body: JSON.stringify({ ...shippingData, method }),
        });
        setOrderedItems(items);
        setOrderedSubtotal(subtotal);
        setOrder(payload.order);
        await refreshCart();
        if (payload.order.orderStatus === "waiting_shipping_fee") {
          setIsSubmitting(false);
          setFeePending(true);
          setMaxStep(1);
          return;
        }
      } catch (caught) {
        setCheckoutError(caught instanceof Error ? caught.message : "Gagal membuat pesanan");
        setIsSubmitting(false);
        return;
      }
      setIsSubmitting(false);
    }
    const nextStep = Math.min(steps.length, currentStep + 1);
    setMaxStep((step) => Math.max(step, nextStep));
    setCurrentStep(nextStep);
  }

  function completePaymentProof() {
    setMaxStep(4);
    setCurrentStep(4);
  }

  const instanBelumAdaOrder = !order && method === "instant";

  function displayDelivery(): number | null {
    if (order) return order.totalAmount - orderedSubtotal;
    if (instanBelumAdaOrder) return null;
    if (method === "same_day") return methods.sameDayFixedCost;
    return methods.flatDeliveryCost;
  }

  const delivery = displayDelivery();
  const preOrderTotal = subtotal + (delivery ?? 0);
  const courierLabel = METHOD_LABELS[order ? order.shippingMethod : method];
  const waLink = whatsappNumber ? toWaLink(whatsappNumber) : null;

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12 lg:px-10 lg:py-16">
      <Link
        href="/keranjang"
        className="inline-flex items-center gap-2 text-sm font-medium text-[var(--ink-700)] transition hover:text-[var(--brand-600)]"
      >
        <ArrowLeft aria-hidden="true" size={17} />
        Kembali ke keranjang
      </Link>

      <div className="mt-7">
        <p className="text-sm font-semibold text-[var(--brand-600)]">Selesaikan pesanan</p>
        <h1 className="mt-1 font-serif text-4xl tracking-tight sm:text-5xl">Checkout</h1>
      </div>

      <nav aria-label="Tahapan checkout" className="mt-9 overflow-x-auto pb-2">
        <ol className="flex min-w-[820px] items-start">
          {steps.map((step, index) => {
            const isComplete = step.id < currentStep;
            const isCurrent = step.id === currentStep;
            const Icon = step.icon;

            return (
              <li key={step.id} className="flex flex-1 items-start last:flex-none">
                <button
                  type="button"
                  onClick={() => goToStep(step.id)}
                  disabled={step.id > maxStep}
                  aria-current={isCurrent ? "step" : undefined}
                  className="group flex min-w-40 items-start gap-3 text-left"
                >
                  <span
                    className={`grid size-10 shrink-0 place-items-center rounded-full border transition ${
                      isComplete
                        ? "border-emerald-600 bg-emerald-600 text-white"
                        : isCurrent
                          ? "border-[var(--brand-600)] bg-[var(--brand-600)] text-white"
                          : "border-[var(--border)] bg-white text-[var(--ink-700)] group-hover:border-[var(--ink-700)]"
                    } disabled:cursor-not-allowed`}
                  >
                    {isComplete ? <Check size={17} /> : <Icon size={17} />}
                  </span>
                  <span>
                    <span className="block text-xs text-[var(--ink-700)]">Langkah {step.id}</span>
                    <span className="mt-0.5 block text-sm font-semibold text-[var(--ink-950)]">{step.title}</span>
                    <span className="mt-0.5 block text-xs text-[var(--ink-700)]">{step.description}</span>
                  </span>
                </button>
                {index < steps.length - 1 ? (
                  <span
                    aria-hidden="true"
                    className={`mx-4 mt-5 h-px min-w-8 flex-1 ${step.id < currentStep ? "bg-emerald-500" : "bg-[var(--border)]"}`}
                  />
                ) : null}
              </li>
            );
          })}
        </ol>
      </nav>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-12">
        <section className="rounded-3xl border border-[var(--border)] bg-white p-6 sm:p-8" aria-live="polite">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand-600)]">
            Langkah {currentStep} dari {steps.length}
          </p>
          <h2 className="mt-2 font-serif text-3xl text-[var(--ink-950)]">{steps[currentStep - 1].title}</h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--ink-700)]">
            {currentStep === 1
              ? "Lengkapi informasi penerima, alamat tujuan, dan pilih metode pengiriman."
              : currentStep === 2
                ? "Periksa total pesanan dan ikuti panduan pembayaran resmi Jasmine Shop Premium Product."
                : currentStep === 3
                  ? "Unggah bukti pembayaran agar dapat segera diverifikasi oleh admin."
                  : "Simpan nomor pesanan dan pantau proses verifikasi pembayaranmu."}
          </p>
          {checkoutError ? <p role="alert" className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{checkoutError}</p> : null}

          {currentStep === 1 ? (
            order && feePending ? (
              <div className="mt-8">
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                  <p className="flex items-center gap-2 text-sm font-semibold text-amber-900">
                    <PackageCheck aria-hidden="true" size={19} />
                    Pesanan sedang menunggu konfirmasi ongkir
                  </p>
                  <p className="mt-2 text-sm leading-6 text-amber-800">
                    Pesanan{" "}
                    <span className="font-mono font-bold">{order.orderNumber}</span> berhasil dibuat. Biaya ongkir
                    instan akan dikonfirmasi admin melalui WhatsApp sebelum kamu melakukan pembayaran.
                  </p>
                  {waLink ? (
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-flex items-center gap-2 rounded-full bg-amber-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-950"
                    >
                      Hubungi admin via WhatsApp
                    </a>
                  ) : null}
                </div>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <Link href="/" className="flex flex-1 items-center justify-center rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold text-white hover:bg-[var(--brand-700)]">
                    Kembali berbelanja
                  </Link>
                  <Link href="/akun" className="flex flex-1 items-center justify-center rounded-full border border-stone-300 px-5 py-3 text-sm font-semibold text-stone-700 hover:bg-stone-100">
                    Lihat status pesanan
                  </Link>
                </div>
              </div>
            ) : (
              <>
                {savedAddresses.length > 0 ? (
                  <SavedAddressPicker
                    addresses={savedAddresses}
                    selectedId={selectedAddressId}
                    onSelect={selectSavedAddress}
                    onReset={resetSavedAddress}
                  />
                ) : null}
                <ShippingForm
                  data={shippingData}
                  errors={shippingErrors}
                  onChange={updateShipping}
                  methods={methods}
                  method={method}
                  onSelectMethod={handleSelectMethod}
                />
              </>
            )
          ) : currentStep === 2 ? (
            <>
              <TransferGuide total={order?.totalAmount ?? preOrderTotal} />
            </>
          ) : currentStep === 3 ? (
            <PaymentProofUpload orderId={order?.id ?? ""} onConfirmed={completePaymentProof} />
          ) : (
            <OrderSummary
              items={orderedItems}
              shipping={shippingData}
              subtotal={orderedSubtotal}
              order={order}
              shippingAmount={order ? order.totalAmount - orderedSubtotal : 0}
              courier={courierLabel}
            />
          )}

          {currentStep < 4 ? <div className="mt-7 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => setCurrentStep((step) => Math.max(1, step - 1))}
              disabled={currentStep === 1}
              className="rounded-full border border-[var(--border)] px-5 py-3 text-sm font-semibold text-[var(--ink-700)] transition hover:bg-[var(--cream-100)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Kembali
            </button>
            {feePending ? (
              <p className="max-w-xs text-right text-xs leading-5 text-[var(--ink-700)]">
                Menunggu konfirmasi ongkir dari admin sebelum pembayaran.
              </p>
            ) : currentStep < 3 ? (
              <button
                type="button"
                onClick={continueCheckout}
                disabled={isSubmitting}
                className="rounded-full bg-[var(--brand-600)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--brand-900)] disabled:cursor-not-allowed disabled:bg-[var(--border)]"
              >
                {isSubmitting ? "Menyimpan pesanan..." : "Lanjutkan"}
              </button>
            ) : (
              <p className="max-w-xs text-right text-xs leading-5 text-[var(--ink-700)]">
                Ringkasan terbuka setelah bukti pembayaran berhasil diunggah.
              </p>
            )}
          </div> : null}
        </section>

        <aside className="rounded-3xl bg-[var(--brand-900)] p-6 text-white lg:sticky lg:top-8">
          <h2 className="font-serif text-2xl">Ringkasan pesanan</h2>
          <div className="mt-6 space-y-4">
            {(order ? orderedItems : items).map((item) => (
              <div key={item.id} className="flex items-start justify-between gap-4 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium text-white">{item.product.name}</p>
                  <p className="mt-0.5 text-xs text-[var(--cream-100)]">{item.quantity} × {rupiahFormatter.format(item.product.price)}</p>
                </div>
                <p className="shrink-0 text-[var(--cream-50)]">{rupiahFormatter.format(item.product.price * item.quantity)}</p>
              </div>
            ))}
          </div>
          <div className="my-6 h-px bg-white/15" />
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-4 text-[var(--cream-100)]">
              <dt>Subtotal ({order ? orderedItems.reduce((sum, item) => sum + item.quantity, 0) : itemCount} item)</dt>
              <dd className="text-white">{rupiahFormatter.format(order ? orderedSubtotal : subtotal)}</dd>
            </div>
            <div className="flex justify-between gap-4 text-[var(--cream-100)]">
              <dt>Pengiriman</dt>
              <dd className="text-white">{instanBelumAdaOrder || (order && feePending) ? "Menyusul" : delivery === null ? "—" : rupiahFormatter.format(delivery)}</dd>
            </div>
            <div className="flex justify-between gap-4 pt-2 text-base font-semibold">
              <dt>Total</dt>
              <dd className="text-[var(--accent-500)]">{rupiahFormatter.format(order?.totalAmount ?? preOrderTotal)}</dd>
            </div>
          </dl>
          {instanBelumAdaOrder || (order && feePending) ? (
            <p className="mt-4 text-xs leading-5 text-[var(--cream-100)]">
              Total untuk pesanan ini belum termasuk ongkir instan. Ongkir ditentukan admin dan dikonfirmasi via WhatsApp.
            </p>
          ) : null}
          <p className="mt-6 flex items-center gap-2 text-xs text-[var(--cream-100)]">
            <ShieldCheck aria-hidden="true" size={15} />
            Informasi pesananmu terlindungi
          </p>
        </aside>
      </div>
    </div>
  );
}