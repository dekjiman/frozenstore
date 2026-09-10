import Link from "next/link";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[var(--cream-100)] px-5 py-8 text-[var(--ink-950)] sm:py-12">
      <div className="mx-auto max-w-lg">
        <Link href="/" className="inline-block font-serif text-2xl tracking-tight">Jasmine Frozen Food<span className="text-[var(--brand-600)]">.</span></Link>
        <div className="mt-8"><LoginForm /></div>
      </div>
    </main>
  );
}
