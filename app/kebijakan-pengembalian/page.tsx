import type { Metadata } from "next";
import { StoreHeader } from "@/components/storefront/store-header";
import { StoreFooter } from "@/components/storefront/store-footer";
import { Container } from "@/components/ui/container";
import { getSiteSettings } from "@/lib/queries/site-settings";
import { normalizeWaNumber } from "@/lib/wa";
import { SITE_NAME, canonical } from "@/lib/seo";
import { RotateCcw, AlertTriangle, Video, CheckCircle2, HelpCircle } from "lucide-react";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Kebijakan Pengembalian",
  description: `Ketentuan garansi, klaim produk rusak, dan pengembalian produk ${SITE_NAME}.`,
  ...canonical("/kebijakan-pengembalian"),
};

export default async function KebijakanPengembalianPage() {
  const settings = await getSiteSettings();
  const brand = settings?.brandName || "Jasmine Shop Premium Product";
  const whatsapp = settings?.whatsappNumber || "0812-3456-7890";

  return (
    <div className="min-h-screen bg-[var(--cream-50)]">
      <StoreHeader />

      <main className="pb-16">
        <section className="border-b border-stone-200/80 bg-gradient-to-br from-white via-[var(--cream-50)] to-[var(--brand-50)]/40 py-10 sm:py-14">
          <Container width="normal">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mx-auto mb-3 grid size-12 place-items-center rounded-2xl bg-[var(--brand-100)] text-[var(--brand-600)]">
                <RotateCcw size={26} />
              </div>
              <h1 className="font-serif text-3xl font-bold tracking-tight text-[var(--ink-950)] sm:text-4xl">
                Kebijakan Pengembalian
              </h1>
              <p className="mt-3 text-sm text-stone-600 sm:text-base">
                Garansi kualitas dan panduan klaim pengembalian atau penggantian produk di {brand}.
              </p>
            </div>
          </Container>
        </section>

        <Container width="normal" className="pt-10">
          <div className="mx-auto max-w-3xl space-y-8 text-[var(--ink-900)]">
            <div className="rounded-2xl border border-[var(--brand-200)] bg-[var(--brand-50)]/60 p-5 sm:p-6">
              <div className="flex items-start gap-3.5">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-[var(--brand-600)]" />
                <div className="text-sm leading-relaxed text-stone-700">
                  <strong className="block font-semibold text-[var(--ink-950)]">
                    Garansi Kualitas 100% Produk Segar
                  </strong>
                  Kepuasan pelanggan adalah prioritas kami. Jika produk yang Anda terima dalam kondisi rusak, cacat kemasan akibat kesalahan penanganan pihak kami, atau tidak sesuai dengan pesanan, kami siap memberikan penggantian produk atau pengembalian dana (*refund*).
                </div>
              </div>
            </div>

            <section className="rounded-2xl border border-stone-200/80 bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="grid size-8 place-items-center rounded-lg bg-[var(--brand-50)] text-[var(--brand-600)]">
                  <Video size={18} />
                </div>
                <h2 className="font-serif text-xl font-bold text-[var(--ink-950)]">
                  Syarat &amp; Ketentuan Klaim
                </h2>
              </div>
              <ul className="list-disc pl-5 space-y-3 text-sm text-stone-600">
                <li>
                  <strong>Video Unboxing Lengkap:</strong> Pelanggan wajib menyertakan video unboxing utuh tanpa terpotong (sejak segel paket masih tertutup rapat hingga produk dikeluarkan).
                </li>
                <li>
                  <strong>Batas Waktu Pelaporan:</strong> Klaim harus diajukan maksimal <strong>1 x 24 jam</strong> sejak status paket dinyatakan diterima oleh sistem kurir ekspedisi.
                </li>
                <li>
                  <strong>Kondisi Produk:</strong> Produk belum dikonsumsi dan masih berada dalam kemasan aslinya.
                </li>
              </ul>
            </section>

            <section className="rounded-2xl border border-stone-200/80 bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="grid size-8 place-items-center rounded-lg bg-[var(--brand-50)] text-[var(--brand-600)]">
                  <AlertTriangle size={18} />
                </div>
                <h2 className="font-serif text-xl font-bold text-[var(--ink-950)]">
                  Kasus yang Tidak Memenuhi Syarat
                </h2>
              </div>
              <ul className="list-disc pl-5 space-y-3 text-sm text-stone-600">
                <li>Kerusakan akibat kelalaian pelanggan (misal: paket dibiarkan di luar suhu ruang selama berjam-jam setelah diterima).</li>
                <li>Pelanggan salah mencantumkan alamat pengiriman atau nomor telepon tidak dapat dihubungi oleh kurir.</li>
                <li>Perubahan selera atau salah memilih varian oleh pembeli setelah pesanan diproses.</li>
              </ul>
            </section>

            <section className="rounded-2xl border border-stone-200/80 bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="grid size-8 place-items-center rounded-lg bg-[var(--brand-50)] text-[var(--brand-600)]">
                  <HelpCircle size={18} />
                </div>
                <h2 className="font-serif text-xl font-bold text-[var(--ink-950)]">
                  Cara Mengajukan Klaim
                </h2>
              </div>
              <p className="text-sm leading-relaxed text-stone-600">
                Hubungi Customer Service kami melalui WhatsApp dengan mengirimkan Nomor Pesanan (#INV), foto paket, dan video unboxing:
              </p>
              <div className="mt-4">
                <a
                  href={`https://wa.me/${normalizeWaNumber(whatsapp)}?text=Halo%20Jasmine%20Frozen%20Food%2C%20saya%20ingin%20mengajukan%20komplain%20pesanan`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-600)] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-[var(--brand-700)]"
                >
                  Ajukan Klaim via WhatsApp
                </a>
              </div>
            </section>
          </div>
        </Container>
      </main>

      <StoreFooter initialSettings={settings} />
    </div>
  );
}
