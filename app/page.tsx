import { Menu } from "lucide-react";
import { CartButton } from "@/components/cart-button";
import { AccountNavigation } from "@/components/account-navigation";
import { CatalogSection } from "@/components/catalog-section";

export default function CatalogPage() {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-950">
      <header className="border-b border-stone-200/80 bg-stone-50/95">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <button
            type="button"
            aria-label="Buka menu"
            className="grid size-10 place-items-center rounded-full text-stone-700 transition hover:bg-stone-200/70 lg:hidden"
          >
            <Menu size={20} strokeWidth={1.8} />
          </button>

          <a href="#" className="font-serif text-2xl tracking-tight sm:text-[1.7rem]">
            Raf Store<span className="text-orange-600">.</span>
          </a>

          <nav className="hidden items-center gap-8 text-sm font-medium text-stone-600 lg:flex">
            <a className="text-stone-950" href="#products">
              Semua Produk
            </a>
            <a className="transition hover:text-stone-950" href="#products">
              Koleksi Baru
            </a>
            <a className="transition hover:text-stone-950" href="#footer">
              Tentang Kami
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <AccountNavigation compact />
            <CartButton />
          </div>
        </div>
      </header>

      <main>
        <section className="border-b border-stone-200/80 bg-[#f1eee7]">
          <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-18 lg:px-10 lg:py-22">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-orange-700">
              Pilihan untuk keseharianmu
            </p>
            <h1 className="max-w-3xl font-serif text-4xl leading-[1.08] tracking-tight text-stone-950 sm:text-6xl lg:text-7xl">
              Barang baik untuk hari yang lebih bermakna.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-stone-600 sm:text-lg">
              Koleksi pilihan yang fungsional, tahan lama, dan nyaman menemani setiap aktivitasmu.
            </p>
          </div>
        </section>

        <CatalogSection />
      </main>

      <footer id="footer" className="border-t border-stone-200 bg-stone-950 text-stone-300">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
          <p className="font-serif text-lg text-white">Raf Store.</p>
          <p>Produk pilihan, dikirim dengan sepenuh hati.</p>
        </div>
      </footer>
    </div>
  );
}
