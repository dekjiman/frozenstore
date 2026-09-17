import type { Metadata } from "next";
import Link from "next/link";
import { StoreHeader } from "@/components/storefront/store-header";
import { StoreFooter } from "@/components/storefront/store-footer";
import { Container } from "@/components/ui/container";
import { getSiteSettings } from "@/lib/queries/site-settings";
import { SITE_NAME, canonical } from "@/lib/seo";
import { ShoppingBag, Search, CreditCard, Upload, PackageCheck, ArrowRight } from "lucide-react";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Cara Order",
  description: `Panduan langkah mudah berbelanja frozen food berkualitas di ${SITE_NAME}.`,
  ...canonical("/cara-order"),
};

const STEPS = [
  {
    icon: <Search className="size-6 text-[var(--brand-600)]" />,
    number: "01",
    title: "Pilih Produk Favorit",
    description: "Jelajahi katalog produk kami. Pilih produk olahan ayam, sapi, seafood, atau snack frozen yang Anda inginkan dan klik Tambah ke Keranjang.",
  },
  {
    icon: <ShoppingBag className="size-6 text-[var(--brand-600)]" />,
    number: "02",
    title: "Periksa Keranjang & Checkout",
    description: "Buka halaman keranjang belanja, periksa jumlah pesanan, lalu klik tombol Checkout untuk melanjutkan pengisian data pengiriman.",
  },
  {
    icon: <CreditCard className="size-6 text-[var(--brand-600)]" />,
    number: "03",
    title: "Isi Alamat & Lakukan Pembayaran",
    description: "Masukkan alamat lengkap Anda dan pilih rekening tujuan transfer bank resmi kami sesuai petunjuk yang tertera.",
  },
  {
    icon: <Upload className="size-6 text-[var(--brand-600)]" />,
    number: "04",
    title: "Unggah Bukti Transfer",
    description: "Unggah foto struk atau screenshot bukti transfer Anda di halaman konfirmasi agar tim kami dapat segera memverifikasi pesanan Anda.",
  },
  {
    icon: <PackageCheck className="size-6 text-[var(--brand-600)]" />,
    number: "05",
    title: "Pesanan Dikirim",
    description: "Setelah pembayaran diverifikasi, pesanan akan dikemas rapi dengan pengemasan rantai dingin dan dikirimkan langsung ke rumah Anda.",
  },
];

export default async function CaraOrderPage() {
  const settings = await getSiteSettings();

  return (
    <div className="min-h-screen bg-[var(--cream-50)]">
      <StoreHeader />

      <main className="pb-16">
        <section className="border-b border-stone-200/80 bg-gradient-to-br from-white via-[var(--cream-50)] to-[var(--brand-50)]/40 py-10 sm:py-14">
          <Container width="normal">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mx-auto mb-3 grid size-12 place-items-center rounded-2xl bg-[var(--brand-100)] text-[var(--brand-600)]">
                <ShoppingBag size={26} />
              </div>
              <h1 className="font-serif text-3xl font-bold tracking-tight text-[var(--ink-950)] sm:text-4xl">
                Cara Order
              </h1>
              <p className="mt-3 text-sm text-stone-600 sm:text-base">
                Langkah praktis dan mudah memesan frozen food berkualitas untuk keluarga Anda.
              </p>
            </div>
          </Container>
        </section>

        <Container width="normal" className="pt-10">
          <div className="mx-auto max-w-3xl space-y-4">
            {STEPS.map((step) => (
              <div
                key={step.number}
                className="flex items-start gap-4 sm:gap-6 rounded-2xl border border-stone-200/80 bg-white p-5 sm:p-6 shadow-sm"
              >
                <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-[var(--brand-50)] border border-[var(--brand-100)]">
                  {step.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--brand-600)]">
                      Langkah {step.number}
                    </span>
                  </div>
                  <h3 className="mt-1 font-serif text-lg font-bold text-[var(--ink-950)]">
                    {step.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-stone-600">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}

            <div className="mt-10 rounded-2xl border border-[var(--brand-200)] bg-[var(--brand-50)]/70 p-6 text-center">
              <h3 className="font-serif text-xl font-bold text-[var(--ink-950)]">
                Siap Berbelanja Sekarang?
              </h3>
              <p className="mt-2 text-sm text-stone-600">
                Temukan varian produk frozen food premium favorit keluarga Anda hari ini.
              </p>
              <div className="mt-5">
                <Link
                  href="/produk"
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-600)] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-[var(--brand-700)]"
                >
                  Mulai Belanja <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </main>

      <StoreFooter initialSettings={settings} />
    </div>
  );
}
