import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { cartItems, products } from "@/db/schema";
import { getCartPayload, getOrCreateCart } from "@/lib/cart-service";
import { attachCartSession, getCartSession } from "@/lib/cart-session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { productId?: unknown; quantity?: unknown };
    const productId = typeof body.productId === "string" ? body.productId.trim() : "";
    const quantity = body.quantity === undefined ? 1 : Number(body.quantity);

    if (!productId || !Number.isInteger(quantity) || quantity < 1) {
      return NextResponse.json(
        { error: { code: "INVALID_CART_ITEM", message: "Produk dan kuantitas wajib valid" } },
        { status: 400 },
      );
    }

    const product = await db.query.products.findFirst({
      where: eq(products.id, productId),
    });

    if (!product) {
      return NextResponse.json(
        { error: { code: "PRODUCT_NOT_FOUND", message: "Produk tidak ditemukan" } },
        { status: 404 },
      );
    }

    const session = getCartSession(request);
    const cart = await getOrCreateCart(session.key);
    const existingItem = await db.query.cartItems.findFirst({
      where: and(eq(cartItems.cartId, cart.id), eq(cartItems.productId, productId)),
    });
    const nextQuantity = (existingItem?.quantity ?? 0) + quantity;

    if (nextQuantity > product.currentStock) {
      return NextResponse.json(
        {
          error: {
            code: "INSUFFICIENT_STOCK",
            message: `Stok hanya tersedia ${product.currentStock} unit`,
          },
        },
        { status: 409 },
      );
    }

    if (existingItem) {
      await db
        .update(cartItems)
        .set({ quantity: nextQuantity, updatedAt: new Date() })
        .where(eq(cartItems.id, existingItem.id));
    } else {
      await db.insert(cartItems).values({
        id: randomUUID(),
        cartId: cart.id,
        productId,
        quantity,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    const payload = await getCartPayload(cart.id);
    return attachCartSession(NextResponse.json({ cart: payload }, { status: 201 }), session);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: { code: "INVALID_JSON", message: "Body JSON tidak valid" } },
        { status: 400 },
      );
    }

    console.error("Failed to add cart item", error);
    return NextResponse.json(
      { error: { code: "CART_ITEM_CREATE_FAILED", message: "Gagal menambah item keranjang" } },
      { status: 500 },
    );
  }
}
