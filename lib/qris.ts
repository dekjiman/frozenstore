import type { QrisSettingRow } from "@/db/schema";

type QrisInput = {
  label: string;
  merchantName: string;
  payId: string;
  qrImageUrl: string;
  instruction: string;
  isActive: boolean;
};

export function parseQrisInput(
  body: Record<string, unknown>,
  existing?: QrisSettingRow,
): { data: QrisInput } | { error: string } {
  const label = typeof body.label === "string" ? body.label.trim() : existing?.label ?? "QRIS";
  const merchantName = typeof body.merchantName === "string" ? body.merchantName.trim() : existing?.merchantName ?? "";
  const payId = typeof body.payId === "string" ? body.payId.trim() : existing?.payId ?? "";
  const qrImageUrl = typeof body.qrImageUrl === "string" ? body.qrImageUrl.trim() : existing?.qrImageUrl ?? "";
  const instruction = typeof body.instruction === "string" ? body.instruction.trim() : existing?.instruction ?? "";
  const isActive = body.isActive === undefined ? existing?.isActive ?? true : body.isActive;

  if (label.length < 2 || label.length > 80) return { error: "Label QRIS harus 2-80 karakter" };
  if (merchantName.length < 3 || merchantName.length > 120) {
    return { error: "Nama merchant harus 3-120 karakter" };
  }
  if (payId.length < 5 || payId.length > 120) return { error: "Pay ID harus 5-120 karakter" };
  if (qrImageUrl.length > 1000) return { error: "URL gambar QR maksimal 1000 karakter" };
  if (instruction.length > 500) return { error: "Instruksi maksimal 500 karakter" };
  if (typeof isActive !== "boolean") return { error: "Status aktif harus berupa boolean" };

  return {
    data: { label, merchantName, payId, qrImageUrl, instruction, isActive },
  };
}