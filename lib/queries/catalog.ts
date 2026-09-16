import { and, asc, desc, eq, gt, isNull, sql, gte, lte, or, max } from "drizzle-orm";
import { db } from "@/db/client";
import { products, productMedia, categories } from "@/db/schema";

export type CatalogParams = {
  q?: string;
  category?: string;
  featured?: boolean;
  bestSeller?: boolean;
  promo?: boolean;
  cooking?: boolean;
  sort?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  page?: number;
  limit?: number;
};

export type CatalogProductDTO = {
  id: string;
  name: string;
  slug: string | null;
  price: number;
  compareAtPrice: number | null;
  imageUrl: string;
  shortDescription: string;
  ratingAverage: number;
  ratingCount: number;
  soldCount: number;
  isFeatured: boolean;
  isBestSeller: boolean;
  isNew: boolean;
  isPromo: boolean;
  category: string;
  categoryId: string | null;
  categoryName: string | null;
  primaryMediaUrl: string | null;
  weightValue: number | null;
  weightUnit: string;
  piecesMin: number | null;
  piecesMax: number | null;
  currentStock: number;
};

export type CatalogResult = {
  products: CatalogProductDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

const SORT_OPTIONS: Record<string, ReturnType<typeof asc>> = {
  "name-asc": asc(products.name),
  "name-desc": desc(products.name),
  "price-asc": asc(products.price),
  "price-desc": desc(products.price),
  "newest": desc(products.createdAt),
  "popular": desc(products.soldCount),
  "rating": desc(products.ratingAverage),
};

function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, "\\$&");
}

export async function getCatalogProducts(
  params: CatalogParams,
): Promise<CatalogResult> {
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.min(50, Math.max(1, params.limit ?? 20));
  const offset = (page - 1) * limit;

  const conditions = [
    eq(products.isActive, true),
    isNull(products.deletedAt),
  ];

  if (params.q) {
    const pattern = `%${escapeLike(params.q.trim().toLowerCase())}%`;
    conditions.push(
      or(
        sql`lower(${products.name}) LIKE ${pattern} ESCAPE '\\'`,
        sql`lower(${products.description}) LIKE ${pattern} ESCAPE '\\'`,
        sql`lower(${products.sku}) LIKE ${pattern} ESCAPE '\\'`,
      )!,
    );
  }

  if (params.category) {
    const catParam = params.category.trim();
    const matchedCategory = await db.query.categories.findFirst({
      where: or(
        eq(categories.id, catParam),
        eq(categories.slug, catParam),
        sql`lower(${categories.name}) = ${catParam.toLowerCase()}`,
      ),
    });

    if (matchedCategory) {
      conditions.push(
        or(
          eq(products.categoryId, matchedCategory.id),
          sql`lower(${products.category}) = ${matchedCategory.name.toLowerCase()}`,
        )!,
      );
    } else {
      conditions.push(
        or(
          eq(products.categoryId, catParam),
          sql`lower(${products.category}) = ${catParam.toLowerCase()}`,
        )!,
      );
    }
  }

  if (params.featured) {
    conditions.push(eq(products.isFeatured, true));
  }

  if (params.bestSeller) {
    conditions.push(eq(products.isBestSeller, true));
  }

  if (params.promo) {
    conditions.push(eq(products.isPromo, true));
  }

  if (params.minPrice !== undefined) {
    conditions.push(gte(products.price, params.minPrice));
  }

  if (params.maxPrice !== undefined) {
    conditions.push(lte(products.price, params.maxPrice));
  }

  if (params.inStock) {
    conditions.push(sql`${products.currentStock} > 0`);
  }

  const whereClause = and(...conditions);
  const orderClause = SORT_OPTIONS[params.sort ?? "name-asc"] ?? asc(products.name);

  const primaryMedia = db
    .select({
      productId: productMedia.productId,
      url: max(productMedia.url).as("url"),
    })
    .from(productMedia)
    .where(eq(productMedia.isPrimary, true))
    .groupBy(productMedia.productId)
    .as("primary_media");

  const categoryNameSubq = db
    .select({
      id: categories.id,
      name: categories.name,
    })
    .from(categories)
    .as("category_name");

  const [rows, countResult] = await Promise.all([
    db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        price: products.price,
        compareAtPrice: products.compareAtPrice,
        imageUrl: products.imageUrl,
        shortDescription: products.shortDescription,
        ratingAverage: products.ratingAverage,
        ratingCount: products.ratingCount,
        soldCount: products.soldCount,
        isFeatured: products.isFeatured,
        isBestSeller: products.isBestSeller,
        isNew: products.isNew,
        isPromo: products.isPromo,
        category: products.category,
        categoryId: products.categoryId,
        weightValue: products.weightValue,
        weightUnit: products.weightUnit,
        piecesMin: products.piecesMin,
        piecesMax: products.piecesMax,
        currentStock: products.currentStock,
        primaryMediaUrl: primaryMedia.url,
        categoryName: categoryNameSubq.name,
      })
      .from(products)
      .leftJoin(primaryMedia, eq(products.id, primaryMedia.productId))
      .leftJoin(categoryNameSubq, eq(products.categoryId, categoryNameSubq.id))
      .where(whereClause)
      .orderBy(orderClause)
      .limit(limit)
      .offset(offset),

    db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(whereClause),
  ]);

  const total = Number(countResult[0]?.count ?? 0);

  return {
    products: rows.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      price: r.price,
      compareAtPrice: r.compareAtPrice,
      imageUrl: r.primaryMediaUrl ?? r.imageUrl,
      shortDescription: r.shortDescription,
      ratingAverage: r.ratingAverage,
      ratingCount: r.ratingCount,
      soldCount: r.soldCount,
      isFeatured: r.isFeatured,
      isBestSeller: r.isBestSeller,
      isNew: r.isNew,
      isPromo: r.isPromo,
      category: r.category,
      categoryId: r.categoryId,
      categoryName: r.categoryName,
      primaryMediaUrl: r.primaryMediaUrl,
      weightValue: r.weightValue,
      weightUnit: r.weightUnit,
      piecesMin: r.piecesMin,
      piecesMax: r.piecesMax,
      currentStock: r.currentStock,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export type CatalogExportProductDTO = {
  id: string;
  sku: string;
  name: string;
  category: string;
  categoryName: string | null;
  shortDescription: string;
  price: number;
  currentStock: number;
  imageUrl: string;
};

export async function getCatalogExportProducts(): Promise<CatalogExportProductDTO[]> {
  const primaryMedia = db
    .select({
      productId: productMedia.productId,
      url: max(productMedia.url).as("url"),
    })
    .from(productMedia)
    .where(eq(productMedia.isPrimary, true))
    .groupBy(productMedia.productId)
    .as("primary_media");

  const categoryNameSubq = db
    .select({
      id: categories.id,
      name: categories.name,
    })
    .from(categories)
    .as("category_name");

  const rows = await db
    .select({
      id: products.id,
      sku: products.sku,
      name: products.name,
      category: products.category,
      shortDescription: products.shortDescription,
      price: products.price,
      currentStock: products.currentStock,
      fallbackImageUrl: products.imageUrl,
      primaryMediaUrl: primaryMedia.url,
      categoryName: categoryNameSubq.name,
    })
    .from(products)
    .leftJoin(primaryMedia, eq(products.id, primaryMedia.productId))
    .leftJoin(categoryNameSubq, eq(products.categoryId, categoryNameSubq.id))
    .where(
      and(
        eq(products.isActive, true),
        isNull(products.deletedAt),
        gt(products.currentStock, 0),
      ),
    )
    .orderBy(asc(products.name));

  return rows.map((r) => ({
    id: r.id,
    sku: r.sku,
    name: r.name,
    category: r.category,
    categoryName: r.categoryName,
    shortDescription: r.shortDescription,
    price: r.price,
    currentStock: r.currentStock,
    imageUrl: r.primaryMediaUrl ?? r.fallbackImageUrl,
  }));
}
