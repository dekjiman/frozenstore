import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { updateMedia, deleteMedia } from "@/lib/product-media-service";
import { revalidateCacheTag, CACHE_TAGS } from "@/lib/cache";

export const runtime = "nodejs";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; mediaId: string }> },
) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  const { id, mediaId } = await params;

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const updates: { altText?: string; title?: string; isPrimary?: boolean } = {};

    if (typeof body.altText === "string") updates.altText = body.altText;
    if (typeof body.title === "string") updates.title = body.title;
    if (typeof body.isPrimary === "boolean") updates.isPrimary = body.isPrimary;

    const result = await updateMedia(id, mediaId, updates);

    if ("error" in result) {
      const status = result.code === "MEDIA_NOT_FOUND" ? 404 : 400;
      return NextResponse.json(
        { error: { code: result.code, message: result.error } },
        { status },
      );
    }

    revalidateCacheTag(CACHE_TAGS.PRODUCTS);
    revalidateCacheTag(CACHE_TAGS.HOMEPAGE);

    return NextResponse.json({ data: result.data });
  } catch (error) {
    console.error("Failed to update media", error);
    return NextResponse.json(
      { error: { code: "MEDIA_UPDATE_FAILED", message: "Gagal memperbarui media" } },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; mediaId: string }> },
) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  const { id, mediaId } = await params;

  try {
    const result = await deleteMedia(id, mediaId);

    if (!result.success) {
      const status = result.error?.includes("tidak ditemukan") ? 404 : 400;
      return NextResponse.json(
        { error: { code: "DELETE_FAILED", message: result.error } },
        { status },
      );
    }

    revalidateCacheTag(CACHE_TAGS.PRODUCTS);
    revalidateCacheTag(CACHE_TAGS.HOMEPAGE);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Failed to delete media", error);
    return NextResponse.json(
      { error: { code: "MEDIA_DELETE_FAILED", message: "Gagal menghapus media" } },
      { status: 500 },
    );
  }
}
