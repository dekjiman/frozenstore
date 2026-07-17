import { asc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { storeBankAccounts, transferInstructions } from "@/db/schema";

export const runtime = "nodejs";

export async function GET() {
  try {
    const [accountRows, instructionRows] = await Promise.all([
      db
        .select()
        .from(storeBankAccounts)
        .where(eq(storeBankAccounts.isActive, true))
        .orderBy(asc(storeBankAccounts.displayOrder), asc(storeBankAccounts.bankName)),
      db
        .select()
        .from(transferInstructions)
        .where(eq(transferInstructions.isActive, true))
        .orderBy(asc(transferInstructions.stepOrder)),
    ]);

    const response = NextResponse.json({
      accounts: accountRows.map((row) => ({
        id: row.id,
        bankName: row.bankName,
        accountNumber: row.accountNumber,
        accountHolder: row.accountHolderName,
        instruction: row.instruction,
      })),
      instructions: instructionRows.map((row) => ({
        id: row.id,
        title: row.title,
        instruction: row.instruction,
        step: row.stepOrder,
      })),
      totals: {
        accounts: accountRows.length,
        instructions: instructionRows.length,
      },
    });
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error) {
    console.error("Failed to get public payment settings", error);
    return NextResponse.json(
      { error: { code: "PAYMENT_SETTINGS_FAILED", message: "Gagal memuat pengaturan pembayaran" } },
      { status: 500 },
    );
  }
}
