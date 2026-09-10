"use client";

import { Container } from "@/components/ui/container";
import { ShieldCheck, Snowflake, BadgeCheck, Package, Truck } from "lucide-react";
import type { HomepageDTO } from "@/lib/queries/homepage";

type TrustItem = HomepageDTO["trustItems"][number];

const ICON_MAP: Record<string, React.ReactNode> = {
  shield: <ShieldCheck size={20} strokeWidth={1.5} />,
  truck: <Truck size={20} strokeWidth={1.5} />,
  badge: <BadgeCheck size={20} strokeWidth={1.5} />,
  support: <Snowflake size={20} strokeWidth={1.5} />,
  quality: <ShieldCheck size={20} strokeWidth={1.5} />,
  coldchain: <Snowflake size={20} strokeWidth={1.5} />,
  halal: <BadgeCheck size={20} strokeWidth={1.5} />,
  packaging: <Package size={20} strokeWidth={1.5} />,
  shipping: <Truck size={20} strokeWidth={1.5} />,
};

const DEFAULT_ITEMS = [
  { id: "1", iconKey: "quality", title: "Kualitas Premium", description: "Bahan pilihan terbaik" },
  { id: "2", iconKey: "coldchain", title: "Rantai Dingin Terjaga", description: "Kesegaran sampai tujuan" },
  { id: "3", iconKey: "halal", title: "Halal & BPOM", description: "Aman & terpercaya" },
  { id: "4", iconKey: "packaging", title: "Kemasan Food Grade", description: "Higienis & berkualitas" },
  { id: "5", iconKey: "shipping", title: "Pengiriman Cepat", description: "Seluruh Indonesia" },
];

export function TrustStrip({ items }: { items: TrustItem[] }) {
  const displayItems = items.length > 0 ? items : DEFAULT_ITEMS;

  return (
    <section className="bg-stone-50/80 py-5 sm:py-6 border-y border-stone-100">
      <Container width="wide">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 sm:gap-x-10 lg:gap-x-14">
          {displayItems.map((item) => (
            <div key={item.id} className="trust-item flex items-center gap-2.5">
              <div className="grid size-9 place-items-center rounded-lg bg-[var(--brand-50)] text-[var(--brand-600)]">
                {ICON_MAP[item.iconKey] ?? <ShieldCheck size={20} strokeWidth={1.5} />}
              </div>
              <div>
                <h3 className="text-xs font-bold text-[var(--ink-950)]">{item.title}</h3>
                <p className="text-[11px] text-stone-500">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
