import { desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { orders } from "@/db/schema";
import { requireAdmin } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;
  try {
    const rows = await db.select().from(orders).orderBy(desc(orders.createdAt));
    return NextResponse.json({ orders: rows, total: rows.length });
  } catch (error) {
    console.error("Failed to list admin orders", error);
    return NextResponse.json({ error: { code: "ADMIN_ORDERS_FAILED", message: "Gagal memuat pesanan" } }, { status: 500 });
  }
}
