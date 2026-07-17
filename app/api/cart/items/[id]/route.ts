import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { cartItems } from "@/db/schema";
import { findCartItemForSession, getCartPayload } from "@/lib/cart-service";
import { getCartSession } from "@/lib/cart-session";

export const runtime = "nodejs";

type CartItemRouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, { params }: CartItemRouteContext) {
  try {
    const { id } = await params;
    const body = (await request.json()) as { quantity?: unknown };
    const quantity = Number(body.quantity);

    if (!Number.isInteger(quantity) || quantity < 1) {
      return NextResponse.json(
        { error: { code: "INVALID_QUANTITY", message: "Kuantitas minimal 1" } },
        { status: 400 },
      );
    }

    const session = getCartSession(request);
    const result = await findCartItemForSession(id, session.key);

    if (!result) {
      return NextResponse.json(
        { error: { code: "CART_ITEM_NOT_FOUND", message: "Item keranjang tidak ditemukan" } },
        { status: 404 },
      );
    }

    if (quantity > result.product.currentStock) {
      return NextResponse.json(
        {
          error: {
            code: "INSUFFICIENT_STOCK",
            message: `Stok hanya tersedia ${result.product.currentStock} unit`,
          },
        },
        { status: 409 },
      );
    }

    await db
      .update(cartItems)
      .set({ quantity, updatedAt: new Date() })
      .where(eq(cartItems.id, result.item.id));

    return NextResponse.json({ cart: await getCartPayload(result.cart.id) });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: { code: "INVALID_JSON", message: "Body JSON tidak valid" } },
        { status: 400 },
      );
    }

    console.error("Failed to update cart item", error);
    return NextResponse.json(
      { error: { code: "CART_ITEM_UPDATE_FAILED", message: "Gagal mengubah item keranjang" } },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, { params }: CartItemRouteContext) {
  try {
    const { id } = await params;
    const session = getCartSession(request);
    const result = await findCartItemForSession(id, session.key);

    if (!result) {
      return NextResponse.json(
        { error: { code: "CART_ITEM_NOT_FOUND", message: "Item keranjang tidak ditemukan" } },
        { status: 404 },
      );
    }

    await db.delete(cartItems).where(eq(cartItems.id, result.item.id));
    return NextResponse.json({ cart: await getCartPayload(result.cart.id) });
  } catch (error) {
    console.error("Failed to delete cart item", error);
    return NextResponse.json(
      { error: { code: "CART_ITEM_DELETE_FAILED", message: "Gagal menghapus item keranjang" } },
      { status: 500 },
    );
  }
}
