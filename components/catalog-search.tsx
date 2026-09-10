"use client";

import { Search } from "lucide-react";

type CatalogSearchProps = {
  value: string;
  onChange: (value: string) => void;
};

export function CatalogSearch({ value, onChange }: CatalogSearchProps) {
  return (
    <form
      role="search"
      className="relative w-full sm:max-w-md"
      onSubmit={(event) => event.preventDefault()}
    >
      <label htmlFor="catalog-search" className="sr-only">
        Cari produk
      </label>
      <Search
        aria-hidden="true"
        size={19}
        strokeWidth={1.8}
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-500"
      />
      <input
        id="catalog-search"
        name="search"
        type="search"
        autoComplete="off"
        placeholder="Cari produk yang kamu butuhkan..."
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full rounded-full border border-stone-300 bg-white pl-12 pr-5 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 hover:border-stone-400 focus:border-[var(--brand-600)] focus:ring-4 focus:ring-[var(--brand-600)]/10"
      />
    </form>
  );
}
