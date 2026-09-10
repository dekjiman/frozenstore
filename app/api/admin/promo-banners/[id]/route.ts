import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { promoBanners } from "@/db/schema";
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

    if ("title" in body) updates.title = body.title;
    if ("subtitle" in body) updates.subtitle = body.subtitle;
    if ("badgeText" in body) updates.badgeText = body.badgeText;
    if ("imageUrl" in body) updates.imageUrl = body.imageUrl;
    if ("backgroundVariant" in body) updates.backgroundVariant = body.backgroundVariant;
    if ("ctaLabel" in body) updates.ctaLabel = body.ctaLabel;
    if ("ctaUrl" in body) updates.ctaUrl = body.ctaUrl;
    if ("placement" in body) updates.placement = body.placement;
    if ("sortOrder" in body) updates.sortOrder = body.sortOrder;
    if ("isActive" in body) updates.isActive = body.isActive;
    if ("startsAt" in body) updates.startsAt = body.startsAt ? new Date(body.startsAt as string) : null;
    if ("endsAt" in body) updates.endsAt = body.endsAt ? new Date(body.endsAt as string) : null;

    await db.update(promoBanners).set(updates).where(eq(promoBanners.id, id));

    revalidateCacheTag(CACHE_TAGS.HOMEPAGE);

    return NextResponse.json({ data: { id } });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: { code: "INVALID_JSON", message: "Body JSON tidak valid" } },
        { status: 400 },
      );
    }
    console.error("Failed to update promo banner", error);
    return NextResponse.json(
      { error: { code: "PROMO_BANNER_UPDATE_FAILED", message: "Gagal mengupdate promo banner" } },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  const { id } = await params;

  try {
    await db.delete(promoBanners).where(eq(promoBanners.id, id));
    revalidateCacheTag(CACHE_TAGS.HOMEPAGE);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Failed to delete promo banner", error);
    return NextResponse.json(
      { error: { code: "PROMO_BANNER_DELETE_FAILED", message: "Gagal menghapus promo banner" } },
      { status: 500 },
    );
  }
}
