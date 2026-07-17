import { and, eq, ne } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { transferInstructions } from "@/db/schema";
import { requireAdmin } from "@/lib/admin-auth";
import { parseTransferInstructionInput } from "@/lib/transfer-instruction";

type Context = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Context) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;
  const { id } = await params;
  const instruction = await db.query.transferInstructions.findFirst({ where: eq(transferInstructions.id, id) });
  if (!instruction) return NextResponse.json({ error: { code: "TRANSFER_INSTRUCTION_NOT_FOUND", message: "Instruksi tidak ditemukan" } }, { status: 404 });
  return NextResponse.json({ instruction });
}

export async function PATCH(request: Request, { params }: Context) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;
  try {
    const { id } = await params;
    const existing = await db.query.transferInstructions.findFirst({ where: eq(transferInstructions.id, id) });
    if (!existing) return NextResponse.json({ error: { code: "TRANSFER_INSTRUCTION_NOT_FOUND", message: "Instruksi tidak ditemukan" } }, { status: 404 });
    const body = (await request.json()) as Record<string, unknown>;
    const parsed = parseTransferInstructionInput(body, existing);
    if ("error" in parsed) return NextResponse.json({ error: { code: "INVALID_TRANSFER_INSTRUCTION", message: parsed.error } }, { status: 400 });
    const duplicate = await db.query.transferInstructions.findFirst({
      where: and(eq(transferInstructions.stepOrder, parsed.data.stepOrder), ne(transferInstructions.id, id)),
      columns: { id: true },
    });
    if (duplicate) return NextResponse.json({ error: { code: "STEP_ORDER_EXISTS", message: "Urutan langkah sudah digunakan" } }, { status: 409 });
    const updates = { ...parsed.data, updatedAt: new Date() };
    await db.update(transferInstructions).set(updates).where(eq(transferInstructions.id, id));
    return NextResponse.json({ instruction: { ...existing, ...updates } });
  } catch (error) {
    if (error instanceof SyntaxError) return NextResponse.json({ error: { code: "INVALID_JSON", message: "Body JSON tidak valid" } }, { status: 400 });
    if (error instanceof Error && error.message.includes("UNIQUE constraint failed")) return NextResponse.json({ error: { code: "STEP_ORDER_EXISTS", message: "Urutan langkah sudah digunakan" } }, { status: 409 });
    console.error("Failed to update transfer instruction", error);
    return NextResponse.json({ error: { code: "TRANSFER_INSTRUCTION_UPDATE_FAILED", message: "Gagal mengubah instruksi" } }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: Context) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;
  const { id } = await params;
  const result = await db.delete(transferInstructions).where(eq(transferInstructions.id, id)).returning({ id: transferInstructions.id });
  if (result.length === 0) return NextResponse.json({ error: { code: "TRANSFER_INSTRUCTION_NOT_FOUND", message: "Instruksi tidak ditemukan" } }, { status: 404 });
  return NextResponse.json({ deleted: true, id });
}
