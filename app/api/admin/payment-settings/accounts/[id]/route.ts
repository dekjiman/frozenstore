import { and, eq, ne, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { storeBankAccounts } from "@/db/schema";
import { requireAdmin } from "@/lib/admin-auth";
import { parseBankAccountInput } from "@/lib/bank-account";

type Context = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Context) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;
  const { id } = await params;
  const account = await db.query.storeBankAccounts.findFirst({ where: eq(storeBankAccounts.id, id) });
  if (!account) return NextResponse.json({ error: { code: "BANK_ACCOUNT_NOT_FOUND", message: "Rekening tidak ditemukan" } }, { status: 404 });
  return NextResponse.json({ account });
}

export async function PATCH(request: Request, { params }: Context) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;
  try {
    const { id } = await params;
    const existing = await db.query.storeBankAccounts.findFirst({ where: eq(storeBankAccounts.id, id) });
    if (!existing) return NextResponse.json({ error: { code: "BANK_ACCOUNT_NOT_FOUND", message: "Rekening tidak ditemukan" } }, { status: 404 });
    const body = (await request.json()) as Record<string, unknown>;
    const parsed = parseBankAccountInput(body, existing);
    if ("error" in parsed) return NextResponse.json({ error: { code: "INVALID_BANK_ACCOUNT", message: parsed.error } }, { status: 400 });
    const duplicate = await db.query.storeBankAccounts.findFirst({
      where: and(
        sql`lower(${storeBankAccounts.bankName}) = lower(${parsed.data.bankName})`,
        eq(storeBankAccounts.accountNumber, parsed.data.accountNumber),
        ne(storeBankAccounts.id, id),
      ),
      columns: { id: true },
    });
    if (duplicate) return NextResponse.json({ error: { code: "BANK_ACCOUNT_EXISTS", message: "Rekening bank sudah terdaftar" } }, { status: 409 });
    const updates = { ...parsed.data, updatedAt: new Date() };
    await db.update(storeBankAccounts).set(updates).where(eq(storeBankAccounts.id, id));
    return NextResponse.json({ account: { ...existing, ...updates } });
  } catch (error) {
    if (error instanceof SyntaxError) return NextResponse.json({ error: { code: "INVALID_JSON", message: "Body JSON tidak valid" } }, { status: 400 });
    if (error instanceof Error && error.message.includes("UNIQUE constraint failed")) return NextResponse.json({ error: { code: "BANK_ACCOUNT_EXISTS", message: "Rekening bank sudah terdaftar" } }, { status: 409 });
    console.error("Failed to update bank account", error);
    return NextResponse.json({ error: { code: "BANK_ACCOUNT_UPDATE_FAILED", message: "Gagal mengubah rekening" } }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: Context) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;
  const { id } = await params;
  const result = await db.delete(storeBankAccounts).where(eq(storeBankAccounts.id, id)).returning({ id: storeBankAccounts.id });
  if (result.length === 0) return NextResponse.json({ error: { code: "BANK_ACCOUNT_NOT_FOUND", message: "Rekening tidak ditemukan" } }, { status: 404 });
  return NextResponse.json({ deleted: true, id });
}
