import { asc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { productMedia, products } from "@/db/schema";
import { requireAdmin } from "@/lib/admin-auth";
import { uploadMedia } from "@/lib/product-media-service";
import { revalidateCacheTag, CACHE_TAGS } from "@/lib/cache";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  const { id } = await params;

  try {
    const product = await db.query.products.findFirst({
      where: eq(products.id, id),
      columns: { id: true },
    });

    if (!product) {
      return NextResponse.json(
        { error: { code: "PRODUCT_NOT_FOUND", message: "Produk tidak ditemukan" } },
        { status: 404 },
      );
    }

    const media = await db.query.productMedia.findMany({
      where: eq(productMedia.productId, id),
      orderBy: [asc(productMedia.sortOrder)],
    });

    return NextResponse.json({ data: media });
  } catch (error) {
    console.error("Failed to list media", error);
    return NextResponse.json(
      { error: { code: "MEDIA_LIST_FAILED", message: "Gagal memuat daftar media" } },
      { status: 500 },
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  const { id } = await params;

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const altText = typeof formData.get("altText") === "string" ? (formData.get("altText") as string) : undefined;
    const title = typeof formData.get("title") === "string" ? (formData.get("title") as string) : undefined;
    const isPrimary = formData.get("isPrimary") === "true";

    if (!file) {
      return NextResponse.json(
        { error: { code: "NO_FILE", message: "File tidak ditemukan" } },
        { status: 400 },
      );
    }

    const result = await uploadMedia(id, file, { altText, title, isPrimary });

    if ("error" in result) {
      const status = result.code === "PRODUCT_NOT_FOUND" ? 404
        : result.code === "INVALID_MEDIA_TYPE" ? 400
        : result.code === "MEDIA_TOO_LARGE" ? 400
        : result.code === "MEDIA_LIMIT_EXCEEDED" ? 409
        : 500;
      return NextResponse.json(
        { error: { code: result.code, message: result.error } },
        { status },
      );
    }

    revalidateCacheTag(CACHE_TAGS.PRODUCTS);
    revalidateCacheTag(CACHE_TAGS.HOMEPAGE);

    return NextResponse.json({ data: result.data }, { status: 201 });
  } catch (error) {
    console.error("Failed to upload media", error);
    return NextResponse.json(
      { error: { code: "MEDIA_UPLOAD_FAILED", message: "Gagal mengupload media" } },
      { status: 500 },
    );
  }
}
