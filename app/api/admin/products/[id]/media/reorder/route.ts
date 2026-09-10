import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { reorderMedia } from "@/lib/product-media-service";
import { revalidateCacheTag, CACHE_TAGS } from "@/lib/cache";

export const runtime = "nodejs";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  const { id } = await params;

  try {
    const body = (await request.json()) as { orderedIds?: string[] };

    if (!Array.isArray(body.orderedIds) || body.orderedIds.length === 0) {
      return NextResponse.json(
        { error: { code: "INVALID_BODY", message: "orderedIds harus berupa array non-kosong" } },
        { status: 400 },
      );
    }

    const result = await reorderMedia(id, body.orderedIds);

    if (!result.success) {
      return NextResponse.json(
        { error: { code: "REORDER_FAILED", message: result.error } },
        { status: 400 },
      );
    }

    revalidateCacheTag(CACHE_TAGS.PRODUCTS);
    revalidateCacheTag(CACHE_TAGS.HOMEPAGE);

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    console.error("Failed to reorder media", error);
    return NextResponse.json(
      { error: { code: "REORDER_FAILED", message: "Gagal mengurutkan media" } },
      { status: 500 },
    );
  }
}
