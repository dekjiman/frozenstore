import { getHomepageData } from "@/lib/queries/homepage";
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

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";

function HomeJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Jasmine Frozen Food",
    url: BASE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: `${BASE_URL}/produk?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
    organization: {
      "@type": "Organization",
      name: "Jasmine Frozen Food",
      url: BASE_URL,
      logo: `${BASE_URL}/logo.png`,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default async function HomePage() {
  const data = await getHomepageData();

  return (
    <div className="min-h-screen bg-[var(--cream-50)]">
      <HomeJsonLd />
      <StoreHeader />

      <main>
        {data.hero && <HeroCampaign hero={data.hero} />}
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
      </main>

      <StoreFooter initialSettings={data.siteSettings} />
    </div>
  );
}
