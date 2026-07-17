"use client";

export type ShippingData = {
  recipientName: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  notes: string;
};

export type ShippingErrors = Partial<Record<keyof ShippingData, string>>;

type ShippingFormProps = {
  data: ShippingData;
  errors: ShippingErrors;
  onChange: (field: keyof ShippingData, value: string) => void;
};

const fieldClass =
  "mt-2 h-12 w-full rounded-xl border border-stone-300 bg-white px-4 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-orange-600 focus:ring-4 focus:ring-orange-600/10";

export function ShippingForm({ data, errors, onChange }: ShippingFormProps) {
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
            placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, dan kecamatan"
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

      <Field label="Kode pos" name="postalCode" error={errors.postalCode}>
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
