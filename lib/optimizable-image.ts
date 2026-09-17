const OPTIMIZABLE_SOURCE = /^\/(uploads|images)\/.*\.(webp|jpe?g|png|avif)$/i;

/**
 * Gambar lokal same-origin (raster) aman dilewatkan optimizer next/image sehingga
 * mendapat srcset + format modern otomatis. URL eksternal (host dinamis dari admin)
 * atau format non-raster (svg/gif) harus tetap memakai <img>.
 */
export function isOptimizableImageSrc(src: string | null | undefined): boolean {
  if (!src) return false;
  return OPTIMIZABLE_SOURCE.test(src) && !/\.(gif|svg)$/i.test(src);
}
