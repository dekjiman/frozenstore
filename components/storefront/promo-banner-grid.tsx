"use client";

import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/container";
import { Zap, Package, Truck } from "lucide-react";
import type { HomepageDTO } from "@/lib/queries/homepage";

type Promo = HomepageDTO["promoBanners"][number];

const PROMO_STYLES: Record<number, { bg: string; icon: React.ReactNode; light: boolean }> = {
  0: { bg: "promo-flash-sale", icon: <Zap size={16} className="text-yellow-300" />, light: false },
  1: { bg: "promo-paket-hemat", icon: <Package size={16} className="text-white" />, light: false },
  2: { bg: "promo-gratis-ongkir", icon: <Truck size={16} className="text-[var(--brand-600)]" />, light: true },
};

export function PromoBannerGrid({ promos }: { promos: Promo[] }) {
  if (promos.length === 0) return null;

  return (
    <section className="bg-[var(--cream-50)] py-5 sm:py-6">
      <Container width="wide">
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {promos.map((promo, idx) => {
            const style = PROMO_STYLES[idx] ?? PROMO_STYLES[0];
            const textColor = style.light ? "text-[var(--ink-950)]" : "text-white";
            const subColor = style.light ? "text-stone-500" : "text-white/75";

            return (
              <Link
                key={promo.id}
                href={promo.ctaUrl ?? "#"}
                className={`group relative overflow-hidden rounded-2xl ${style.bg} p-4 sm:p-5 transition hover:shadow-lg duration-200`}
              >
                {/* Decorative circles */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <div className="absolute -right-6 -top-6 size-32 rounded-full bg-white/[0.07]" />
                  <div className="absolute -bottom-3 -left-3 size-20 rounded-full bg-white/[0.05]" />
                </div>

                <div className="relative z-10 flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    {promo.badgeText && (
                      <span className={`inline-flex items-center gap-1 rounded-full ${style.light ? "bg-[var(--brand-600)]/10 text-[var(--brand-600)]" : "bg-white/15 text-white"} px-2 py-0.5 text-[10px] font-bold mb-2.5`}>
                        {style.icon}
                        {promo.badgeText}
                      </span>
                    )}

                    <h3 className={`font-serif text-base font-bold ${textColor} sm:text-lg leading-tight`}>
                      {promo.title}
                    </h3>
                    <p className={`mt-1 text-xs ${subColor} leading-relaxed`}>
                      {promo.subtitle}
                    </p>

                    {promo.ctaLabel && (
                      <span className={`mt-2.5 inline-flex items-center gap-1 text-[11px] font-semibold ${style.light ? "text-[var(--brand-600)]" : "text-white/85"} group-hover:underline`}>
                        {promo.ctaLabel}
                        <span className="transition-transform group-hover:translate-x-0.5">&rarr;</span>
                      </span>
                    )}
                  </div>

                  {promo.imageUrl && (
                    <div className="relative size-16 shrink-0 overflow-hidden rounded-xl sm:size-20">
                      <Image
                        src={promo.imageUrl}
                        alt={promo.title}
                        fill
                        sizes="80px"
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
