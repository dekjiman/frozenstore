import { randomUUID } from "node:crypto";
import { asc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { marketplaceLinks } from "@/db/schema";
import { requireAdmin } from "@/lib/admin-auth";
import { revalidateCacheTag, CACHE_TAGS } from "@/lib/cache";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const rows = await db
      .select()
      .from(marketplaceLinks)
      .orderBy(asc(marketplaceLinks.sortOrder));

    return NextResponse.json({ data: rows });
  } catch (error) {
    console.error("Failed to list marketplace links", error);
    return NextResponse.json(
      { error: { code: "MARKETPLACE_LINKS_LIST_FAILED", message: "Gagal memuat daftar marketplace link" } },
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

    await db.insert(marketplaceLinks).values({
      id,
      marketplace: (body.marketplace as string) ?? "",
      label: (body.label as string) ?? "",
      url: (body.url as string) ?? "",
      logoUrl: (body.logoUrl as string) ?? null,
      sortOrder: (body.sortOrder as number) ?? 0,
      isActive: (body.isActive as boolean) ?? true,
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
    console.error("Failed to create marketplace link", error);
    return NextResponse.json(
      { error: { code: "MARKETPLACE_LINK_CREATE_FAILED", message: "Gagal membuat marketplace link" } },
      { status: 500 },
    );
  }
}
