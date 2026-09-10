import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { trustItems } from "@/db/schema";
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

    if ("iconKey" in body) updates.iconKey = body.iconKey;
    if ("title" in body) updates.title = body.title;
    if ("description" in body) updates.description = body.description;
    if ("sortOrder" in body) updates.sortOrder = body.sortOrder;
    if ("isActive" in body) updates.isActive = body.isActive;

    await db.update(trustItems).set(updates).where(eq(trustItems.id, id));

    revalidateCacheTag(CACHE_TAGS.HOMEPAGE);

    return NextResponse.json({ data: { id } });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: { code: "INVALID_JSON", message: "Body JSON tidak valid" } },
        { status: 400 },
      );
    }
    console.error("Failed to update trust item", error);
    return NextResponse.json(
      { error: { code: "TRUST_ITEM_UPDATE_FAILED", message: "Gagal mengupdate trust item" } },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  const { id } = await params;

  try {
    await db.delete(trustItems).where(eq(trustItems.id, id));
    revalidateCacheTag(CACHE_TAGS.HOMEPAGE);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Failed to delete trust item", error);
    return NextResponse.json(
      { error: { code: "TRUST_ITEM_DELETE_FAILED", message: "Gagal menghapus trust item" } },
      { status: 500 },
    );
  }
}
