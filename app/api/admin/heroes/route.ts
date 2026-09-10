import { randomUUID } from "node:crypto";
import { asc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { heroCampaigns } from "@/db/schema";
import { requireAdmin } from "@/lib/admin-auth";
import { revalidateCacheTag, CACHE_TAGS } from "@/lib/cache";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const rows = await db
      .select()
      .from(heroCampaigns)
      .orderBy(asc(heroCampaigns.sortOrder));

    return NextResponse.json({ data: rows });
  } catch (error) {
    console.error("Failed to list hero campaigns", error);
    return NextResponse.json(
      { error: { code: "HEROES_LIST_FAILED", message: "Gagal memuat daftar hero campaign" } },
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
    const now = new Date();

    await db.insert(heroCampaigns).values({
      id,
      eyebrow: (body.eyebrow as string) ?? null,
      title: (body.title as string) ?? "",
      highlightedText: (body.highlightedText as string) ?? null,
      description: (body.description as string) ?? null,
      imageUrl: (body.imageUrl as string) ?? null,
      imageAlt: (body.imageAlt as string) ?? null,
      primaryCtaLabel: (body.primaryCtaLabel as string) ?? null,
      primaryCtaUrl: (body.primaryCtaUrl as string) ?? null,
      secondaryCtaLabel: (body.secondaryCtaLabel as string) ?? null,
      secondaryCtaUrl: (body.secondaryCtaUrl as string) ?? null,
      sortOrder: (body.sortOrder as number) ?? 0,
      isActive: (body.isActive as boolean) ?? true,
      startsAt: body.startsAt ? new Date(body.startsAt as string) : null,
      endsAt: body.endsAt ? new Date(body.endsAt as string) : null,
      createdAt: now,
      updatedAt: now,
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
    console.error("Failed to create hero campaign", error);
    return NextResponse.json(
      { error: { code: "HERO_CREATE_FAILED", message: "Gagal membuat hero campaign" } },
      { status: 500 },
    );
  }
}
