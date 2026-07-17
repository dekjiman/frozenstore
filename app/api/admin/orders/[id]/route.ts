import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { orders } from "@/db/schema";
import { requireAdmin } from "@/lib/admin-auth";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Context) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;
  try {
    const { id } = await params;
    const body = await request.json() as Record<string, unknown>;
    const paymentStatus = body.paymentStatus;
    const orderStatus = body.orderStatus;
    if (paymentStatus !== undefined && !["pending", "awaiting_verification", "paid", "failed"].includes(String(paymentStatus))) return NextResponse.json({ error: { code: "INVALID_PAYMENT_STATUS", message: "Status pembayaran tidak valid" } }, { status: 400 });
    if (orderStatus !== undefined && !["waiting_payment", "processing", "shipped", "delivered", "cancelled"].includes(String(orderStatus))) return NextResponse.json({ error: { code: "INVALID_ORDER_STATUS", message: "Status pesanan tidak valid" } }, { status: 400 });
    const updates: Partial<typeof orders.$inferInsert> = { updatedAt: new Date() };
    if (paymentStatus !== undefined) updates.paymentStatus = paymentStatus as typeof orders.$inferSelect["paymentStatus"];
    if (orderStatus !== undefined) updates.orderStatus = orderStatus as typeof orders.$inferSelect["orderStatus"];
    if (paymentStatus === "paid" && orderStatus === undefined) updates.orderStatus = "processing";
    const [order] = await db.update(orders).set(updates).where(eq(orders.id, id)).returning();
    if (!order) return NextResponse.json({ error: { code: "ORDER_NOT_FOUND", message: "Pesanan tidak ditemukan" } }, { status: 404 });
    return NextResponse.json({ order });
  } catch (error) {
    console.error("Failed to update admin order", error);
    return NextResponse.json({ error: { code: "ADMIN_ORDER_UPDATE_FAILED", message: "Gagal memperbarui pesanan" } }, { status: 500 });
  }
}
