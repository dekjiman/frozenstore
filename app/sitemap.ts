import type { MetadataRoute } from "next";
import { db } from "@/db/client";
import { products, categories } from "@/db/schema";
import { and, eq, isNull } from "drizzle-orm";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let productUrls: MetadataRoute.Sitemap = [];
  let categoryUrls: MetadataRoute.Sitemap = [];

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
  } catch (error) {
    console.error("Failed to generate dynamic sitemap entries", error);
  }

  const staticUrls: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE_URL}/produk`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/masuk`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE_URL}/daftar`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE_URL}/keranjang`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE_URL}/checkout`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/akun`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
  ];

  return [...staticUrls, ...categoryUrls, ...productUrls];
}
