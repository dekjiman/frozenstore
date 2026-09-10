import { randomUUID } from "node:crypto";
import { asc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { categories } from "@/db/schema";
import { requireAdmin } from "@/lib/admin-auth";
import { revalidateCacheTag, CACHE_TAGS } from "@/lib/cache";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const rows = await db
      .select()
      .from(categories)
      .orderBy(asc(categories.sortOrder));

    return NextResponse.json({ data: rows });
  } catch (error) {
    console.error("Failed to list categories", error);
    return NextResponse.json(
      { error: { code: "CATEGORIES_LIST_FAILED", message: "Gagal memuat daftar kategori" } },
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

    await db.insert(categories).values({
      id,
      name: (body.name as string) ?? "",
      slug: (body.slug as string) ?? null,
      description: (body.description as string) ?? null,
      imageUrl: (body.imageUrl as string) ?? null,
      iconKey: (body.iconKey as string) ?? null,
      sortOrder: (body.sortOrder as number) ?? 0,
      isActive: (body.isActive as boolean) ?? true,
      createdAt: now,
      updatedAt: now,
    });

    revalidateCacheTag(CACHE_TAGS.CATEGORIES);
    revalidateCacheTag(CACHE_TAGS.HOMEPAGE);

    return NextResponse.json({ data: { id } }, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: { code: "INVALID_JSON", message: "Body JSON tidak valid" } },
        { status: 400 },
      );
    }
    console.error("Failed to create category", error);
    return NextResponse.json(
      { error: { code: "CATEGORY_CREATE_FAILED", message: "Gagal membuat kategori" } },
      { status: 500 },
    );
  }
}
