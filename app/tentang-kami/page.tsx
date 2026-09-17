import type { Metadata } from "next";
import Link from "next/link";
import { StoreHeader } from "@/components/storefront/store-header";
import { StoreFooter } from "@/components/storefront/store-footer";
import { Container } from "@/components/ui/container";
import { SITE_NAME, canonical } from "@/lib/seo";
import { ShieldCheck, Snowflake, Truck, BadgeCheck, Heart, Users, Award } from "lucide-react";

export const metadata: Metadata = {
  title: "Tentang Kami",
  description: `Kenali lebih dekat ${SITE_NAME} — penyedia frozen food premium berkualitas, halal, dan bergizi untuk keluarga Indonesia.`,
  ...canonical("/tentang-kami"),
};

const VALUES = [
  {
    icon: <ShieldCheck size={28} strokeWidth={1.5} />,
    title: "Kualitas Premium",
    description: "Kami hanya menggunakan bahan pilihan terbaik untuk setiap produk kami.",
  },
  {
    icon: <Snowflake size={28} strokeWidth={1.5} />,
    title: "Frozen Fresh",
    description: "Rantai dingin terjaga dari pabrik hingga ke tangan Anda.",
  },
  {
    icon: <BadgeCheck size={28} strokeWidth={1.5} />,
    title: "Halal & BPOM",
    description: "Semua produk kami tersertifikasi halal dan terdaftar di BPOM.",
  },
  {
    icon: <Truck size={28} strokeWidth={1.5} />,
    title: "Pengiriman Cepat",
    description: "Pengiriman ke seluruh Indonesia dengan kemasan yang terjaga kesegarannya.",
  },
];

const MILESTONES = [
  { year: "2018", title: "Berdiri", description: "Jasmine Shop Premium Product didirikan dengan visi menyediakan frozen food berkualitas untuk keluarga Indonesia." },
  { year: "2020", title: "Ekspansi Produksi", description: "Pembangunan pabrik baru dengan kapasitas produksi yang lebih besar." },
  { year: "2022", title: "100+ Produk", description: "Meluncurkan lebih dari 100 varian produk frozen food premium." },
  { year: "2024", title: "500+ Reseller", description: "Jaringan reseller kami telah tersebar di seluruh Indonesia." },
];

export default function TentangKamiPage() {
  return (
    <div className="min-h-screen bg-[var(--cream-50)]">
      <StoreHeader />

      <main>
        {/* Hero */}
        <section className="bg-gradient-to-br from-[var(--cream-100)] to-[var(--brand-50)] py-16 sm:py-20">
          <Container width="normal">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--brand-600)]/10 px-3 py-1 text-xs font-semibold text-[var(--brand-600)]">
                <Heart size={12} />
                Tentang Kami
              </span>
              <h1 className="mt-4 font-serif text-3xl font-bold text-[var(--ink-950)] sm:text-4xl lg:text-5xl">
                Frozen Food Premium untuk Keluarga Indonesia
              </h1>
              <p className="mt-4 text-base leading-relaxed text-[var(--ink-700)] sm:text-lg">
                Kami percaya setiap keluarga berhak menikmati makanan berkualitas restoran
                dengan cara yang praktis dan terjangkau.
              </p>
            </div>
          </Container>
        </section>

        {/* Story */}
        <section className="py-12 sm:py-16">
          <Container width="normal">
            <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
              <div>
                <h2 className="font-serif text-2xl font-bold text-[var(--ink-950)] sm:text-3xl">
                  Cerita Kami
                </h2>
                <div className="mt-4 space-y-4 text-[var(--ink-700)] leading-relaxed">
                  <p>
                    Jasmine Shop Premium Product bermula dari kepedulian kami terhadap kebutuhan
                    keluarga Indonesia akan makanan yang praktis, bergizi, dan tetap
                    berkualitas tinggi. Didirikan pada tahun 2018, kami berkomitmen
                    untuk menghadirkan produk frozen food terbaik.
                  </p>
                  <p>
                    Dengan bahan-bahan pilihan terbaik dan proses produksi yang higienis,
                    setiap produk kami dirancang untuk memberikan pengalaman kuliner yang
                    luar biasa — cukup dalam 15 menit, hidangan lezat siap dihidangkan.
                  </p>
                  <p>
                    Kini, dengan lebih dari 100 produk dan 500+ reseller aktif di
                    seluruh Indonesia, kami terus berkomitmen untuk menjadi pilihan
                    utama keluarga Indonesia.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-stone-100 shadow-lg">
                  <div className="grid size-full place-items-center text-stone-300">
                    <div className="text-center">
                      <Award size={48} className="mx-auto mb-2" />
                      <p className="text-sm font-medium">Sejak 2018</p>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-4 -right-4 rounded-xl bg-[var(--brand-600)] px-4 py-3 text-white shadow-lg sm:-bottom-6 sm:-right-6">
                  <p className="text-2xl font-bold">8+</p>
                  <p className="text-xs text-white/80">Tahun Pengalaman</p>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* Values */}
        <section className="bg-white py-12 sm:py-16">
          <Container width="normal">
            <div className="text-center">
              <h2 className="font-serif text-2xl font-bold text-[var(--ink-950)] sm:text-3xl">
                Nilai-Nilai Kami
              </h2>
              <p className="mt-2 text-sm text-stone-500">
                Prinsip yang kami pegang dalam setiap langkah
              </p>
            </div>

            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {VALUES.map((value) => (
                <div key={value.title} className="flex flex-col items-center text-center rounded-2xl border border-stone-200/80 bg-[var(--cream-50)] p-6 transition hover:shadow-sm">
                  <div className="mb-3 grid size-14 place-items-center rounded-xl bg-[var(--brand-50)] text-[var(--brand-600)]">
                    {value.icon}
                  </div>
                  <h3 className="text-sm font-bold text-[var(--ink-950)]">{value.title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-stone-500">{value.description}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* Milestones */}
        <section className="py-12 sm:py-16">
          <Container width="normal">
            <div className="text-center">
              <h2 className="font-serif text-2xl font-bold text-[var(--ink-950)] sm:text-3xl">
                Perjalanan Kami
              </h2>
              <p className="mt-2 text-sm text-stone-500">
                Tonggak penting dalam sejarah Jasmine Shop Premium Product
              </p>
            </div>

            <div className="relative mt-10">
              {/* Vertical line */}
              <div className="absolute left-4 top-0 bottom-0 w-px bg-stone-200 sm:left-1/2 sm:-translate-x-px" />

              <div className="space-y-8">
                {MILESTONES.map((milestone, idx) => (
                  <div key={milestone.year} className={`relative flex gap-6 sm:gap-0 ${idx % 2 === 0 ? "sm:flex-row" : "sm:flex-row-reverse"}`}>
                    {/* Dot */}
                    <div className="absolute left-4 top-1 z-10 size-3 -translate-x-1.5 rounded-full bg-[var(--brand-600)] ring-4 ring-white sm:left-1/2" />

                    {/* Content */}
                    <div className={`flex-1 pl-10 sm:pl-0 ${idx % 2 === 0 ? "sm:pr-12 sm:text-right" : "sm:pl-12"}`}>
                      <span className="inline-block rounded-full bg-[var(--brand-50)] px-2.5 py-0.5 text-xs font-bold text-[var(--brand-600)]">
                        {milestone.year}
                      </span>
                      <h3 className="mt-2 text-base font-bold text-[var(--ink-950)]">{milestone.title}</h3>
                      <p className="mt-1 text-sm text-stone-500">{milestone.description}</p>
                    </div>

                    {/* Spacer for alternating layout */}
                    <div className="hidden sm:block flex-1" />
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </section>

        {/* Stats */}
        <section className="bg-[var(--brand-600)] py-12 sm:py-16">
          <Container width="normal">
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
              {[
                { value: "100+", label: "Produk Premium" },
                { value: "5000+", label: "Pelanggan Puas" },
                { value: "500+", label: "Reseller Aktif" },
                { value: "10.000+", label: "Pesanan Terkirim" },
              ].map((stat) => (
                <div key={stat.label} className="text-center text-white">
                  <p className="text-3xl font-bold sm:text-4xl">{stat.value}</p>
                  <p className="mt-1 text-sm text-white/70">{stat.label}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* CTA */}
        <section className="py-12 sm:py-16">
          <Container width="normal">
            <div className="rounded-2xl bg-stone-50 p-8 text-center sm:p-12">
              <Users size={32} className="mx-auto mb-4 text-[var(--brand-600)]" />
              <h2 className="font-serif text-xl font-bold text-[var(--ink-950)] sm:text-2xl">
                Bergabunglah dengan Keluarga Besar Kami
              </h2>
              <p className="mt-2 text-sm text-stone-500">
                Jadilah bagian dari jaringan reseller kami atau nikmati produk kami langsung
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link
                  href="/produk"
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-600)] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-[var(--brand-700)]"
                >
                  Lihat Produk
                </Link>
                <Link
                  href="/bantuan"
                  className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-6 py-2.5 text-sm font-bold text-[var(--ink-950)] transition hover:bg-stone-50"
                >
                  Hubungi Kami
                </Link>
              </div>
            </div>
          </Container>
        </section>
      </main>

      <StoreFooter />
    </div>
  );
}
