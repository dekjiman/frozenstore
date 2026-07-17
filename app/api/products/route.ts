import { and, asc, eq, isNull, or, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { products } from "@/db/schema";
import { toProduct } from "@/lib/product-mapper";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const searchParams = new URL(request.url).searchParams;
    const query = searchParams.get("q")?.trim() ?? "";

    if (query.length > 100) {
      return NextResponse.json(
        { error: { code: "INVALID_SEARCH_QUERY", message: "Kata kunci maksimal 100 karakter" } },
        { status: 400 },
      );
    }

    const searchCondition = query
      ? or(
          sql`instr(lower(${products.name}), lower(${query})) > 0`,
          sql`instr(lower(${products.category}), lower(${query})) > 0`,
          sql`instr(lower(${products.sku}), lower(${query})) > 0`,
        )
      : undefined;

    const rows = await db
      .select()
      .from(products)
      .where(
        and(
          eq(products.isActive, true),
          isNull(products.deletedAt),
          searchCondition,
        ),
      )
      .orderBy(asc(products.name));

    return NextResponse.json({
      products: rows.map(toProduct),
      total: rows.length,
      query: query || null,
    });
  } catch (error) {
    console.error("Failed to list products", error);

    return NextResponse.json(
      { error: { code: "PRODUCTS_LIST_FAILED", message: "Gagal memuat daftar produk" } },
      { status: 500 },
    );
  }
}
