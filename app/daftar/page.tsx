import Link from "next/link";
import { RegisterForm } from "@/components/register-form";

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-[#f1eee7] px-5 py-8 text-stone-950 sm:py-12">
      <div className="mx-auto max-w-lg">
        <Link href="/" className="inline-block font-serif text-2xl tracking-tight">Raf Store<span className="text-orange-600">.</span></Link>
        <div className="mt-8"><RegisterForm /></div>
      </div>
    </main>
  );
}
