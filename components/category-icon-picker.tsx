"use client";

import { useState } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { CATEGORY_ICON_OPTIONS, CategoryIcon } from "@/lib/category-icons";

export function CategoryIconPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (key: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = CATEGORY_ICON_OPTIONS.filter(
    (o) =>
      o.label.toLowerCase().includes(query.trim().toLowerCase()) ||
      o.key.toLowerCase().includes(query.trim().toLowerCase()),
  ).slice(0, 40);

  return (
    <div className="relative mt-1">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex h-12 w-full items-center justify-between gap-3 rounded-xl border px-3 text-sm transition ${
          value
            ? "border-[var(--brand-600)] bg-[var(--brand-50)] text-[var(--brand-700)]"
            : "border-stone-300 bg-white text-stone-500 hover:border-stone-400"
        }`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-lg bg-white text-[var(--brand-600)] shadow-sm ring-1 ring-stone-200">
            <CategoryIcon iconKey={value} className="size-4" />
          </span>
          {value ? (
            <span className="font-medium capitalize">{value.replace(/-/g, " ")}</span>
          ) : (
            <span className="font-normal text-stone-400">Pilih ikon kategori…</span>
          )}
        </span>
        <ChevronDown size={16} className={`transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open ? (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden="true" />
          <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-2xl border border-stone-200 bg-white p-3 shadow-xl">
            <label className="relative block">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari ikon…"
                className="h-10 w-full rounded-lg border border-stone-200 bg-stone-50 pl-9 pr-8 text-sm outline-none focus:border-[var(--brand-600)]"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Hapus pencarian"
                  className="absolute right-2 top-1/2 -translate-y-1/2 grid size-6 place-items-center rounded-full text-stone-400 hover:bg-stone-200"
                >
                  <X size={13} />
                </button>
              ) : null}
            </label>

            <div className="mt-3 grid max-h-64 grid-cols-5 gap-1.5 overflow-y-auto sm:grid-cols-6" role="listbox">
              {filtered.map((opt) => {
                const selected = opt.key === value;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    title={opt.label}
                    onClick={() => {
                      onChange(opt.key);
                      setOpen(false);
                      setQuery("");
                    }}
                    className={`group flex flex-col items-center gap-1 rounded-xl border p-2.5 text-[10px] font-medium transition ${
                      selected
                        ? "border-[var(--brand-600)] bg-[var(--brand-50)] text-[var(--brand-700)]"
                        : "border-transparent text-stone-600 hover:border-stone-200 hover:bg-stone-50"
                    }`}
                  >
                    <CategoryIcon iconKey={opt.key} className="size-5" />
                    <span className="w-full truncate text-center leading-tight">{opt.label}</span>
                    {selected ? <Check size={12} className="text-[var(--brand-600)]" /> : null}
                  </button>
                );
              })}
              {filtered.length === 0 ? (
                <p className="col-span-full py-6 text-center text-xs text-stone-400">Ikon tidak ditemukan.</p>
              ) : null}
            </div>

            <div className="mt-3 flex justify-end border-t border-stone-100 pt-2.5">
              <button
                type="button"
                onClick={() => {
                  onChange("");
                  setOpen(false);
                }}
                className="text-xs font-semibold text-stone-500 hover:text-[var(--brand-600)]"
              >
                Tanpa ikon
              </button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}