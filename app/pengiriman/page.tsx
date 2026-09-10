import type { Metadata } from "next";
import { StoreHeader } from "@/components/storefront/store-header";
import { StoreFooter } from "@/components/storefront/store-footer";
import { Container } from "@/components/ui/container";
import { getSiteSettings } from "@/lib/queries/site-settings";
import { Truck, ShieldCheck, Clock, HelpCircle } from "lucide-react";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Informasi Pengiriman — Jasmine Shop Premium Product",
  description:
    "Jadwal, area jangkauan, dan standar pengemasan rantai dingin pengiriman Jasmine Shop Premium Product.",
};

export default async function PengirimanPage() {
  const settings = await getSiteSettings();
  const brand = settings?.brandName || "Jasmine Shop Premium Product";
  const hours = settings?.operatingHours || "Senin - Sabtu, 08:00 - 17:00 WIB";
  const whatsapp = settings?.whatsappNumber || "0812-3456-7890";

  return (
    <div className="min-h-screen bg-[var(--cream-50)]">
      <StoreHeader />

      <main className="pb-16">
        <section className="border-b border-stone-200/80 bg-gradient-to-br from-white via-[var(--cream-50)] to-[var(--brand-50)]/40 py-10 sm:py-14">
          <Container width="normal">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mx-auto mb-3 grid size-12 place-items-center rounded-2xl bg-[var(--brand-100)] text-[var(--brand-600)]">
                <Truck size={26} />
              </div>
              <h1 className="font-serif text-3xl font-bold tracking-tight text-[var(--ink-950)] sm:text-4xl">
                Informasi Pengiriman
              </h1>
              <p className="mt-3 text-sm text-stone-600 sm:text-base">
                Standar pengemasan cold-chain dan jangkauan ekspedisi {brand}.
              </p>
            </div>
          </Container>
        </section>

        <Container width="normal" className="pt-10">
          <div className="mx-auto max-w-3xl space-y-6 text-[var(--ink-900)]">
            <div className="rounded-2xl border border-stone-200/80 bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="grid size-8 place-items-center rounded-lg bg-[var(--brand-50)] text-[var(--brand-600)]">
                  <ShieldCheck size={18} />
                </div>
                <h2 className="font-serif text-xl font-bold text-[var(--ink-950)]">
                  Standar Pengemasan Rantai Dingin (Cold Chain)
                </h2>
              </div>
              <p className="text-sm leading-relaxed text-stone-600">
                Semua pesanan makanan beku kami dikemas menggunakan bubble wrap aluminium foil thermal khusus dan disertai es beku (ice gel pack) berkualitas tinggi untuk menjaga suhu produk tetap stabil selama perjalanan hingga tiba di tangan Anda.
              </p>
            </div>

            <div className="rounded-2xl border border-stone-200/80 bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="grid size-8 place-items-center rounded-lg bg-[var(--brand-50)] text-[var(--brand-600)]">
                  <Clock size={18} />
                </div>
                <h2 className="font-serif text-xl font-bold text-[var(--ink-950)]">
                  Jadwal Operasional Pengiriman
                </h2>
              </div>
              <ul className="list-disc pl-5 space-y-2 text-sm text-stone-600">
                <li>Jam operasional pengiriman: <strong>{hours}</strong>.</li>
                <li>Pesanan dengan metode instan yang terkonfirmasi sebelum pukul 15.00 WIB akan dikirimkan di hari yang sama.</li>
                <li>Pesanan yang masuk setelah batas waktu atau di hari libur akan dikirimkan pada hari kerja berikutnya.</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-stone-200/80 bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="grid size-8 place-items-center rounded-lg bg-[var(--brand-50)] text-[var(--brand-600)]">
                  <HelpCircle size={18} />
                </div>
                <h2 className="font-serif text-xl font-bold text-[var(--ink-950)]">
                  Konsultasi Pengiriman Luar Kota
                </h2>
              </div>
              <p className="text-sm leading-relaxed text-stone-600">
                Untuk pengiriman dalam jumlah besar (reseller/horeca) atau ke luar wilayah Jabodetabek yang memerlukan ekspedisi pendingin khusus (Paxel/Thermo Truck), silakan hubungi admin kami melalui WhatsApp:
              </p>
              <div className="mt-4">
                <a
                  href={`https://wa.me/${whatsapp.replace(/\D/g, "")}?text=Halo%20Jasmine%20Frozen%20Food%2C%20saya%20mau%20tanya%20pengiriman`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-600)] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-[var(--brand-700)]"
                >
                  Hubungi Admin Pengiriman
                </a>
              </div>
            </div>
          </div>
        </Container>
      </main>

      <StoreFooter initialSettings={settings} />
    </div>
  );
}
