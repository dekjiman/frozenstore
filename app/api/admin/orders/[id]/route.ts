import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { orderItems, orders } from "@/db/schema";
import { requireAdmin } from "@/lib/admin-auth";

type Context = { params: Promise<{ id: string }> };

const PAYMENT_STATUSES = ["pending", "awaiting_verification", "paid", "failed"] as const;
const ORDER_STATUSES = [
  "waiting_payment",
  "waiting_shipping_fee",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;
type PaymentStatusValue = (typeof PAYMENT_STATUSES)[number];
type OrderStatusValue = (typeof ORDER_STATUSES)[number];

function shippingAmountValue(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return Math.max(0, Math.round(value));
  if (typeof value === "string" && value.trim() !== "" && Number.isFinite(Number(value))) return Math.max(0, Math.round(Number(value)));
  return null;
}

function isPaymentStatus(value: unknown): value is PaymentStatusValue {
  return (PAYMENT_STATUSES as readonly string[]).includes(String(value));
}

function isOrderStatus(value: unknown): value is OrderStatusValue {
  return (ORDER_STATUSES as readonly string[]).includes(String(value));
}

export async function GET(request: Request, { params }: Context) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;
  try {
    const { id } = await params;
    const order = await db.query.orders.findFirst({ where: eq(orders.id, id) });
    if (!order) return NextResponse.json({ error: { code: "ORDER_NOT_FOUND", message: "Pesanan tidak ditemukan" } }, { status: 404 });
    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id)).orderBy(orderItems.createdAt);
    return NextResponse.json({ order, items });
  } catch (error) {
    console.error("Failed to load admin order detail", error);
    return NextResponse.json({ error: { code: "ADMIN_ORDER_DETAIL_FAILED", message: "Gagal memuat detail pesanan" } }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: Context) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;
  try {
    const { id } = await params;
    const body = await request.json() as Record<string, unknown>;
    const paymentStatus = body.paymentStatus;
    const orderStatus = body.orderStatus;
    if (paymentStatus !== undefined && !isPaymentStatus(paymentStatus)) return NextResponse.json({ error: { code: "INVALID_PAYMENT_STATUS", message: "Status pembayaran tidak valid" } }, { status: 400 });
    if (orderStatus !== undefined && !isOrderStatus(orderStatus)) return NextResponse.json({ error: { code: "INVALID_ORDER_STATUS", message: "Status pesanan tidak valid" } }, { status: 400 });

    const current = await db.query.orders.findFirst({ where: eq(orders.id, id) });
    if (!current) return NextResponse.json({ error: { code: "ORDER_NOT_FOUND", message: "Pesanan tidak ditemukan" } }, { status: 404 });

    const updates: Partial<typeof orders.$inferInsert> = { updatedAt: new Date() };
    const newPay = (paymentStatus ?? current.paymentStatus) as PaymentStatusValue;
    let newPro = (orderStatus ?? current.orderStatus) as OrderStatusValue;

    if (body.shippingAmount !== undefined) {
      if (current.shippingMethod !== "instant") {
        return NextResponse.json({ error: { code: "ONLY_INSTANT_FEE", message: "Biaya ongkir hanya bisa diatur untuk pesanan Instan." } }, { status: 400 });
      }
      const shippingAmount = shippingAmountValue(body.shippingAmount);
      if (shippingAmount === null) return NextResponse.json({ error: { code: "INVALID_SHIPPING_AMOUNT", message: "Biaya ongkir tidak valid" } }, { status: 400 });
      updates.shippingAmount = shippingAmount;
      updates.totalAmount = current.subtotalAmount + shippingAmount;
      if (current.orderStatus === "waiting_shipping_fee" && orderStatus === undefined) {
        newPro = "waiting_payment";
      }
    }

    if (newPay === "paid") {
      if (
        current.shippingMethod === "instant" &&
        current.orderStatus === "waiting_shipping_fee" &&
        body.shippingAmount === undefined
      ) {
        return NextResponse.json({ error: { code: "ONGKIR_TERLEBIH_DULU", message: "Isi biaya ongkir terlebih dahulu sebelum menandai pesanan Instan Lunas." } }, { status: 400 });
      }
      if (newPro === "waiting_payment" || newPro === "waiting_shipping_fee") {
        newPro = "processing";
      }
    } else if (
      paymentStatus !== undefined &&
      orderStatus === undefined &&
      (newPay === "pending" || newPay === "failed")
    ) {
      if (newPro === "processing" || newPro === "shipped" || newPro === "delivered") {
        newPro = "waiting_payment";
      }
    }

    if ((newPro === "processing" || newPro === "shipped" || newPro === "delivered") && newPay !== "paid") {
      return NextResponse.json({ error: { code: "PAYMENT_NOT_PAID", message: "Set status pembayaran Lunas terlebih dahulu sebelum menandai pesanan Diproses, Dikirim, atau Selesai." } }, { status: 400 });
    }

    if (newPro === "waiting_shipping_fee" && current.shippingMethod !== "instant") {
      return NextResponse.json({ error: { code: "INVALID_ORDER_STATUS", message: "Status Menunggu ongkir hanya berlaku untuk pesanan Instan." } }, { status: 400 });
    }

    if (paymentStatus !== undefined) updates.paymentStatus = newPay;
    if (newPro !== current.orderStatus) updates.orderStatus = newPro;

    const [order] = await db.update(orders).set(updates).where(eq(orders.id, id)).returning();
    return NextResponse.json({ order });
  } catch (error) {
    console.error("Failed to update admin order", error);
    return NextResponse.json({ error: { code: "ADMIN_ORDER_UPDATE_FAILED", message: "Gagal memperbarui pesanan" } }, { status: 500 });
  }
}