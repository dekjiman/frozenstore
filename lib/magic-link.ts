import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { SEO_BASE } from "@/lib/seo";
import { getSiteSettings } from "@/lib/queries/site-settings";

const devSecret = "raf-store-auto-login-development-key";
const lifetimeMs = 15 * 60_000;
const usedNonces = new Set<string>();

function magicSecret(): string | null {
  const value = process.env.AUTO_LOGIN_SECRET?.trim();
  if (value) return value;
  return process.env.NODE_ENV === "production" ? null : devSecret;
}

function encodePart(value: string): string {
  return Buffer.from(value).toString("base64url");
}

function decodePart(value: string): string | null {
  try {
    return Buffer.from(value, "base64url").toString("utf8");
  } catch {
    return null;
  }
}

function buildSignature(secret: string, material: string): string {
  return createHmac("sha256", secret).update(material).digest("base64url");
}

export function issueAdminMagicToken(input: { phone: string; orderId: string }): string | null {
  const secret = magicSecret();
  if (!secret || !input.phone) return null;

  const payload = JSON.stringify({ phone: input.phone, orderId: input.orderId });
  const payloadB64 = encodePart(payload);
  const exp = Date.now() + lifetimeMs;
  const nonceB64 = randomBytes(16).toString("base64url");
  const material = `${payloadB64}.${exp}.${nonceB64}`;

  return `${material}.${buildSignature(secret, material)}`;
}

export function verifyAdminMagicToken(token: string): { phone: string; orderId: string } | null {
  const secret = magicSecret();
  if (!secret) return null;

  const match = /^([A-Za-z0-9_-]+)\.(\d+)\.([A-Za-z0-9_-]+)\.([A-Za-z0-9_-]+)$/.exec(token);
  if (!match) return null;

  const [, payloadB64, rawExp, nonceB64, sig] = match;
  const material = `${payloadB64}.${rawExp}.${nonceB64}`;

  const expected = buildSignature(secret, material);
  const actual = Buffer.from(sig);
  const expectedBuffer = Buffer.from(expected);
  if (actual.length !== expectedBuffer.length || !timingSafeEqual(actual, expectedBuffer)) {
    return null;
  }

  if (usedNonces.has(nonceB64)) return null;
  const exp = Number(rawExp);
  if (!Number.isFinite(exp) || exp <= Date.now()) return null;

  const rawPayload = decodePart(payloadB64);
  if (!rawPayload) return null;
  let payload: { phone?: unknown; orderId?: unknown };
  try {
    payload = JSON.parse(rawPayload) as { phone?: unknown; orderId?: unknown };
  } catch {
    return null;
  }
  if (typeof payload.phone !== "string" || typeof payload.orderId !== "string") return null;
  if (!payload.phone || !payload.orderId) return null;

  usedNonces.add(nonceB64);
  if (usedNonces.size > 1000) {
    for (const id of [...usedNonces].slice(0, 500)) usedNonces.delete(id);
  }

  return { phone: payload.phone, orderId: payload.orderId };
}

export async function buildAdminOrderLink(orderId: string): Promise<string> {
  const base = SEO_BASE.replace(/\/+$/, "");
  const settings = await getSiteSettings();
  const phone = settings?.whatsappNumber ?? "";
  const token = issueAdminMagicToken({ phone, orderId });
  if (token) return `${base}/api/auth/magic?token=${encodeURIComponent(token)}`;
  return `${base}/admin/pesanan?order=${encodeURIComponent(orderId)}`;
}