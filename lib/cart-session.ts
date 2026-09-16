import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { COOKIE_SECURE } from "@/lib/cookie-security";
import {
  CART_SESSION_COOKIE,
  decodeCartSession,
  encodeCartSession,
} from "@/lib/cart-session-signature";

export function getCartSession(request: Request) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const sessionCookie = cookieHeader
    .split(";")
    .map((part) => part.trim().split("="))
    .find(([name]) => name === CART_SESSION_COOKIE);

  let encodedValue: string | undefined;
  try {
    encodedValue = sessionCookie?.[1] ? decodeURIComponent(sessionCookie[1]) : undefined;
  } catch {
    encodedValue = undefined;
  }
  const existingKey = decodeCartSession(encodedValue);

  return {
    key: existingKey ?? randomUUID(),
    isNew: !existingKey,
  };
}

export function attachCartSession(
  response: NextResponse,
  session: { key: string; isNew: boolean },
) {
  if (session.isNew) {
    response.cookies.set(CART_SESSION_COOKIE, encodeCartSession(session.key), {
      httpOnly: true,
      sameSite: "lax",
      secure: COOKIE_SECURE,
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
  }

  return response;
}
