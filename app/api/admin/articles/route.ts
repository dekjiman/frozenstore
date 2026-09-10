import { NextResponse } from "next/server";
import { asc } from "drizzle-orm";
import { db } from "@/db/client";
import { articles } from "@/db/schema";
import { randomBytes } from "crypto";

export const runtime = "nodejs";

export async function GET() {
  try {
    const list = await db
      .select()
      .from(articles)
      .orderBy(asc(articles.createdAt));

    return NextResponse.json({ data: list });
  } catch (error) {
    console.error("Failed to list articles", error);
    return NextResponse.json(
      { error: { code: "ARTICLES_LIST_FAILED", message: "Gagal memuat daftar artikel" } },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const title = typeof body.title === "string" ? body.title.trim() : "";
    const content = typeof body.content === "string" ? body.content.trim() : "";
    const excerpt = typeof body.excerpt === "string" ? body.excerpt.trim() : "";
    const authorName = typeof body.authorName === "string" ? body.authorName.trim() : "Admin";
    const coverImage = typeof body.coverImage === "string" ? body.coverImage.trim() : null;
    const isPublished = typeof body.isPublished === "boolean" ? body.isPublished : true;

    if (!title || !content) {
      return NextResponse.json(
        { error: { code: "INVALID_ARTICLE_DATA", message: "Judul dan konten harus diisi" } },
        { status: 400 },
      );
    }

    // Generate slug
    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    const randomHex = randomBytes(4).toString("hex");
    const slug = `${baseSlug}-${randomHex}`;

    const newId = `article-${randomBytes(8).toString("hex")}`;

    await db.insert(articles).values({
      id: newId,
      title,
      slug,
      content,
      excerpt,
      authorName,
      coverImage,
      isPublished,
      publishedAt: isPublished ? new Date() : null,
    });

    return NextResponse.json({ success: true, id: newId }, { status: 201 });
  } catch (error) {
    console.error("Failed to create article", error);
    return NextResponse.json(
      { error: { code: "ARTICLE_CREATE_FAILED", message: "Gagal membuat artikel" } },
      { status: 500 },
    );
  }
}
