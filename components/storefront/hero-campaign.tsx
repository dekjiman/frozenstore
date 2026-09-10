"use client";

import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Snowflake, Truck, Star, ShoppingCart, Eye } from "lucide-react";
import type { HomepageDTO } from "@/lib/queries/homepage";

type HeroData = NonNullable<HomepageDTO["hero"]>;

const STATS = [
  { value: "4.9 / 5", label: "Rating", icon: <Star size={12} className="fill-[var(--accent-500)] text-[var(--accent-500)]" /> },
  { value: "2500+", label: "Pelanggan Puas" },
  { value: "10.000+", label: "Pesanan Terkirim" },
  { value: "500+", label: "Reseller Aktif" },
];

export function HeroCampaign({ hero }: { hero: HeroData }) {
  return (
    <section className="relative overflow-hidden hero-gradient">
      <Container width="wide" className="py-10 sm:py-14 lg:py-20">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
          {/* Text */}
          <div className="order-2 lg:order-1 lg:col-span-5">
            <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-[var(--brand-600)]/10 px-3 py-1 text-xs font-semibold text-[var(--brand-600)]">
              <span className="size-1.5 rounded-full bg-[var(--brand-600)]" />
              {hero.eyebrow}
            </div>

            <h1 className="heading-display font-serif text-[var(--ink-950)]">
              {hero.title}
              {hero.highlightedText && (
                <span className="text-[var(--brand-600)]"> {hero.highlightedText}</span>
              )}
            </h1>

            <p className="mt-4 max-w-md text-base text-[var(--ink-700)] sm:text-lg leading-relaxed">
              {hero.description}
            </p>

            {/* CTAs */}
            <div className="mt-7 flex flex-wrap gap-3">
              {hero.primaryCtaLabel && hero.primaryCtaUrl && (
                <Button asChild size="lg" className="rounded-full px-7 shadow-lg shadow-[var(--brand-600)]/20">
                  <Link href={hero.primaryCtaUrl} className="gap-2">
                    <ShoppingCart size={16} />
                    {hero.primaryCtaLabel}
                  </Link>
                </Button>
              )}
              {hero.secondaryCtaLabel && hero.secondaryCtaUrl && (
                <Button asChild variant="secondary" size="lg" className="rounded-full px-7">
                  <Link href={hero.secondaryCtaUrl} className="gap-2">
                    <Eye size={16} />
                    {hero.secondaryCtaLabel}
                  </Link>
                </Button>
              )}
            </div>

            {/* Trust badges */}
            <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-xs text-stone-500">
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={15} className="text-[var(--brand-600)]" />
                Halal &amp; Aman
              </span>
              <span className="flex items-center gap-1.5">
                <Snowflake size={15} className="text-blue-500" />
                Frozen Fresh
              </span>
              <span className="flex items-center gap-1.5">
                <Truck size={15} className="text-[var(--success)]" />
                Pengiriman Cepat
              </span>
            </div>
          </div>

          {/* Image + Stats */}
          <div className="order-1 lg:order-2 lg:col-span-7">
            <div className="relative">
              <div className="relative mx-auto aspect-[4/3] w-full max-w-2xl overflow-hidden rounded-3xl shadow-2xl shadow-black/8 lg:aspect-[16/10]">
                <Image
                  src={hero.imageUrl}
                  alt={hero.imageAlt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 58vw"
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-black/15 to-transparent" />
              </div>

              {/* Stats card */}
              <div className="absolute -bottom-5 right-3 sm:right-6 lg:-right-2 lg:bottom-8 hero-stats-card rounded-2xl p-4 shadow-xl">
                <div className="space-y-2.5">
                  {STATS.map((stat, i) => (
                    <div key={i} className="flex items-center gap-2">
                      {stat.icon && <span>{stat.icon}</span>}
                      <span className="text-sm font-bold text-[var(--ink-950)]">{stat.value}</span>
                      <span className="text-[11px] text-stone-500">{stat.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
