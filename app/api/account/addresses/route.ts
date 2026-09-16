import { and, desc, eq, isNotNull, not } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { orders } from "@/db/schema";
import { getAuthenticatedUser } from "@/lib/auth-session";

export async function GET(request: Request) {
  try {
    const authenticated = await getAuthenticatedUser(request);
    if (!authenticated) return NextResponse.json({ error: { code: "UNAUTHENTICATED", message: "Silakan masuk terlebih dahulu" } }, { status: 401 });

    const rows = await db
      .select()
      .from(orders)
      .where(
        and(
          eq(orders.userId, authenticated.user.id),
          not(eq(orders.orderStatus, "cancelled")),
          isNotNull(orders.shippingAddress),
        ),
      )
      .orderBy(desc(orders.createdAt))
      .limit(100);

    const seen = new Set<string>();
    const addresses: Array<{
      id: string;
      recipientName: string;
      phone: string;
      address: string;
      city: string;
      province: string;
      postalCode: string;
      notes: string;
      createdAt: string;
    }> = [];

    for (const order of rows) {
      const key = [
        order.recipientName,
        order.recipientPhone,
        order.shippingAddress,
        order.shippingCity,
        order.shippingProvince,
        order.shippingPostalCode,
      ]
        .join("|")
        .toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      addresses.push({
        id: order.id,
        recipientName: order.recipientName,
        phone: order.recipientPhone,
        address: order.shippingAddress,
        city: order.shippingCity,
        province: order.shippingProvince,
        postalCode: order.shippingPostalCode,
        notes: order.shippingNotes ?? "",
        createdAt: order.createdAt.toISOString(),
      });
      if (addresses.length >= 10) break;
    }

    return NextResponse.json({ addresses });
  } catch (error) {
    console.error("Failed to list saved addresses", error);
    return NextResponse.json({ error: { code: "ADDRESS_LIST_FAILED", message: "Gagal memuat alamat tersimpan" } }, { status: 500 });
  }
}