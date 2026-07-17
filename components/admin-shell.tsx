"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  Boxes,
  CreditCard,
  LayoutDashboard,
  PackageSearch,
  ShoppingBag,
  Store,
  UserCircle,
} from "lucide-react";
import { useAuth } from "@/components/auth-provider";

const navigation = [
  { href: "/admin", label: "Ringkasan", icon: LayoutDashboard },
  { href: "/admin/produk", label: "Produk & Stok", icon: Boxes },
  { href: "/admin/stok/riwayat", label: "Riwayat Stok", icon: PackageSearch },
  { href: "/admin/pesanan", label: "Pesanan", icon: ShoppingBag },
  { href: "/admin/pengaturan-pembayaran", label: "Pembayaran", icon: CreditCard },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();

  useEffect(() => {
    if (!isLoading && user?.role !== "admin") router.replace("/masuk");
  }, [isLoading, router, user]);

  if (isLoading || user?.role !== "admin") {
    return <div className="grid min-h-screen place-items-center bg-stone-100 text-sm text-stone-500">Memverifikasi akses admin...</div>;
  }

  return (
    <div className="min-h-screen bg-stone-100 text-stone-950 lg:grid lg:grid-cols-[250px_minmax(0,1fr)]">
      <aside className="hidden min-h-screen border-r border-stone-800 bg-stone-950 p-5 text-white lg:flex lg:flex-col">
        <Link href="/admin" className="flex items-center gap-3 px-2 py-3">
          <span className="grid size-10 place-items-center rounded-xl bg-orange-600"><Store size={19} /></span>
          <span><span className="block font-serif text-xl">Raf Store.</span><span className="block text-[11px] text-stone-400">Admin Dashboard</span></span>
        </Link>
        <nav className="mt-8 space-y-1" aria-label="Navigasi admin">
          {navigation.map((item) => {
            const Icon = item.icon;
            return <Link key={item.href} href={item.href} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-stone-300 transition hover:bg-white/10 hover:text-white"><Icon size={18} />{item.label}</Link>;
          })}
        </nav>
        <div className="mt-auto border-t border-white/10 pt-5">
          <Link href="/" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-stone-400 hover:bg-white/10 hover:text-white"><PackageSearch size={18} />Lihat toko</Link>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="border-b border-stone-200 bg-white">
          <div className="flex h-18 items-center justify-between gap-4 px-5 sm:px-8 lg:px-10">
            <div><p className="text-xs text-stone-500">Dashboard operasional</p><p className="text-sm font-semibold text-stone-900">Raf Store Admin</p></div>
            <div className="flex items-center gap-3"><span className="hidden text-right sm:block"><span className="block text-sm font-semibold">{user.name}</span><button type="button" onClick={async () => { await logout(); router.push("/masuk"); }} className="block text-xs text-stone-500 hover:text-red-600">Keluar</button></span><UserCircle size={34} className="text-stone-500" /></div>
          </div>
          <nav className="flex gap-2 overflow-x-auto border-t border-stone-100 px-5 py-2 lg:hidden" aria-label="Navigasi admin mobile">
            {navigation.map((item) => <Link key={item.href} href={item.href} className="shrink-0 rounded-full bg-stone-100 px-4 py-2 text-xs font-semibold text-stone-700">{item.label}</Link>)}
          </nav>
        </header>
        <main className="px-5 py-8 sm:px-8 lg:px-10 lg:py-10">{children}</main>
      </div>
    </div>
  );
}
