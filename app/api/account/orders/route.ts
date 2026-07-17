import { count, desc, eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { orderItems, orders } from "@/db/schema";
import { getAuthenticatedUser } from "@/lib/auth-session";

const paymentStatusLabels = {
  pending: "Menunggu Pembayaran",
  awaiting_verification: "Menunggu Verifikasi",
  paid: "Lunas",
  failed: "Pembayaran Ditolak",
} as const;

const orderStatusLabels = {
  waiting_payment: "Menunggu Pembayaran",
  processing: "Diproses",
  shipped: "Sedang Dikirim",
  delivered: "Selesai",
  cancelled: "Dibatalkan",
} as const;

export async function GET(request: Request) {
  try {
    const authenticated = await getAuthenticatedUser(request);
    if (!authenticated) return NextResponse.json({ error: { code: "UNAUTHENTICATED", message: "Silakan masuk terlebih dahulu" } }, { status: 401 });

    const searchParams = new URL(request.url).searchParams;
    const page = Math.max(1, Number.parseInt(searchParams.get("page") ?? "1", 10) || 1);
    const limit = Math.min(50, Math.max(1, Number.parseInt(searchParams.get("limit") ?? "20", 10) || 20));
    const offset = (page - 1) * limit;

    const [rows, [{ total }]] = await Promise.all([
      db.select().from(orders).where(eq(orders.userId, authenticated.user.id)).orderBy(desc(orders.createdAt)).limit(limit).offset(offset),
      db.select({ total: count() }).from(orders).where(eq(orders.userId, authenticated.user.id)),
    ]);

    const items = rows.length > 0
      ? await db.select().from(orderItems).where(inArray(orderItems.orderId, rows.map((order) => order.id))).orderBy(orderItems.createdAt)
      : [];
    const itemsByOrder = new Map<string, typeof items>();
    for (const item of items) {
      const list = itemsByOrder.get(item.orderId) ?? [];
      list.push(item);
      itemsByOrder.set(item.orderId, list);
    }

    return NextResponse.json({
      orders: rows.map((order) => {
        const orderProducts = itemsByOrder.get(order.id) ?? [];
        return {
          id: order.id,
          orderNumber: order.orderNumber,
          createdAt: order.createdAt.toISOString(),
          itemCount: orderProducts.reduce((sum, item) => sum + item.quantity, 0),
          productNames: orderProducts.map((item) => item.productName),
          total: order.totalAmount,
          paymentStatus: order.paymentStatus,
          paymentStatusLabel: paymentStatusLabels[order.paymentStatus],
          status: order.orderStatus,
          statusLabel: orderStatusLabels[order.orderStatus],
        };
      }),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Failed to list order history", error);
    return NextResponse.json({ error: { code: "ORDER_HISTORY_FAILED", message: "Gagal memuat riwayat pesanan" } }, { status: 500 });
  }
}
