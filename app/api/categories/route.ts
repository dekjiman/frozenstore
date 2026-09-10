import { asc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { categories } from "@/db/schema";

export const runtime = "nodejs";
export const revalidate = 300;

export async function GET() {
  try {
    const rows = await db.query.categories.findMany({
      where: eq(categories.isActive, true),
      orderBy: [asc(categories.sortOrder)],
    });

    return NextResponse.json({
      data: rows.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        imageUrl: c.imageUrl,
        iconKey: c.iconKey,
        sortOrder: c.sortOrder,
      })),
    });
  } catch (error) {
    console.error("Failed to list categories", error);
    return NextResponse.json(
      { error: { code: "CATEGORIES_FAILED", message: "Gagal memuat kategori" } },
      { status: 500 },
    );
  }
}
