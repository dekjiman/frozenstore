"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/components/auth-provider";

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    if (!email.trim() || !password) {
      setError("Email dan password wajib diisi");
      setIsSubmitting(false);
      return;
    }

    const valid = await login(email, password);
    if (!valid) {
      setError("Email atau password tidak sesuai");
      setIsSubmitting(false);
      return;
    }

    const session = await fetch("/api/auth/session", { cache: "no-store" }).then((response) => response.json()) as { user?: { role?: string } };
    router.push(session.user?.role === "admin" ? "/admin" : "/akun");
    router.refresh();
  }

  return (
    <form onSubmit={submit} noValidate className="rounded-3xl border border-[var(--border)] bg-white p-6 shadow-[0_24px_70px_-45px_rgba(28,25,23,0.45)] sm:p-8">
      <span className="grid size-11 place-items-center rounded-full bg-[var(--brand-50)] text-[var(--brand-600)]"><LogIn size={19} /></span>
      <h1 className="mt-5 font-serif text-3xl text-[var(--ink-950)]">Masuk ke Jasmine Shop Premium Product</h1>
      <p className="mt-2 text-sm leading-6 text-[var(--ink-700)]">Akses riwayat pesanan dan lanjutkan checkout dengan akun pelangganmu.</p>

      <div className="mt-7 rounded-xl bg-[var(--cream-100)] p-4 text-xs leading-5 text-[var(--ink-700)]">
        <p className="font-semibold text-[var(--ink-950)]">Akun demo</p>
        <p className="mt-2">Admin: admin@jasminefrozenfood.id / Admin#Jasmine2026</p>
      </div>

      {error ? <p role="alert" className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p> : null}

      <div className="mt-6 space-y-5">
        <div>
          <label htmlFor="login-email" className="text-sm font-semibold text-[var(--ink-950)]">Email</label>
          <input id="login-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" placeholder="nama@email.com" className="mt-2 h-12 w-full rounded-xl border border-[var(--border)] px-4 text-sm outline-none focus:border-[var(--brand-600)] focus:ring-4 focus:ring-[var(--brand-600)]/10" />
        </div>
        <div>
          <div className="flex items-center justify-between gap-3">
            <label htmlFor="login-password" className="text-sm font-semibold text-[var(--ink-950)]">Password</label>
            <button type="button" className="text-xs font-semibold text-[var(--brand-600)]">Lupa password?</button>
          </div>
          <div className="relative">
            <input id="login-password" type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" placeholder="Masukkan password" className="mt-2 h-12 w-full rounded-xl border border-[var(--border)] px-4 pr-12 text-sm outline-none focus:border-[var(--brand-600)] focus:ring-4 focus:ring-[var(--brand-600)]/10" />
            <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"} className="absolute right-2 top-3.5 grid size-9 place-items-center rounded-full text-[var(--ink-700)] hover:bg-[var(--cream-100)]">{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button>
          </div>
        </div>
      </div>

      <button type="submit" disabled={isSubmitting} className="mt-7 w-full rounded-full bg-[var(--brand-600)] px-6 py-3.5 text-sm font-semibold text-white hover:bg-[var(--brand-900)] disabled:bg-[var(--border)]">{isSubmitting ? "Memproses..." : "Masuk"}</button>
      <p className="mt-5 text-center text-sm text-[var(--ink-700)]">Belum punya akun? <Link href="/daftar" className="font-semibold text-[var(--brand-600)] hover:text-[var(--brand-700)]">Daftar sekarang</Link></p>
    </form>
  );
}
