"use client";

import Link from "next/link";
import { CheckCircle2, Eye, EyeOff, UserPlus } from "lucide-react";
import { useState } from "react";
import { ApiError, apiFetch } from "@/lib/client-api";

type RegisterData = {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  acceptedTerms: boolean;
};

type RegisterErrors = Partial<Record<keyof RegisterData, string>>;

const inputClass = "mt-2 h-12 w-full rounded-xl border border-[var(--border)] bg-white px-4 text-sm outline-none transition placeholder:text-[var(--ink-700)] focus:border-[var(--brand-600)] focus:ring-4 focus:ring-[var(--brand-600)]/10";

export function RegisterForm() {
  const [data, setData] = useState<RegisterData>({ name: "", email: "", phone: "", password: "", confirmPassword: "", acceptedTerms: false });
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const passwordScore = [
    data.password.length >= 8,
    /[A-Z]/.test(data.password),
    /\d/.test(data.password),
    /[^A-Za-z0-9]/.test(data.password),
  ].filter(Boolean).length;

  function update<K extends keyof RegisterData>(field: K, value: RegisterData[K]) {
    setData((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: RegisterErrors = {};
    if (data.name.trim().length < 3) nextErrors.name = "Nama lengkap minimal 3 karakter";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) nextErrors.email = "Masukkan alamat email yang valid";
    if (!/^(?:\+62|62|0)8\d{8,12}$/.test(data.phone.replace(/[\s-]/g, ""))) nextErrors.phone = "Masukkan nomor WhatsApp Indonesia yang valid";
    if (passwordScore < 3) nextErrors.password = "Gunakan minimal 8 karakter, huruf besar, angka, dan simbol";
    if (data.confirmPassword !== data.password) nextErrors.confirmPassword = "Konfirmasi password tidak sama";
    if (!data.acceptedTerms) nextErrors.acceptedTerms = "Kamu perlu menyetujui syarat penggunaan";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await apiFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ name: data.name, email: data.email, phone: data.phone, password: data.password }),
      });
      setSubmitted(true);
    } catch (caught) {
      if (caught instanceof ApiError && caught.fields) setErrors(caught.fields as RegisterErrors);
      setSubmitError(caught instanceof Error ? caught.message : "Gagal membuat akun");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div role="status" className="rounded-3xl border border-emerald-200 bg-white p-8 text-center shadow-[0_24px_70px_-45px_rgba(28,25,23,0.45)]">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-emerald-600 text-white"><CheckCircle2 size={25} /></span>
        <h1 className="mt-5 font-serif text-3xl text-[var(--ink-950)]">Akun berhasil dibuat</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--ink-700)]">Selamat datang, {data.name}. Akunmu sudah tersimpan dan siap digunakan.</p>
        <Link href="/masuk" className="mt-6 inline-flex rounded-full bg-[var(--brand-600)] px-6 py-3 text-sm font-semibold text-white hover:bg-[var(--brand-900)]">Lanjut masuk</Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="rounded-3xl border border-[var(--border)] bg-white p-6 shadow-[0_24px_70px_-45px_rgba(28,25,23,0.45)] sm:p-8">
      <span className="grid size-11 place-items-center rounded-full bg-[var(--brand-50)] text-[var(--brand-600)]"><UserPlus size={19} /></span>
      <h1 className="mt-5 font-serif text-3xl text-[var(--ink-950)]">Buat akun pelanggan</h1>
      <p className="mt-2 text-sm leading-6 text-[var(--ink-700)]">Daftar untuk checkout dan memantau semua pesanan Jasmine Shop Premium Product.</p>

      {submitError ? <p role="alert" className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{submitError}</p> : null}
      <div className="mt-7 space-y-5">
        <Field label="Nama lengkap" name="name" error={errors.name}>
          <input id="name" value={data.name} onChange={(event) => update("name", event.target.value)} autoComplete="name" placeholder="Nama sesuai penerima" className={inputClass} aria-invalid={Boolean(errors.name)} />
        </Field>
        <Field label="Email" name="email" error={errors.email}>
          <input id="email" type="email" value={data.email} onChange={(event) => update("email", event.target.value)} autoComplete="email" placeholder="nama@email.com" className={inputClass} aria-invalid={Boolean(errors.email)} />
        </Field>
        <Field label="Nomor WhatsApp" name="phone" error={errors.phone}>
          <input id="phone" type="tel" value={data.phone} onChange={(event) => update("phone", event.target.value)} autoComplete="tel" placeholder="081234567890" className={inputClass} aria-invalid={Boolean(errors.phone)} />
        </Field>
        <Field label="Password" name="password" error={errors.password}>
          <div className="relative">
            <input id="password" type={showPassword ? "text" : "password"} value={data.password} onChange={(event) => update("password", event.target.value)} autoComplete="new-password" placeholder="Minimal 8 karakter" className={`${inputClass} pr-12`} aria-invalid={Boolean(errors.password)} />
            <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"} className="absolute right-2 top-4 grid size-9 place-items-center rounded-full text-[var(--ink-700)] hover:bg-[var(--cream-100)]">{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button>
          </div>
          <div className="mt-2 grid grid-cols-4 gap-1.5" aria-label={`Kekuatan password ${passwordScore} dari 4`}>
            {[1, 2, 3, 4].map((score) => <span key={score} className={`h-1.5 rounded-full ${score <= passwordScore ? (passwordScore >= 3 ? "bg-emerald-500" : "bg-amber-500") : "bg-[var(--border)]"}`} />)}
          </div>
        </Field>
        <Field label="Konfirmasi password" name="confirmPassword" error={errors.confirmPassword}>
          <input id="confirmPassword" type={showPassword ? "text" : "password"} value={data.confirmPassword} onChange={(event) => update("confirmPassword", event.target.value)} autoComplete="new-password" placeholder="Ulangi password" className={inputClass} aria-invalid={Boolean(errors.confirmPassword)} />
        </Field>

        <div>
          <label className="flex cursor-pointer items-start gap-3 text-sm leading-6 text-[var(--ink-700)]">
            <input type="checkbox" checked={data.acceptedTerms} onChange={(event) => update("acceptedTerms", event.target.checked)} className="mt-1 size-4 accent-[var(--brand-600)]" />
            <span>Saya menyetujui syarat penggunaan dan kebijakan privasi Jasmine Shop Premium Product.</span>
          </label>
          {errors.acceptedTerms ? <p className="mt-1.5 text-xs font-medium text-red-600">{errors.acceptedTerms}</p> : null}
        </div>
      </div>

      <button type="submit" disabled={isSubmitting} className="mt-7 w-full rounded-full bg-[var(--brand-600)] px-6 py-3.5 text-sm font-semibold text-white hover:bg-[var(--brand-900)] disabled:bg-[var(--border)]">{isSubmitting ? "Menyimpan..." : "Daftar akun"}</button>
      <p className="mt-5 text-center text-sm text-[var(--ink-700)]">Sudah punya akun? <Link href="/masuk" className="font-semibold text-[var(--brand-600)] hover:text-[var(--brand-700)]">Masuk</Link></p>
    </form>
  );
}

function Field({ label, name, error, children }: { label: string; name: string; error?: string; children: React.ReactNode }) {
  return <div><label htmlFor={name} className="text-sm font-semibold text-[var(--ink-950)]">{label}</label>{children}{error ? <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p> : null}</div>;
}
