import type { Metadata } from "next";
import { getHomepageData, type HomepageDTO } from "@/lib/queries/homepage";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TAGLINE,
  canonical,
  jsonLdScript,
  organizationJsonLd,
  storeJsonLd,
  websiteJsonLd,
} from "@/lib/seo";
import { AdUnit } from "@/components/ads/ad-unit";
import { StoreHeader } from "@/components/storefront/store-header";
import { StoreFooter } from "@/components/storefront/store-footer";
import { HeroCampaign } from "@/components/storefront/hero-campaign";
import { CategoryRail } from "@/components/storefront/category-rail";
import { PromoBannerGrid } from "@/components/storefront/promo-banner-grid";
import { BestSellerSection } from "@/components/storefront/best-seller-section";
import { TrustStrip } from "@/components/storefront/trust-strip";
import { ArticleSection } from "@/components/storefront/article-section";
import { MarketplacePanel } from "@/components/storefront/marketplace-panel";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    absolute: `${SITE_NAME} — ${SITE_TAGLINE}`,
  },
  description: SITE_DESCRIPTION,
  ...canonical("/"),
};

function HomeJsonLd({ settings, marketplaceUrls }: { settings: HomepageDTO["siteSettings"]; marketplaceUrls: string[] }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      organizationJsonLd(),
      websiteJsonLd(),
      storeJsonLd({
        brandName: settings?.brandName ?? SITE_NAME,
        tagline: settings?.tagline,
        logoUrl: settings?.logoUrl,
        email: settings?.email,
        whatsappNumber: settings?.whatsappNumber,
        address: settings?.address,
        operatingHours: settings?.operatingHours,
        instagramUrl: settings?.instagramUrl,
        tiktokUrl: settings?.tiktokUrl,
        facebookUrl: settings?.facebookUrl,
        youtubeUrl: settings?.youtubeUrl,
        marketplaceUrls,
      }),
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }}
    />
  );
}

export default async function HomePage() {
  const data = await getHomepageData();

  return (
    <div className="min-h-screen bg-[var(--cream-50)]">
      <HomeJsonLd
        settings={data.siteSettings}
        marketplaceUrls={data.marketplaceLinks.map((m) => m.url)}
      />
      <StoreHeader />

      <main>
        {data.hero ? (
          <HeroCampaign hero={data.hero} />
        ) : (
          <h1 className="sr-only">
            {SITE_NAME} — {SITE_TAGLINE}
          </h1>
        )}
        <CategoryRail categories={data.categories} />
        <PromoBannerGrid promos={data.promoBanners} />
        <BestSellerSection products={data.bestSellers} />
        <TrustStrip items={data.trustItems} />
        <ArticleSection articles={data.articles} />
        {data.siteSettings && (
          <MarketplacePanel
            marketplaceLinks={data.marketplaceLinks}
            siteSettings={data.siteSettings}
            testimonials={data.testimonials}
          />
        )}

        <div className="px-4 py-10 sm:px-6">
          <AdUnit slot={process.env.NEXT_PUBLIC_AD_SLOT_HOME ?? ""} />
        </div>
      </main>

      <StoreFooter initialSettings={data.siteSettings} />
    </div>
  );
}
