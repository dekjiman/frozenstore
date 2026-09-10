import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { testimonials } from "@/db/schema";
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

    if ("customerName" in body) updates.customerName = body.customerName;
    if ("customerTitle" in body) updates.customerTitle = body.customerTitle;
    if ("quote" in body) updates.quote = body.quote;
    if ("rating" in body) updates.rating = body.rating;
    if ("avatarUrl" in body) updates.avatarUrl = body.avatarUrl;
    if ("sortOrder" in body) updates.sortOrder = body.sortOrder;
    if ("isPublished" in body) updates.isPublished = body.isPublished;

    await db.update(testimonials).set(updates).where(eq(testimonials.id, id));

    revalidateCacheTag(CACHE_TAGS.HOMEPAGE);

    return NextResponse.json({ data: { id } });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: { code: "INVALID_JSON", message: "Body JSON tidak valid" } },
        { status: 400 },
      );
    }
    console.error("Failed to update testimonial", error);
    return NextResponse.json(
      { error: { code: "TESTIMONIAL_UPDATE_FAILED", message: "Gagal mengupdate testimonial" } },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  const { id } = await params;

  try {
    await db.delete(testimonials).where(eq(testimonials.id, id));
    revalidateCacheTag(CACHE_TAGS.HOMEPAGE);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Failed to delete testimonial", error);
    return NextResponse.json(
      { error: { code: "TESTIMONIAL_DELETE_FAILED", message: "Gagal menghapus testimonial" } },
      { status: 500 },
    );
  }
}
