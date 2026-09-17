import type { Metadata } from "next";
import { StoreHeader } from "@/components/storefront/store-header";
import { StoreFooter } from "@/components/storefront/store-footer";
import { Container } from "@/components/ui/container";
import { getSiteSettings } from "@/lib/queries/site-settings";
import { normalizeWaNumber } from "@/lib/wa";
import { SITE_NAME, canonical } from "@/lib/seo";
import { MapPin, Phone, Mail, Clock, MessageCircle, ExternalLink } from "lucide-react";
import Link from "next/link";

export const revalidate = 300;

const MAPS_LINK = "https://www.google.com/maps?cid=952775512031478653";
const MAPS_EMBED_SRC =
  "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d3965.8992208135946!2d106.7899634!3d-6.2769792!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f1be4b7191a5%3A0xd38f047b953c37d!2sJasmine%20Shop!5e0!3m2!1sen!2sid!4v1789597587346!5m2!1sen!2sid";

export const metadata: Metadata = {
  title: "Hubungi Kami",
  description: `Hubungi ${SITE_NAME} untuk pertanyaan, pemesanan, atau kemitraan reseller. Tim kami siap membantu melalui WhatsApp, email, dan media sosial.`,
  ...canonical("/kontak"),
};

export default async function KontakPage() {
  const settings = await getSiteSettings();
  const brand = settings?.brandName || "Jasmine Shop Premium Product";
  const whatsapp = settings?.whatsappNumber || "0812-3456-7890";
  const email = settings?.email || "info@jasminefrozenfood.id";
  const address = settings?.address || "Jl. Raya Utama No. 88, Jakarta Selatan, Indonesia";
  const hours = settings?.operatingHours || "Senin – Sabtu: 08.00 – 17.00 WIB";

  const contactCards = [
    {
      icon: <Phone size={22} />,
      title: "WhatsApp",
      content: whatsapp,
      href: `https://wa.me/${normalizeWaNumber(whatsapp)}`,
      action: "Chat Sekarang",
    },
    {
      icon: <Mail size={22} />,
      title: "Email",
      content: email,
      href: `mailto:${email}`,
      action: "Kirim Email",
    },
    {
      icon: <MapPin size={22} />,
      title: "Alamat",
      content: address,
      href: MAPS_LINK,
      action: "Lihat di Peta",
    },
    {
      icon: <Clock size={22} />,
      title: "Jam Operasional",
      content: hours,
      href: null,
      action: null,
    },
  ];

  const socials = [
    { label: "Instagram", href: settings?.instagramUrl },
    { label: "TikTok", href: settings?.tiktokUrl },
    { label: "YouTube", href: settings?.youtubeUrl },
    { label: "Facebook", href: settings?.facebookUrl },
  ].filter((s) => s.href);

  return (
    <div className="min-h-screen bg-[var(--cream-50)]">
      <StoreHeader />

      <main className="pb-16">
        <section className="border-b border-stone-200/80 bg-gradient-to-br from-white via-[var(--cream-50)] to-[var(--brand-50)]/40 py-10 sm:py-14">
          <Container width="normal">
            <div className="mx-auto max-w-3xl text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--brand-600)]/10 px-3 py-1 text-xs font-semibold text-[var(--brand-600)]">
                <MessageCircle size={12} />
                Hubungi Kami
              </span>
              <h1 className="mt-4 font-serif text-3xl font-bold tracking-tight text-[var(--ink-950)] sm:text-4xl">
                Kami Siap Membantu Anda
              </h1>
              <p className="mt-3 text-sm text-stone-600 sm:text-base">
                Ada pertanyaan seputar produk, pemesanan, pengiriman, atau ingin
                bergabung menjadi reseller {brand}? Hubungi kami melalui saluran di bawah ini.
              </p>
            </div>
          </Container>
        </section>

        <Container width="normal" className="pt-10">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {contactCards.map((card) => (
              <div
                key={card.title}
                className="flex flex-col justify-between rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm"
              >
                <div>
                  <div className="mb-3 grid size-10 place-items-center rounded-xl bg-[var(--brand-50)] text-[var(--brand-600)]">
                    {card.icon}
                  </div>
                  <h2 className="text-sm font-bold text-[var(--ink-950)]">{card.title}</h2>
                  <p className="mt-1.5 break-words text-sm leading-relaxed text-stone-600">
                    {card.content}
                  </p>
                </div>
                {card.href && card.action && (
                  <a
                    href={card.href}
                    target={card.href.startsWith("http") ? "_blank" : undefined}
                    rel={card.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[var(--brand-600)] hover:underline"
                  >
                    {card.action}
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>
            ))}
          </div>

          <section className="mt-10 overflow-hidden rounded-3xl border border-stone-200/80 bg-white shadow-sm">
            <div className="grid sm:grid-cols-[1.35fr_1fr]">
              <iframe
                src={MAPS_EMBED_SRC}
                title={`Peta lokasi ${brand}`}
                loading="lazy"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
                className="h-72 w-full border-0 sm:h-full sm:min-h-80"
              />
              <div className="flex flex-col justify-center gap-3 p-6 sm:p-8">
                <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[var(--brand-600)]/10 px-3 py-1 text-xs font-semibold text-[var(--brand-600)]">
                  <MapPin size={12} />
                  Lokasi Kami
                </span>
                <h2 className="font-serif text-2xl font-bold text-[var(--ink-950)]">
                  Kunjungi Toko Kami
                </h2>
                <p className="text-sm leading-relaxed text-stone-600">{address}</p>
                <p className="text-sm text-stone-500">
                  Cari lokasi toko {brand} di Google Maps dan arahkan navigasi Anda ke sana.
                </p>
                <a
                  href={MAPS_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex w-fit items-center gap-2 rounded-full bg-[var(--brand-600)] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[var(--brand-700)]"
                >
                  Buka di Google Maps
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          </section>

          {socials.length > 0 && (
            <section className="mt-10">
              <h2 className="font-serif text-xl font-bold text-[var(--ink-950)]">
                Media Sosial
              </h2>
              <p className="mt-1 text-sm text-stone-500">
                Ikuti kami untuk update produk terbaru dan promo spesial.
              </p>
              <div className="mt-4 flex flex-wrap gap-2.5">
                {socials.map((social) => (
                  <Link
                    key={social.label}
                    href={social.href ?? "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-[var(--ink-950)] transition hover:bg-stone-50"
                  >
                    {social.label}
                  </Link>
                ))}
              </div>
            </section>
          )}
        </Container>
      </main>

      <StoreFooter initialSettings={settings} />
    </div>
  );
}