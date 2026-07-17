import { asc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { transferInstructions } from "@/db/schema";

export const runtime = "nodejs";

export async function GET() {
  try {
    const rows = await db
      .select()
      .from(transferInstructions)
      .where(eq(transferInstructions.isActive, true))
      .orderBy(asc(transferInstructions.stepOrder));

    return NextResponse.json({
      instructions: rows.map((row) => ({
        id: row.id,
        title: row.title,
        instruction: row.instruction,
        step: row.stepOrder,
      })),
      total: rows.length,
    });
  } catch (error) {
    console.error("Failed to list transfer instructions", error);
    return NextResponse.json(
      { error: { code: "TRANSFER_INSTRUCTIONS_FAILED", message: "Gagal memuat instruksi transfer" } },
      { status: 500 },
    );
  }
}
