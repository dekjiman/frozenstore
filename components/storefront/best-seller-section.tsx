"use client";

import Link from "next/link";
import { Container } from "@/components/ui/container";
import { ProductCard } from "@/components/storefront/product-card";
import { Flame } from "lucide-react";
import type { HomepageDTO } from "@/lib/queries/homepage";

type Product = HomepageDTO["bestSellers"][number];

export function BestSellerSection({ products }: { products: Product[] }) {
  if (products.length === 0) return null;

  return (
    <section className="bg-white py-8 sm:py-10">
      <Container width="wide">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3 sm:mb-6">
          <div>
            <div className="mb-0.5 flex items-center gap-1.5">
              <Flame size={16} className="text-[var(--brand-600)]" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--brand-600)]">
                Best Seller
              </span>
            </div>
            <h2 className="heading-section font-serif text-[var(--ink-950)]">Produk Terlaris</h2>
            <p className="mt-0.5 text-sm text-stone-500">Produk Terlaris Pilihan Pelanggan</p>
          </div>
          <Link
            href="/produk?bestSeller=true"
            className="inline-flex items-center gap-1 rounded-full border border-[var(--brand-600)] px-4 py-1.5 text-xs font-semibold text-[var(--brand-600)] transition hover:bg-[var(--brand-600)] hover:text-white"
          >
            Lihat Semua &rarr;
          </Link>
        </div>

        {/* Use max-w to constrain width so products don't spread too far */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </Container>
    </section>
  );
}
