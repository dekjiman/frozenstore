import Link from "next/link";
import Image from "next/image";
import { SectionHeading } from "@/components/ui/section-heading";
import { isOptimizableImageSrc } from "@/lib/optimizable-image";

type RelatedProduct = {
  id: string;
  name: string;
  slug: string | null;
  price: number;
  imageUrl: string;
};

const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export function RelatedProducts({ products }: { products: RelatedProduct[] }) {
  if (products.length === 0) return null;

  return (
    <section>
      <SectionHeading eyebrow="Produk Lainnya" title="Produk Terkait" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 sm:gap-4">
        {products.map((p) => (
          <Link
            key={p.id}
            href={p.slug ? `/produk/${p.slug}` : `/produk/${p.id}`}
            className="group flex flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-white transition hover:shadow-md"
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-100">
              {isOptimizableImageSrc(p.imageUrl) ? (
                <Image
                  src={p.imageUrl}
                  alt={p.name}
                  fill
                  sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, 25vw"
                  className="object-cover transition-transform duration-200 group-hover:scale-[1.03]"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
                />
              )}
            </div>
            <div className="flex flex-col p-3">
              <h3 className="line-clamp-2 text-sm font-semibold text-[var(--ink-950)] group-hover:text-[var(--brand-600)]">
                {p.name}
              </h3>
              <p className="mt-auto pt-1 text-sm font-bold text-[var(--brand-600)]">
                {rupiah.format(p.price)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
