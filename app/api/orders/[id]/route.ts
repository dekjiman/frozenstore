import { and, asc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { orderItems, orders } from "@/db/schema";
import { getCartSession } from "@/lib/cart-session";
import { getAuthenticatedUser } from "@/lib/auth-session";

export const runtime = "nodejs";

type OrderDetailContext = {
  params: Promise<{ id: string }>;
};

const paymentStatusLabels = {
  pending: "Menunggu Pembayaran",
  awaiting_verification: "Menunggu Verifikasi",
  paid: "Lunas",
  failed: "Pembayaran Ditolak",
} as const;

const orderStatusLabels = {
  waiting_payment: "Menunggu Pembayaran",
  processing: "Diproses",
  shipped: "Dikirim",
  delivered: "Selesai",
  cancelled: "Dibatalkan",
} as const;

export async function GET(request: Request, { params }: OrderDetailContext) {
  try {
    const { id } = await params;
    const session = getCartSession(request);
    if (session.isNew) {
      return NextResponse.json(
        { error: { code: "CART_SESSION_REQUIRED", message: "Sesi tidak valid" } },
        { status: 401 },
      );
    }

    const authenticated = await getAuthenticatedUser(request);
    const customerId = authenticated?.user.id ?? `guest:${session.key}`;
    const order = await db.query.orders.findFirst({
      where: and(eq(orders.id, id), eq(orders.customerId, customerId)),
    });

    if (!order) {
      return NextResponse.json(
        { error: { code: "ORDER_NOT_FOUND", message: "Pesanan tidak ditemukan" } },
        { status: 404 },
      );
    }

    const items = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, order.id))
      .orderBy(asc(orderItems.createdAt));

    return NextResponse.json({
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        createdAt: order.createdAt.toISOString(),
        shipping: {
          recipientName: order.recipientName,
          phone: order.recipientPhone,
          address: order.shippingAddress,
          city: order.shippingCity,
          province: order.shippingProvince,
          postalCode: order.shippingPostalCode,
          notes: order.shippingNotes,
        },
        items: items.map((item) => ({
          id: item.id,
          productId: item.productId,
          sku: item.productSku,
          name: item.productName,
          quantity: item.quantity,
          price: item.priceAtPurchase,
          lineTotal: item.priceAtPurchase * item.quantity,
        })),
        totals: {
          subtotal: order.subtotalAmount,
          shipping: order.shippingAmount,
          total: order.totalAmount,
        },
        payment: {
          status: order.paymentStatus,
          statusLabel: paymentStatusLabels[order.paymentStatus],
          proofUrl: order.paymentProofUrl,
        },
        status: order.orderStatus,
        statusLabel: orderStatusLabels[order.orderStatus],
      },
    });
  } catch (error) {
    console.error("Failed to get order summary", error);
    return NextResponse.json(
      { error: { code: "ORDER_SUMMARY_FAILED", message: "Gagal memuat ringkasan pesanan" } },
      { status: 500 },
    );
  }
}
