import { randomUUID } from "node:crypto";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { cartItems, carts, products } from "@/db/schema";
import { toProduct } from "@/lib/product-mapper";

export async function getOrCreateCart(sessionKey: string) {
  const existingCart = await db.query.carts.findFirst({
    where: eq(carts.sessionKey, sessionKey),
  });

  if (existingCart) return existingCart;

  const cart = {
    id: randomUUID(),
    sessionKey,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await db.insert(carts).values(cart);
  return cart;
}

export async function getCartPayload(cartId: string) {
  const rows = await db
    .select({ item: cartItems, product: products })
    .from(cartItems)
    .innerJoin(products, eq(cartItems.productId, products.id))
    .where(eq(cartItems.cartId, cartId))
    .orderBy(asc(cartItems.createdAt));

  const items = rows.map(({ item, product }) => ({
    id: item.id,
    product: toProduct(product),
    quantity: item.quantity,
    lineTotal: product.price * item.quantity,
  }));

  return {
    id: cartId,
    items,
    itemCount: items.reduce((total, item) => total + item.quantity, 0),
    subtotal: items.reduce((total, item) => total + item.lineTotal, 0),
  };
}

export async function findCartItemForSession(itemId: string, sessionKey: string) {
  return db
    .select({ item: cartItems, cart: carts, product: products })
    .from(cartItems)
    .innerJoin(carts, eq(cartItems.cartId, carts.id))
    .innerJoin(products, eq(cartItems.productId, products.id))
    .where(and(eq(cartItems.id, itemId), eq(carts.sessionKey, sessionKey)))
    .get();
}
