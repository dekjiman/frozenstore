"use client";

import { MessageCircle, ExternalLink } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { TestimonialPanel } from "@/components/storefront/testimonial-panel";
import { toWaLink } from "@/lib/wa";
import type { HomepageDTO } from "@/lib/queries/homepage";

type MarketplaceLink = HomepageDTO["marketplaceLinks"][number];
type SiteSettings = NonNullable<HomepageDTO["siteSettings"]>;
type Testimonial = HomepageDTO["testimonials"][number];

export function MarketplacePanel({
  marketplaceLinks,
  siteSettings,
  testimonials,
}: {
  marketplaceLinks: MarketplaceLink[];
  siteSettings: SiteSettings;
  testimonials?: Testimonial[];
}) {
  const waUrl = siteSettings.whatsappNumber
    ? toWaLink(siteSettings.whatsappNumber, "Halo Jasmine Frozen Food, saya tertarik dengan produknya")
    : null;

  return (
    <section className="bg-[var(--cream-100)] py-8 sm:py-12">
      <Container width="wide">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
          {/* Testimonials */}
          {testimonials && testimonials.length > 0 && (
            <TestimonialPanel testimonials={testimonials} />
          )}

          {/* Marketplace + WhatsApp */}
          <div className="flex flex-col gap-5">
            {/* WhatsApp CTA */}
            <div className="rounded-2xl border border-stone-200/80 bg-white p-4 sm:p-5">
              <div className="flex items-start gap-3.5">
                <div className="grid size-10 place-items-center rounded-xl bg-[var(--success)]/10 text-[var(--success)] shrink-0">
                  <MessageCircle size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-[var(--ink-950)]">
                    Temukan Kami di
                  </h3>
                  <p className="mt-0.5 text-xs text-stone-500">
                    Belanja lebih mudah di marketplace favorit
                  </p>
                  {waUrl && (
                    <Button asChild size="sm" className="mt-2.5 rounded-full bg-[var(--success)] text-white hover:bg-[var(--success)]/90 text-xs">
                      <a href={waUrl} target="_blank" rel="noopener noreferrer" className="gap-1.5">
                        <MessageCircle size={12} />
                        Order via WhatsApp
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Marketplace links */}
            {marketplaceLinks.length > 0 && (
              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-stone-400">
                  Marketplace
                </h4>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {marketplaceLinks.map((mp) => (
                    <a
                      key={mp.id}
                      href={mp.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-2 rounded-xl border border-stone-200/80 bg-white px-3 py-2.5 text-xs font-medium text-stone-700 transition hover:border-[var(--brand-400)] hover:text-[var(--brand-600)] hover:shadow-sm"
                    >
                      {mp.logoUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={mp.logoUrl} alt={mp.marketplace} className="h-4 w-auto" />
                      )}
                      <span className="flex-1 truncate">{mp.label}</span>
                      <ExternalLink size={10} className="text-stone-300 group-hover:text-[var(--brand-500)] shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
