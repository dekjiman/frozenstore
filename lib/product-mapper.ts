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
    isActive: row.isActive,
    articleId: row.articleId,
    storageInstructions: row.storageInstructions,
    seoTitle: row.seoTitle,
    seoDescription: row.seoDescription,
    categoryId: row.categoryId,
  };
}
