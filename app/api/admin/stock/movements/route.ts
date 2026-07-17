import { and, count, desc, eq, gte, lte, or, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { products, stockMovements } from "@/db/schema";
import { requireAdmin } from "@/lib/admin-auth";

export const runtime = "nodejs";

function parseDateFilter(value: string | null, endOfDay = false) {
  if (!value) return null;
  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? `${value}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}Z`
    : value;
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export async function GET(request: Request) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const searchParams = new URL(request.url).searchParams;
    const productId = searchParams.get("productId")?.trim() ?? "";
    const type = searchParams.get("type")?.trim() ?? "";
    const query = searchParams.get("q")?.trim() ?? "";
    const from = parseDateFilter(searchParams.get("from"));
    const to = parseDateFilter(searchParams.get("to"), true);
    const limit = Number(searchParams.get("limit") ?? 50);
    const offset = Number(searchParams.get("offset") ?? 0);

    if (from === undefined || to === undefined || (from && to && from > to)) {
      return NextResponse.json(
        { error: { code: "INVALID_DATE_RANGE", message: "Rentang waktu tidak valid" } },
        { status: 400 },
      );
    }
    if (type && !["in", "out", "adjustment"].includes(type)) {
      return NextResponse.json(
        { error: { code: "INVALID_MOVEMENT_TYPE", message: "Tipe mutasi stok tidak valid" } },
        { status: 400 },
      );
    }
    if (query.length > 100) {
      return NextResponse.json(
        { error: { code: "INVALID_SEARCH_QUERY", message: "Kata kunci maksimal 100 karakter" } },
        { status: 400 },
      );
    }
    if (!Number.isInteger(limit) || limit < 1 || limit > 100 || !Number.isInteger(offset) || offset < 0) {
      return NextResponse.json(
        { error: { code: "INVALID_PAGINATION", message: "Limit harus 1-100 dan offset tidak boleh negatif" } },
        { status: 400 },
      );
    }

    const condition = and(
      productId ? eq(stockMovements.productId, productId) : undefined,
      type ? eq(stockMovements.type, type as "in" | "out" | "adjustment") : undefined,
      from ? gte(stockMovements.createdAt, from) : undefined,
      to ? lte(stockMovements.createdAt, to) : undefined,
      query
        ? or(
            sql`instr(lower(${products.name}), lower(${query})) > 0`,
            sql`instr(lower(${products.sku}), lower(${query})) > 0`,
            sql`instr(lower(${stockMovements.reason}), lower(${query})) > 0`,
            sql`instr(lower(coalesce(${stockMovements.reference}, '')), lower(${query})) > 0`,
          )
        : undefined,
    );

    const rows = await db
      .select({
        id: stockMovements.id,
        productId: stockMovements.productId,
        productName: products.name,
        sku: products.sku,
        type: stockMovements.type,
        quantity: stockMovements.quantity,
        stockBefore: stockMovements.stockBefore,
        stockAfter: stockMovements.stockAfter,
        reason: stockMovements.reason,
        reference: stockMovements.reference,
        createdBy: stockMovements.createdBy,
        createdAt: stockMovements.createdAt,
      })
      .from(stockMovements)
      .innerJoin(products, eq(stockMovements.productId, products.id))
      .where(condition)
      .orderBy(desc(stockMovements.createdAt), desc(stockMovements.id))
      .limit(limit)
      .offset(offset);
    const [{ total }] = await db
      .select({ total: count() })
      .from(stockMovements)
      .innerJoin(products, eq(stockMovements.productId, products.id))
      .where(condition);

    return NextResponse.json({
      movements: rows,
      total,
      limit,
      offset,
      filters: {
        productId: productId || null,
        type: type || null,
        query: query || null,
        from: from?.toISOString() ?? null,
        to: to?.toISOString() ?? null,
      },
    });
  } catch (error) {
    console.error("Failed to list stock movements", error);
    return NextResponse.json(
      { error: { code: "STOCK_HISTORY_FAILED", message: "Gagal memuat riwayat stok" } },
      { status: 500 },
    );
  }
}
