import type { TransferInstructionRow } from "@/db/schema";

type TransferInstructionInput = {
  title: string;
  instruction: string;
  stepOrder: number;
  isActive: boolean;
};

export function parseTransferInstructionInput(
  body: Record<string, unknown>,
  existing?: TransferInstructionRow,
): { data: TransferInstructionInput } | { error: string } {
  const title = typeof body.title === "string" ? body.title.trim() : existing?.title ?? "";
  const instruction = typeof body.instruction === "string"
    ? body.instruction.trim()
    : existing?.instruction ?? "";
  const stepOrder = body.stepOrder === undefined ? existing?.stepOrder ?? Number.NaN : Number(body.stepOrder);
  const isActive = body.isActive === undefined ? existing?.isActive ?? true : body.isActive;

  if (title.length < 2 || title.length > 100) return { error: "Judul harus 2-100 karakter" };
  if (instruction.length < 5 || instruction.length > 1_000) {
    return { error: "Isi instruksi harus 5-1.000 karakter" };
  }
  if (!Number.isInteger(stepOrder) || stepOrder < 1 || stepOrder > 10_000) {
    return { error: "Urutan langkah harus bilangan bulat antara 1 dan 10.000" };
  }
  if (typeof isActive !== "boolean") return { error: "Status aktif harus berupa boolean" };

  return { data: { title, instruction, stepOrder, isActive } };
}
