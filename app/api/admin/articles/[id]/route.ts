import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { articles } from "@/db/schema";
import { requireAdmin } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const p = await params;
    const id = p.id;
    const row = await db.query.articles.findFirst({
      where: eq(articles.id, id),
    });

    if (!row) {
      return NextResponse.json(
        { error: { code: "ARTICLE_NOT_FOUND", message: "Artikel tidak ditemukan" } },
        { status: 404 },
      );
    }

    return NextResponse.json({ data: row });
  } catch (error) {
    console.error("Failed to fetch article", error);
    return NextResponse.json(
      { error: { code: "ARTICLE_FETCH_FAILED", message: "Gagal memuat artikel" } },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const p = await params;
    const id = p.id;
    const body = await request.json();

    const title = typeof body.title === "string" ? body.title.trim() : undefined;
    const content = typeof body.content === "string" ? body.content.trim() : undefined;
    const excerpt = typeof body.excerpt === "string" ? body.excerpt.trim() : undefined;
    const authorName = typeof body.authorName === "string" ? body.authorName.trim() : undefined;
    const coverImage = typeof body.coverImage === "string" ? body.coverImage.trim() : body.coverImage === null ? null : undefined;
    const isPublished = typeof body.isPublished === "boolean" ? body.isPublished : undefined;

    const updates: Partial<typeof articles.$inferInsert> = {};
    if (title !== undefined) updates.title = title;
    if (content !== undefined) updates.content = content;
    if (excerpt !== undefined) updates.excerpt = excerpt;
    if (authorName !== undefined) updates.authorName = authorName;
    if (coverImage !== undefined) updates.coverImage = coverImage;
    if (isPublished !== undefined) updates.isPublished = isPublished;

    await db.update(articles).set(updates).where(eq(articles.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update article", error);
    return NextResponse.json(
      { error: { code: "ARTICLE_UPDATE_FAILED", message: "Gagal mengupdate artikel" } },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const p = await params;
    const id = p.id;

    await db.delete(articles).where(eq(articles.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete article", error);
    return NextResponse.json(
      { error: { code: "ARTICLE_DELETE_FAILED", message: "Gagal menghapus artikel" } },
      { status: 500 },
    );
  }
}
