import { and, asc, eq, isNull, or, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { products, productMedia, productBadges, categories, articles } from "@/db/schema";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  try {
    const product = await db.query.products.findFirst({
      where: and(
        or(eq(products.slug, slug), eq(products.id, slug)),
        eq(products.isActive, true),
        isNull(products.deletedAt),
      ),
    });

    if (!product) {
      return NextResponse.json(
        { error: { code: "PRODUCT_NOT_FOUND", message: "Produk tidak ditemukan" } },
        { status: 404 },
      );
    }

    const [media, badges, category, related, article] = await Promise.all([
      db.query.productMedia.findMany({
        where: eq(productMedia.productId, product.id),
        orderBy: [asc(productMedia.sortOrder)],
      }),

      db.query.productBadges.findMany({
        where: eq(productBadges.productId, product.id),
        orderBy: [asc(productBadges.sortOrder)],
      }),

      product.categoryId
        ? db.query.categories.findFirst({
            where: eq(categories.id, product.categoryId),
          })
        : null,

      db
        .select({
          id: products.id,
          name: products.name,
          slug: products.slug,
          price: products.price,
          imageUrl: products.imageUrl,
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
            eq(products.categoryId, product.categoryId ?? ""),
            sql`${products.id} != ${product.id}`,
          ),
        )
        .limit(4),
        
      product.articleId
        ? db.query.articles.findFirst({
            where: eq(articles.id, product.articleId),
          })
        : null,
    ]);

    return NextResponse.json({
      data: {
        id: product.id,
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        description: product.description,
        shortDescription: product.shortDescription,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        category: product.category,
        categoryId: product.categoryId,
        categoryName: category?.name ?? null,
        imageUrl: product.imageUrl,
        weightValue: product.weightValue,
        weightUnit: product.weightUnit,
        piecesMin: product.piecesMin,
        piecesMax: product.piecesMax,
        isFeatured: product.isFeatured,
        isBestSeller: product.isBestSeller,
        isNew: product.isNew,
        isPromo: product.isPromo,
        ratingAverage: product.ratingAverage,
        ratingCount: product.ratingCount,
        soldCount: product.soldCount,
        currentStock: product.currentStock,
        articleId: product.articleId,
        article: article ? {
          title: article.title,
          slug: article.slug,
          excerpt: article.excerpt,
        } : null,
        storageInstructions: product.storageInstructions,
        seoTitle: product.seoTitle,
        seoDescription: product.seoDescription,
        media: media.map((m) => ({
          id: m.id,
          mediaType: m.mediaType,
          url: m.url,
          thumbnailUrl: m.thumbnailUrl,
          posterUrl: m.posterUrl,
          altText: m.altText,
          title: m.title,
          sortOrder: m.sortOrder,
          isPrimary: m.isPrimary,
          width: m.width,
          height: m.height,
        })),
        badges: badges.map((b) => ({
          id: b.id,
          label: b.label,
          badgeType: b.badgeType,
        })),
        related: related.map((r) => ({
          id: r.id,
          name: r.name,
          slug: r.slug,
          price: r.price,
          imageUrl: r.primaryMediaUrl ?? r.imageUrl,
        })),
      },
    });
  } catch (error) {
    console.error("Failed to fetch product by slug", error);
    return NextResponse.json(
      { error: { code: "PRODUCT_FETCH_FAILED", message: "Gagal memuat produk" } },
      { status: 500 },
    );
  }
}
