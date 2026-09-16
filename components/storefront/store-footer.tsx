"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Phone, Mail, Clock, MapPin, ExternalLink, Send } from "lucide-react";
import { Container } from "@/components/ui/container";
import type { SiteSettingsDTO } from "@/lib/queries/site-settings";

export function StoreFooter({
  initialSettings,
}: {
  initialSettings?: Partial<SiteSettingsDTO> | null;
} = {}) {
  const [settings, setSettings] = useState<Partial<SiteSettingsDTO> | null>(initialSettings ?? null);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    if (initialSettings) return;

    let isMounted = true;
    fetch("/api/site-settings")
      .then((res) => res.json())
      .then((payload) => {
        if (isMounted && payload?.data) {
          setSettings(payload.data);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [initialSettings]);

  const rawWhatsapp = settings?.whatsappNumber || "0812-3456-7890";
  const waDigits = rawWhatsapp.replace(/\D/g, "");
  const waFormatted = waDigits.startsWith("0") ? `62${waDigits.slice(1)}` : waDigits;
  const waHref = waDigits ? `https://wa.me/${waFormatted}` : "https://wa.me/6281234567890";

  const emailVal = settings?.email || "info@jasminefrozenfood.id";
  const hoursVal = settings?.operatingHours || "08.00 - 20.00 WIB";
  const addressVal = settings?.address;

  const socialLinks = [
    { label: "Instagram", letter: "I", href: settings?.instagramUrl || "#", color: "hover:bg-white/20 hover:border-white/40" },
    { label: "Facebook", letter: "F", href: settings?.facebookUrl || "#", color: "hover:bg-white/20 hover:border-white/40" },
    { label: "TikTok", letter: "T", href: settings?.tiktokUrl || "#", color: "hover:bg-white/20 hover:border-white/40" },
    { label: "YouTube", letter: "Y", href: settings?.youtubeUrl || "#", color: "hover:bg-white/20 hover:border-white/40" },
  ];

  async function handleNewsletter(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;
    try {
      await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      setSubscribed(true);
      setEmail("");
    } catch {
      // silent
    }
  }

  return (
    <footer className="bg-[var(--brand-700)] text-white">
      <Container width="wide" className="py-10 lg:py-14">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand + Social */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <span className="inline-flex h-9 w-auto overflow-hidden rounded-xl bg-white">
                <img src="/images/logo/logo_jusmine-mark.png" alt={settings?.brandName || "Jasmine Shop Premium Product"} className="h-9 w-auto object-contain" />
              </span>
            </Link>
            <p className="text-xs leading-relaxed text-white/70">
              {settings?.tagline || "Frozen Food Premium dengan kualitas terbaik untuk keluarga Indonesia."}
            </p>
            {/* Social icons — circular */}
            <div className="mt-4 flex gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target={social.href !== "#" ? "_blank" : undefined}
                  rel={social.href !== "#" ? "noopener noreferrer" : undefined}
                  className={`grid size-8 place-items-center rounded-full border border-white/20 bg-white/10 text-white text-[10px] font-bold transition ${social.color}`}
                  aria-label={social.label}
                >
                  {social.letter}
                </a>
              ))}
            </div>
          </div>

          {/* Produk */}
          <div>
            <h3 className="mb-4 text-sm font-bold text-white">Produk</h3>
            <ul className="space-y-2.5 text-xs">
              <li><Link href="/produk" className="text-white/70 hover:text-white transition-colors">Semua Produk</Link></li>
              <li><Link href="/produk?bestSeller=true" className="text-white/70 hover:text-white transition-colors">Best Seller</Link></li>
              <li><Link href="/produk?featured=true" className="text-white/70 hover:text-white transition-colors">Produk Baru</Link></li>
              <li><Link href="/produk?promo=true" className="text-white/70 hover:text-white transition-colors">Promo</Link></li>
            </ul>
          </div>

          {/* Informasi */}
          <div>
            <h3 className="mb-4 text-sm font-bold text-white">Informasi</h3>
            <ul className="space-y-2.5 text-xs">
              <li><Link href="/tentang-kami" className="text-white/70 hover:text-white transition-colors">Tentang Kami</Link></li>
              <li><Link href="/kontak" className="text-white/70 hover:text-white transition-colors">Kontak</Link></li>
              <li><Link href="/cara-order" className="text-white/70 hover:text-white transition-colors">Cara Order</Link></li>
              <li><Link href="/cara-penyimpanan" className="text-white/70 hover:text-white transition-colors">Cara Penyimpanan</Link></li>
              <li><Link href="/pengiriman" className="text-white/70 hover:text-white transition-colors">Pengiriman</Link></li>
            </ul>
          </div>

          {/* Bantuan */}
          <div>
            <h3 className="mb-4 text-sm font-bold text-white">Bantuan</h3>
            <ul className="space-y-2.5 text-xs">
              <li><Link href="/bantuan" className="text-white/70 hover:text-white transition-colors">FAQ</Link></li>
              <li><Link href="/kontak" className="text-white/70 hover:text-white transition-colors">Hubungi Kami</Link></li>
              <li><Link href="/kebijakan-pengembalian" className="text-white/70 hover:text-white transition-colors">Kebijakan Pengembalian</Link></li>
              <li><Link href="/syarat-ketentuan" className="text-white/70 hover:text-white transition-colors">Syarat &amp; Ketentuan</Link></li>
              <li><Link href="/kebijakan-privasi" className="text-white/70 hover:text-white transition-colors">Kebijakan Privasi</Link></li>
            </ul>
          </div>

          {/* Kontak + Newsletter */}
          <div>
            <h3 className="mb-4 text-sm font-bold text-white">Kontak</h3>
            <ul className="space-y-2.5 text-xs text-white/70">
              <li className="flex items-start gap-2">
                <Phone size={13} className="mt-0.5 shrink-0 text-white/50" />
                <div>
                  <p className="text-[10px] text-white/50">WhatsApp</p>
                  <a
                    href={waHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-white hover:underline transition-colors"
                  >
                    {rawWhatsapp}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Mail size={13} className="mt-0.5 shrink-0 text-white/50" />
                <div>
                  <p className="text-[10px] text-white/50">Email</p>
                  <a
                    href={`mailto:${emailVal}`}
                    className="font-medium text-white hover:underline transition-colors"
                  >
                    {emailVal}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Clock size={13} className="mt-0.5 shrink-0 text-white/50" />
                <div>
                  <p className="text-[10px] text-white/50">Jam Operasional</p>
                  <p className="font-medium text-white">{hoursVal}</p>
                </div>
              </li>
              {addressVal && (
                <li className="flex items-start gap-2">
                  <MapPin size={13} className="mt-0.5 shrink-0 text-white/50" />
                  <div>
                    <p className="text-[10px] text-white/50">Alamat</p>
                    <p className="font-medium text-white">{addressVal}</p>
                    <a
                      href="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d3965.8992208135946!2d106.7899634!3d-6.2769792!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f1be4b7191a5%3A0xd38f047b953c37d!2sJasmine%20Shop!5e0!3m2!1sen!2sid!4v1789597587346!5m2!1sen!2sid"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-white/80 hover:text-white transition-colors"
                    >
                      <ExternalLink size={10} />
                      Buka di Google Maps
                    </a>
                  </div>
                </li>
              )}
            </ul>

            {/* Newsletter */}
            <div className="mt-5 pt-5 border-t border-white/20">
              <h4 className="mb-2 text-xs font-bold text-white">Dapatkan Promo &amp; Info Terbaru</h4>
              <p className="mb-3 text-[10px] text-white/60">Daftarkan emailmu untuk mendapatkan promo menarik setiap minggunya</p>
              {subscribed ? (
                <p className="text-xs text-white">Terima kasih sudah berlangganan!</p>
              ) : (
                <form onSubmit={handleNewsletter} className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email kamu..."
                    required
                    aria-label="Alamat email newsletter"
                    className="newsletter-input h-9 flex-1 rounded-lg border border-white/30 bg-white/10 px-3 text-xs text-white placeholder:text-white/40 outline-none focus:border-white focus:bg-white/15"
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-white px-4 text-xs font-bold text-[var(--brand-700)] transition hover:bg-stone-100"
                  >
                    <Send size={12} />
                    Daftar
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </Container>

      {/* Bottom bar */}
      <div className="border-t border-white/15">
        <Container width="wide" className="py-4">
          <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-white/50">
            <p>&copy; {new Date().getFullYear()} Jasmine Shop Premium Product. All rights reserved.</p>
            <div className="flex gap-4">
              <Link href="/kebijakan-privasi" className="hover:text-white transition-colors">Kebijakan Privasi</Link>
              <Link href="/syarat-ketentuan" className="hover:text-white transition-colors">Syarat &amp; Ketentuan</Link>
            </div>
          </div>
        </Container>
      </div>
    </footer>
  );
}
