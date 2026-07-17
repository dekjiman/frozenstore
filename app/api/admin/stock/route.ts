import { and, asc, eq, isNull, or, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { products } from "@/db/schema";
import { requireAdmin } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const searchParams = new URL(request.url).searchParams;
    const query = searchParams.get("q")?.trim() ?? "";
    const lowStockThreshold = Number(searchParams.get("lowStockThreshold") ?? 10);

    if (query.length > 100) {
      return NextResponse.json(
        { error: { code: "INVALID_SEARCH_QUERY", message: "Kata kunci maksimal 100 karakter" } },
        { status: 400 },
      );
    }
    if (!Number.isInteger(lowStockThreshold) || lowStockThreshold < 0 || lowStockThreshold > 100_000) {
      return NextResponse.json(
        { error: { code: "INVALID_STOCK_THRESHOLD", message: "Batas stok menipis harus bilangan bulat antara 0 dan 100.000" } },
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
      .select({
        id: products.id,
        sku: products.sku,
        name: products.name,
        category: products.category,
        price: products.price,
        stock: products.currentStock,
        imageUrl: products.imageUrl,
        updatedAt: products.updatedAt,
      })
      .from(products)
      .where(
        and(
          eq(products.isActive, true),
          isNull(products.deletedAt),
          searchCondition,
        ),
      )
      .orderBy(asc(products.currentStock), asc(products.name));

    const stock = rows.map((product) => ({
      ...product,
      status: product.stock === 0
        ? "out_of_stock" as const
        : product.stock <= lowStockThreshold
          ? "low_stock" as const
          : "available" as const,
    }));
    const summary = stock.reduce(
      (result, product) => ({
        totalProducts: result.totalProducts + 1,
        totalUnits: result.totalUnits + product.stock,
        inventoryValue: result.inventoryValue + product.stock * product.price,
        lowStockCount: result.lowStockCount + (product.stock <= lowStockThreshold ? 1 : 0),
        outOfStockCount: result.outOfStockCount + (product.stock === 0 ? 1 : 0),
      }),
      { totalProducts: 0, totalUnits: 0, inventoryValue: 0, lowStockCount: 0, outOfStockCount: 0 },
    );

    return NextResponse.json({
      stock,
      summary,
      total: stock.length,
      query: query || null,
      lowStockThreshold,
      generatedAt: new Date(),
    });
  } catch (error) {
    console.error("Failed to get current stock", error);
    return NextResponse.json(
      { error: { code: "CURRENT_STOCK_FAILED", message: "Gagal memuat stok terkini" } },
      { status: 500 },
    );
  }
}
