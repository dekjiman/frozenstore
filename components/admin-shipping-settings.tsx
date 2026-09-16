"use client";

import { Loader2, Save, Truck, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/client-api";

type ShippingMethod = "regular" | "same_day" | "instant";

type SettingsPayload = {
  id: string;
  enableRegular: boolean;
  enableSameDay: boolean;
  enableInstant: boolean;
  defaultMethod: ShippingMethod;
  sameDayFixedCost: number;
  flatDeliveryCost: number;
};

const inputClass =
  "mt-2 h-11 w-full rounded-xl border border-stone-300 bg-white px-4 text-sm text-stone-900 outline-none transition focus:border-[var(--brand-600)] focus:ring-4 focus:ring-[var(--brand-600)]/10 disabled:bg-stone-50 disabled:text-stone-400";

export function AdminShippingSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    enableRegular: true,
    enableSameDay: true,
    enableInstant: true,
    defaultMethod: "regular" as ShippingMethod,
    sameDayFixedCost: "25000",
    flatDeliveryCost: "20000",
  });

  useEffect(() => {
    apiFetch<{ data: SettingsPayload }>("/api/admin/shipping-settings", { cache: "no-store" })
      .then((payload) => {
        const d = payload.data;
        setForm({
          enableRegular: d.enableRegular,
          enableSameDay: d.enableSameDay,
          enableInstant: d.enableInstant,
          defaultMethod: d.defaultMethod,
          sameDayFixedCost: String(d.sameDayFixedCost),
          flatDeliveryCost: String(d.flatDeliveryCost),
        });
      })
      .catch((caught) => setError(caught instanceof Error ? caught.message : "Gagal memuat pengaturan"))
      .finally(() => setLoading(false));
  }, []);

  async function saveSettings(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setNotice(null);
    setError(null);
    const toNumber = (value: string) => {
      const n = Number(value);
      return Number.isFinite(n) ? Math.round(n) : 0;
    };
    try {
      const payload = await apiFetch<{ data: SettingsPayload }>("/api/admin/shipping-settings", {
        method: "PUT",
        body: JSON.stringify({
          enableRegular: form.enableRegular,
          enableSameDay: form.enableSameDay,
          enableInstant: form.enableInstant,
          defaultMethod: form.defaultMethod,
          sameDayFixedCost: toNumber(form.sameDayFixedCost),
          flatDeliveryCost: toNumber(form.flatDeliveryCost),
        }),
      });
      setForm({
        enableRegular: payload.data.enableRegular,
        enableSameDay: payload.data.enableSameDay,
        enableInstant: payload.data.enableInstant,
        defaultMethod: payload.data.defaultMethod,
        sameDayFixedCost: String(payload.data.sameDayFixedCost),
        flatDeliveryCost: String(payload.data.flatDeliveryCost),
      });
      setNotice("Pengaturan pengiriman berhasil disimpan.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Gagal menyimpan pengaturan");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="p-8 text-sm text-stone-500">Memuat pengaturan pengiriman...</p>;
  }

  return (
    <form onSubmit={saveSettings} className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-[var(--ink-950)]">Pengaturan Pengiriman</h1>
          <p className="mt-1 text-sm text-stone-500">
            Atur metode pengiriman yang tersedia di checkout dan tarifnya.
          </p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex h-11 items-center gap-2 rounded-full bg-[var(--brand-600)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--brand-900)] disabled:cursor-not-allowed disabled:bg-stone-300"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? "Menyimpan..." : "Simpan pengaturan"}
        </button>
      </div>

      {notice ? <p role="status" className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">{notice}</p> : null}
      {error ? <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

      <section className="rounded-3xl border border-[var(--border)] bg-white p-6">
        <h2 className="flex items-center gap-2 font-serif text-2xl text-[var(--ink-950)]">
          <Truck aria-hidden="true" size={20} className="text-[var(--brand-600)]" /> Metode pengiriman
        </h2>
        <div className="mt-5 space-y-5">
          <Toggle
            label="Aktifkan Reguler"
            hint="Dikirim via ekspedisi / kurir kargo biasa, tarif memakai 'Ongkir Flat'."
            checked={form.enableRegular}
            onChange={(value) =>
              setForm((f) => {
                const enableRegular = value;
                const defaultMethod =
                  !value && f.defaultMethod === "regular"
                    ? f.enableInstant
                      ? "instant"
                      : f.enableSameDay
                        ? "same_day"
                        : "regular"
                    : f.defaultMethod;
                return { ...f, enableRegular, defaultMethod };
              })
            }
          />
          <NumberField label="Ongkir Flat (Reguler)" unit="Rp" value={form.flatDeliveryCost} onChange={(value) => setForm((f) => ({ ...f, flatDeliveryCost: value }))} />
          <Toggle
            label="Aktifkan Same Day"
            hint="Pengiriman di hari yang sama, tarif tetap per pesanan."
            checked={form.enableSameDay}
            onChange={(value) => setForm((f) => ({ ...f, enableSameDay: value }))}
          />
          {form.enableSameDay ? (
            <NumberField label="Tarif Same Day (per pesanan)" unit="Rp" value={form.sameDayFixedCost} onChange={(value) => setForm((f) => ({ ...f, sameDayFixedCost: value }))} />
          ) : null}
          <Toggle
            label="Aktifkan Instan (Grab / GoSend)"
            hint="Pelanggan memilih Instan tanpa nominal; admin yang menentukan ongkir per pesanan via WhatsApp."
            checked={form.enableInstant}
            onChange={(value) => setForm((f) => ({ ...f, enableInstant: value }))}
          />
        </div>

        <div className="mt-6 border-t border-stone-100 pt-6">
          <p className="flex items-center gap-2 text-sm font-semibold text-stone-900">
            Metode pengiriman default
          </p>
          <p className="mt-1 text-xs text-stone-500">
            Metode yang otomatis terpilih di halaman checkout. Pelanggan tetap bisa mengganti ke metode lain.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <MethodOption
              label="Reguler"
              hint="Ongkir flat"
              value="regular"
              checked={form.defaultMethod}
              disabled={!form.enableRegular}
              onChange={(value) => setForm((f) => ({ ...f, defaultMethod: value }))}
            />
            <MethodOption
              label="Same Day (Grab / GoSend)"
              hint="Tarif tetap, dikirim hari yang sama"
              value="same_day"
              checked={form.defaultMethod}
              disabled={!form.enableSameDay}
              onChange={(value) => setForm((f) => ({ ...f, defaultMethod: value }))}
            />
            <MethodOption
              label="Instan (Grab / GoSend)"
              hint="Ongkir ditentukan admin per pesanan"
              value="instant"
              checked={form.defaultMethod}
              disabled={!form.enableInstant}
              onChange={(value) => setForm((f) => ({ ...f, defaultMethod: value }))}
            />
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-[var(--border)] bg-white p-6">
        <h2 className="flex items-center gap-2 font-serif text-2xl text-[var(--ink-950)]">
          <Zap aria-hidden="true" size={20} className="text-[var(--brand-600)]" /> Catatan metode Instan
        </h2>
        <p className="mt-3 text-sm leading-6 text-stone-600">
          Untuk pesanan Instan, biaya ongkir diisi melalui halaman{" "}
          <span className="font-semibold">Pesanan pelanggan</span> saat menjalankan pesanan — pesanan muncul dengan
          status <span className="font-semibold">Menunggu ongkir</span>. Setelah nominal diisi, total pesanan otomatis ter-update dan pelanggan diarahkan
          membayar.
        </p>
      </section>
    </form>
  );
}

function MethodOption({
  label,
  hint,
  value,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  hint: string;
  value: ShippingMethod;
  checked: ShippingMethod;
  onChange: (value: ShippingMethod) => void;
  disabled?: boolean;
}) {
  const selected = value === checked;
  return (
    <label
      className={`rounded-2xl border p-4 transition ${selected ? "border-[var(--brand-600)] bg-[var(--brand-50)]" : "border-stone-200"} ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:border-stone-300"}`}
    >
      <span className="flex items-start gap-3">
        <input
          type="radio"
          name="defaultMethod"
          value={value}
          checked={selected}
          disabled={disabled}
          onChange={() => onChange(value)}
          className="mt-1 size-4 accent-[var(--brand-600)]"
        />
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-stone-900">{label}</span>
          <span className="mt-0.5 block text-xs leading-5 text-stone-500">{hint}</span>
        </span>
      </span>
    </label>
  );
}

function Toggle({
  label,
  hint,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label className={`flex items-start justify-between gap-4 rounded-2xl border border-stone-200 p-4 ${disabled ? "opacity-60" : "cursor-pointer"}`}>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-stone-900">{label}</span>
        <span className="mt-0.5 block text-xs text-stone-500">{hint}</span>
      </span>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 size-5 shrink-0 accent-[var(--brand-600)]"
      />
    </label>
  );
}

function NumberField({
  label,
  unit,
  value,
  onChange,
}: {
  label: string;
  unit: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="text-sm font-semibold text-stone-800">{label}</label>
      <div className="relative mt-2">
        <input
          type="number"
          inputMode="numeric"
          min={0}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`${inputClass} pr-12`}
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-stone-400">{unit}</span>
      </div>
    </div>
  );
}