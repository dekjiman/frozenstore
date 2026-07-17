import { asc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { storeBankAccounts } from "@/db/schema";

export const runtime = "nodejs";

export async function GET() {
  try {
    const rows = await db
      .select()
      .from(storeBankAccounts)
      .where(eq(storeBankAccounts.isActive, true))
      .orderBy(asc(storeBankAccounts.displayOrder), asc(storeBankAccounts.bankName));

    return NextResponse.json({
      accounts: rows.map((row) => ({
        id: row.id,
        bankName: row.bankName,
        accountNumber: row.accountNumber,
        accountHolder: row.accountHolderName,
        instruction: row.instruction,
      })),
      total: rows.length,
    });
  } catch (error) {
    console.error("Failed to list active bank accounts", error);
    return NextResponse.json(
      { error: { code: "BANK_ACCOUNTS_LIST_FAILED", message: "Gagal memuat rekening tujuan" } },
      { status: 500 },
    );
  }
}
