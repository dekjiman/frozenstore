"use client";

import { ImageOff } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

type ProductImageProps = {
  src: string;
  alt: string;
  variant: "card" | "detail" | "thumbnail" | "admin";
  loading?: "eager" | "lazy";
  badge?: string;
};

const OPTIMIZABLE_SOURCE = /^\/(uploads|images)\/.*\.(webp|jpe?g|png|avif)$/i;

const variantStyles = {
  card: {
    container: "relative aspect-[4/5] overflow-hidden rounded-2xl bg-stone-200",
    image: "object-cover transition duration-500 ease-out group-hover:scale-[1.035]",
    sizes: "(max-width: 639px) 50vw, (max-width: 1279px) 33vw, 25vw",
  },
  detail: {
    container: "relative aspect-[4/5] overflow-hidden rounded-3xl bg-stone-200",
    image: "object-cover",
    sizes: "(max-width: 1023px) 100vw, 50vw",
  },
  thumbnail: {
    container: "relative size-24 shrink-0 overflow-hidden rounded-2xl bg-stone-200 sm:size-28",
    image: "object-cover",
    sizes: "(max-width: 639px) 96px, 112px",
  },
  admin: {
    container: "relative size-12 shrink-0 overflow-hidden rounded-xl bg-stone-200",
    image: "object-cover",
    sizes: "48px",
  },
} as const;

export function ProductImage({
  src,
  alt,
  variant,
  loading = "lazy",
  badge,
}: ProductImageProps) {
  const styles = variantStyles[variant];
  const [failed, setFailed] = useState(false);
  // Hanya gambar lokal (raster, same-origin) yang bisa lewat optimizer next/image
  // sehingga dapat srcset + format modern otomatis. URL eksternal tetap <img>.
  const canOptimize =
    OPTIMIZABLE_SOURCE.test(src) && !/\.(gif|svg)$/i.test(src);
  const isPriority = variant === "detail" && loading === "eager";

  return (
    <div className={styles.container}>
      {failed ? (
        <span className="absolute inset-0 grid place-items-center bg-stone-100 text-stone-400" role="img" aria-label={`Gambar ${alt} tidak tersedia`}>
          <ImageOff aria-hidden="true" size={variant === "detail" ? 32 : 18} />
        </span>
      ) : canOptimize ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={styles.sizes}
          loading={loading}
          priority={isPriority}
          onError={() => setFailed(true)}
          className={styles.image}
        />
      ) : (
        // URL gambar dikelola admin dan host-nya dinamis, sehingga tidak dapat memakai allowlist build-time next/image.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          loading={loading}
          decoding="async"
          fetchPriority={isPriority ? "high" : undefined}
          sizes={styles.sizes}
          onError={() => setFailed(true)}
          className={`absolute inset-0 h-full w-full ${styles.image}`}
        />
      )}
      {badge ? (
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-stone-700 backdrop-blur-sm sm:left-4 sm:top-4">
          {badge}
        </span>
      ) : null}
    </div>
  );
}
