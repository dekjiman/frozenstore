import { randomUUID } from "node:crypto";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { productMedia, products } from "@/db/schema";
import {
  getMediaStorage,
  getMediaType,
  getMaxFileSize,
  isAllowedMimeType,
  type StoredMedia,
} from "@/lib/media-storage";

const MAX_MEDIA_PER_PRODUCT = 12;

export type MediaUploadResult =
  | { data: MediaDTO }
  | { error: string; code: string };

export type MediaDTO = {
  id: string;
  productId: string;
  mediaType: "image" | "video";
  url: string;
  storageKey: string | null;
  thumbnailUrl: string | null;
  posterUrl: string | null;
  altText: string;
  title: string;
  sortOrder: number;
  isPrimary: boolean;
  durationSeconds: number | null;
  width: number | null;
  height: number | null;
  mimeType: string | null;
  fileSizeBytes: number | null;
  createdAt: Date;
  updatedAt: Date;
};

export function toMediaDTO(row: typeof productMedia.$inferSelect): MediaDTO {
  return {
    id: row.id,
    productId: row.productId,
    mediaType: row.mediaType as "image" | "video",
    url: row.url,
    storageKey: row.storageKey,
    thumbnailUrl: row.thumbnailUrl,
    posterUrl: row.posterUrl,
    altText: row.altText,
    title: row.title,
    sortOrder: row.sortOrder,
    isPrimary: row.isPrimary,
    durationSeconds: row.durationSeconds,
    width: row.width,
    height: row.height,
    mimeType: row.mimeType,
    fileSizeBytes: row.fileSizeBytes,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function uploadMedia(
  productId: string,
  file: File,
  options?: { altText?: string; title?: string; isPrimary?: boolean },
): Promise<MediaUploadResult> {
  const product = await db.query.products.findFirst({
    where: eq(products.id, productId),
    columns: { id: true },
  });
  if (!product) {
    return { error: "Produk tidak ditemukan", code: "PRODUCT_NOT_FOUND" };
  }

  if (!isAllowedMimeType(file.type)) {
    return { error: "Tipe file tidak diizinkan", code: "INVALID_MEDIA_TYPE" };
  }

  const maxSize = getMaxFileSize(file.type);
  if (file.size > maxSize) {
    const mb = Math.round(maxSize / (1024 * 1024));
    return {
      error: `Ukuran file maksimal ${mb}MB`,
      code: "MEDIA_TOO_LARGE",
    };
  }

  const existingCount = await db
    .select({ count: productMedia.id })
    .from(productMedia)
    .where(eq(productMedia.productId, productId));
  if (existingCount.length >= MAX_MEDIA_PER_PRODUCT) {
    return {
      error: `Maksimal ${MAX_MEDIA_PER_PRODUCT} media per produk`,
      code: "MEDIA_LIMIT_EXCEEDED",
    };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const mediaType = getMediaType(file.type);
  const folder = `products`;

  const storage = getMediaStorage();
  let stored: StoredMedia;
  try {
    stored = await storage.upload({
      buffer,
      filename: file.name,
      mimeType: file.type,
      folder,
    });
  } catch {
    return { error: "Gagal mengupload file", code: "MEDIA_UPLOAD_FAILED" };
  }

  const id = randomUUID();
  const now = new Date();
  const sortOrder = existingCount.length;
  const isPrimary = options?.isPrimary ?? existingCount.length === 0;

  if (isPrimary) {
    await db
      .update(productMedia)
      .set({ isPrimary: false })
      .where(eq(productMedia.productId, productId));
  }

  await db.insert(productMedia).values({
    id,
    productId,
    mediaType,
    url: stored.url,
    storageKey: stored.key,
    thumbnailUrl: null,
    posterUrl: null,
    altText: options?.altText ?? "",
    title: options?.title ?? "",
    sortOrder,
    isPrimary,
    durationSeconds: null,
    width: stored.width ?? null,
    height: stored.height ?? null,
    mimeType: stored.mimeType,
    fileSizeBytes: stored.fileSizeBytes,
    createdAt: now,
    updatedAt: now,
  });

  const row = await db.query.productMedia.findFirst({
    where: eq(productMedia.id, id),
  });

  return { data: toMediaDTO(row!) };
}

export async function updateMedia(
  productId: string,
  mediaId: string,
  updates: { altText?: string; title?: string; isPrimary?: boolean },
): Promise<MediaUploadResult> {
  const row = await db.query.productMedia.findFirst({
    where: and(
      eq(productMedia.id, mediaId),
      eq(productMedia.productId, productId),
    ),
  });
  if (!row) {
    return { error: "Media tidak ditemukan", code: "MEDIA_NOT_FOUND" };
  }

  if (updates.isPrimary && !row.isPrimary) {
    await db
      .update(productMedia)
      .set({ isPrimary: false })
      .where(eq(productMedia.productId, productId));
  }

  const now = new Date();
  await db
    .update(productMedia)
    .set({
      ...(updates.altText !== undefined && { altText: updates.altText }),
      ...(updates.title !== undefined && { title: updates.title }),
      ...(updates.isPrimary !== undefined && { isPrimary: updates.isPrimary }),
      updatedAt: now,
    })
    .where(eq(productMedia.id, mediaId));

  const updated = await db.query.productMedia.findFirst({
    where: eq(productMedia.id, mediaId),
  });

  return { data: toMediaDTO(updated!) };
}

export async function reorderMedia(
  productId: string,
  orderedIds: string[],
): Promise<{ success: boolean; error?: string }> {
  if (orderedIds.length === 0) {
    return { success: false, error: "Daftar ID media tidak boleh kosong" };
  }

  const allMedia = await db.query.productMedia.findMany({
    where: eq(productMedia.productId, productId),
  });

  const validIds = new Set(allMedia.map((m) => m.id));
  for (const id of orderedIds) {
    if (!validIds.has(id)) {
      return {
        success: false,
        error: `Media ${id} tidak dimiliki oleh produk ini`,
      };
    }
  }

  const now = new Date();

  for (let i = 0; i < orderedIds.length; i++) {
    await db
      .update(productMedia)
      .set({ sortOrder: i, updatedAt: now })
      .where(eq(productMedia.id, orderedIds[i]));
  }

  return { success: true };
}

export async function deleteMedia(
  productId: string,
  mediaId: string,
): Promise<{ success: boolean; error?: string }> {
  const row = await db.query.productMedia.findFirst({
    where: and(
      eq(productMedia.id, mediaId),
      eq(productMedia.productId, productId),
    ),
  });
  if (!row) {
    return { success: false, error: "Media tidak ditemukan" };
  }

  if (row.isPrimary) {
    return {
      success: false,
      error: "Tidak bisa menghapus gambar utama. Atur gambar utama lain terlebih dahulu.",
    };
  }

  await db.delete(productMedia).where(eq(productMedia.id, mediaId));

  if (row.storageKey) {
    const storage = getMediaStorage();
    try {
      await storage.delete(row.storageKey);
    } catch {
      console.warn(`Failed to delete media file: ${row.storageKey}`);
    }
  }

  return { success: true };
}

export async function getProductMedia(
  productId: string,
): Promise<MediaDTO[]> {
  const rows = await db.query.productMedia.findMany({
    where: eq(productMedia.productId, productId),
    orderBy: [asc(productMedia.sortOrder)],
  });
  return rows.map(toMediaDTO);
}

export async function getPrimaryMedia(
  productId: string,
): Promise<MediaDTO | null> {
  const row = await db.query.productMedia.findFirst({
    where: and(
      eq(productMedia.productId, productId),
      eq(productMedia.isPrimary, true),
    ),
  });
  return row ? toMediaDTO(row) : null;
}
