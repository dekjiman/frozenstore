import type { StoreBankAccountRow } from "@/db/schema";

type BankAccountInput = {
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  instruction: string;
  isActive: boolean;
  displayOrder: number;
};

export function parseBankAccountInput(
  body: Record<string, unknown>,
  existing?: StoreBankAccountRow,
): { data: BankAccountInput } | { error: string } {
  const bankName = typeof body.bankName === "string" ? body.bankName.trim() : existing?.bankName ?? "";
  const accountNumber = typeof body.accountNumber === "string"
    ? body.accountNumber.replace(/[\s-]/g, "")
    : existing?.accountNumber ?? "";
  const accountHolderName = typeof body.accountHolderName === "string"
    ? body.accountHolderName.trim()
    : existing?.accountHolderName ?? "";
  const instruction = typeof body.instruction === "string"
    ? body.instruction.trim()
    : existing?.instruction ?? "";
  const displayOrder = body.displayOrder === undefined
    ? existing?.displayOrder ?? 0
    : Number(body.displayOrder);
  const isActive = body.isActive === undefined ? existing?.isActive ?? true : body.isActive;

  if (bankName.length < 2 || bankName.length > 80) return { error: "Nama bank harus 2-80 karakter" };
  if (!/^\d{5,30}$/.test(accountNumber)) return { error: "Nomor rekening harus 5-30 digit" };
  if (accountHolderName.length < 3 || accountHolderName.length > 120) {
    return { error: "Nama pemilik rekening harus 3-120 karakter" };
  }
  if (instruction.length > 500) return { error: "Instruksi rekening maksimal 500 karakter" };
  if (!Number.isInteger(displayOrder) || displayOrder < 0 || displayOrder > 10_000) {
    return { error: "Urutan tampilan harus bilangan bulat antara 0 dan 10.000" };
  }
  if (typeof isActive !== "boolean") return { error: "Status aktif harus berupa boolean" };

  return {
    data: { bankName, accountNumber, accountHolderName, instruction, displayOrder, isActive },
  };
}
