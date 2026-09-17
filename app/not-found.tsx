import Link from "next/link";
import { StoreHeader } from "@/components/storefront/store-header";
import { StoreFooter } from "@/components/storefront/store-footer";
import { Container } from "@/components/ui/container";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--cream-50)]">
      <StoreHeader />

      <main className="flex flex-1 items-center py-16 sm:py-24">
        <Container>
          <div className="mx-auto max-w-xl rounded-3xl border border-stone-200/70 bg-white p-8 text-center shadow-sm sm:p-12">
            <p className="font-serif text-6xl font-bold text-[var(--brand-600)]">404</p>
            <h1 className="mt-4 font-serif text-2xl font-bold text-[var(--ink-950)] sm:text-3xl">
              Halaman Tidak Ditemukan
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-[var(--ink-700)] sm:text-base">
              Halaman yang Anda cari mungkin sudah dipindahkan atau tidak tersedia lagi.
              Silakan jelajahi katalog produk kami atau kembali ke beranda.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/"
                className="inline-flex w-full items-center justify-center rounded-full bg-[var(--brand-600)] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--brand-700)] sm:w-auto"
              >
                Ke Beranda
              </Link>
              <Link
                href="/produk"
                className="inline-flex w-full items-center justify-center rounded-full border border-stone-300 bg-white px-6 py-3 text-sm font-semibold text-[var(--ink-900)] transition-colors hover:border-[var(--brand-500)] hover:text-[var(--brand-600)] sm:w-auto"
              >
                Lihat Semua Produk
              </Link>
            </div>
          </div>
        </Container>
      </main>

      <StoreFooter />
    </div>
  );
}
