import type { ProductRow } from "@/db/schema";

export type ProductInput = {
  sku: string;
  name: string;
  category: string;
  description: string;
  price: number;
  currentStock: number;
  imageUrl: string;
  isActive: boolean;
};

type ValidationResult =
  | { data: ProductInput }
  | { error: string };

const validImageUrl = (value: string) =>
  value.startsWith("/") || /^https?:\/\/[^\s]+$/i.test(value);

export function parseProductInput(
  body: Record<string, unknown>,
  existing?: ProductRow,
): ValidationResult {
  const sku = typeof body.sku === "string" ? body.sku.trim().toUpperCase() : existing?.sku ?? "";
  const name = typeof body.name === "string" ? body.name.trim() : existing?.name ?? "";
  const category = typeof body.category === "string" ? body.category.trim() : existing?.category ?? "";
  const description = typeof body.description === "string" ? body.description.trim() : existing?.description ?? "";
  const price = body.price === undefined ? existing?.price ?? Number.NaN : Number(body.price);
  const currentStockValue = body.currentStock ?? body.stock;
  const currentStock = currentStockValue === undefined
    ? existing?.currentStock ?? Number.NaN
    : Number(currentStockValue);
  const imageUrl = typeof body.imageUrl === "string" ? body.imageUrl.trim() : existing?.imageUrl ?? "";
  const isActive = typeof body.isActive === "boolean" ? body.isActive : existing?.isActive ?? true;

  if (!/^[A-Z0-9][A-Z0-9._-]{1,49}$/.test(sku)) {
    return { error: "SKU harus 2-50 karakter dan hanya boleh berisi huruf, angka, titik, garis bawah, atau tanda hubung" };
  }
  if (name.length < 2 || name.length > 120) return { error: "Nama produk harus 2-120 karakter" };
  if (category.length < 2 || category.length > 80) return { error: "Kategori harus 2-80 karakter" };
  if (description.length > 2_000) return { error: "Deskripsi maksimal 2.000 karakter" };
  if (!Number.isSafeInteger(price) || price < 0) return { error: "Harga harus bilangan bulat non-negatif" };
  if (!Number.isSafeInteger(currentStock) || currentStock < 0 || currentStock > 10_000_000) {
    return { error: "Stok harus bilangan bulat antara 0 dan 10.000.000" };
  }
  if (!imageUrl || imageUrl.length > 2_048 || !validImageUrl(imageUrl)) {
    return { error: "URL gambar produk tidak valid" };
  }

  return {
    data: { sku, name, category, description, price, currentStock, imageUrl, isActive },
  };
}

export function toAdminProduct(row: ProductRow) {
  return {
    id: row.id,
    sku: row.sku,
    name: row.name,
    category: row.category,
    description: row.description,
    price: row.price,
    stock: row.currentStock,
    currentStock: row.currentStock,
    imageUrl: row.imageUrl,
    isActive: row.isActive,
    deletedAt: row.deletedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
