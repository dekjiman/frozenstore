import type { ProductRow } from "@/db/schema";
import type { Product } from "@/types/product";

export function toProduct(row: ProductRow): Product {
  return {
    id: row.id,
    sku: row.sku,
    name: row.name,
    category: row.category,
    description: row.description,
    price: row.price,
    stock: row.currentStock,
    imageUrl: row.imageUrl,
  };
}
