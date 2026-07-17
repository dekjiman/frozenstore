"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarDays, LogOut, Mail, Package, Phone, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { apiFetch } from "@/lib/client-api";

type Profile = { id: string; name: string; email: string; phone: string | null; createdAt: string };
type Order = {
  id: string; orderNumber: string; createdAt: string; itemCount: number; productNames: string[];
  total: number; paymentStatusLabel: string; status: string; statusLabel: string;
};

const rupiahFormatter = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });
const dateFormatter = new Intl.DateTimeFormat("id-ID", { dateStyle: "long" });

export function AccountPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, logout, refreshSession } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.replace("/masuk"); return; }
    Promise.all([
      apiFetch<{ user: Profile }>("/api/account/profile", { cache: "no-store" }),
      apiFetch<{ orders: Order[] }>("/api/account/orders", { cache: "no-store" }),
    ]).then(([profilePayload, orderPayload]) => {
      setProfile(profilePayload.user);
      setForm({ name: profilePayload.user.name, email: profilePayload.user.email, phone: profilePayload.user.phone ?? "" });
      setOrders(orderPayload.orders);
      setError(null);
    }).catch((caught) => setError(caught instanceof Error ? caught.message : "Gagal memuat akun"))
      .finally(() => setIsLoading(false));
  }, [authLoading, user, router]);

  async function saveProfile(event: React.FormEvent) {
    event.preventDefault();
    try {
      const payload = await apiFetch<{ user: Profile }>("/api/account/profile", { method: "PATCH", body: JSON.stringify(form) });
      setProfile(payload.user);
      setEditing(false);
      await refreshSession();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Gagal menyimpan profil");
    }
  }

  async function handleLogout() {
    await logout();
    router.push("/masuk");
    router.refresh();
  }

  if (authLoading || isLoading) return <div className="mx-auto max-w-7xl px-5 py-16 text-sm text-stone-500">Memuat akun...</div>;
  if (!profile) return <div className="mx-auto max-w-7xl px-5 py-16"><p className="text-red-700">{error ?? "Akun tidak ditemukan"}</p></div>;
  const initials = profile.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14 lg:px-10 lg:py-16">
      <p className="text-sm font-semibold text-orange-700">Area pelanggan</p>
      <h1 className="mt-1 font-serif text-4xl tracking-tight sm:text-5xl">Akun saya</h1>
      {error ? <p role="alert" className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

      <div className="mt-9 grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-start lg:gap-12">
        <aside className="rounded-3xl border border-stone-200 bg-white p-6 lg:sticky lg:top-8">
          <div className="flex items-center gap-4"><span className="grid size-14 place-items-center rounded-full bg-orange-100 font-serif text-xl font-bold text-orange-800">{initials}</span><div className="min-w-0"><h2 className="truncate text-lg font-semibold">{profile.name}</h2><p className="text-xs text-stone-500">Pelanggan Raf Store</p></div></div>
          {editing ? (
            <form onSubmit={saveProfile} className="mt-6 space-y-3 border-t border-stone-200 pt-6">
              <input aria-label="Nama" value={form.name} onChange={(event) => setForm((value) => ({ ...value, name: event.target.value }))} className="h-11 w-full rounded-xl border border-stone-300 px-3 text-sm" />
              <input aria-label="Email" type="email" value={form.email} onChange={(event) => setForm((value) => ({ ...value, email: event.target.value }))} className="h-11 w-full rounded-xl border border-stone-300 px-3 text-sm" />
              <input aria-label="WhatsApp" value={form.phone} onChange={(event) => setForm((value) => ({ ...value, phone: event.target.value }))} className="h-11 w-full rounded-xl border border-stone-300 px-3 text-sm" />
              <div className="flex gap-2"><button type="button" onClick={() => setEditing(false)} className="flex-1 rounded-full border px-3 py-2 text-xs font-semibold">Batal</button><button className="flex-1 rounded-full bg-stone-900 px-3 py-2 text-xs font-semibold text-white">Simpan</button></div>
            </form>
          ) : (
            <dl className="mt-6 space-y-4 border-t border-stone-200 pt-6 text-sm">
              <div><dt className="flex items-center gap-2 text-xs text-stone-500"><Mail size={14} /> Email</dt><dd className="mt-1 break-all font-medium">{profile.email}</dd></div>
              <div><dt className="flex items-center gap-2 text-xs text-stone-500"><Phone size={14} /> WhatsApp</dt><dd className="mt-1 font-medium">{profile.phone ?? "—"}</dd></div>
              <div><dt className="flex items-center gap-2 text-xs text-stone-500"><CalendarDays size={14} /> Bergabung sejak</dt><dd className="mt-1 font-medium">{dateFormatter.format(new Date(profile.createdAt))}</dd></div>
            </dl>
          )}
          {!editing ? <button type="button" onClick={() => setEditing(true)} className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full border border-stone-300 px-5 py-2.5 text-sm font-semibold"><UserRound size={16} /> Edit profil</button> : null}
          <button type="button" onClick={() => void handleLogout()} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"><LogOut size={16} /> Keluar</button>
        </aside>

        <section aria-labelledby="orders-heading">
          <div className="flex items-end justify-between gap-4"><div><p className="text-sm text-stone-500">Pantau pesananmu</p><h2 id="orders-heading" className="mt-1 font-serif text-3xl">Riwayat pesanan</h2></div><p className="text-sm font-medium text-stone-600">{orders.length} pesanan</p></div>
          <div className="mt-6 space-y-4">
            {orders.map((order) => <article key={order.id} className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="font-mono text-sm font-bold">{order.orderNumber}</p><p className="mt-1 text-xs text-stone-500">Dipesan {dateFormatter.format(new Date(order.createdAt))}</p></div><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">{order.statusLabel}</span></div><div className="mt-5 grid gap-4 border-y border-stone-100 py-4 sm:grid-cols-[minmax(0,1fr)_140px_140px]"><div><p className="text-xs text-stone-500">Produk</p><p className="mt-1 truncate text-sm">{order.productNames.join(", ")}</p><p className="mt-1 text-xs text-stone-500">{order.itemCount} item</p></div><div><p className="text-xs text-stone-500">Pembayaran</p><p className="mt-1 text-sm font-medium">{order.paymentStatusLabel}</p></div><div className="sm:text-right"><p className="text-xs text-stone-500">Total</p><p className="mt-1 text-sm font-bold text-orange-700">{rupiahFormatter.format(order.total)}</p></div></div></article>)}
            {orders.length === 0 ? <p className="rounded-2xl border border-stone-200 bg-white py-12 text-center text-sm text-stone-500">Belum ada pesanan.</p> : null}
          </div>
          <Link href="/" className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-orange-700"><Package size={16} /> Belanja produk lainnya</Link>
        </section>
      </div>
    </div>
  );
}
