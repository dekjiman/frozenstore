import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { orders } from "@/db/schema";

export const MAX_INSTANT_SHIPPING_FEE = 1_000_000;

export type InstantFeeResult =
  | { ok: true; order: typeof orders.$inferSelect }
  | {
      ok: false;
      code: "ORDER_NOT_FOUND" | "ONLY_INSTANT_FEE" | "NOT_AWAITING_FEE" | "INVALID_SHIPPING_AMOUNT";
      message: string;
    };

export function parseShippingAmount(value: string | number | null | undefined): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? Math.max(0, Math.round(value)) : null;
  }
  if (typeof value === "string") {
    const digits = value.replace(/\D/g, "");
    if (!digits) return null;
    const parsed = Number(digits);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

export async function applyInstantShippingFee(input: {
  orderId: string;
  amount: number;
}): Promise<InstantFeeResult> {
  const current = await db.query.orders.findFirst({ where: eq(orders.id, input.orderId) });
  if (!current) {
    return { ok: false, code: "ORDER_NOT_FOUND", message: "Pesanan tidak ditemukan" };
  }
  if (current.shippingMethod !== "instant") {
    return {
      ok: false,
      code: "ONLY_INSTANT_FEE",
      message: "Biaya ongkir hanya bisa diatur untuk pesanan Instan.",
    };
  }
  if (current.orderStatus !== "waiting_shipping_fee") {
    return {
      ok: false,
      code: "NOT_AWAITING_FEE",
      message: "Pesanan tidak dalam status menunggu konfirmasi ongkir.",
    };
  }

  const amount = Math.max(0, Math.round(input.amount));
  if (amount > MAX_INSTANT_SHIPPING_FEE) {
    return {
      ok: false,
      code: "INVALID_SHIPPING_AMOUNT",
      message: `Biaya ongkir maksimal Rp ${MAX_INSTANT_SHIPPING_FEE.toLocaleString("id-ID")}.`,
    };
  }

  const [order] = await db
    .update(orders)
    .set({
      shippingAmount: amount,
      totalAmount: current.subtotalAmount + amount,
      orderStatus: "waiting_payment",
      updatedAt: new Date(),
    })
    .where(eq(orders.id, current.id))
    .returning();

  return { ok: true, order };
}