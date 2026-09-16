import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { qrisSettings } from "@/db/schema";
import { requireAdmin } from "@/lib/admin-auth";
import { parseQrisInput } from "@/lib/qris";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const row = await db.select().from(qrisSettings).limit(1);
    return NextResponse.json({ qris: row[0] ?? null });
  } catch (error) {
    console.error("Failed to load QRIS settings", error);
    return NextResponse.json(
      { error: { code: "QRIS_LIST_FAILED", message: "Gagal memuat pengaturan QRIS" } },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const parsed = parseQrisInput(body);
    if ("error" in parsed) {
      return NextResponse.json(
        { error: { code: "INVALID_QRIS", message: parsed.error } },
        { status: 400 },
      );
    }

    const now = new Date();
    const existing = await db.select({ id: qrisSettings.id }).from(qrisSettings).limit(1);

    if (existing[0]) {
      await db
        .update(qrisSettings)
        .set({ ...parsed.data, updatedAt: now })
        .where(eq(qrisSettings.id, existing[0].id))
        .execute();
    } else {
      await db
        .insert(qrisSettings)
        .values({ id: "default", ...parsed.data, createdAt: now, updatedAt: now })
        .execute();
    }

    const row = await db.select().from(qrisSettings).limit(1);
    return NextResponse.json({ qris: row[0] ?? null });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: { code: "INVALID_JSON", message: "Body JSON tidak valid" } },
        { status: 400 },
      );
    }
    console.error("Failed to save QRIS settings", error);
    return NextResponse.json(
      { error: { code: "QRIS_SAVE_FAILED", message: "Gagal menyimpan pengaturan QRIS" } },
      { status: 500 },
    );
  }
}