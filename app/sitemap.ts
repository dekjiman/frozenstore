import type { MetadataRoute } from "next";
import { db } from "@/db/client";
import { products, categories, articles } from "@/db/schema";
import { and, eq, isNull, asc } from "drizzle-orm";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let productUrls: MetadataRoute.Sitemap = [];
  let categoryUrls: MetadataRoute.Sitemap = [];
  let articleUrls: MetadataRoute.Sitemap = [];

  try {
    const activeProducts = (await db
      .select({ slug: products.slug })
      .from(products)
      .where(and(eq(products.isActive, true), isNull(products.deletedAt))))
      .filter((p) => p.slug);

    const activeCategories = await db
      .select({ slug: categories.slug })
      .from(categories)
      .where(eq(categories.isActive, true));

    const publishedArticles = await db
      .select({ slug: articles.slug, updatedAt: articles.updatedAt })
      .from(articles)
      .where(eq(articles.isPublished, true))
      .orderBy(asc(articles.title));

    productUrls = activeProducts.map((p) => ({
      url: `${BASE_URL}/produk/${p.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    categoryUrls = activeCategories.map((c) => ({
      url: `${BASE_URL}/produk?category=${c.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

    articleUrls = publishedArticles.map((a) => ({
      url: `${BASE_URL}/artikel/${a.slug}`,
      lastModified: a.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));
  } catch (error) {
    console.error("Failed to generate dynamic sitemap entries", error);
  }

  const staticUrls: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE_URL}/produk`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/artikel`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE_URL}/masuk`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE_URL}/daftar`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE_URL}/keranjang`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE_URL}/checkout`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/akun`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
  ];

  return [...staticUrls, ...categoryUrls, ...articleUrls, ...productUrls];
}
