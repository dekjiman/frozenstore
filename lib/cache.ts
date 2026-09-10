import { revalidateTag as nextRevalidateTag } from "next/cache";

// ─── Cache Tag Constants ─────────────────────────────────────────
export const CACHE_TAGS = {
  HOMEPAGE: "homepage",
  PRODUCTS: "products",
  CATEGORIES: "categories",
} as const;

// ─── Invalidate Cached Responses by Tag ──────────────────────────
// Call from admin mutation routes to bust stale storefront cache.
export function revalidateCacheTag(tag: string) {
  nextRevalidateTag(tag, "default");
}

// ─── Convenience: invalidate all storefront tags ─────────────────
export function revalidateAll() {
  revalidateCacheTag(CACHE_TAGS.HOMEPAGE);
  revalidateCacheTag(CACHE_TAGS.PRODUCTS);
  revalidateCacheTag(CACHE_TAGS.CATEGORIES);
}
