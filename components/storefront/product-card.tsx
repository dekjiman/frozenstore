"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Heart } from "lucide-react";
import type { HomepageDTO } from "@/lib/queries/homepage";

type Product = HomepageDTO["bestSellers"][number];

function formatRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

function StarRating({ average, count }: { average: number; count: number }) {
  return (
    <div className="flex items-center gap-1 text-[11px] text-stone-500">
      <svg className="size-3 fill-[var(--accent-500)]" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
      <span className="font-medium text-stone-700">{average.toFixed(1)}</span>
      <span>({count})</span>
    </div>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const href = product.slug ? `/produk/${product.slug}` : `/produk/${product.id}`;
  const discount = product.compareAtPrice && product.compareAtPrice > product.price
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : null;

  return (
    <div className="product-card group flex flex-col overflow-hidden rounded-2xl border border-stone-200/80 bg-white">
      {/* Image */}
      <Link href={href} className="relative aspect-square w-full overflow-hidden bg-stone-50" aria-label={`Lihat ${product.name}`}>
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />

        {/* Badges */}
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-2">
          <div className="flex flex-col gap-1">
            <span className="inline-flex items-center gap-0.5 rounded-full bg-[var(--success)] px-1.5 py-0.5 text-[9px] font-bold text-white">
              <svg className="size-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              HALAL
            </span>
            {discount && (
              <span className="flash-badge rounded-full bg-[var(--brand-600)] px-1.5 py-0.5 text-[9px] font-bold text-white">
                -{discount}%
              </span>
            )}
          </div>

          <button
            className="grid size-7 place-items-center rounded-full bg-white/80 text-stone-300 backdrop-blur-sm transition hover:bg-white hover:text-[var(--brand-600)]"
            aria-label="Tambah ke wishlist"
          >
            <Heart size={13} />
          </button>
        </div>
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col p-3">
        <Link href={href}>
          <h3 className="line-clamp-2 text-[13px] font-semibold text-[var(--ink-950)] leading-snug hover:text-[var(--brand-600)] transition-colors">
            {product.name}
          </h3>
        </Link>

        <StarRating average={product.ratingAverage} count={product.ratingCount} />

        {product.soldCount > 0 && (
          <p className="mt-0.5 text-[11px] text-stone-400">Terjual {product.soldCount.toLocaleString("id-ID")}</p>
        )}

        {/* Price + Cart */}
        <div className="mt-auto pt-2.5">
          <div className="flex items-baseline gap-1.5 mb-2">
            <span className="text-sm font-bold text-[var(--brand-600)]">
              {formatRupiah(product.price)}
            </span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-[11px] text-stone-400 line-through">
                {formatRupiah(product.compareAtPrice)}
              </span>
            )}
          </div>

          <button className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-[var(--brand-600)] px-2.5 py-2 text-[11px] font-bold text-white transition hover:bg-[var(--brand-700)] active:bg-[var(--brand-800)]">
            <ShoppingCart size={12} />
            + Keranjang
          </button>
        </div>
      </div>
    </div>
  );
}
