import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
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

  const encodedValue = sessionCookie?.[1] ? decodeURIComponent(sessionCookie[1]) : undefined;
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
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
  }

  return response;
}
