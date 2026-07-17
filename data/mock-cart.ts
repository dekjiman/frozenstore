import { mockProducts } from "@/data/mock-products";
import type { CartItem } from "@/types/cart";

export const mockCartItems: CartItem[] = [
  {
    id: "cart-item-001",
    product: mockProducts[0],
    quantity: 1,
    lineTotal: 189_000,
  },
  {
    id: "cart-item-002",
    product: mockProducts[1],
    quantity: 2,
    lineTotal: 178_000,
  },
  {
    id: "cart-item-003",
    product: mockProducts[5],
    quantity: 1,
    lineTotal: 219_000,
  },
];

export const mockCartSummary = {
  itemCount: 4,
  subtotal: 586_000,
};
