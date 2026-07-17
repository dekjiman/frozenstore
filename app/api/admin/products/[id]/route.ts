import { and, eq, isNull, ne, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { products } from "@/db/schema";
import { requireAdmin } from "@/lib/admin-auth";
import { parseProductInput, toAdminProduct } from "@/lib/admin-product";

export const runtime = "nodejs";

type Context = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Context) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const product = await db.query.products.findFirst({ where: eq(products.id, id) });
  if (!product) {
    return NextResponse.json(
      { error: { code: "PRODUCT_NOT_FOUND", message: "Produk tidak ditemukan" } },
      { status: 404 },
    );
  }
  return NextResponse.json({ product: toAdminProduct(product) });
}

export async function PATCH(request: Request, { params }: Context) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const { id } = await params;
    const existing = await db.query.products.findFirst({
      where: and(eq(products.id, id), isNull(products.deletedAt)),
    });
    if (!existing) {
      return NextResponse.json(
        { error: { code: "PRODUCT_NOT_FOUND", message: "Produk tidak ditemukan" } },
        { status: 404 },
      );
    }

    const body = (await request.json()) as Record<string, unknown>;
    if ("stock" in body || "currentStock" in body) {
      return NextResponse.json(
        { error: { code: "STOCK_UPDATE_NOT_ALLOWED", message: "Gunakan endpoint mutasi stok untuk mengubah stok" } },
        { status: 400 },
      );
    }
    const parsed = parseProductInput(body, existing);
    if ("error" in parsed) {
      return NextResponse.json(
        { error: { code: "INVALID_PRODUCT", message: parsed.error } },
        { status: 400 },
      );
    }

    const duplicate = await db.query.products.findFirst({
      where: and(
        sql`lower(${products.sku}) = lower(${parsed.data.sku})`,
        ne(products.id, id),
      ),
      columns: { id: true },
    });
    if (duplicate) {
      return NextResponse.json(
        { error: { code: "PRODUCT_SKU_EXISTS", message: "SKU sudah digunakan" } },
        { status: 409 },
      );
    }

    const updatedAt = new Date();
    await db.update(products).set({ ...parsed.data, updatedAt }).where(eq(products.id, id));
    return NextResponse.json({
      product: toAdminProduct({ ...existing, ...parsed.data, updatedAt }),
    });
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
    console.error("Failed to update product", error);
    return NextResponse.json(
      { error: { code: "PRODUCT_UPDATE_FAILED", message: "Gagal mengubah produk" } },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, { params }: Context) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const { id } = await params;
    const deletedAt = new Date();
    const rows = await db
      .update(products)
      .set({ isActive: false, deletedAt, updatedAt: deletedAt })
      .where(and(eq(products.id, id), isNull(products.deletedAt)))
      .returning({ id: products.id });
    if (rows.length === 0) {
      return NextResponse.json(
        { error: { code: "PRODUCT_NOT_FOUND", message: "Produk tidak ditemukan" } },
        { status: 404 },
      );
    }
    return NextResponse.json({ deleted: true, id, deletedAt });
  } catch (error) {
    console.error("Failed to delete product", error);
    return NextResponse.json(
      { error: { code: "PRODUCT_DELETE_FAILED", message: "Gagal menghapus produk" } },
      { status: 500 },
    );
  }
}
