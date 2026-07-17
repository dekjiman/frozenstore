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
      className="relative grid size-10 place-items-center rounded-full border border-stone-300 bg-white text-stone-800 transition hover:border-stone-400"
    >
      <ShoppingBag aria-hidden="true" size={18} strokeWidth={1.8} />
      {itemCount > 0 ? (
        <span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-orange-600 px-1 text-[10px] font-bold leading-5 text-white">
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      ) : null}
    </Link>
  );
}
