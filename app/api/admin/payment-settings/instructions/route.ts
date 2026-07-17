import { randomUUID } from "node:crypto";
import { asc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { transferInstructions } from "@/db/schema";
import { requireAdmin } from "@/lib/admin-auth";
import { parseTransferInstructionInput } from "@/lib/transfer-instruction";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;
  try {
    const instructions = await db.select().from(transferInstructions).orderBy(asc(transferInstructions.stepOrder));
    return NextResponse.json({ instructions, total: instructions.length });
  } catch (error) {
    console.error("Failed to list transfer instructions", error);
    return NextResponse.json({ error: { code: "TRANSFER_INSTRUCTIONS_LIST_FAILED", message: "Gagal memuat instruksi" } }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const parsed = parseTransferInstructionInput(body);
    if ("error" in parsed) return NextResponse.json({ error: { code: "INVALID_TRANSFER_INSTRUCTION", message: parsed.error } }, { status: 400 });
    const duplicate = await db.query.transferInstructions.findFirst({
      where: eq(transferInstructions.stepOrder, parsed.data.stepOrder),
      columns: { id: true },
    });
    if (duplicate) return NextResponse.json({ error: { code: "STEP_ORDER_EXISTS", message: "Urutan langkah sudah digunakan" } }, { status: 409 });
    const now = new Date();
    const row = { id: randomUUID(), ...parsed.data, createdAt: now, updatedAt: now };
    await db.insert(transferInstructions).values(row);
    return NextResponse.json({ instruction: row }, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError) return NextResponse.json({ error: { code: "INVALID_JSON", message: "Body JSON tidak valid" } }, { status: 400 });
    if (error instanceof Error && error.message.includes("UNIQUE constraint failed")) return NextResponse.json({ error: { code: "STEP_ORDER_EXISTS", message: "Urutan langkah sudah digunakan" } }, { status: 409 });
    console.error("Failed to create transfer instruction", error);
    return NextResponse.json({ error: { code: "TRANSFER_INSTRUCTION_CREATE_FAILED", message: "Gagal membuat instruksi" } }, { status: 500 });
  }
}
