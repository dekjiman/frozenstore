"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Boxes,
  CreditCard,
  Globe,
  Heart,
  Image,
  LayoutDashboard,
  MessageSquareQuote,
  PackageSearch,
  PenTool,
  Settings,
  ShoppingBag,
  Star,
  Store,
  UserCircle,
  X,
  Menu,
} from "lucide-react";
import { useAuth } from "@/components/auth-provider";

const NAV_GROUPS = [
  {
    label: "Operasional",
    items: [
      { href: "/admin", label: "Ringkasan", icon: LayoutDashboard },
      { href: "/admin/produk", label: "Produk", icon: Boxes },
      { href: "/admin/stok/masuk", label: "Stok Masuk", icon: PackageSearch },
      { href: "/admin/stok/riwayat", label: "Riwayat Stok", icon: PackageSearch },
      { href: "/admin/pesanan", label: "Pesanan", icon: ShoppingBag },
      { href: "/admin/pengaturan-pembayaran", label: "Pembayaran", icon: CreditCard },
    ],
  },
  {
    label: "Konten",
    items: [
      { href: "/admin/kategori", label: "Kategori", icon: Star },
      { href: "/admin/hero", label: "Hero Campaign", icon: Image },
      { href: "/admin/promo", label: "Promo Banner", icon: PenTool },
      { href: "/admin/testimonial", label: "Testimoni", icon: MessageSquareQuote },
      { href: "/admin/trust", label: "Kepercayaan", icon: Heart },
      { href: "/admin/artikel", label: "Artikel & Tips", icon: PenTool },
    ],
  },
  {
    label: "Pengaturan",
    items: [
      { href: "/admin/pengaturan", label: "Situs", icon: Settings },
      { href: "/admin/marketplace", label: "Marketplace", icon: Globe },
    ],
  },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && user?.role !== "admin") router.replace("/masuk");
  }, [isLoading, router, user]);

  if (isLoading || user?.role !== "admin") {
    return (
      <div className="grid min-h-screen place-items-center bg-[var(--cream-50)] text-sm text-[var(--ink-700)]">
        Memverifikasi akses admin...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--cream-50)] text-[var(--ink-950)] lg:grid lg:grid-cols-[250px_minmax(0,1fr)]">
      {/* Desktop sidebar */}
      <aside className="hidden min-h-screen border-r border-stone-800 bg-[var(--brand-900)] p-5 text-white lg:flex lg:flex-col">
        <Link href="/admin" className="flex items-center gap-3 px-2 py-3">
          <span className="grid size-10 place-items-center rounded-xl bg-[var(--brand-600)]">
            <Store size={19} />
          </span>
          <span>
            <span className="block font-serif text-xl">Jasmine.</span>
            <span className="block text-[11px] text-stone-400">Admin Dashboard</span>
          </span>
        </Link>

        <nav className="mt-8 flex-1 space-y-5" aria-label="Navigasi admin">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-stone-500">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-stone-300 transition hover:bg-white/10 hover:text-white"
                    >
                      <Icon size={18} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-white/10 pt-5">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-stone-400 hover:bg-white/10 hover:text-white"
          >
            <Store size={18} />
            Lihat toko
          </Link>
        </div>
      </aside>

      {/* Main area */}
      <div className="min-w-0">
        <header className="border-b border-[var(--border)] bg-white">
          <div className="flex h-16 items-center justify-between gap-4 px-5 sm:px-8 lg:px-10">
            {/* Mobile menu toggle */}
            <button
              className="lg:hidden grid size-9 place-items-center rounded-lg text-[var(--ink-700)] hover:bg-stone-100"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Tutup menu" : "Buka menu"}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <div className="hidden sm:block">
              <p className="text-xs text-[var(--ink-700)]">Dashboard operasional</p>
              <p className="text-sm font-semibold text-[var(--ink-950)]">Jasmine Admin</p>
            </div>

            <div className="flex items-center gap-3 ml-auto">
              <span className="hidden text-right sm:block">
                <span className="block text-sm font-semibold">{user.name}</span>
                <button
                  type="button"
                  onClick={async () => {
                    await logout();
                    router.push("/masuk");
                  }}
                  className="block text-xs text-[var(--ink-700)] hover:text-[var(--error)]"
                >
                  Keluar
                </button>
              </span>
              <UserCircle size={34} className="text-stone-500" />
            </div>
          </div>

          {/* Mobile nav */}
          {mobileOpen && (
            <nav className="lg:hidden border-t border-[var(--border)] bg-white px-4 py-3 space-y-3">
              {NAV_GROUPS.map((group) => (
                <div key={group.label}>
                  <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-widest text-stone-500">
                    {group.label}
                  </p>
                  {group.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block rounded-lg px-3 py-2 text-sm font-medium text-[var(--ink-700)] hover:bg-stone-50"
                      onClick={() => setMobileOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              ))}
            </nav>
          )}
        </header>

        <main className="px-5 py-8 sm:px-8 lg:px-10 lg:py-10">{children}</main>
      </div>
    </div>
  );
}
