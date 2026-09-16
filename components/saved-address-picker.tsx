"use client";

import { Banknote, Check, ChevronDown, MapPin, Phone } from "lucide-react";
import { useState } from "react";

export type SavedAddress = {
  id: string;
  recipientName: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  notes: string;
  createdAt: string;
};

type SavedAddressPickerProps = {
  addresses: SavedAddress[];
  selectedId: string | null;
  onSelect: (address: SavedAddress) => void;
  onReset: () => void;
};

export function SavedAddressPicker({ addresses, selectedId, onSelect, onReset }: SavedAddressPickerProps) {
  const [open, setOpen] = useState(false);
  const selected = addresses.find((address) => address.id === selectedId) ?? null;

  function handleSelect(address: SavedAddress) {
    onSelect(address);
    setOpen(false);
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between gap-4">
        <p className="flex items-center gap-2 text-sm font-semibold text-stone-800">
          <Banknote aria-hidden="true" size={16} className="text-[var(--brand-600)]" />
          Alamat tersimpan
        </p>
        {selected ? (
          <button
            type="button"
            onClick={onReset}
            className="text-xs font-semibold text-[var(--brand-600)] underline-offset-2 hover:underline"
          >
            Tulis alamat baru
          </button>
        ) : null}
      </div>

      {selected ? (
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          className={`mt-2 flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition ${
            open ? "border-[var(--brand-600)] bg-[var(--brand-50)]" : "border-stone-200 bg-white hover:border-stone-300"
          }`}
        >
          <MapPin aria-hidden="true" size={17} className="shrink-0 text-[var(--brand-600)]" />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-stone-900">{selected.recipientName}</span>
            <span className="mt-0.5 block truncate text-xs text-stone-600">
              {selected.address}, {selected.city}, {selected.province}
              {selected.postalCode ? ` ${selected.postalCode}` : ""}
            </span>
          </span>
          <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-[var(--brand-600)]">
            Ganti
            <ChevronDown
              aria-hidden="true"
              size={14}
              className={`transition-transform ${open ? "rotate-180" : ""}`}
            />
          </span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          className="mt-2 flex w-full items-center justify-between gap-3 rounded-2xl border border-dashed border-stone-300 bg-white px-4 py-3.5 text-sm font-semibold text-stone-700 transition hover:border-[var(--brand-600)] hover:text-[var(--brand-600)]"
        >
          Pilih alamat tersimpan ({addresses.length})
          <ChevronDown
            aria-hidden="true"
            size={16}
            className={`transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>
      )}

      {open ? (
        <div className="mt-2 overflow-hidden rounded-2xl border border-stone-200 bg-white">
          <ul className="max-h-64 divide-y divide-stone-100 overflow-y-auto">
            {addresses.map((address) => {
              const isSelected = selectedId === address.id;
              return (
                <li key={address.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(address)}
                    aria-pressed={isSelected}
                    className={`flex w-full items-start gap-3 px-4 py-3 text-left transition ${
                      isSelected ? "bg-[var(--brand-50)]" : "hover:bg-stone-50"
                    }`}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5 text-sm font-semibold text-stone-900">
                        <MapPin aria-hidden="true" size={13} className="shrink-0 text-[var(--brand-600)]" />
                        <span className="truncate">{address.recipientName}</span>
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-stone-600">{address.address}</span>
                      <span className="block text-xs text-stone-500">
                        {address.city}
                        {address.postalCode ? `, ${address.postalCode}` : ""} · {address.province}
                      </span>
                      <span className="mt-1 flex items-center gap-1 text-xs font-medium text-stone-700">
                        <Phone aria-hidden="true" size={11} className="shrink-0" />
                        {address.phone}
                      </span>
                    </span>
                    {isSelected ? (
                      <Check aria-hidden="true" size={18} className="mt-1 shrink-0 text-[var(--brand-600)]" />
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
          <p className="border-t border-stone-100 bg-stone-50 px-4 py-2.5 text-xs leading-5 text-stone-500">
            Pilih alamat lalu detailnya tetap bisa diubah di form di bawah.
          </p>
        </div>
      ) : null}
    </div>
  );
}