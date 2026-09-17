import type { Metadata } from "next";
import { StoreHeader } from "@/components/storefront/store-header";
import { StoreFooter } from "@/components/storefront/store-footer";
import { Container } from "@/components/ui/container";
import { getSiteSettings } from "@/lib/queries/site-settings";
import { canonical } from "@/lib/seo";
import { Snowflake, ThermometerSnowflake, Clock, AlertOctagon, Flame } from "lucide-react";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Cara Penyimpanan",
  description:
    "Panduan menjaga kesegaran, kehigienisan, dan kelezatan frozen food dengan suhu penyimpanan yang tepat.",
  ...canonical("/cara-penyimpanan"),
};

const TIPS = [
  {
    icon: <ThermometerSnowflake className="size-6 text-[var(--brand-600)]" />,
    title: "Simpan di Suhu Minimal -18°C",
    desc: "Segera masukkan produk ke dalam freezer dengan suhu -18°C atau lebih rendah begitu paket tiba. Suhu stabil menjaga kualitas tekstur dan gizi produk.",
  },
  {
    icon: <Clock className="size-6 text-[var(--brand-600)]" />,
    title: "Perhatikan Tanggal Kedaluwarsa",
    desc: "Produk frozen food kami bertahan 3 hingga 6 bulan di dalam freezer bersuhu stabil. Selalu cek label tanggal kedaluwarsa pada kemasan.",
  },
  {
    icon: <AlertOctagon className="size-6 text-[var(--brand-600)]" />,
    title: "Jangan Bekukan Ulang Produk yang Sudah Cair",
    desc: "Produk yang sudah dicairkan (thawed) sebaiknya langsung dimasak hingga matang. Membekukan kembali produk yang sudah mencair dapat merusak tekstur dan memicu pertumbuhan bakteri.",
  },
  {
    icon: <Flame className="size-6 text-[var(--brand-600)]" />,
    title: "Thawing (Pencairan) dengan Aman",
    desc: "Pindahkan produk dari freezer ke chiller/kulkas bawah semalam sebelum dimasak, atau gunakan microwave defrost. Hindari merendam produk di air panas langsung tanpa plastik kedap udara.",
  },
];

export default async function CaraPenyimpananPage() {
  const settings = await getSiteSettings();

  return (
    <div className="min-h-screen bg-[var(--cream-50)]">
      <StoreHeader />

      <main className="pb-16">
        <section className="border-b border-stone-200/80 bg-gradient-to-br from-white via-[var(--cream-50)] to-[var(--brand-50)]/40 py-10 sm:py-14">
          <Container width="normal">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mx-auto mb-3 grid size-12 place-items-center rounded-2xl bg-[var(--brand-100)] text-[var(--brand-600)]">
                <Snowflake size={26} />
              </div>
              <h1 className="font-serif text-3xl font-bold tracking-tight text-[var(--ink-950)] sm:text-4xl">
                Cara Penyimpanan
              </h1>
              <p className="mt-3 text-sm text-stone-600 sm:text-base">
                Tips menjaga kualitas, rasa, dan nutrisi frozen food agar tetap segar saat disajikan.
              </p>
            </div>
          </Container>
        </section>

        <Container width="normal" className="pt-10">
          <div className="mx-auto max-w-3xl grid gap-5 sm:grid-cols-2">
            {TIPS.map((tip) => (
              <div
                key={tip.title}
                className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-sm flex flex-col"
              >
                <div className="grid size-12 place-items-center rounded-xl bg-[var(--brand-50)] border border-[var(--brand-100)] mb-4">
                  {tip.icon}
                </div>
                <h3 className="font-serif text-lg font-bold text-[var(--ink-950)]">
                  {tip.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">
                  {tip.desc}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </main>

      <StoreFooter initialSettings={settings} />
    </div>
  );
}
