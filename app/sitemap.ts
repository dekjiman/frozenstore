import type { MetadataRoute } from "next";
import { db } from "@/db/client";
import { products, categories, articles } from "@/db/schema";
import { and, eq, isNull, asc, lte } from "drizzle-orm";
import { SEO_BASE, absoluteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

const now = () => new Date();

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let productUrls: MetadataRoute.Sitemap = [];
  let categoryUrls: MetadataRoute.Sitemap = [];
  let articleUrls: MetadataRoute.Sitemap = [];

  try {
    const activeProducts = (
      await db
        .select({
          slug: products.slug,
          imageUrl: products.imageUrl,
          updatedAt: products.updatedAt,
        })
        .from(products)
        .where(and(eq(products.isActive, true), isNull(products.deletedAt)))
        .orderBy(asc(products.name))
    ).filter((p) => p.slug);

    const activeCategories = await db
      .select({ slug: categories.slug, updatedAt: categories.updatedAt })
      .from(categories)
      .where(eq(categories.isActive, true))
      .orderBy(asc(categories.sortOrder));

    const publishedArticles = await db
      .select({ slug: articles.slug, coverImage: articles.coverImage, updatedAt: articles.updatedAt })
      .from(articles)
      .where(and(eq(articles.isPublished, true), lte(articles.publishedAt, now())))
      .orderBy(asc(articles.title));

    productUrls = activeProducts.map((p) => ({
      url: `${SEO_BASE}/produk/${p.slug}`,
      lastModified: p.updatedAt ?? now(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
      images: p.imageUrl ? [absoluteUrl(p.imageUrl)] : undefined,
    }));

    categoryUrls = activeCategories.map((c) => ({
      url: `${SEO_BASE}/kategori/${c.slug}`,
      lastModified: c.updatedAt ?? now(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

    articleUrls = publishedArticles.map((a) => ({
      url: `${SEO_BASE}/artikel/${a.slug}`,
      lastModified: a.updatedAt ?? now(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
      images: a.coverImage ? [absoluteUrl(a.coverImage)] : undefined,
    }));
  } catch (error) {
    console.error("Failed to generate dynamic sitemap entries", error);
  }

  const staticUrls: MetadataRoute.Sitemap = [
    { url: SEO_BASE, lastModified: now(), changeFrequency: "daily", priority: 1.0 },
    { url: `${SEO_BASE}/produk`, lastModified: now(), changeFrequency: "daily", priority: 0.9 },
    { url: `${SEO_BASE}/produk?promo=true`, lastModified: now(), changeFrequency: "weekly", priority: 0.6 },
    { url: `${SEO_BASE}/produk?reseller=true`, lastModified: now(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${SEO_BASE}/artikel`, lastModified: now(), changeFrequency: "daily", priority: 0.8 },
    { url: `${SEO_BASE}/tentang-kami`, lastModified: now(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${SEO_BASE}/kontak`, lastModified: now(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${SEO_BASE}/bantuan`, lastModified: now(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${SEO_BASE}/cara-order`, lastModified: now(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${SEO_BASE}/cara-penyimpanan`, lastModified: now(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${SEO_BASE}/pengiriman`, lastModified: now(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${SEO_BASE}/kebijakan-pengembalian`, lastModified: now(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${SEO_BASE}/kebijakan-privasi`, lastModified: now(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${SEO_BASE}/syarat-ketentuan`, lastModified: now(), changeFrequency: "yearly", priority: 0.3 },
  ];

  return [...staticUrls, ...categoryUrls, ...articleUrls, ...productUrls];
}
