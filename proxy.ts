import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  CART_SESSION_COOKIE,
  decodeCartSession,
} from "@/lib/cart-session-signature";
import { requireAdmin } from "@/lib/admin-auth";

const protectedMethods = new Set(["POST", "PATCH", "PUT", "DELETE"]);

export async function proxy(request: NextRequest) {
  const { nextUrl } = request;

  if (nextUrl.pathname === "/produk" || nextUrl.pathname === "/produk/") {
    const legacyCategory = nextUrl.searchParams.get("category");
    if (legacyCategory) {
      const target = nextUrl.clone();
      target.pathname = `/kategori/${encodeURIComponent(legacyCategory)}`;
      target.searchParams.delete("category");
      return NextResponse.redirect(target, 301);
    }
  }

  if (request.nextUrl.pathname.startsWith("/api/admin/payment-settings")) {
    return (await requireAdmin(request)) ?? NextResponse.next();
  }

  if (!protectedMethods.has(request.method)) {
    return NextResponse.next();
  }

  const sessionKey = decodeCartSession(request.cookies.get(CART_SESSION_COOKIE)?.value);

  if (!sessionKey) {
    return NextResponse.json(
      {
        error: {
          code: "CART_SESSION_REQUIRED",
          message: "Sesi keranjang tidak valid. Muat keranjang sebelum mengubah item.",
        },
      },
      { status: 401 },
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/produk",
    "/produk/",
    "/api/admin/payment-settings/:path*",
    "/api/cart/:path*",
    "/api/checkout/:path*",
    "/api/orders/:path*",
  ],
};
