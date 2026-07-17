import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CartContent } from "@/components/cart-content";

export default function CartPage() {
  return (
    <main className="min-h-screen bg-stone-50 text-stone-950">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <Link href="/" className="font-serif text-2xl tracking-tight sm:text-[1.7rem]">
            Raf Store<span className="text-orange-600">.</span>
          </Link>
          <Link
            href="/#products"
            className="inline-flex items-center gap-2 text-sm font-medium text-stone-600 transition hover:text-orange-700"
          >
            <ArrowLeft aria-hidden="true" size={17} />
            Lanjut belanja
          </Link>
        </div>
      </header>

      <CartContent />
    </main>
  );
}
