import Link from "next/link";
import { LoginForm } from "@/components/login-form";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ admin?: string }> }) {
  const { admin } = await searchParams;
  const forAdmin = admin === "1";

  return (
    <main className="min-h-screen bg-[var(--cream-100)] px-5 py-8 text-[var(--ink-950)] sm:py-12">
      <div className="mx-auto max-w-lg">
        <Link href="/" className="inline-block font-serif text-2xl tracking-tight">Jasmine Shop Premium Product<span className="text-[var(--brand-600)]">.</span></Link>
        <div className="mt-8"><LoginForm forAdmin={forAdmin} /></div>
      </div>
    </main>
  );
}
