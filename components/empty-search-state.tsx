import { SearchX } from "lucide-react";

type EmptySearchStateProps = {
  query: string;
  onClear: () => void;
};

export function EmptySearchState({ query, onClear }: EmptySearchStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="grid min-h-72 place-items-center rounded-3xl border border-dashed border-stone-300 bg-white px-6 py-12 text-center"
    >
      <div>
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-stone-100 text-stone-500">
          <SearchX aria-hidden="true" size={22} strokeWidth={1.7} />
        </span>
        <h3 className="mt-4 font-serif text-2xl text-stone-900">Produk tidak ditemukan</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-stone-500">
          Tidak ada produk yang cocok dengan <span className="font-semibold text-stone-700">“{query}”</span>.
          Coba nama, kategori, atau SKU lain.
        </p>
        <button
          type="button"
          onClick={onClear}
          className="mt-5 rounded-full bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--brand-700)] focus:outline-none focus:ring-4 focus:ring-[var(--brand-600)]/20"
        >
          Hapus pencarian
        </button>
      </div>
    </div>
  );
}
