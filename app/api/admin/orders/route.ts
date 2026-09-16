import { and, desc, eq, gte, lte } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { orders } from "@/db/schema";
import { requireAdmin } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;
  try {
    const url = new URL(request.url);
    const rawFrom = url.searchParams.get("from");
    const rawTo = url.searchParams.get("to");
    const from =
      rawFrom && !Number.isNaN(new Date(rawFrom).getTime()) ? new Date(rawFrom) : null;
    const to =
      rawTo && !Number.isNaN(new Date(rawTo).getTime()) ? new Date(rawTo) : null;

    const validPayments = ["pending", "awaiting_verification", "paid", "failed"] as const;
    const validStatuses = [
      "waiting_shipping_fee",
      "waiting_payment",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ] as const;
    const rawPayment = url.searchParams.get("payment");
    const rawStatus = url.searchParams.get("status");
    const payment = validPayments.includes(rawPayment as (typeof validPayments)[number])
      ? (rawPayment as (typeof validPayments)[number])
      : null;
    const status = validStatuses.includes(rawStatus as (typeof validStatuses)[number])
      ? (rawStatus as (typeof validStatuses)[number])
      : null;

    const hasFilter = Boolean(from || to || payment || status);

    const rows = hasFilter
      ? await db.select().from(orders)
          .where(
            and(
              ...(from ? [gte(orders.createdAt, from)] : []),
              ...(to ? [lte(orders.createdAt, to)] : []),
              ...(payment ? [eq(orders.paymentStatus, payment)] : []),
              ...(status ? [eq(orders.orderStatus, status)] : []),
            ),
          )
          .orderBy(desc(orders.createdAt))
      : await db.select().from(orders).orderBy(desc(orders.createdAt));
    return NextResponse.json({ orders: rows, total: rows.length });
  } catch (error) {
    console.error("Failed to list admin orders", error);
    return NextResponse.json({ error: { code: "ADMIN_ORDERS_FAILED", message: "Gagal memuat pesanan" } }, { status: 500 });
  }
}
