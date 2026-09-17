import { randomBytes } from "node:crypto";
import { mkdir, writeFile, unlink } from "node:fs/promises";
import { join, resolve } from "node:path";
import { optimizeImageBuffer } from "@/lib/image-optimize";

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

function isJpeg(buffer: Buffer): boolean {
  return buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
}

function isPng(buffer: Buffer): boolean {
  const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  return (
    buffer.length >= signature.length &&
    signature.every((byte, index) => buffer[index] === byte)
  );
}

function isWebp(buffer: Buffer): boolean {
  return (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString("latin1") === "RIFF" &&
    buffer.subarray(8, 12).toString("latin1") === "WEBP"
  );
}

function isIsoBmff(buffer: Buffer): boolean {
  return buffer.length >= 12 && buffer.subarray(4, 8).toString("latin1") === "ftyp";
}

const AVIF_BRANDS = new Set(["avif", "avis"]);

const MP4_BRANDS = new Set([
  "isom",
  "iso2",
  "iso4",
  "iso5",
  "iso6",
  "mp41",
  "mp42",
  "M4V ",
  "M4A ",
  "3gp4",
  "avc1",
  "dash",
]);

// Boxes (selain brand) yang umum muncul sebagai pembuka file MP4/AVIF setelah ftyp
const KNOWN_TOP_BOXES = new Set(["moov", "mdat", "free", "wide", "skip", "moof", "meta", "sidx"]);

function nextTopLevelBoxName(buffer: Buffer): string | null {
  const size = buffer.readUInt32BE(0);
  if (!Number.isFinite(size) || size < 16 || size > buffer.length) return null;
  // ftyp box mulai di offset 4 (4 byte size + 4 byte type).
  // Box berikutnya dimulai tepat setelah box ftyp.
  const nextOffset = 4 + size;
  if (nextOffset + 4 > buffer.length) return null;
  return buffer.subarray(nextOffset, nextOffset + 4).toString("latin1");
}

function isAvif(buffer: Buffer): boolean {
  if (!isIsoBmff(buffer)) return false;
  const brand = buffer.subarray(8, 12).toString("latin1");
  return AVIF_BRANDS.has(brand);
}

function isMp4(buffer: Buffer): boolean {
  if (!isIsoBmff(buffer)) return false;
  const brand = buffer.subarray(8, 12).toString("latin1");
  if (AVIF_BRANDS.has(brand) || !MP4_BRANDS.has(brand)) return false;
  const next = nextTopLevelBoxName(buffer);
  return next !== null && KNOWN_TOP_BOXES.has(next);
}

export function isFileContentMatchingMimeType(buffer: Buffer, mimeType: string): boolean {
  switch (mimeType) {
    case "image/jpeg":
      return isJpeg(buffer);
    case "image/png":
      return isPng(buffer);
    case "image/webp":
      return isWebp(buffer);
    case "image/avif":
      return isAvif(buffer);
    case "video/mp4":
      return isMp4(buffer);
    default:
      return false;
  }
}

const MIME_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "video/mp4": "mp4",
};

function normalizeFilename(mimeType: string): string {
  const ext = MIME_EXTENSIONS[mimeType] ?? "bin";
  const base = randomBytes(8).toString("hex");
  return `${base}.${ext}`;
}

const MAX_FOLDER_DEPTH = 2;
const FOLDER_SEGMENT_PATTERN = /^[a-z0-9_-]{1,50}$/i;

export function isValidFolder(folder: string): boolean {
  if (!folder) return false;
  const segments = folder.replace(/\\/g, "/").split("/").filter(Boolean);
  if (segments.length === 0 || segments.length > MAX_FOLDER_DEPTH) return false;
  return segments.every((segment) => FOLDER_SEGMENT_PATTERN.test(segment));
}

export const localMediaStorage: MediaStorage = {
  async upload({ buffer, mimeType, folder }): Promise<StoredMedia> {
    if (!isValidFolder(folder)) {
      throw new Error("Invalid upload folder");
    }
    const dir = join(UPLOAD_ROOT, folder);
    await mkdir(dir, { recursive: true });

    const optimized = await optimizeImageBuffer(buffer, mimeType);
    const normalized = normalizeFilename(optimized.mimeType);
    const key = `${folder}/${normalized}`;
    const filePath = join(dir, normalized);

    await writeFile(filePath, optimized.buffer);

    return {
      key,
      url: `/uploads/${key}`,
      width: optimized.width ?? undefined,
      height: optimized.height ?? undefined,
      fileSizeBytes: optimized.buffer.length,
      mimeType: optimized.mimeType,
    };
  },

  async delete(key: string): Promise<void> {
    const normalizedKey = key.replace(/\\/g, "/");
    if (normalizedKey.includes("..")) {
      console.warn(`Blocked unsafe media delete path: ${key}`);
      return;
    }
    const safePath = resolve(UPLOAD_ROOT, normalizedKey);
    const uploadRoot = resolve(UPLOAD_ROOT);
    if (safePath === uploadRoot || !safePath.startsWith(uploadRoot)) {
      console.warn(`Blocked unsafe media delete path: ${key}`);
      return;
    }
    try {
      await unlink(safePath);
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
