"use client";

import Link from "next/link";
import { LogIn, UserPlus, UserRound } from "lucide-react";
import { useAuth } from "@/components/auth-provider";

type AccountNavigationProps = {
  compact?: boolean;
};

export function AccountNavigation({ compact = false }: AccountNavigationProps) {
  const { user } = useAuth();

  if (user) {
    const accountHref = user.role === "admin" ? "/admin" : "/akun";
    return (
      <Link
        href={accountHref}
        aria-label={`Buka akun ${user.name}`}
        className="inline-flex h-10 items-center gap-2 rounded-full border border-stone-300 bg-white px-3 text-sm font-semibold text-stone-700 transition hover:border-[var(--brand-500)] hover:text-[var(--brand-600)]"
      >
        <UserRound aria-hidden="true" size={17} />
        {compact ? null : <span className="hidden md:inline">{user.role === "admin" ? "Dashboard" : "Akun saya"}</span>}
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/masuk"
        className="inline-flex h-10 items-center gap-2 rounded-full px-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-200/70 hover:text-[var(--brand-600)]"
      >
        <LogIn aria-hidden="true" size={17} />
        {compact ? null : <span className="hidden sm:inline">Masuk</span>}
      </Link>
      <Link
        href="/daftar"
        className="hidden h-10 items-center gap-2 rounded-full bg-stone-900 px-4 text-sm font-semibold text-white transition hover:bg-[var(--brand-700)] sm:inline-flex"
      >
        <UserPlus aria-hidden="true" size={16} /> Daftar
      </Link>
    </div>
  );
}
