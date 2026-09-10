import { randomUUID } from "node:crypto";
import { and, asc, isNull, or, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { products } from "@/db/schema";
import { requireAdmin } from "@/lib/admin-auth";
import { parseProductInput, toAdminProduct } from "@/lib/admin-product";
import { revalidateCacheTag, CACHE_TAGS } from "@/lib/cache";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const searchParams = new URL(request.url).searchParams;
    const query = searchParams.get("q")?.trim() ?? "";
    const includeDeleted = searchParams.get("includeDeleted") === "true";

    if (query.length > 100) {
      return NextResponse.json(
        { error: { code: "INVALID_SEARCH_QUERY", message: "Kata kunci maksimal 100 karakter" } },
        { status: 400 },
      );
    }

    const searchCondition = query
      ? or(
          sql`strpos(lower(${products.name}), lower(${query})) > 0`,
          sql`strpos(lower(${products.category}), lower(${query})) > 0`,
          sql`strpos(lower(${products.sku}), lower(${query})) > 0`,
        )
      : undefined;
    const rows = await db
      .select()
      .from(products)
      .where(and(includeDeleted ? undefined : isNull(products.deletedAt), searchCondition))
      .orderBy(asc(products.name));

    return NextResponse.json({ products: rows.map(toAdminProduct), total: rows.length });
  } catch (error) {
    console.error("Failed to list admin products", error);
    return NextResponse.json(
      { error: { code: "PRODUCTS_LIST_FAILED", message: "Gagal memuat daftar produk" } },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const parsed = parseProductInput(body);
    if ("error" in parsed) {
      return NextResponse.json(
        { error: { code: "INVALID_PRODUCT", message: parsed.error } },
        { status: 400 },
      );
    }

    const duplicate = await db.query.products.findFirst({
      where: sql`lower(${products.sku}) = lower(${parsed.data.sku})`,
      columns: { id: true },
    });
    if (duplicate) {
      return NextResponse.json(
        { error: { code: "PRODUCT_SKU_EXISTS", message: "SKU sudah digunakan" } },
        { status: 409 },
      );
    }

    const now = new Date();
    const product = {
      id: randomUUID(),
      ...parsed.data,
      deletedAt: null,
      createdAt: now,
      updatedAt: now,
      ratingAverage: 0,
      ratingCount: 0,
      soldCount: 0,
    };
    await db.insert(products).values(product);
    revalidateCacheTag(CACHE_TAGS.PRODUCTS);
    revalidateCacheTag(CACHE_TAGS.HOMEPAGE);
    return NextResponse.json({ product: toAdminProduct(product) }, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: { code: "INVALID_JSON", message: "Body JSON tidak valid" } },
        { status: 400 },
      );
    }
    if (error instanceof Error && error.message.includes("UNIQUE constraint failed")) {
      return NextResponse.json(
        { error: { code: "PRODUCT_SKU_EXISTS", message: "SKU sudah digunakan" } },
        { status: 409 },
      );
    }
    console.error("Failed to create product", error);
    return NextResponse.json(
      { error: { code: "PRODUCT_CREATE_FAILED", message: "Gagal membuat produk" } },
      { status: 500 },
    );
  }
}
