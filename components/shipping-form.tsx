"use client";

import { Info, Truck, Zap } from "lucide-react";

export type ShippingData = {
  recipientName: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  notes: string;
};

export type ShippingErrors = Partial<Record<keyof ShippingData | "method", string>>;

export type ShippingMethod = "regular" | "same_day" | "instant";

export type ShippingMethodsConfig = {
  enableRegular: boolean;
  enableSameDay: boolean;
  enableInstant: boolean;
  defaultMethod: ShippingMethod;
  sameDayFixedCost: number;
  flatDeliveryCost: number;
};

type ShippingFormProps = {
  data: ShippingData;
  errors: ShippingErrors;
  onChange: (field: keyof ShippingData, value: string) => void;
  methods: ShippingMethodsConfig;
  method: ShippingMethod;
  onSelectMethod: (method: ShippingMethod) => void;
};

const fieldClass =
  "mt-2 h-12 w-full rounded-xl border border-stone-300 bg-white px-4 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-[var(--brand-600)] focus:ring-4 focus:ring-[var(--brand-600)]/10";

const rupiah = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });

export function ShippingForm({
  data,
  errors,
  onChange,
  methods,
  method,
  onSelectMethod,
}: ShippingFormProps) {
  const { enableRegular, enableSameDay, enableInstant, sameDayFixedCost, flatDeliveryCost } = methods;

  const options: Array<{
    value: ShippingMethod;
    label: string;
    hint: string;
    cost: string | null;
    icon: React.ReactNode;
  }> = [];

  if (enableRegular) {
    options.push({
      value: "regular",
      label: "Reguler",
      hint: "Dikirim via ekspedisi / kurir kargo biasa.",
      cost: rupiah.format(flatDeliveryCost),
      icon: <Truck aria-hidden="true" size={18} className="mt-0.5 shrink-0 text-[var(--brand-600)]" />,
    });
  }

  if (enableSameDay) {
    options.push({
      value: "same_day",
      label: "Same Day (Grab Express / GoSend)",
      hint: "Dikirim kurir instan, diterima di hari yang sama.",
      cost: rupiah.format(sameDayFixedCost),
      icon: <Truck aria-hidden="true" size={18} className="mt-0.5 shrink-0 text-[var(--brand-600)]" />,
    });
  }

  if (enableInstant) {
    options.push({
      value: "instant",
      label: "Instan (Grab Express / GoSend)",
      hint: "Ongkir dikonfirmasi admin via WhatsApp setelah pesanan dibuat.",
      cost: "Dikonfirmasi admin",
      icon: <Zap aria-hidden="true" size={18} className="mt-0.5 shrink-0 text-[var(--brand-600)]" />,
    });
  }

  return (
    <div className="mt-8 grid gap-5 sm:grid-cols-2">
      <Field label="Nama penerima" name="recipientName" error={errors.recipientName}>
        <input
          id="recipientName"
          name="recipientName"
          value={data.recipientName}
          onChange={(event) => onChange("recipientName", event.target.value)}
          placeholder="Nama lengkap penerima"
          autoComplete="name"
          aria-invalid={Boolean(errors.recipientName)}
          aria-describedby={errors.recipientName ? "recipientName-error" : undefined}
          className={fieldClass}
        />
      </Field>

      <Field label="Nomor WhatsApp" name="phone" error={errors.phone}>
        <input
          id="phone"
          name="phone"
          type="tel"
          inputMode="tel"
          value={data.phone}
          onChange={(event) => onChange("phone", event.target.value)}
          placeholder="Contoh: 081234567890"
          autoComplete="tel"
          aria-invalid={Boolean(errors.phone)}
          aria-describedby={errors.phone ? "phone-error" : undefined}
          className={fieldClass}
        />
      </Field>

      <div className="sm:col-span-2">
        <Field label="Alamat lengkap" name="address" error={errors.address}>
          <textarea
            id="address"
            name="address"
            value={data.address}
            onChange={(event) => onChange("address", event.target.value)}
            placeholder="Nama jalan, nomor rumah, patokan / RT-RW"
            autoComplete="street-address"
            rows={4}
            aria-invalid={Boolean(errors.address)}
            aria-describedby={errors.address ? "address-error" : undefined}
            className={`${fieldClass} h-auto resize-y py-3`}
          />
        </Field>
      </div>

      <Field label="Kota/Kabupaten" name="city" error={errors.city}>
        <input
          id="city"
          name="city"
          value={data.city}
          onChange={(event) => onChange("city", event.target.value)}
          placeholder="Kota atau kabupaten"
          autoComplete="address-level2"
          aria-invalid={Boolean(errors.city)}
          aria-describedby={errors.city ? "city-error" : undefined}
          className={fieldClass}
        />
      </Field>

      <Field label="Provinsi" name="province" error={errors.province}>
        <input
          id="province"
          name="province"
          value={data.province}
          onChange={(event) => onChange("province", event.target.value)}
          placeholder="Provinsi"
          autoComplete="address-level1"
          aria-invalid={Boolean(errors.province)}
          aria-describedby={errors.province ? "province-error" : undefined}
          className={fieldClass}
        />
      </Field>

      <Field label="Kode pos (opsional)" name="postalCode" error={errors.postalCode}>
        <input
          id="postalCode"
          name="postalCode"
          inputMode="numeric"
          maxLength={5}
          value={data.postalCode}
          onChange={(event) => onChange("postalCode", event.target.value.replace(/\D/g, ""))}
          placeholder="5 digit kode pos"
          autoComplete="postal-code"
          aria-invalid={Boolean(errors.postalCode)}
          aria-describedby={errors.postalCode ? "postalCode-error" : undefined}
          className={fieldClass}
        />
      </Field>

      <div className="sm:col-span-2">
        <Field label="Catatan untuk kurir (opsional)" name="notes" error={errors.notes}>
          <textarea
            id="notes"
            name="notes"
            maxLength={250}
            value={data.notes}
            onChange={(event) => onChange("notes", event.target.value)}
            placeholder="Contoh: rumah pagar hitam, titip ke satpam"
            rows={3}
            className={`${fieldClass} h-auto resize-y py-3`}
          />
        </Field>
        <p className="mt-1 text-right text-xs text-stone-400">{data.notes.length}/250</p>
      </div>

      <div className="sm:col-span-2">
        <p className="text-sm font-semibold text-stone-800">Metode pengiriman</p>
        <p className="mt-2 flex items-start gap-2 rounded-xl bg-amber-50 px-3.5 py-2.5 text-xs leading-5 text-amber-800">
          <Info aria-hidden="true" size={15} className="mt-0.5 shrink-0" />
          <span>
            Saat ini kami hanya melayani wilayah <strong>Jabodetabek</strong> dengan <strong>Grab Express</strong> dan <strong>GoSend</strong>. Untuk pengiriman ke luar kota, silakan hubungi Admin langsung.
          </span>
        </p>
        {errors.method ? (
          <p className="mt-1.5 text-xs font-medium text-red-600">{errors.method}</p>
        ) : null}
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          {options.map((option) => {
            const isSelected = method === option.value;
            return (
              <label
                key={option.value}
                className={`cursor-pointer rounded-2xl border p-4 transition ${
                  isSelected ? "border-[var(--brand-600)] bg-[var(--brand-50)]" : "border-stone-200 hover:border-stone-300"
                }`}
              >
                <span className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="shippingMethod"
                    value={option.value}
                    checked={isSelected}
                    onChange={() => onSelectMethod(option.value)}
                    className="mt-1 size-4 accent-[var(--brand-600)]"
                  />
                  {option.icon}
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-stone-900">{option.label}</span>
                    <span className="mt-0.5 block text-xs leading-5 text-stone-500">{option.hint}</span>
                    <span className="mt-1 block text-sm font-bold text-stone-900">{option.cost}</span>
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  error,
  children,
}: {
  label: string;
  name: keyof ShippingData;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={name} className="text-sm font-semibold text-stone-800">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${name}-error`} className="mt-1.5 text-xs font-medium text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}