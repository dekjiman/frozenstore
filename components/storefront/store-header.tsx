"use client";

import Link from "next/link";
import { useState } from "react";
import { Search, User, Menu, X, Tag, HelpCircle } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { CartButton } from "@/components/cart-button";
import { Container } from "@/components/ui/container";

const NAV_LINKS = [
  { href: "/", label: "Beranda" },
  { href: "/produk", label: "Produk" },
  { href: "/produk?promo=true", label: "Promo" },
  { href: "/artikel", label: "Artikel & Tips" },
  { href: "/produk?reseller=true", label: "Reseller" },
  { href: "/tentang-kami", label: "Tentang Kami" },
  { href: "/kontak", label: "Kontak" },
];

export function StoreHeader() {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) window.location.href = `/produk?q=${encodeURIComponent(q)}`;
  }

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      {/* ── Top Utility Bar ── */}
      <div className="border-b border-stone-100 bg-[var(--cream-50)]">
        <Container width="wide">
          <div className="flex h-8 items-center justify-between text-xs text-stone-500">
            <span className="hidden sm:inline">Frozen Food Premium #1 di Indonesia</span>
            <div className="flex items-center gap-5 sm:ml-auto">
              <Link href="/produk?promo=true" className="flex items-center gap-1.5 hover:text-[var(--brand-600)] transition-colors">
                <Tag size={13} />
                <span className="hidden sm:inline">Promo</span>
              </Link>
              <Link href="/bantuan" className="flex items-center gap-1.5 hover:text-[var(--brand-600)] transition-colors">
                <HelpCircle size={13} />
                <span className="hidden sm:inline">Bantuan</span>
              </Link>
            </div>
          </div>
        </Container>
      </div>

      {/* ── Main Header Row ── */}
      <Container width="wide">
        <div className="flex h-[60px] items-center gap-3">
          {/* Mobile menu toggle */}
          <button
            className="lg:hidden grid size-9 place-items-center rounded-lg text-stone-600 hover:bg-stone-100"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Tutup menu" : "Buka menu"}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Logo */}
          <Link href="/" className="group flex items-center shrink-0 transition-opacity hover:opacity-90" aria-label="Jasmine Shop Premium Product">
            <img src="/images/logo/logo_jusmine-mark.png" alt="Jasmine Shop Premium Product" className="h-11 w-auto object-contain md:h-12" />
          </Link>


          {/* Search — center, flexible */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl mx-auto">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari produk favoritmu..."
                aria-label="Cari produk"
                className="h-11 w-full rounded-full border border-stone-200 bg-stone-50 pl-4 pr-11 text-sm text-[var(--ink-950)] placeholder:text-stone-400 outline-none focus:border-[var(--brand-600)] focus:bg-white focus:ring-2 focus:ring-[var(--brand-600)]/10 transition-all"
              />
              <button
                type="submit"
                className="absolute right-1 top-1/2 -translate-y-1/2 grid size-9 place-items-center rounded-full bg-[var(--brand-600)] text-white transition hover:bg-[var(--brand-700)]"
                aria-label="Cari"
              >
                <Search size={16} />
              </button>
            </div>
          </form>

          {/* Right actions — Promo, Bantuan, Akun, Keranjang */}
          <div className="flex items-center gap-1 ml-auto">
            <Link
              href="/produk?promo=true"
              className="hidden lg:flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-stone-500 hover:text-[var(--brand-600)] transition-colors"
            >
              <Tag size={20} strokeWidth={1.5} />
              <span className="text-[10px] font-medium leading-none">Promo</span>
            </Link>
            <Link
              href="/bantuan"
              className="hidden lg:flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-stone-500 hover:text-[var(--brand-600)] transition-colors"
            >
              <HelpCircle size={20} strokeWidth={1.5} />
              <span className="text-[10px] font-medium leading-none">Bantuan</span>
            </Link>
            <Link
              href={user ? "/akun" : "/masuk"}
              className="hidden sm:flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-stone-500 hover:text-[var(--brand-600)] transition-colors"
            >
              {user ? (
                user.image ? <img src={user.image} alt={`Foto ${user.name}`} className="size-7 rounded-full object-cover" /> : <div className="grid size-7 place-items-center rounded-full bg-[var(--brand-600)] text-xs font-bold text-white">{user.name.charAt(0).toUpperCase()}</div>
              ) : (
                <User size={20} strokeWidth={1.5} />
              )}
              <span className="text-[10px] font-medium leading-none">{user ? "Akun Saya" : "Akun"}</span>
            </Link>
            <CartButton />
          </div>
        </div>

        {/* Mobile search */}
        <form onSubmit={handleSearch} className="md:hidden pb-3">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari produk favoritmu..."
              aria-label="Cari produk"
              className="h-10 w-full rounded-full border border-stone-200 bg-stone-50 pl-4 pr-10 text-sm text-[var(--ink-950)] placeholder:text-stone-400 outline-none focus:border-[var(--brand-600)] focus:bg-white"
            />
            <button
              type="submit"
              className="absolute right-1 top-1/2 -translate-y-1/2 grid size-8 place-items-center rounded-full bg-[var(--brand-600)] text-white"
              aria-label="Cari"
            >
              <Search size={14} />
            </button>
          </div>
        </form>
      </Container>

      {/* ── Nav Bar (desktop) ── */}
      <nav className="hidden lg:block border-t border-stone-100 bg-white">
        <Container width="wide">
          <div className="flex h-11 items-center gap-1 overflow-x-auto scrollbar-none">
            {NAV_LINKS.map((link, idx) => (
              <Link
                key={link.href}
                href={link.href}
                className={`whitespace-nowrap rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors ${
                  idx === 0
                    ? "text-[var(--brand-600)] border-b-2 border-[var(--brand-600)] rounded-none"
                    : "text-stone-600 hover:bg-[var(--brand-50)] hover:text-[var(--brand-600)]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </Container>
      </nav>

      {/* ── Mobile Nav Drawer ── */}
      {mobileOpen && (
        <nav className="lg:hidden border-t border-stone-100 bg-white px-4 py-2 space-y-0.5 shadow-lg">
          {NAV_LINKS.map((link, idx) => (
            <Link
              key={link.href}
              href={link.href}
              className={`block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                idx === 0
                  ? "text-[var(--brand-600)] bg-[var(--brand-50)]"
                  : "text-stone-600 hover:bg-[var(--brand-50)] hover:text-[var(--brand-600)]"
              }`}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="border-t border-stone-100 pt-1.5 mt-1.5">
            <Link
              href={user ? "/akun" : "/masuk"}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-stone-600 hover:bg-[var(--brand-50)]"
              onClick={() => setMobileOpen(false)}
            >
              {user?.image ? <img src={user.image} alt={`Foto ${user.name}`} className="size-7 rounded-full object-cover" /> : <User size={16} />}
              {user ? "Akun Saya" : "Masuk / Daftar"}
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
