import { and, desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { orders } from "@/db/schema";
import { applyInstantShippingFee } from "@/lib/order-fee";
import { getSiteSettings } from "@/lib/queries/site-settings";
import { normalizeWaNumber, sendWhatsApp } from "@/lib/whatsapp-notify";

export const runtime = "nodejs";

const ORDER_NUMBER_PATTERN = /JAS-\d{8}-\d{4}/;

const rupiahFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const processedMessageIds = new Set<string>();

type ProtoRecord = Record<string, unknown>;

function textFromMessage(message: unknown): string {
  if (!message || typeof message !== "object") return "";
  const raw = message as ProtoRecord;
  if (typeof raw.conversation === "string" && raw.conversation.trim()) return raw.conversation.trim();
  const extended = raw.extendedTextMessage as ProtoRecord | undefined;
  if (extended && typeof extended.text === "string" && extended.text.trim()) return extended.text.trim();
  const image = raw.imageMessage as ProtoRecord | undefined;
  if (image && typeof image.caption === "string" && image.caption.trim()) return image.caption.trim();
  return "";
}

function quotedTextFrom(message: unknown): string {
  if (!message || typeof message !== "object") return "";
  const raw = message as ProtoRecord;
  const extended = raw.extendedTextMessage as ProtoRecord | undefined;
  const contexts: unknown[] = [];
  if (extended && extended.contextInfo) contexts.push((extended.contextInfo as ProtoRecord).quotedMessage);
  if (raw.contextInfo) contexts.push((raw.contextInfo as ProtoRecord).quotedMessage);
  for (const quoted of contexts) {
    const text = textFromMessage(quoted);
    if (text) return text;
  }
  return "";
}

function normalizeRupiah(raw: string): string {
  if (raw.includes(",") && /,\d{1,2}$/.test(raw)) {
    return raw.replace(/\./g, "").replace(",", ".");
  }
  return raw.replace(/[.,]/g, "");
}

function amountFromText(text: string): number | null {
  const matches = text.match(/Rp\.?\s*\d[\d.,]*|\b\d[\d.,]*\b/g) ?? [];
  for (const match of matches) {
    const digits = match.replace(/^Rp\.?\s*/i, "").trim();
    const value = Number(normalizeRupiah(digits));
    if (Number.isFinite(value) && value > 0) return value;
  }
  return null;
}

async function adminTargetNumber(): Promise<string> {
  return normalizeWaNumber((await getSiteSettings())?.whatsappNumber ?? "");
}

async function replyToAdmin(text: string): Promise<void> {
  const number = await adminTargetNumber();
  if (number) await sendWhatsApp({ number, text });
}

function resolveSenderNumber(key: ProtoRecord): string {
  const remoteJidAlt = typeof key.remoteJidAlt === "string" ? key.remoteJidAlt : "";
  const remoteJid = typeof key.remoteJid === "string" ? key.remoteJid : "";
  return normalizeWaNumber((remoteJidAlt || remoteJid).split("@")[0]);
}

async function mostRecentAwaitingInstantOrder() {
  return db.query.orders.findFirst({
    where: and(
      eq(orders.shippingMethod, "instant"),
      eq(orders.orderStatus, "waiting_shipping_fee"),
    ),
    orderBy: desc(orders.createdAt),
  });
}

async function handleIncoming(entry: unknown): Promise<void> {
  if (!entry || typeof entry !== "object") return;
  const raw = entry as ProtoRecord;
  const key = raw.key as ProtoRecord | undefined;
  if (!key) return;
  if (key.fromMe !== false) return;

  const messageId = typeof key.id === "string" ? key.id : "";
  if (messageId && processedMessageIds.has(messageId)) return;
  if (messageId) {
    processedMessageIds.add(messageId);
    if (processedMessageIds.size > 1000) {
      for (const id of [...processedMessageIds].slice(0, 500)) processedMessageIds.delete(id);
    }
  }

  const sender = resolveSenderNumber(key);
  const admin = await adminTargetNumber();
  if (!sender || !admin || sender !== admin) return;

  const text = textFromMessage(raw.message);
  if (!text) return;

  const orderNumber =
    ORDER_NUMBER_PATTERN.exec(quotedTextFrom(raw.message))?.[0] ??
    ORDER_NUMBER_PATTERN.exec(text)?.[0] ??
    null;
  const amount = amountFromText(text);

  if (orderNumber === null && amount === null) return;

  let order: typeof orders.$inferSelect | null = null;
  if (orderNumber !== null) {
    order =
      (await db.query.orders.findFirst({ where: eq(orders.orderNumber, orderNumber) })) ?? null;
    if (!order) {
      await replyToAdmin(`Pesanan ${orderNumber} tidak ditemukan.`);
      return;
    }
  } else {
    order = (await mostRecentAwaitingInstantOrder()) ?? null;
    if (!order) {
      await replyToAdmin("Belum ada pesanan Instan yang menunggu konfirmasi ongkir.");
      return;
    }
  }

  if (amount === null) {
    await replyToAdmin(
      `Ketik nominal ongkir untuk ${order.orderNumber}, contoh: "25000" atau "Rp 25.000".`,
    );
    return;
  }

  const result = await applyInstantShippingFee({ orderId: order.id, amount });
  if (!result.ok) {
    await replyToAdmin(`Gagal set ongkir ${order.orderNumber}: ${result.message}`);
    return;
  }

  const total = result.order.totalAmount;
  const fee = result.order.shippingAmount;

  await replyToAdmin(
    [
      `Ongkir ${order.orderNumber} sudah diset ke ${rupiahFormatter.format(fee)}.`,
      `Status: Menunggu Pembayaran (total ${rupiahFormatter.format(total)}).`,
      `Pelanggan sudah dinotifikasi.`,
    ].join("\n"),
  );

  await sendWhatsApp({
    number: order.recipientPhone,
    text: [
      `Halo, ongkir untuk pesananmu sudah dikonfirmasi admin.`,
      ``,
      `*Pesanan:* ${order.orderNumber}`,
      `*Ongkir:* ${rupiahFormatter.format(fee)}`,
      `*Total yang harus dibayar:* ${rupiahFormatter.format(total)}`,
      ``,
      `Silakan lakukan pembayaran lalu unggah bukti di menu "Pesanan" /akun agar bisa segera diverifikasi.`,
    ].join("\n"),
  });
}

export async function POST(request: Request) {
  const apiKey = process.env.EVOLUTION_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(
      { error: { code: "WEBHOOK_NOT_CONFIGURED", message: "Webhook belum dikonfigurasi" } },
      { status: 503 },
    );
  }
  if (request.headers.get("apikey") !== apiKey) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: true });
  }

  if (!payload || typeof payload !== "object") return NextResponse.json({ ok: true });
  const body = payload as ProtoRecord;
  if (body.event !== "messages.upsert") return NextResponse.json({ ok: true });

  const data = body.data;
  if (Array.isArray(data)) {
    for (const entry of data) await handleIncoming(entry);
  } else {
    await handleIncoming(data);
  }

  return NextResponse.json({ ok: true });
}