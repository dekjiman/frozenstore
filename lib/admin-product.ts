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
  slug: string | null;
  shortDescription: string;
  compareAtPrice: number | null;
  weightValue: number | null;
  weightUnit: string;
  piecesMin: number | null;
  piecesMax: number | null;
  isFeatured: boolean;
  isBestSeller: boolean;
  isNew: boolean;
  isPromo: boolean;
  articleId: string | null;
  storageInstructions: string;
  seoTitle: string | null;
  seoDescription: string | null;
  categoryId: string | null;
};

type ValidationResult =
  | { data: ProductInput }
  | { error: string };

const validImageUrl = (value: string) =>
  value.startsWith("/") || /^https?:\/\/[^\s]+$/i.test(value);

function coerceNumber(
  value: unknown,
  existing: number | null | undefined,
  fallback: number,
): { value: number; error?: string } {
  if (value === undefined || value === null || value === "") {
    return { value: existing ?? fallback };
  }
  if (typeof value === "number" && Number.isFinite(value)) return { value };
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return { value: parsed };
  }
  return { value: Number.NaN, error: "harus berupa angka" };
}

function coerceNullableNumber(
  value: unknown,
  existing: number | null | undefined,
): { value: number | null; error?: string } {
  if (value === undefined || value === null || value === "") {
    return { value: existing ?? null };
  }
  if (typeof value === "number" && Number.isFinite(value)) return { value };
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return { value: parsed };
  }
  return { value: null, error: "harus berupa angka" };
}

export function parseProductInput(
  body: Record<string, unknown>,
  existing?: ProductRow,
): ValidationResult {
  const sku = typeof body.sku === "string" ? body.sku.trim().toUpperCase() : existing?.sku ?? "";
  const name = typeof body.name === "string" ? body.name.trim() : existing?.name ?? "";
  const category = typeof body.category === "string" ? body.category.trim() : existing?.category ?? "";
  const description = typeof body.description === "string" ? body.description.trim() : existing?.description ?? "";
  const parsedPrice = coerceNumber(body.price, existing?.price, Number.NaN);
  if (parsedPrice.error) return { error: `Harga harus berupa angka` };
  const price = parsedPrice.value;
  const parsedStock = coerceNumber(body.currentStock ?? body.stock, existing?.currentStock, Number.NaN);
  if (parsedStock.error) return { error: `Stok harus berupa angka` };
  const currentStock = parsedStock.value;
  const imageUrl = typeof body.imageUrl === "string" ? body.imageUrl.trim() : existing?.imageUrl ?? "";
  const isActive = typeof body.isActive === "boolean" ? body.isActive : existing?.isActive ?? true;
  const slug = typeof body.slug === "string" ? body.slug.trim() || null : existing?.slug ?? null;
  const shortDescription = typeof body.shortDescription === "string" ? body.shortDescription.trim() : existing?.shortDescription ?? "";
  const parsedCompareAtPrice = coerceNullableNumber(body.compareAtPrice, existing?.compareAtPrice);
  if (parsedCompareAtPrice.error) return { error: `Harga coret harus berupa angka` };
  const compareAtPrice = parsedCompareAtPrice.value;
  const parsedWeight = coerceNullableNumber(body.weightValue, existing?.weightValue);
  if (parsedWeight.error) return { error: `Berat harus berupa angka` };
  const weightValue = parsedWeight.value;
  const weightUnit = typeof body.weightUnit === "string" ? body.weightUnit.trim() || "g" : existing?.weightUnit ?? "g";
  const parsedPiecesMin = coerceNullableNumber(body.piecesMin, existing?.piecesMin);
  if (parsedPiecesMin.error) return { error: `Jumlah minimum harus berupa angka` };
  const piecesMin = parsedPiecesMin.value;
  const parsedPiecesMax = coerceNullableNumber(body.piecesMax, existing?.piecesMax);
  if (parsedPiecesMax.error) return { error: `Jumlah maksimum harus berupa angka` };
  const piecesMax = parsedPiecesMax.value;
  const isFeatured = typeof body.isFeatured === "boolean" ? body.isFeatured : existing?.isFeatured ?? false;
  const isBestSeller = typeof body.isBestSeller === "boolean" ? body.isBestSeller : existing?.isBestSeller ?? false;
  const isNew = typeof body.isNew === "boolean" ? body.isNew : existing?.isNew ?? false;
  const isPromo = typeof body.isPromo === "boolean" ? body.isPromo : existing?.isPromo ?? false;
  const articleId = typeof body.articleId === "string" ? body.articleId.trim() || null : existing?.articleId ?? null;
  const storageInstructions = typeof body.storageInstructions === "string" ? body.storageInstructions.trim() : existing?.storageInstructions ?? "";
  const seoTitle = typeof body.seoTitle === "string" ? body.seoTitle.trim() || null : existing?.seoTitle ?? null;
  const seoDescription = typeof body.seoDescription === "string" ? body.seoDescription.trim() || null : existing?.seoDescription ?? null;
  const categoryId = typeof body.categoryId === "string" ? body.categoryId.trim() || null : existing?.categoryId ?? null;

  if (!/^[A-Z0-9][A-Z0-9._-]{1,49}$/.test(sku)) {
    return { error: "SKU harus 2-50 karakter dan hanya boleh berisi huruf, angka, titik, garis bawah, atau tanda hubung" };
  }
  if (name.length < 2 || name.length > 120) return { error: "Nama produk harus 2-120 karakter" };
  if (category.length < 2 || category.length > 80) return { error: "Kategori harus 2-80 karakter" };
  if (slug !== null && slug.length > 200) return { error: "Slug maksimal 200 karakter" };
  if (shortDescription.length > 300) return { error: "Deskripsi singkat maksimal 300 karakter" };
  if (description.length > 2_000) return { error: "Deskripsi maksimal 2.000 karakter" };
  if (!Number.isSafeInteger(price) || price < 0) return { error: "Harga harus bilangan bulat non-negatif" };
  if (!Number.isSafeInteger(currentStock) || currentStock < 0 || currentStock > 10_000_000) {
    return { error: "Stok harus bilangan bulat antara 0 dan 10.000.000" };
  }
  if (compareAtPrice !== null && (!Number.isSafeInteger(compareAtPrice) || compareAtPrice < 0)) {
    return { error: "Harga coret harus bilangan bulat non-negatif" };
  }
  if (weightValue !== null && (!Number.isFinite(weightValue) || weightValue < 0)) {
    return { error: "Berat harus angka non-negatif" };
  }
  if (piecesMin !== null && (!Number.isSafeInteger(piecesMin) || piecesMin < 0)) {
    return { error: "Jumlah minimum harus bilangan bulat non-negatif" };
  }
  if (piecesMax !== null && (!Number.isSafeInteger(piecesMax) || piecesMax < 0)) {
    return { error: "Jumlah maksimum harus bilangan bulat non-negatif" };
  }
  if (piecesMin !== null && piecesMax !== null && piecesMax < piecesMin) {
    return { error: "Jumlah maksimum tidak boleh kurang dari jumlah minimum" };
  }
  if (!imageUrl || imageUrl.length > 2_048 || !validImageUrl(imageUrl)) {
    return { error: "URL gambar produk tidak valid" };
  }

  return {
    data: {
      sku, name, category, description, price, currentStock, imageUrl, isActive,
      slug, shortDescription, compareAtPrice, weightValue, weightUnit,
      piecesMin, piecesMax, isFeatured, isBestSeller, isNew, isPromo,
      articleId, storageInstructions, seoTitle, seoDescription, categoryId,
    },
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
    slug: row.slug,
    shortDescription: row.shortDescription,
    compareAtPrice: row.compareAtPrice,
    weightValue: row.weightValue,
    weightUnit: row.weightUnit,
    piecesMin: row.piecesMin,
    piecesMax: row.piecesMax,
    isFeatured: row.isFeatured,
    isBestSeller: row.isBestSeller,
    isNew: row.isNew,
    isPromo: row.isPromo,
    articleId: row.articleId,
    storageInstructions: row.storageInstructions,
    seoTitle: row.seoTitle,
    seoDescription: row.seoDescription,
    categoryId: row.categoryId,
  };
}
