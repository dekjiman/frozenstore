import { randomUUID } from "node:crypto";
import { and, eq, isNull } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { products, stockMovements } from "@/db/schema";
import { requireAdmin } from "@/lib/admin-auth";
import { toAdminProduct } from "@/lib/admin-product";

export const runtime = "nodejs";

type Context = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Context) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const { id } = await params;
    const body = (await request.json()) as Record<string, unknown>;
    const quantity = Number(body.quantity);
    const reason = typeof body.reason === "string" ? body.reason.trim() : "";
    const reference = typeof body.reference === "string" ? body.reference.trim() : "";

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100_000) {
      return NextResponse.json(
        { error: { code: "INVALID_STOCK_QUANTITY", message: "Jumlah stok masuk harus bilangan bulat antara 1 dan 100.000" } },
        { status: 400 },
      );
    }
    if (reason.length < 3 || reason.length > 200) {
      return NextResponse.json(
        { error: { code: "INVALID_STOCK_REASON", message: "Alasan stok masuk harus 3-200 karakter" } },
        { status: 400 },
      );
    }
    if (reference.length > 100) {
      return NextResponse.json(
        { error: { code: "INVALID_STOCK_REFERENCE", message: "Referensi maksimal 100 karakter" } },
        { status: 400 },
      );
    }

    const product = await db.query.products.findFirst({
      where: and(eq(products.id, id), isNull(products.deletedAt)),
    });
    if (!product) {
      return NextResponse.json(
        { error: { code: "PRODUCT_NOT_FOUND", message: "Produk tidak ditemukan" } },
        { status: 404 },
      );
    }
    if (!product.isActive) {
      return NextResponse.json(
        { error: { code: "PRODUCT_INACTIVE", message: "Stok produk nonaktif tidak dapat diubah" } },
        { status: 409 },
      );
    }

    const stockAfter = product.currentStock + quantity;
    if (!Number.isSafeInteger(stockAfter) || stockAfter > 10_000_000) {
      return NextResponse.json(
        { error: { code: "STOCK_LIMIT_EXCEEDED", message: "Stok produk tidak boleh melebihi 10.000.000 unit" } },
        { status: 409 },
      );
    }

    const now = new Date();
    const movement = {
      id: randomUUID(),
      productId: product.id,
      type: "in" as const,
      quantity,
      stockBefore: product.currentStock,
      stockAfter,
      reason,
      reference: reference || null,
      createdBy: null,
      createdAt: now,
    };

    await db.transaction(async (transaction) => {
      await transaction
        .update(products)
        .set({ currentStock: stockAfter, updatedAt: now })
        .where(and(eq(products.id, product.id), eq(products.currentStock, product.currentStock)))
        .execute();
      await transaction.insert(stockMovements).values(movement).execute();
    });

    return NextResponse.json(
      {
        product: toAdminProduct({ ...product, currentStock: stockAfter, updatedAt: now }),
        movement,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: { code: "INVALID_JSON", message: "Body JSON tidak valid" } },
        { status: 400 },
      );
    }
    console.error("Failed to record incoming stock", error);
    return NextResponse.json(
      { error: { code: "STOCK_UPDATE_FAILED", message: "Gagal mencatat stok masuk" } },
      { status: 500 },
    );
  }
}
