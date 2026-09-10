import type { Metadata } from "next";
import Link from "next/link";
import { StoreHeader } from "@/components/storefront/store-header";
import { StoreFooter } from "@/components/storefront/store-footer";
import { Container } from "@/components/ui/container";
import { getSiteSettings } from "@/lib/queries/site-settings";
import { FileCheck2, ShoppingCart, Truck, RefreshCw, HelpCircle } from "lucide-react";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Syarat & Ketentuan — Jasmine Shop Premium Product",
  description:
    "Syarat & Ketentuan penggunaan layanan dan transaksi pemesanan produk di Jasmine Shop Premium Product.",
};

export default async function SyaratKetentuanPage() {
  const settings = await getSiteSettings();
  const brand = settings?.brandName || "Jasmine Shop Premium Product";
  const email = settings?.email || "info@jasminefrozenfood.id";
  const whatsapp = settings?.whatsappNumber || "0812-3456-7890";

  return (
    <div className="min-h-screen bg-[var(--cream-50)]">
      <StoreHeader />

      <main className="pb-16">
        <section className="border-b border-stone-200/80 bg-gradient-to-br from-white via-[var(--cream-50)] to-[var(--brand-50)]/40 py-10 sm:py-14">
          <Container width="normal">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mx-auto mb-3 grid size-12 place-items-center rounded-2xl bg-[var(--brand-100)] text-[var(--brand-600)]">
                <FileCheck2 size={26} />
              </div>
              <h1 className="font-serif text-3xl font-bold tracking-tight text-[var(--ink-950)] sm:text-4xl">
                Syarat &amp; Ketentuan
              </h1>
              <p className="mt-3 text-sm text-stone-600 sm:text-base">
                Ketentuan pemesanan, pembayaran, dan layanan di {brand}.
              </p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white/80 px-3.5 py-1 text-xs text-stone-500 shadow-sm backdrop-blur">
                <span>Terakhir diperbarui: 6 September 2026</span>
              </div>
            </div>
          </Container>
        </section>

        <Container width="normal" className="pt-10">
          <div className="mx-auto max-w-3xl space-y-8 text-[var(--ink-900)]">
            <section className="rounded-2xl border border-stone-200/80 bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="grid size-8 place-items-center rounded-lg bg-[var(--brand-50)] text-[var(--brand-600)]">
                  <ShoppingCart size={18} />
                </div>
                <h2 className="font-serif text-xl font-bold text-[var(--ink-950)]">
                  1. Ketentuan Pemesanan &amp; Pembayaran
                </h2>
              </div>
              <div className="space-y-3 text-sm leading-relaxed text-stone-600">
                <p>
                  Dengan melakukan transaksi di {brand}, Anda menyetujui ketentuan berikut:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Pemesanan dapat dilakukan melalui situs resmi atau melalui WhatsApp resmi kami.</li>
                  <li>Pembayaran dilakukan melalui transfer bank resmi yang tertera pada halaman pembayaran.</li>
                  <li>Pelanggan diwajibkan mengunggah bukti transfer yang valid agar pesanan dapat segera diverifikasi oleh tim kami.</li>
                  <li>Pesanan yang belum dibayar dalam batas waktu tertentu dapat dibatalkan secara otomatis oleh sistem.</li>
                </ul>
              </div>
            </section>

            <section className="rounded-2xl border border-stone-200/80 bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="grid size-8 place-items-center rounded-lg bg-[var(--brand-50)] text-[var(--brand-600)]">
                  <Truck size={18} />
                </div>
                <h2 className="font-serif text-xl font-bold text-[var(--ink-950)]">
                  2. Ketentuan Pengiriman
                </h2>
              </div>
              <div className="space-y-3 text-sm leading-relaxed text-stone-600">
                <p>
                  Sebagai produk makanan beku (frozen food), kualitas produk sangat bergantung pada penanganan suhu:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Pengiriman menggunakan kurir instan/sameday atau ekspedisi khusus dengan pengemasan rantai dingin (cold chain/ice pack).</li>
                  <li>Pelanggan wajib memastikan ada penerima di alamat tujuan saat pesanan tiba agar produk dapat langsung dimasukkan ke dalam freezer (-18°C).</li>
                  <li>Keterlambatan penerimaan oleh pelanggan di lokasi yang menyebabkan produk mencair berada di luar tanggung jawab penjual.</li>
                </ul>
              </div>
            </section>

            <section className="rounded-2xl border border-stone-200/80 bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="grid size-8 place-items-center rounded-lg bg-[var(--brand-50)] text-[var(--brand-600)]">
                  <RefreshCw size={18} />
                </div>
                <h2 className="font-serif text-xl font-bold text-[var(--ink-950)]">
                  3. Pengembalian &amp; Komplain
                </h2>
              </div>
              <div className="space-y-3 text-sm leading-relaxed text-stone-600">
                <p>
                  Komplain kerusakan produk atau kekurangan isi paket wajib disertai dengan <strong>video unboxing tanpa jeda</strong> maksimal 1x24 jam sejak paket diterima. Selengkapnya dapat dibaca pada halaman <Link href="/kebijakan-pengembalian" className="text-[var(--brand-600)] underline">Kebijakan Pengembalian</Link>.
                </p>
              </div>
            </section>

            <section className="rounded-2xl border border-stone-200/80 bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="grid size-8 place-items-center rounded-lg bg-[var(--brand-50)] text-[var(--brand-600)]">
                  <HelpCircle size={18} />
                </div>
                <h2 className="font-serif text-xl font-bold text-[var(--ink-950)]">
                  4. Bantuan Pelanggan
                </h2>
              </div>
              <p className="text-sm leading-relaxed text-stone-600">
                Untuk pertanyaan lebih lanjut mengenai syarat dan ketentuan ini, hubungi kami di:
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-stone-200/80 bg-stone-50 p-4">
                  <p className="text-xs text-stone-500">Email</p>
                  <a href={`mailto:${email}`} className="text-sm font-semibold text-[var(--brand-600)] hover:underline">
                    {email}
                  </a>
                </div>
                <div className="rounded-xl border border-stone-200/80 bg-stone-50 p-4">
                  <p className="text-xs text-stone-500">WhatsApp</p>
                  <a
                    href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-[var(--brand-600)] hover:underline"
                  >
                    {whatsapp}
                  </a>
                </div>
              </div>
            </section>
          </div>
        </Container>
      </main>

      <StoreFooter initialSettings={settings} />
    </div>
  );
}
