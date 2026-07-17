import { and, eq, isNull } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { products } from "@/db/schema";
import { toProduct } from "@/lib/product-mapper";

export const runtime = "nodejs";

type ProductRouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: ProductRouteContext) {
  try {
    const { id } = await params;

    if (!id.trim()) {
      return NextResponse.json(
        { error: { code: "INVALID_PRODUCT_ID", message: "ID produk wajib diisi" } },
        { status: 400 },
      );
    }

    const row = await db.query.products.findFirst({
      where: and(
        eq(products.id, id),
        eq(products.isActive, true),
        isNull(products.deletedAt),
      ),
    });

    if (!row) {
      return NextResponse.json(
        { error: { code: "PRODUCT_NOT_FOUND", message: "Produk tidak ditemukan" } },
        { status: 404 },
      );
    }

    return NextResponse.json({ product: toProduct(row) });
  } catch (error) {
    console.error("Failed to get product", error);

    return NextResponse.json(
      { error: { code: "PRODUCT_DETAIL_FAILED", message: "Gagal memuat detail produk" } },
      { status: 500 },
    );
  }
}
