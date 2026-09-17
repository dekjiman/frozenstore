import type { Metadata } from "next";
import { StoreHeader } from "@/components/storefront/store-header";
import { StoreFooter } from "@/components/storefront/store-footer";
import { Container } from "@/components/ui/container";
import { SITE_NAME, canonical } from "@/lib/seo";
import { HelpCircle, MessageCircle, Phone, Mail, Clock, ChevronRight, Package, CreditCard, Truck, RotateCcw } from "lucide-react";

export const metadata: Metadata = {
  title: "Bantuan",
  description: `Pusat bantuan ${SITE_NAME} — temukan jawaban atas pertanyaan Anda seputar pemesanan, pengiriman, pembayaran, dan lainnya.`,
  ...canonical("/bantuan"),
};

const FAQ_ITEMS = [
  {
    category: "Pemesanan",
    icon: <Package size={20} strokeWidth={1.5} />,
    items: [
      {
        q: "Bagaimana cara memesan produk?",
        a: "Anda bisa memesan langsung melalui website kami, WhatsApp, atau marketplace favorit Anda (Shopee, Tokopedia, TikTok Shop, Lazada). Pilih produk, masukkan ke keranjang, dan ikuti proses checkout.",
      },
      {
        q: "Bisakah saya membatalkan pesanan?",
        a: "Pesanan yang sudah dikonfirmasi tidak dapat dibatalkan. Namun, Anda bisa menghubungi kami via WhatsApp untuk diskusi lebih lanjut.",
      },
      {
        q: "Apakah ada pesanan minimum?",
        a: "Tidak ada pesanan minimum. Namun, untuk pengiriman gratis, minimal pembelian adalah Rp150.000.",
      },
    ],
  },
  {
    category: "Pembayaran",
    icon: <CreditCard size={20} strokeWidth={1.5} />,
    items: [
      {
        q: "Metode pembayaran apa yang diterima?",
        a: "Kami menerima transfer bank (BCA, Mandiri, BRI, BNI), e-wallet (GoPay, OVO, Dana, ShopeePay), dan kartu kredit/debit.",
      },
      {
        q: "Bagaimana cara membayar via transfer bank?",
        a: "Setelah checkout, Anda akan mendapatkan nomor rekening dan total yang harus dibayar. Lakukan transfer sesuai nominal yang tertera, lalu konfirmasi pembayaran melalui website atau WhatsApp.",
      },
      {
        q: "Apakah harga sudah termasuk pajak?",
        a: "Ya, semua harga yang tercantum sudah termasuk pajak. Tidak ada biaya tambahan tersembunyi.",
      },
    ],
  },
  {
    category: "Pengiriman",
    icon: <Truck size={20} strokeWidth={1.5} />,
    items: [
      {
        q: "Bagaimana pengiriman frozen food dijaga kesegarannya?",
        a: "Kami menggunakan kemasan box berinsulasi dengan ice pack khusus untuk menjaga suhu tetap dingin selama pengiriman. Rantai dingin kami terjaga dari pabrik hingga ke tangan Anda.",
      },
      {
        q: "Berapa lama pengiriman dilakukan?",
        a: "Untuk wilayah Pulau Jawa: estimasi 1-2 hari kerja. Estimasi dapat berbeda tergantung lokasi dan kurir yang digunakan.",
      },
      {
        q: "Area pengiriman mana saja yang terjangkau?",
        a: "Pengiriman kami hanya melayani wilayah Pulau Jawa. Untuk area tertentu, silakan hubungi kami via WhatsApp untuk cek ketersediaan pengiriman.",
      },
    ],
  },
  {
    category: "Pengembalian",
    icon: <RotateCcw size={20} strokeWidth={1.5} />,
    items: [
      {
        q: "Bagaimana kebijakan pengembalian produk?",
        a: "Jika produk yang diterima rusak atau tidak sesuai, silakan hubungi kami dalam 24 jam dengan foto produk. Kami akan mengganti produk atau mengembalikan dana Anda.",
      },
      {
        q: "Bagaimana cara menyimpan produk frozen food?",
        a: "Simpan produk di freezer dengan suhu -18°C atau lebih rendah. Perhatikan tanggal kedaluwarsa pada kemasan. Setelah dimasak, produk harus segera dikonsumsi.",
      },
    ],
  },
];

import { getSiteSettings } from "@/lib/queries/site-settings";

export default async function BantuanPage() {
  const settings = await getSiteSettings();

  const rawWhatsapp = settings?.whatsappNumber || "62817771020";
  const waDigits = rawWhatsapp.replace(/\D/g, "");
  const waFormatted = waDigits.startsWith("0") ? `62${waDigits.slice(1)}` : waDigits;
  const waHref = waDigits ? `https://wa.me/${waFormatted}` : "https://wa.me/62817771020";
  const waCtaHref = `${waHref}?text=Halo%20Jasmine%20Frozen%20Food%2C%20saya%20punya%20pertanyaan`;

  const emailVal = settings?.email || "info@jasmineshop.id";
  const hoursVal = settings?.operatingHours || "Senin - Sabtu, 08:00 - 20:00 WIB";

  const contactInfo = [
    { icon: <Phone size={18} />, label: "WhatsApp", value: rawWhatsapp, href: waHref },
    { icon: <Mail size={18} />, label: "Email", value: emailVal, href: `mailto:${emailVal}` },
    { icon: <Clock size={18} />, label: "Jam Operasional", value: hoursVal, href: null },
  ];
  return (
    <div className="min-h-screen bg-[var(--cream-50)]">
      <StoreHeader />

      <main>
        {/* Hero */}
        <section className="bg-gradient-to-br from-[var(--cream-100)] to-[var(--brand-50)] py-12 sm:py-16">
          <Container width="normal">
            <div className="text-center">
              <HelpCircle size={40} className="mx-auto mb-3 text-[var(--brand-600)]" />
              <h1 className="font-serif text-3xl font-bold text-[var(--ink-950)] sm:text-4xl">
                Pusat Bantuan
              </h1>
              <p className="mt-3 text-sm text-stone-500 sm:text-base">
                Temukan jawaban atas pertanyaan Anda di sini
              </p>

              {/* Search */}
              <div className="mx-auto mt-6 max-w-lg">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Cari pertanyaan..."
                    aria-label="Cari pertanyaan"
                    className="h-12 w-full rounded-full border border-stone-200 bg-white pl-11 pr-4 text-sm text-[var(--ink-950)] placeholder:text-stone-400 outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-[var(--brand-600)]/10"
                  />
                  <HelpCircle size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* Quick Links */}
        <section className="py-8 sm:py-10">
          <Container width="normal">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {FAQ_ITEMS.map((cat) => (
                <a
                  key={cat.category}
                  href={`#${cat.category.toLowerCase()}`}
                  className="flex items-center gap-3 rounded-xl border border-stone-200/80 bg-white p-4 transition hover:border-[var(--brand-400)] hover:shadow-sm"
                >
                  <div className="grid size-10 place-items-center rounded-lg bg-[var(--brand-50)] text-[var(--brand-600)]">
                    {cat.icon}
                  </div>
                  <span className="text-sm font-semibold text-[var(--ink-950)]">{cat.category}</span>
                </a>
              ))}
            </div>
          </Container>
        </section>

        {/* FAQ */}
        <section className="py-8 sm:py-10">
          <Container width="normal">
            <div className="space-y-10">
              {FAQ_ITEMS.map((cat) => (
                <div key={cat.category} id={cat.category.toLowerCase()}>
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="grid size-8 place-items-center rounded-lg bg-[var(--brand-50)] text-[var(--brand-600)]">
                      {cat.icon}
                    </div>
                    <h2 className="font-serif text-lg font-bold text-[var(--ink-950)]">
                      {cat.category}
                    </h2>
                  </div>

                  <div className="space-y-2.5">
                    {cat.items.map((item) => (
                      <details
                        key={item.q}
                        className="group rounded-xl border border-stone-200/80 bg-white"
                      >
                        <summary className="flex cursor-pointer items-center justify-between gap-3 px-5 py-4 text-sm font-semibold text-[var(--ink-950)] list-none [&::-webkit-details-marker]:hidden">
                          <span>{item.q}</span>
                          <ChevronRight size={16} className="shrink-0 text-stone-400 transition-transform group-open:rotate-90" />
                        </summary>
                        <div className="px-5 pb-4 text-sm leading-relaxed text-stone-500">
                          {item.a}
                        </div>
                      </details>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* Contact */}
        <section className="bg-white py-10 sm:py-14">
          <Container width="normal">
            <div className="text-center">
              <h2 className="font-serif text-xl font-bold text-[var(--ink-950)] sm:text-2xl">
                Masih Punya Pertanyaan?
              </h2>
              <p className="mt-2 text-sm text-stone-500">
                Hubungi kami dan kami akan dengan senang hati membantu Anda
              </p>
            </div>

            <div className="mx-auto mt-8 grid max-w-lg gap-3">
              {contactInfo.map((contact) => (
                <div
                  key={contact.label}
                  className="flex items-center gap-4 rounded-xl border border-stone-200/80 bg-[var(--cream-50)] p-4"
                >
                  <div className="grid size-10 place-items-center rounded-lg bg-[var(--brand-50)] text-[var(--brand-600)] shrink-0">
                    {contact.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-stone-400">{contact.label}</p>
                    {contact.href ? (
                      <a href={contact.href} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-[var(--ink-950)] hover:text-[var(--brand-600)] transition-colors">
                        {contact.value}
                      </a>
                    ) : (
                      <p className="text-sm font-semibold text-[var(--ink-950)]">{contact.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 text-center">
              <a
                href={waCtaHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-[var(--success)] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-[var(--success)]/90"
              >
                <MessageCircle size={16} />
                Chat via WhatsApp
              </a>
            </div>
          </Container>
        </section>
      </main>

      <StoreFooter initialSettings={settings} />
    </div>
  );
}
