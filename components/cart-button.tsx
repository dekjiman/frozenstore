"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/components/cart-provider";

export function CartButton() {
  const { itemCount } = useCart();

  return (
    <Link
      href="/keranjang"
      aria-label={`Lihat keranjang, ${itemCount} item`}
      className="relative flex flex-col items-center gap-0.5 rounded-lg px-2.5 py-1.5 text-stone-500 hover:text-[var(--brand-600)] transition-colors"
    >
      <div className="relative">
        <ShoppingBag aria-hidden="true" size={20} strokeWidth={1.5} />
        {itemCount > 0 ? (
          <span className="absolute -right-1.5 -top-1.5 grid min-w-[18px] place-items-center rounded-full bg-[var(--brand-600)] px-1 text-[9px] font-bold leading-[18px] text-white">
            {itemCount > 99 ? "99+" : itemCount}
          </span>
        ) : null}
      </div>
      <span className="text-[10px] font-medium leading-none">Keranjang</span>
    </Link>
  );
}
