import { and, asc, eq, gte, isNull, lte, or, desc, sql } from "drizzle-orm";
import { db } from "@/db/client";
import {
  products,
  productMedia,
  categories,
  heroCampaigns,
  promoBanners,
  trustItems,
  articles,
  testimonials,
  siteSettings,
  marketplaceLinks,
} from "@/db/schema";

export type HomepageDTO = {
  siteSettings: {
    brandName: string;
    tagline: string;
    logoUrl: string | null;
    whatsappNumber: string | null;
    email: string | null;
    address: string | null;
    operatingHours: string | null;
    freeShippingThreshold: number;
    instagramUrl: string | null;
    tiktokUrl: string | null;
    youtubeUrl: string | null;
    facebookUrl: string | null;
  } | null;
  hero: {
    id: string;
    eyebrow: string;
    title: string;
    highlightedText: string | null;
    description: string;
    imageUrl: string;
    imageAlt: string;
    primaryCtaLabel: string | null;
    primaryCtaUrl: string | null;
    secondaryCtaLabel: string | null;
    secondaryCtaUrl: string | null;
  } | null;
  categories: {
    id: string;
    name: string;
    slug: string;
    description: string;
    imageUrl: string | null;
    iconKey: string | null;
    sortOrder: number;
  }[];
  promoBanners: {
    id: string;
    title: string;
    subtitle: string;
    badgeText: string | null;
    imageUrl: string;
    backgroundVariant: string | null;
    ctaLabel: string | null;
    ctaUrl: string | null;
  }[];
  bestSellers: {
    id: string;
    name: string;
    slug: string | null;
    price: number;
    compareAtPrice: number | null;
    imageUrl: string;
    ratingAverage: number;
    ratingCount: number;
    soldCount: number;
    shortDescription: string;
    primaryMediaUrl: string | null;
  }[];
  trustItems: {
    id: string;
    iconKey: string;
    title: string;
    description: string;
  }[];
  articles: {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    coverImage: string | null;
  }[];
  testimonials: {
    id: string;
    customerName: string;
    customerTitle: string;
    quote: string;
    rating: number;
    avatarUrl: string | null;
  }[];
  marketplaceLinks: {
    id: string;
    marketplace: string;
    label: string;
    url: string;
    logoUrl: string | null;
  }[];
};

export async function getHomepageData(): Promise<HomepageDTO> {
  const [
    settings,
    hero,
    cats,
    promos,
    bestSellerProducts,
    trust,
    articlesList,
    testis,
    marketplaces,
  ] = await Promise.all([
    db.query.siteSettings.findFirst({
      where: eq(siteSettings.id, "default"),
    }),

    db.query.heroCampaigns.findFirst({
      where: and(
        eq(heroCampaigns.isActive, true),
        or(isNull(heroCampaigns.startsAt), lte(heroCampaigns.startsAt, new Date())),
        or(isNull(heroCampaigns.endsAt), gte(heroCampaigns.endsAt, new Date())),
      ),
      orderBy: [asc(heroCampaigns.sortOrder)],
    }),

    db.query.categories.findMany({
      where: eq(categories.isActive, true),
      orderBy: [asc(categories.sortOrder)],
    }),

    db.query.promoBanners.findMany({
      where: and(
        eq(promoBanners.isActive, true),
        or(isNull(promoBanners.startsAt), lte(promoBanners.startsAt, new Date())),
        or(isNull(promoBanners.endsAt), gte(promoBanners.endsAt, new Date())),
      ),
      orderBy: [asc(promoBanners.sortOrder)],
    }),

    db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        price: products.price,
        compareAtPrice: products.compareAtPrice,
        imageUrl: products.imageUrl,
        ratingAverage: products.ratingAverage,
        ratingCount: products.ratingCount,
        soldCount: products.soldCount,
        shortDescription: products.shortDescription,
        primaryMediaUrl: sql<string | null>`(
          SELECT pm.url FROM ${productMedia} pm
          WHERE pm.product_id = ${products.id} AND pm.is_primary = true
          LIMIT 1
        )`,
      })
      .from(products)
      .where(
        and(
          eq(products.isActive, true),
          eq(products.isBestSeller, true),
          isNull(products.deletedAt),
        ),
      )
      .orderBy(desc(products.soldCount))
      .limit(8),

    db.query.trustItems.findMany({
      where: eq(trustItems.isActive, true),
      orderBy: [asc(trustItems.sortOrder)],
    }),

    db.query.articles.findMany({
      where: eq(articles.isPublished, true),
      orderBy: [desc(articles.publishedAt)],
      limit: 3,
    }),

    db.query.testimonials.findMany({
      where: eq(testimonials.isPublished, true),
      orderBy: [asc(testimonials.sortOrder)],
    }),

    db.query.marketplaceLinks.findMany({
      where: eq(marketplaceLinks.isActive, true),
      orderBy: [asc(marketplaceLinks.sortOrder)],
    }),
  ]);

  return {
    siteSettings: settings
      ? {
          brandName: settings.brandName,
          tagline: settings.tagline,
          logoUrl: settings.logoUrl,
          whatsappNumber: settings.whatsappNumber,
          email: settings.email,
          address: settings.address,
          operatingHours: settings.operatingHours,
          freeShippingThreshold: settings.freeShippingThreshold,
          instagramUrl: settings.instagramUrl,
          tiktokUrl: settings.tiktokUrl,
          youtubeUrl: settings.youtubeUrl,
          facebookUrl: settings.facebookUrl,
        }
      : null,
    hero: hero
      ? {
          id: hero.id,
          eyebrow: hero.eyebrow,
          title: hero.title,
          highlightedText: hero.highlightedText,
          description: hero.description,
          imageUrl: hero.imageUrl,
          imageAlt: hero.imageAlt,
          primaryCtaLabel: hero.primaryCtaLabel,
          primaryCtaUrl: hero.primaryCtaUrl,
          secondaryCtaLabel: hero.secondaryCtaLabel,
          secondaryCtaUrl: hero.secondaryCtaUrl,
        }
      : null,
    categories: cats.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      imageUrl: c.imageUrl,
      iconKey: c.iconKey,
      sortOrder: c.sortOrder,
    })),
    promoBanners: promos.map((p) => ({
      id: p.id,
      title: p.title,
      subtitle: p.subtitle,
      badgeText: p.badgeText,
      imageUrl: p.imageUrl,
      backgroundVariant: p.backgroundVariant,
      ctaLabel: p.ctaLabel,
      ctaUrl: p.ctaUrl,
    })),
    bestSellers: bestSellerProducts.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      compareAtPrice: p.compareAtPrice,
      imageUrl: p.primaryMediaUrl ?? p.imageUrl,
      ratingAverage: p.ratingAverage,
      ratingCount: p.ratingCount,
      soldCount: p.soldCount,
      shortDescription: p.shortDescription,
      primaryMediaUrl: p.primaryMediaUrl,
    })),
    trustItems: trust.map((t) => ({
      id: t.id,
      iconKey: t.iconKey,
      title: t.title,
      description: t.description,
    })),
    articles: articlesList.map((a) => ({
      id: a.id,
      title: a.title,
      slug: a.slug,
      excerpt: a.excerpt,
      coverImage: a.coverImage,
    })),
    testimonials: testis.map((t) => ({
      id: t.id,
      customerName: t.customerName,
      customerTitle: t.customerTitle,
      quote: t.quote,
      rating: t.rating,
      avatarUrl: t.avatarUrl,
    })),
    marketplaceLinks: marketplaces.map((m) => ({
      id: m.id,
      marketplace: m.marketplace,
      label: m.label,
      url: m.url,
      logoUrl: m.logoUrl,
    })),
  };
}
