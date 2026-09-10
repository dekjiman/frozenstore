import { randomUUID } from "node:crypto";
import { asc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { testimonials } from "@/db/schema";
import { requireAdmin } from "@/lib/admin-auth";
import { revalidateCacheTag, CACHE_TAGS } from "@/lib/cache";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const rows = await db
      .select()
      .from(testimonials)
      .orderBy(asc(testimonials.sortOrder));

    return NextResponse.json({ data: rows });
  } catch (error) {
    console.error("Failed to list testimonials", error);
    return NextResponse.json(
      { error: { code: "TESTIMONIALS_LIST_FAILED", message: "Gagal memuat daftar testimonial" } },
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

    await db.insert(testimonials).values({
      id,
      customerName: (body.customerName as string) ?? "",
      customerTitle: (body.customerTitle as string) ?? null,
      quote: (body.quote as string) ?? "",
      rating: (body.rating as number) ?? 5,
      avatarUrl: (body.avatarUrl as string) ?? null,
      sortOrder: (body.sortOrder as number) ?? 0,
      isPublished: (body.isPublished as boolean) ?? true,
      createdAt: now,
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
    console.error("Failed to create testimonial", error);
    return NextResponse.json(
      { error: { code: "TESTIMONIAL_CREATE_FAILED", message: "Gagal membuat testimonial" } },
      { status: 500 },
    );
  }
}
