import { randomUUID } from "node:crypto";
import { and, asc, eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { storeBankAccounts } from "@/db/schema";
import { requireAdmin } from "@/lib/admin-auth";
import { parseBankAccountInput } from "@/lib/bank-account";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const accounts = await db.select().from(storeBankAccounts).orderBy(asc(storeBankAccounts.displayOrder));
    return NextResponse.json({ accounts, total: accounts.length });
  } catch (error) {
    console.error("Failed to list bank accounts", error);
    return NextResponse.json({ error: { code: "BANK_ACCOUNTS_LIST_FAILED", message: "Gagal memuat rekening" } }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const parsed = parseBankAccountInput(body);
    if ("error" in parsed) {
      return NextResponse.json(
        { error: { code: "INVALID_BANK_ACCOUNT", message: parsed.error } },
        { status: 400 },
      );
    }

    const duplicate = await db.query.storeBankAccounts.findFirst({
      where: and(
        sql`lower(${storeBankAccounts.bankName}) = lower(${parsed.data.bankName})`,
        eq(storeBankAccounts.accountNumber, parsed.data.accountNumber),
      ),
      columns: { id: true },
    });
    if (duplicate) return NextResponse.json({ error: { code: "BANK_ACCOUNT_EXISTS", message: "Rekening bank sudah terdaftar" } }, { status: 409 });

    const now = new Date();
    const account = {
      id: randomUUID(), ...parsed.data, createdAt: now, updatedAt: now,
    };
    await db.insert(storeBankAccounts).values(account);
    return NextResponse.json({ account }, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError) return NextResponse.json({ error: { code: "INVALID_JSON", message: "Body JSON tidak valid" } }, { status: 400 });
    if (error instanceof Error && error.message.includes("UNIQUE constraint failed")) return NextResponse.json({ error: { code: "BANK_ACCOUNT_EXISTS", message: "Rekening bank sudah terdaftar" } }, { status: 409 });
    console.error("Failed to create bank account", error);
    return NextResponse.json({ error: { code: "BANK_ACCOUNT_CREATE_FAILED", message: "Gagal membuat rekening" } }, { status: 500 });
  }
}
