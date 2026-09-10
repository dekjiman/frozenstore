import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { categories } from "@/db/schema";
import { requireAdmin } from "@/lib/admin-auth";
import { revalidateCacheTag, CACHE_TAGS } from "@/lib/cache";

export const runtime = "nodejs";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  const { id } = await params;

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const updates: Record<string, unknown> = {};

    if ("name" in body) updates.name = body.name;
    if ("slug" in body) updates.slug = body.slug;
    if ("description" in body) updates.description = body.description;
    if ("imageUrl" in body) updates.imageUrl = body.imageUrl;
    if ("iconKey" in body) updates.iconKey = body.iconKey;
    if ("sortOrder" in body) updates.sortOrder = body.sortOrder;
    if ("isActive" in body) updates.isActive = body.isActive;
    updates.updatedAt = new Date();

    await db.update(categories).set(updates).where(eq(categories.id, id));

    revalidateCacheTag(CACHE_TAGS.CATEGORIES);
    revalidateCacheTag(CACHE_TAGS.HOMEPAGE);

    return NextResponse.json({ data: { id } });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: { code: "INVALID_JSON", message: "Body JSON tidak valid" } },
        { status: 400 },
      );
    }
    console.error("Failed to update category", error);
    return NextResponse.json(
      { error: { code: "CATEGORY_UPDATE_FAILED", message: "Gagal mengupdate kategori" } },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  const { id } = await params;

  try {
    await db.delete(categories).where(eq(categories.id, id));
    revalidateCacheTag(CACHE_TAGS.CATEGORIES);
    revalidateCacheTag(CACHE_TAGS.HOMEPAGE);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Failed to delete category", error);
    return NextResponse.json(
      { error: { code: "CATEGORY_DELETE_FAILED", message: "Gagal menghapus kategori" } },
      { status: 500 },
    );
  }
}
