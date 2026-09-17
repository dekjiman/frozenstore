import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { orderItems, orders } from "@/db/schema";
import { getCartSession } from "@/lib/cart-session";
import { getAuthenticatedUser } from "@/lib/auth-session";
import { buildOrderWhatsAppMessage } from "@/lib/order-message";
import { sendWhatsAppToAdmin } from "@/lib/whatsapp-notify";
import { issueAdminMagicLink } from "@/lib/magic-link";
import { isFileContentMatchingMimeType } from "@/lib/media-storage";

export const runtime = "nodejs";

const allowedFileTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);
const maxFileSize = 5 * 1024 * 1024;

const METHOD_LABELS: Record<string, string> = {
  regular: "Reguler",
  same_day: "Same Day (Grab / GoSend)",
  instant: "Instan (Grab/GoSend)",
};

async function notifyAdminPaymentProof(order: typeof orders.$inferSelect): Promise<void> {
  try {
    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
    const adminOrderUrl = await issueAdminMagicLink(order.id);
    await sendWhatsAppToAdmin({
      text: buildOrderWhatsAppMessage(
        {
          orderNumber: order.orderNumber,
          recipientName: order.recipientName,
          recipientPhone: order.recipientPhone,
          address: order.shippingAddress,
          city: order.shippingCity,
          province: order.shippingProvince,
          postalCode: order.shippingPostalCode,
          notes: order.shippingNotes,
          methodLabel: METHOD_LABELS[order.shippingMethod] ?? order.shippingMethod,
          items: items.map((item) => ({ productName: item.productName, quantity: item.quantity })),
          subtotal: order.subtotalAmount,
          shippingAmount: order.shippingAmount,
          totalAmount: order.totalAmount,
          adminOrderUrl,
        },
        "payment_received",
      ),
    });
  } catch (error) {
    console.error("Failed to notify admin about payment proof", error);
  }
}

type PaymentProofContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, { params }: PaymentProofContext) {
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

    if (order.paymentStatus !== "pending" && order.paymentStatus !== "failed") {
      return NextResponse.json(
        { error: { code: "PAYMENT_PROOF_LOCKED", message: "Bukti pembayaran tidak dapat diubah pada status ini" } },
        { status: 409 },
      );
    }

    if (order.orderStatus !== "waiting_payment") {
      return NextResponse.json(
        { error: { code: "PAYMENT_PROOF_LOCKED", message: "Bukti pembayaran hanya dapat diunggah saat pesanan menunggu pembayaran" } },
        { status: 409 },
      );
    }

    const formData = await request.formData();
    const proof = formData.get("paymentProof");

    if (!(proof instanceof File)) {
      return NextResponse.json(
        { error: { code: "PAYMENT_PROOF_REQUIRED", message: "File bukti transfer wajib diunggah" } },
        { status: 400 },
      );
    }

    const extension = allowedFileTypes.get(proof.type);
    if (!extension) {
      return NextResponse.json(
        { error: { code: "INVALID_FILE_TYPE", message: "Format file harus JPG, PNG, atau WebP" } },
        { status: 415 },
      );
    }
    if (proof.size < 1 || proof.size > maxFileSize) {
      return NextResponse.json(
        { error: { code: "INVALID_FILE_SIZE", message: "Ukuran file harus antara 1 byte dan 5 MB" } },
        { status: 413 },
      );
    }

    const buffer = Buffer.from(await proof.arrayBuffer());
    if (!isFileContentMatchingMimeType(buffer, proof.type)) {
      return NextResponse.json(
        { error: { code: "INVALID_FILE_TYPE", message: "Isi file tidak sesuai dengan tipe yang dinyatakan" } },
        { status: 415 },
      );
    }

    const fileName = `${randomUUID()}.${extension}`;
    const uploadDirectory = path.join(process.cwd(), "public", "uploads", "payment-proofs");
    await mkdir(uploadDirectory, { recursive: true });
    await writeFile(path.join(uploadDirectory, fileName), buffer);

    const paymentProofUrl = `/uploads/payment-proofs/${fileName}`;
    await db
      .update(orders)
      .set({
        paymentProofUrl,
        paymentStatus: "awaiting_verification",
        updatedAt: new Date(),
      })
      .where(eq(orders.id, order.id));

    if (order.shippingMethod === "regular" || order.shippingMethod === "same_day") {
      void notifyAdminPaymentProof(order);
    }

    return NextResponse.json({
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        paymentProofUrl,
        paymentStatus: "awaiting_verification",
        paymentStatusLabel: "Menunggu Verifikasi",
      },
    });
  } catch (error) {
    console.error("Failed to upload payment proof", error);
    return NextResponse.json(
      { error: { code: "PAYMENT_PROOF_UPLOAD_FAILED", message: "Gagal mengunggah bukti transfer" } },
      { status: 500 },
    );
  }
}
