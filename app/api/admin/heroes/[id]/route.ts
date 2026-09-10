import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { heroCampaigns } from "@/db/schema";
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

    if ("eyebrow" in body) updates.eyebrow = body.eyebrow;
    if ("title" in body) updates.title = body.title;
    if ("highlightedText" in body) updates.highlightedText = body.highlightedText;
    if ("description" in body) updates.description = body.description;
    if ("imageUrl" in body) updates.imageUrl = body.imageUrl;
    if ("imageAlt" in body) updates.imageAlt = body.imageAlt;
    if ("primaryCtaLabel" in body) updates.primaryCtaLabel = body.primaryCtaLabel;
    if ("primaryCtaUrl" in body) updates.primaryCtaUrl = body.primaryCtaUrl;
    if ("secondaryCtaLabel" in body) updates.secondaryCtaLabel = body.secondaryCtaLabel;
    if ("secondaryCtaUrl" in body) updates.secondaryCtaUrl = body.secondaryCtaUrl;
    if ("sortOrder" in body) updates.sortOrder = body.sortOrder;
    if ("isActive" in body) updates.isActive = body.isActive;
    if ("startsAt" in body) updates.startsAt = body.startsAt ? new Date(body.startsAt as string) : null;
    if ("endsAt" in body) updates.endsAt = body.endsAt ? new Date(body.endsAt as string) : null;
    updates.updatedAt = new Date();

    await db.update(heroCampaigns).set(updates).where(eq(heroCampaigns.id, id));

    revalidateCacheTag(CACHE_TAGS.HOMEPAGE);

    return NextResponse.json({ data: { id } });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: { code: "INVALID_JSON", message: "Body JSON tidak valid" } },
        { status: 400 },
      );
    }
    console.error("Failed to update hero campaign", error);
    return NextResponse.json(
      { error: { code: "HERO_UPDATE_FAILED", message: "Gagal mengupdate hero campaign" } },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  const { id } = await params;

  try {
    await db.delete(heroCampaigns).where(eq(heroCampaigns.id, id));
    revalidateCacheTag(CACHE_TAGS.HOMEPAGE);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Failed to delete hero campaign", error);
    return NextResponse.json(
      { error: { code: "HERO_DELETE_FAILED", message: "Gagal menghapus hero campaign" } },
      { status: 500 },
    );
  }
}
