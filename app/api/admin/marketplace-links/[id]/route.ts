import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { marketplaceLinks } from "@/db/schema";
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

    if ("marketplace" in body) updates.marketplace = body.marketplace;
    if ("label" in body) updates.label = body.label;
    if ("url" in body) updates.url = body.url;
    if ("logoUrl" in body) updates.logoUrl = body.logoUrl;
    if ("sortOrder" in body) updates.sortOrder = body.sortOrder;
    if ("isActive" in body) updates.isActive = body.isActive;

    await db.update(marketplaceLinks).set(updates).where(eq(marketplaceLinks.id, id));

    revalidateCacheTag(CACHE_TAGS.HOMEPAGE);

    return NextResponse.json({ data: { id } });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: { code: "INVALID_JSON", message: "Body JSON tidak valid" } },
        { status: 400 },
      );
    }
    console.error("Failed to update marketplace link", error);
    return NextResponse.json(
      { error: { code: "MARKETPLACE_LINK_UPDATE_FAILED", message: "Gagal mengupdate marketplace link" } },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  const { id } = await params;

  try {
    await db.delete(marketplaceLinks).where(eq(marketplaceLinks.id, id));
    revalidateCacheTag(CACHE_TAGS.HOMEPAGE);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Failed to delete marketplace link", error);
    return NextResponse.json(
      { error: { code: "MARKETPLACE_LINK_DELETE_FAILED", message: "Gagal menghapus marketplace link" } },
      { status: 500 },
    );
  }
}
