import sharp from "sharp";

export const MAX_IMAGE_DIMENSION = 1600;
export const OPTIMIZED_IMAGE_QUALITY = 80;
export const MIN_IMAGE_BYTES_TO_OPTIMIZE = 250 * 1024;

const OPTIMIZABLE_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

const IMAGE_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

export interface OptimizedImage {
  buffer: Buffer;
  mimeType: string;
  extension: string;
  width: number | null;
  height: number | null;
  optimized: boolean;
}

export function isOptimizableImageType(mimeType: string): boolean {
  return OPTIMIZABLE_IMAGE_TYPES.has(mimeType);
}

export async function optimizeImageBuffer(
  buffer: Buffer,
  mimeType: string,
): Promise<OptimizedImage> {
  const original: OptimizedImage = {
    buffer,
    mimeType,
    extension: IMAGE_EXTENSIONS[mimeType] ?? mimeType.split("/").pop() ?? "bin",
    width: null,
    height: null,
    optimized: false,
  };

  if (!isOptimizableImageType(mimeType)) return original;

  try {
    const metadata = await sharp(buffer, { failOn: "none" }).metadata();
    const width = metadata.width ?? null;
    const height = metadata.height ?? null;
    const withDimensions: OptimizedImage = { ...original, width, height };

    if (width === null || height === null) return withDimensions;
    if ((metadata.pages ?? 1) > 1) return withDimensions;

    const withinDimensionLimit =
      width <= MAX_IMAGE_DIMENSION && height <= MAX_IMAGE_DIMENSION;
    if (mimeType === "image/webp" && withinDimensionLimit) return withDimensions;
    if (withinDimensionLimit && buffer.length <= MIN_IMAGE_BYTES_TO_OPTIMIZE) {
      return withDimensions;
    }

    const optimizedBuffer = await sharp(buffer, { failOn: "none" })
      .rotate()
      .resize({
        width: MAX_IMAGE_DIMENSION,
        height: MAX_IMAGE_DIMENSION,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: OPTIMIZED_IMAGE_QUALITY, effort: 5 })
      .toBuffer();

    if (optimizedBuffer.length >= buffer.length) return withDimensions;

    const optimizedMetadata = await sharp(optimizedBuffer, { failOn: "none" }).metadata();

    return {
      buffer: optimizedBuffer,
      mimeType: "image/webp",
      extension: "webp",
      width: optimizedMetadata.width ?? width,
      height: optimizedMetadata.height ?? height,
      optimized: true,
    };
  } catch (error) {
    console.warn(`Image optimization skipped: ${(error as Error).message}`);
    return original;
  }
}
