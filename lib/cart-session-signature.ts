import { createHmac, timingSafeEqual } from "node:crypto";

export const CART_SESSION_COOKIE = "raf_cart_session";

const developmentSecret = "raf-store-development-cart-session-secret";

function getSessionSecret() {
  const secret = process.env.CART_SESSION_SECRET;

  if (process.env.NODE_ENV === "production" && !secret) {
    throw new Error("CART_SESSION_SECRET wajib diatur pada environment production");
  }

  return secret ?? developmentSecret;
}

function createSignature(sessionKey: string) {
  return createHmac("sha256", getSessionSecret()).update(sessionKey).digest("base64url");
}

export function encodeCartSession(sessionKey: string) {
  return `${sessionKey}.${createSignature(sessionKey)}`;
}

export function decodeCartSession(value: string | undefined) {
  if (!value) return null;

  const separatorIndex = value.lastIndexOf(".");
  if (separatorIndex < 1) return null;

  const sessionKey = value.slice(0, separatorIndex);
  const signature = value.slice(separatorIndex + 1);
  const expectedSignature = createSignature(sessionKey);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (signatureBuffer.length !== expectedBuffer.length) return null;

  return timingSafeEqual(signatureBuffer, expectedBuffer) ? sessionKey : null;
}
