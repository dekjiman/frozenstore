import { NextResponse } from "next/server";
import { getCartPayload, getOrCreateCart } from "@/lib/cart-service";
import { attachCartSession, getCartSession } from "@/lib/cart-session";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const session = getCartSession(request);
    const cart = await getOrCreateCart(session.key);
    const payload = await getCartPayload(cart.id);

    return attachCartSession(NextResponse.json({ cart: payload }), session);
  } catch (error) {
    console.error("Failed to get cart", error);
    return NextResponse.json(
      { error: { code: "CART_GET_FAILED", message: "Gagal memuat keranjang" } },
      { status: 500 },
    );
  }
}
