import { randomUUID } from "node:crypto";
import { asc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { trustItems } from "@/db/schema";
import { requireAdmin } from "@/lib/admin-auth";
import { revalidateCacheTag, CACHE_TAGS } from "@/lib/cache";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const rows = await db
      .select()
      .from(trustItems)
      .orderBy(asc(trustItems.sortOrder));

    return NextResponse.json({ data: rows });
  } catch (error) {
    console.error("Failed to list trust items", error);
    return NextResponse.json(
      { error: { code: "TRUST_ITEMS_LIST_FAILED", message: "Gagal memuat daftar trust item" } },
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

    await db.insert(trustItems).values({
      id,
      iconKey: (body.iconKey as string) ?? null,
      title: (body.title as string) ?? "",
      description: (body.description as string) ?? null,
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
    console.error("Failed to create trust item", error);
    return NextResponse.json(
      { error: { code: "TRUST_ITEM_CREATE_FAILED", message: "Gagal membuat trust item" } },
      { status: 500 },
    );
  }
}
