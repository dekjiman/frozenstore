import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { orders } from "@/db/schema";
import { getCartSession } from "@/lib/cart-session";
import { getAuthenticatedUser } from "@/lib/auth-session";

export const runtime = "nodejs";

const allowedFileTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);
const maxFileSize = 5 * 1024 * 1024;

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

    const fileName = `${randomUUID()}.${extension}`;
    const uploadDirectory = path.join(process.cwd(), "public", "uploads", "payment-proofs");
    await mkdir(uploadDirectory, { recursive: true });
    await writeFile(path.join(uploadDirectory, fileName), Buffer.from(await proof.arrayBuffer()));

    const paymentProofUrl = `/uploads/payment-proofs/${fileName}`;
    await db
      .update(orders)
      .set({
        paymentProofUrl,
        paymentStatus: "awaiting_verification",
        updatedAt: new Date(),
      })
      .where(eq(orders.id, order.id));

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
