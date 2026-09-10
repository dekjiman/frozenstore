import type { Metadata } from "next";
import Link from "next/link";
import { StoreHeader } from "@/components/storefront/store-header";
import { StoreFooter } from "@/components/storefront/store-footer";
import { Container } from "@/components/ui/container";
import { getSiteSettings } from "@/lib/queries/site-settings";
import { ShieldCheck, Lock, Eye, FileText, UserCheck, HelpCircle } from "lucide-react";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Kebijakan Privasi — Jasmine Frozen Food",
  description:
    "Kebijakan Privasi Jasmine Frozen Food. Pelajari bagaimana kami mengumpulkan, menggunakan, dan melindungi data pribadi Anda saat berbelanja produk frozen food kami.",
};

export default async function KebijakanPrivasiPage() {
  const settings = await getSiteSettings();
  const brand = settings?.brandName || "Jasmine Frozen Food";
  const email = settings?.email || "info@jasminefrozenfood.id";
  const whatsapp = settings?.whatsappNumber || "0812-3456-7890";

  return (
    <div className="min-h-screen bg-[var(--cream-50)]">
      <StoreHeader />

      <main className="pb-16">
        {/* Hero Section */}
        <section className="border-b border-stone-200/80 bg-gradient-to-br from-white via-[var(--cream-50)] to-[var(--brand-50)]/40 py-10 sm:py-14">
          <Container width="normal">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mx-auto mb-3 grid size-12 place-items-center rounded-2xl bg-[var(--brand-100)] text-[var(--brand-600)]">
                <ShieldCheck size={26} />
              </div>
              <h1 className="font-serif text-3xl font-bold tracking-tight text-[var(--ink-950)] sm:text-4xl">
                Kebijakan Privasi
              </h1>
              <p className="mt-3 text-sm text-stone-600 sm:text-base">
                Komitmen kami dalam menjaga kerahasiaan dan keamanan data pribadi Anda di {brand}.
              </p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white/80 px-3.5 py-1 text-xs text-stone-500 shadow-sm backdrop-blur">
                <span>Terakhir diperbarui: 6 September 2026</span>
              </div>
            </div>
          </Container>
        </section>

        {/* Content Section */}
        <Container width="normal" className="pt-10">
          <div className="mx-auto max-w-3xl space-y-8 text-[var(--ink-900)]">
            {/* Ringkasan */}
            <div className="rounded-2xl border border-[var(--brand-200)] bg-[var(--brand-50)]/60 p-5 sm:p-6">
              <div className="flex items-start gap-3.5">
                <Lock className="mt-0.5 size-5 shrink-0 text-[var(--brand-600)]" />
                <div className="text-sm leading-relaxed text-stone-700">
                  <strong className="block font-semibold text-[var(--ink-950)]">
                    Privasi Anda adalah Prioritas Kami
                  </strong>
                  Kami menghormati hak privasi setiap pengunjung dan pelanggan. Dokumen ini menjelaskan bagaimana kami mengumpulkan, mengelola, serta melindungi informasi pribadi yang Anda berikan saat menggunakan situs web kami.
                </div>
              </div>
            </div>

            {/* 1. Informasi yang Kami Kumpulkan */}
            <section className="rounded-2xl border border-stone-200/80 bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="grid size-8 place-items-center rounded-lg bg-[var(--brand-50)] text-[var(--brand-600)]">
                  <FileText size={18} />
                </div>
                <h2 className="font-serif text-xl font-bold text-[var(--ink-950)]">
                  1. Informasi yang Kami Kumpulkan
                </h2>
              </div>
              <div className="space-y-3 text-sm leading-relaxed text-stone-600">
                <p>Kami mengumpulkan data yang Anda berikan secara langsung kepada kami, meliputi:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    <strong className="text-[var(--ink-950)]">Data Akun & Profil:</strong> Nama lengkap, alamat email, nomor telepon/WhatsApp, dan kata sandi yang terenkripsi saat Anda mendaftar akun.
                  </li>
                  <li>
                    <strong className="text-[var(--ink-950)]">Data Transaksi & Pengiriman:</strong> Alamat lengkap pengiriman, catatan pesanan, riwayat pembelian, serta bukti transfer pembayaran yang Anda unggah.
                  </li>
                  <li>
                    <strong className="text-[var(--ink-950)]">Komunikasi:</strong> Pertanyaan, ulasan produk, masukan, atau pesan yang Anda kirimkan melalui form bantuan maupun WhatsApp layanan pelanggan kami.
                  </li>
                </ul>
              </div>
            </section>

            {/* 2. Bagaimana Kami Menggunakan Informasi Anda */}
            <section className="rounded-2xl border border-stone-200/80 bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="grid size-8 place-items-center rounded-lg bg-[var(--brand-50)] text-[var(--brand-600)]">
                  <Eye size={18} />
                </div>
                <h2 className="font-serif text-xl font-bold text-[var(--ink-950)]">
                  2. Penggunaan Informasi
                </h2>
              </div>
              <div className="space-y-3 text-sm leading-relaxed text-stone-600">
                <p>Informasi yang kami kumpulkan digunakan secara eksklusif untuk:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Memproses dan menyelesaikan transaksi pemesanan produk frozen food Anda.</li>
                  <li>Mengatur pengiriman pesanan ke alamat tujuan dengan kurir berpendingin (rantai dingin) yang tepat.</li>
                  <li>Mengirimkan konfirmasi pesanan, status pembayaran, serta resi pengiriman melalui WhatsApp atau Email.</li>
                  <li>Menanggapi pertanyaan, keluhan, dan memberikan layanan purnajual yang responsif.</li>
                  <li>Mengirimkan penawaran promo atau newsletter khusus bagi pelanggan yang telah menyetujui.</li>
                </ul>
              </div>
            </section>

            {/* 3. Perlindungan & Keamanan Data */}
            <section className="rounded-2xl border border-stone-200/80 bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="grid size-8 place-items-center rounded-lg bg-[var(--brand-50)] text-[var(--brand-600)]">
                  <Lock size={18} />
                </div>
                <h2 className="font-serif text-xl font-bold text-[var(--ink-950)]">
                  3. Perlindungan dan Keamanan Data
                </h2>
              </div>
              <div className="space-y-3 text-sm leading-relaxed text-stone-600">
                <p>
                  Kami menerapkan langkah-langkah keamanan teknis dan organisasi yang ketat untuk mencegah akses tanpa izin, perubahan, pengungkapan, atau penghancuran data pribadi Anda:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Kata sandi akun disimpan dalam bentuk hash yang aman dan tidak dapat dibaca oleh staf kami.</li>
                  <li>Komunikasi web dilindungi menggunakan sertifikat SSL (HTTPS) standar industri.</li>
                  <li>Bukti transaksi dan pembayaran disimpan pada penyimpanan yang terlindungi dan hanya dapat diakses oleh tim otorisasi untuk verifikasi manual.</li>
                </ul>
              </div>
            </section>

            {/* 4. Pembagian Data Pihak Ketiga */}
            <section className="rounded-2xl border border-stone-200/80 bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="grid size-8 place-items-center rounded-lg bg-[var(--brand-50)] text-[var(--brand-600)]">
                  <UserCheck size={18} />
                </div>
                <h2 className="font-serif text-xl font-bold text-[var(--ink-950)]">
                  4. Pembagian Informasi kepada Pihak Ketiga
                </h2>
              </div>
              <div className="space-y-3 text-sm leading-relaxed text-stone-600">
                <p>
                  Kami <strong>tidak pernah menjual, menyewakan, atau memperdagangkan</strong> data pribadi Anda kepada pihak mana pun untuk kepentingan pemasaran mereka.
                </p>
                <p>Kami hanya membagikan data esensial kepada:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Mitra logistik dan kurir ekspedisi (nama, alamat, dan nomor telepon) semata-mata agar pesanan sampai ke tujuan Anda.</li>
                  <li>Pihak penegak hukum jika diwajibkan oleh ketentuan perundang-undangan yang berlaku di Republik Indonesia.</li>
                </ul>
              </div>
            </section>

            {/* 5. Hak-Hak Anda */}
            <section className="rounded-2xl border border-stone-200/80 bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="grid size-8 place-items-center rounded-lg bg-[var(--brand-50)] text-[var(--brand-600)]">
                  <ShieldCheck size={18} />
                </div>
                <h2 className="font-serif text-xl font-bold text-[var(--ink-950)]">
                  5. Hak Anda atas Data Pribadi
                </h2>
              </div>
              <div className="space-y-3 text-sm leading-relaxed text-stone-600">
                <p>Anda memiliki hak penuh untuk:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Mengakses dan memperbarui informasi profil Anda kapan saja melalui menu <Link href="/akun" className="text-[var(--brand-600)] underline">Akun Saya</Link>.</li>
                  <li>Meminta penghapusan akun atau riwayat data tertentu dengan menghubungi tim dukungan kami.</li>
                  <li>Berhenti berlangganan buletin promo kapan saja dengan mengklik tautan unsubscribe atau menghubungi kami.</li>
                </ul>
              </div>
            </section>

            {/* 6. Hubungi Kami */}
            <section className="rounded-2xl border border-stone-200/80 bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="grid size-8 place-items-center rounded-lg bg-[var(--brand-50)] text-[var(--brand-600)]">
                  <HelpCircle size={18} />
                </div>
                <h2 className="font-serif text-xl font-bold text-[var(--ink-950)]">
                  6. Hubungi Kami
                </h2>
              </div>
              <p className="text-sm leading-relaxed text-stone-600">
                Apabila Anda memiliki pertanyaan, saran, atau kekhawatiran terkait Kebijakan Privasi ini atau pengelolaan data Anda di {brand}, silakan hubungi kami melalui:
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-stone-200/80 bg-stone-50 p-4">
                  <p className="text-xs text-stone-500">Email Resmi</p>
                  <a href={`mailto:${email}`} className="text-sm font-semibold text-[var(--brand-600)] hover:underline">
                    {email}
                  </a>
                </div>
                <div className="rounded-xl border border-stone-200/80 bg-stone-50 p-4">
                  <p className="text-xs text-stone-500">WhatsApp Pelanggan</p>
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
