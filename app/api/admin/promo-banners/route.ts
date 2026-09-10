import { randomUUID } from "node:crypto";
import { asc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { promoBanners } from "@/db/schema";
import { requireAdmin } from "@/lib/admin-auth";
import { revalidateCacheTag, CACHE_TAGS } from "@/lib/cache";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const rows = await db
      .select()
      .from(promoBanners)
      .orderBy(asc(promoBanners.sortOrder));

    return NextResponse.json({ data: rows });
  } catch (error) {
    console.error("Failed to list promo banners", error);
    return NextResponse.json(
      { error: { code: "PROMO_BANNERS_LIST_FAILED", message: "Gagal memuat daftar promo banner" } },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const id = randomUUID();

    await db.insert(promoBanners).values({
      id,
      title: (body.title as string) ?? "",
      subtitle: (body.subtitle as string) ?? null,
      badgeText: (body.badgeText as string) ?? null,
      imageUrl: (body.imageUrl as string) ?? null,
      backgroundVariant: (body.backgroundVariant as string) ?? null,
      ctaLabel: (body.ctaLabel as string) ?? null,
      ctaUrl: (body.ctaUrl as string) ?? null,
      placement: (body.placement as string) ?? null,
      sortOrder: (body.sortOrder as number) ?? 0,
      isActive: (body.isActive as boolean) ?? true,
      startsAt: body.startsAt ? new Date(body.startsAt as string) : null,
      endsAt: body.endsAt ? new Date(body.endsAt as string) : null,
    });

    revalidateCacheTag(CACHE_TAGS.HOMEPAGE);

    return NextResponse.json({ data: { id } }, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: { code: "INVALID_JSON", message: "Body JSON tidak valid" } },
        { status: 400 },
      );
    }
    console.error("Failed to create promo banner", error);
    return NextResponse.json(
      { error: { code: "PROMO_BANNER_CREATE_FAILED", message: "Gagal membuat promo banner" } },
      { status: 500 },
    );
  }
}
