import { randomBytes } from "node:crypto";
import { mkdir, writeFile, unlink } from "node:fs/promises";
import { join } from "node:path";

export interface UploadInput {
  buffer: Buffer;
  filename: string;
  mimeType: string;
  folder: string;
}

export interface StoredMedia {
  key: string;
  url: string;
  width?: number;
  height?: number;
  fileSizeBytes: number;
  mimeType: string;
}

export interface MediaStorage {
  upload(input: UploadInput): Promise<StoredMedia>;
  delete(key: string): Promise<void>;
  getPublicUrl(key: string): string;
}

const UPLOAD_ROOT = join(process.cwd(), "public", "uploads");
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

const ALLOWED_VIDEO_TYPES = new Set(["video/mp4"]);

export function isAllowedMimeType(mimeType: string): boolean {
  return ALLOWED_IMAGE_TYPES.has(mimeType) || ALLOWED_VIDEO_TYPES.has(mimeType);
}

export function getMaxFileSize(mimeType: string): number {
  if (ALLOWED_VIDEO_TYPES.has(mimeType)) return MAX_VIDEO_SIZE;
  if (ALLOWED_IMAGE_TYPES.has(mimeType)) return MAX_IMAGE_SIZE;
  return 0;
}

export function getMediaType(mimeType: string): "image" | "video" {
  if (ALLOWED_VIDEO_TYPES.has(mimeType)) return "video";
  return "image";
}

function normalizeFilename(original: string): string {
  const ext = original.split(".").pop()?.toLowerCase() ?? "bin";
  const base = randomBytes(8).toString("hex");
  return `${base}.${ext}`;
}

export const localMediaStorage: MediaStorage = {
  async upload({ buffer, filename, mimeType, folder }): Promise<StoredMedia> {
    const dir = join(UPLOAD_ROOT, folder);
    await mkdir(dir, { recursive: true });

    const normalized = normalizeFilename(filename);
    const key = `${folder}/${normalized}`;
    const filePath = join(dir, normalized);

    await writeFile(filePath, buffer);

    return {
      key,
      url: `/uploads/${key}`,
      fileSizeBytes: buffer.length,
      mimeType,
    };
  },

  async delete(key: string): Promise<void> {
    const filePath = join(UPLOAD_ROOT, key);
    try {
      await unlink(filePath);
    } catch {
      // File may not exist; log and continue
      console.warn(`Failed to delete media file: ${key}`);
    }
  },

  getPublicUrl(key: string): string {
    return `/uploads/${key}`;
  },
};

export function getMediaStorage(): MediaStorage {
  const adapter = process.env.MEDIA_STORAGE_ADAPTER ?? "local";
  if (adapter === "local") return localMediaStorage;
  // Future: return s3MediaStorage or cloudinaryMediaStorage
  return localMediaStorage;
}
