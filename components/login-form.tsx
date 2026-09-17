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

      <Link
        href="/api/auth/google"
        className="mt-7 flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-[var(--border)] bg-white text-sm font-semibold text-[var(--ink-950)] transition-colors hover:border-[var(--brand-500)] hover:bg-[var(--cream-50)]"
      >
        <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.08 5.08 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z" />
          <path fill="#FBBC05" d="M5.84 14.1a7.06 7.06 0 0 1 0-4.2V7.06H2.18a11.35 11.35 0 0 0 0 9.88l3.66-2.84Z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52Z" />
        </svg>
        Lanjutkan dengan Google
      </Link>

      <div className="mt-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-[var(--border)]" />
        <span className="text-xs font-medium text-[var(--ink-700)]">atau masuk dengan email</span>
        <span className="h-px flex-1 bg-[var(--border)]" />
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
