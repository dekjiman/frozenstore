"use client";

import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/container";
import { CategoryIcon } from "@/lib/category-icons";
import type { HomepageDTO } from "@/lib/queries/homepage";

type Category = HomepageDTO["categories"][number];

export function CategoryRail({ categories }: { categories: Category[] }) {
  if (categories.length === 0) return null;

  return (
    <section className="bg-[var(--cream-50)] py-6 sm:py-8">
      <Container width="wide">
        <div className="category-scroll -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 scrollbar-none sm:gap-4 lg:justify-center lg:gap-5">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/kategori/${cat.slug}`}
              className="category-item group flex min-w-[88px] snap-center flex-col items-center gap-3 rounded-2xl bg-white px-3 py-4 shadow-sm sm:min-w-[100px] sm:px-4 sm:py-5 hover:shadow-md"
            >
              <div className="relative size-20 shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-[var(--brand-50)] to-[var(--cream-100)] ring-1 ring-stone-200/60 transition-all group-hover:ring-[var(--brand-500)] group-hover:shadow-lg group-hover:shadow-[var(--brand-600)]/10 sm:size-24">
                {cat.iconKey ? (
                  <span className="grid size-full place-items-center text-[var(--brand-600)] transition-colors group-hover:text-[var(--brand-700)]">
                    <CategoryIcon iconKey={cat.iconKey} className="size-9 sm:size-11" />
                  </span>
                ) : cat.imageUrl ? (
                  <Image
                    src={cat.imageUrl}
                    alt={cat.name}
                    width={96}
                    height={96}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="grid size-full place-items-center text-3xl font-semibold text-[var(--brand-600)] sm:text-4xl">
                    {cat.name.charAt(0)}
                  </span>
                )}
              </div>
              <span className="w-full text-center text-[11px] font-semibold leading-tight text-stone-600 group-hover:text-[var(--brand-600)] transition-colors sm:text-xs">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
