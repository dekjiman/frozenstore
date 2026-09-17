import { randomUUID } from "node:crypto";
import { and, desc, eq, gte, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { cartItems, carts, orderItems, orders } from "@/db/schema";
import { getCartPayload } from "@/lib/cart-service";
import { getCartSession } from "@/lib/cart-session";
import { createOrderNumber } from "@/lib/order-number";
import { getAuthenticatedUser } from "@/lib/auth-session";
import {
  decideShipping,
  readShippingSettings,
  type ShippingMethod,
} from "@/lib/shipping-service";
import { deductStockForOrder, StockUnavailableError } from "@/lib/stock-service";
import { buildOrderWhatsAppMessage } from "@/lib/order-message";
import { sendWhatsAppToAdmin } from "@/lib/whatsapp-notify";
import { issueAdminMagicLink } from "@/lib/magic-link";

export const runtime = "nodejs";

type ShippingRequest = {
  recipientName?: unknown;
  phone?: unknown;
  address?: unknown;
  city?: unknown;
  province?: unknown;
  postalCode?: unknown;
  notes?: unknown;
  method?: unknown;
};

const METHOD_LABELS: Record<ShippingMethod, string> = {
  regular: "Reguler",
  same_day: "Same Day (Grab / GoSend)",
  instant: "Instan (Grab/GoSend)",
};

const ACTIVE_ORDER_STATUSES = [
  "waiting_payment",
  "waiting_shipping_fee",
  "processing",
  "shipped",
  "delivered",
] as const;

const DUPLICATE_CHECK_WINDOW_MS = 15 * 60_000;

function stringValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  try {
    const session = getCartSession(request);
    if (session.isNew) {
      return NextResponse.json(
        { error: { code: "CART_SESSION_REQUIRED", message: "Sesi keranjang tidak valid" } },
        { status: 401 },
      );
    }

    const body = (await request.json()) as ShippingRequest;
    const shipping = {
      recipientName: stringValue(body.recipientName),
      phone: stringValue(body.phone).replace(/[\s-]/g, ""),
      address: stringValue(body.address),
      city: stringValue(body.city),
      province: stringValue(body.province),
      postalCode: stringValue(body.postalCode),
      notes: stringValue(body.notes),
    };
    const errors: Record<string, string> = {};

    if (shipping.recipientName.length < 3) errors.recipientName = "Nama penerima minimal 3 karakter";
    if (!/^(?:\+62|62|0)8\d{8,12}$/.test(shipping.phone)) errors.phone = "Nomor WhatsApp tidak valid";
    if (shipping.address.length < 15) errors.address = "Alamat minimal 15 karakter";
    if (shipping.city.length < 3) errors.city = "Kota wajib diisi";
    if (shipping.province.length < 3) errors.province = "Provinsi wajib diisi";
    if (shipping.postalCode && !/^\d{5}$/.test(shipping.postalCode)) errors.postalCode = "Kode pos harus 5 digit";
    if (shipping.notes.length > 250) errors.notes = "Catatan maksimal 250 karakter";

    let method: ShippingMethod | undefined;
    if (body.method === "regular" || body.method === "same_day" || body.method === "instant") {
      method = body.method;
    }
    if (!method) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_SHIPPING_DATA",
            message: "Data pengiriman tidak valid",
            fields: { method: "Pilih metode pengiriman terlebih dahulu" },
          },
        },
        { status: 400 },
      );
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { error: { code: "INVALID_SHIPPING_DATA", message: "Data pengiriman tidak valid", fields: errors } },
        { status: 400 },
      );
    }

    const cart = await db.query.carts.findFirst({
      where: eq(carts.sessionKey, session.key),
    });

    if (!cart) {
      return NextResponse.json(
        { error: { code: "CART_NOT_FOUND", message: "Keranjang tidak ditemukan" } },
        { status: 404 },
      );
    }

    const cartPayload = await getCartPayload(cart.id);
    if (cartPayload.items.length === 0) {
      return NextResponse.json(
        { error: { code: "EMPTY_CART", message: "Keranjang masih kosong" } },
        { status: 409 },
      );
    }

    const now = new Date();
    const shippingSettings = await readShippingSettings();

    if (method === "regular" && !shippingSettings.enableRegular) {
      return NextResponse.json(
        { error: { code: "METHOD_UNAVAILABLE", message: "Metode Reguler sedang tidak tersedia." } },
        { status: 400 },
      );
    }
    if (method === "same_day" && !shippingSettings.enableSameDay) {
      return NextResponse.json(
        { error: { code: "METHOD_UNAVAILABLE", message: "Metode Same Day sedang tidak tersedia." } },
        { status: 400 },
      );
    }
    if (method === "instant" && !shippingSettings.enableInstant) {
      return NextResponse.json(
        { error: { code: "METHOD_UNAVAILABLE", message: "Metode Instan sedang tidak tersedia." } },
        { status: 400 },
      );
    }

    const decision = decideShipping({
      method,
      settings: shippingSettings,
    });

    const authenticated = await getAuthenticatedUser(request);

    const existingOpenOrder = await db.query.orders.findFirst({
      where: and(
        eq(
          orders.customerId,
          authenticated?.user.id ?? `guest:${session.key}`,
        ),
        inArray(orders.orderStatus, [...ACTIVE_ORDER_STATUSES]),
        gte(orders.createdAt, new Date(now.getTime() - DUPLICATE_CHECK_WINDOW_MS)),
      ),
      orderBy: [desc(orders.createdAt)],
    });

    if (existingOpenOrder) {
      return NextResponse.json(
        {
          error: {
            code: "ORDER_ALREADY_STARTED",
            message: `Pesanan ${existingOpenOrder.orderNumber} masih aktif dan menunggu proses lebih lanjut. Lanjutkan pesanan tersebut alih-alih membuat pesanan baru.`,
            orderId: existingOpenOrder.id,
            orderNumber: existingOpenOrder.orderNumber,
          },
        },
        { status: 409 },
      );
    }

    const order = {
      id: randomUUID(),
      orderNumber: createOrderNumber(now),
      userId: authenticated?.user.id ?? null,
      customerId: authenticated?.user.id ?? `guest:${session.key}`,
      recipientName: shipping.recipientName,
      recipientPhone: shipping.phone,
      shippingAddress: shipping.address,
      shippingCity: shipping.city,
      shippingProvince: shipping.province,
      shippingPostalCode: shipping.postalCode,
      shippingNotes: shipping.notes || null,
      shippingMethod: decision.method,
      subtotalAmount: cartPayload.subtotal,
      shippingAmount: decision.shippingAmount,
      totalAmount: cartPayload.subtotal + decision.shippingAmount,
      paymentStatus: "pending" as const,
      orderStatus: decision.orderStatus,
      courierCode: decision.method,
      courierName: METHOD_LABELS[decision.method],
      courierServiceType: null,
      shippingEtd: null,
      shippingOriginSubdistrictId: null,
      shippingOriginSubdistrictName: null,
      shippingDestinationSubdistrictId: null,
      shippingDestinationSubdistrictName: null,
      shippingDestinationLatitude: null,
      shippingDestinationLongitude: null,
      createdAt: now,
      updatedAt: now,
    };

    const itemRows = cartPayload.items.map((item) => ({
      id: randomUUID(),
      orderId: order.id,
      productId: item.product.id,
      productSku: item.product.sku,
      productName: item.product.name,
      quantity: item.quantity,
      priceAtPurchase: item.product.price,
      createdAt: now,
    }));

    await db.transaction(async (transaction) => {
      await transaction.insert(orders).values(order).execute();
      await transaction.insert(orderItems).values(itemRows).execute();
      await deductStockForOrder(transaction, {
        orderNumber: order.orderNumber,
        items: itemRows,
        createdAt: now,
      });
      await transaction.delete(cartItems).where(eq(cartItems.cartId, cart.id)).execute();
    });

    if (decision.method === "instant") {
      void (async () => {
        const adminOrderUrl = await issueAdminMagicLink(order.id);
        await sendWhatsAppToAdmin({
          text: buildOrderWhatsAppMessage({
            orderNumber: order.orderNumber,
            recipientName: order.recipientName,
            recipientPhone: order.recipientPhone,
            address: order.shippingAddress,
            city: order.shippingCity,
            province: order.shippingProvince,
            postalCode: order.shippingPostalCode,
            notes: order.shippingNotes,
            methodLabel: METHOD_LABELS[decision.method],
            items: itemRows.map((item) => ({ productName: item.productName, quantity: item.quantity })),
            subtotal: order.subtotalAmount,
            shippingAmount: null,
            totalAmount: order.totalAmount,
            adminOrderUrl,
          }),
        });
      })();
    }

    return NextResponse.json(
      {
        order: {
          id: order.id,
          orderNumber: order.orderNumber,
          totalAmount: order.totalAmount,
          paymentStatus: order.paymentStatus,
          orderStatus: order.orderStatus,
          shippingMethod: order.shippingMethod,
          shipping,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: { code: "INVALID_JSON", message: "Body JSON tidak valid" } },
        { status: 400 },
      );
    }

    if (error instanceof StockUnavailableError) {
      return NextResponse.json(
        {
          error: {
            code: error.code,
            message: error.message,
            productId: error.productId,
            requested: error.requested,
            available: error.available,
          },
        },
        { status: 409 },
      );
    }

    console.error("Failed to save shipping data", error);
    return NextResponse.json(
      { error: { code: "SHIPPING_SAVE_FAILED", message: "Gagal menyimpan data pengiriman" } },
      { status: 500 },
    );
  }
}