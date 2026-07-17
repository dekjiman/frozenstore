import Link from "next/link";
import { AccountNavigation } from "@/components/account-navigation";
import { CheckoutFlow } from "@/components/checkout-flow";

export default function CheckoutPage() {
  return (
    <main className="min-h-screen bg-stone-50 text-stone-950">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <Link href="/" className="font-serif text-2xl tracking-tight sm:text-[1.7rem]">
            Raf Store<span className="text-orange-600">.</span>
          </Link>
          <div className="flex items-center gap-3">
            <p className="hidden text-xs font-medium text-stone-500 sm:block">Checkout aman</p>
            <AccountNavigation compact />
          </div>
        </div>
      </header>
      <CheckoutFlow />
    </main>
  );
}
