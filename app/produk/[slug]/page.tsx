import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { StoreHeader } from "@/components/storefront/store-header";
import { StoreFooter } from "@/components/storefront/store-footer";
import { MediaGallery } from "@/components/storefront/media-gallery";
import { StickyPurchase } from "@/components/storefront/sticky-purchase";
import { RelatedProducts } from "@/components/storefront/related-products";
import { ShareButton } from "@/components/storefront/share-button";
import { jsonLdScript } from "@/lib/seo";

export const revalidate = 60;

type PageProps = {
  params: Promise<{ slug: string }>;
};

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
const API_BASE = process.env.API_URL ?? "http://localhost:3000";

type ProductDetail = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  shortDescription: string;
  price: number;
  compareAtPrice: number | null;
  category: string;
  categoryId: string | null;
  categoryName: string | null;
  imageUrl: string;
  weightValue: number | null;
  weightUnit: string;
  piecesMin: number | null;
  piecesMax: number | null;
  isFeatured: boolean;
  isBestSeller: boolean;
  isNew: boolean;
  isPromo: boolean;
  ratingAverage: number;
  ratingCount: number;
  soldCount: number;
  currentStock: number;
  articleId: string | null;
  article: {
    title: string;
    slug: string;
    excerpt: string;
  } | null;
  storageInstructions: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  media: Array<{
    id: string;
    mediaType: string;
    url: string;
    thumbnailUrl: string | null;
    posterUrl: string | null;
    altText: string | null;
    title: string | null;
    sortOrder: number;
    isPrimary: boolean;
    width: number | null;
    height: number | null;
  }>;
  badges: Array<{ id: string; label: string; badgeType: string }>;
  related: Array<{ id: string; name: string; slug: string | null; price: number; imageUrl: string }>;
};

const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

async function getProduct(slug: string): Promise<ProductDetail | null> {
  try {
    const res = await fetch(new URL(`/api/products/${slug}`, API_BASE), {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Produk tidak ditemukan" };

  const title = product.seoTitle ?? `${product.name} — Jasmine Shop Premium Product`;
  const description = product.seoDescription ?? product.shortDescription ?? product.description;
  const url = `${BASE}/produk/${product.slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      type: "website",
      url,
      images: [
        {
          url: product.imageUrl,
          alt: product.name,
          width: 1200,
          height: 630,
        },
      ],
    },
  };
}

function StarRating({ average, count }: { average: number; count: number }) {
  return (
    <div className="flex items-center gap-1.5 text-sm text-[var(--ink-700)]">
      <svg className="size-4 fill-[var(--accent-500)]" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
      <span className="font-medium">{average.toFixed(1)}</span>
      <span>({count})</span>
    </div>
  );
}

function ProductJsonLd({ product }: { product: ProductDetail }) {
  const url = `${BASE}/produk/${product.slug}`;
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || product.shortDescription,
    image: product.imageUrl,
    sku: product.sku,
    brand: { "@type": "Brand", name: "Jasmine Shop Premium Product" },
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "IDR",
      availability:
        product.currentStock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      url,
    },
  };

  if (product.ratingCount > 0) {
    jsonLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: product.ratingAverage,
      reviewCount: product.ratingCount,
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }}
    />
  );
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const hasDiscount = product.compareAtPrice != null && product.compareAtPrice > product.price;

  return (
    <div className="min-h-screen bg-[var(--cream-50)]">
      <ProductJsonLd product={product} />
      <StoreHeader />

      <main className="pb-24 lg:pb-16">
        <Container className="pt-4 pb-6">
          <nav aria-label="Breadcrumb" className="text-sm text-[var(--ink-700)]">
            <ol className="flex min-w-0 items-center gap-2">
              <li>
                <Link href="/" className="hover:text-[var(--brand-600)] transition-colors">Beranda</Link>
              </li>
              <li aria-hidden="true" className="text-stone-300">/</li>
              <li>
                <Link href="/produk" className="hover:text-[var(--brand-600)] transition-colors">Produk</Link>
              </li>
              {product.categoryName && (
                <>
                  <li aria-hidden="true" className="text-stone-300">/</li>
                  <li className="text-[var(--ink-700)]">{product.categoryName}</li>
                </>
              )}
              <li aria-hidden="true" className="text-stone-300">/</li>
              <li aria-current="page" className="truncate font-medium text-[var(--ink-950)]">
                {product.name}
              </li>
            </ol>
          </nav>
        </Container>

        <Container>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[48%_1fr_20%] lg:gap-8">
            <MediaGallery media={product.media} />

            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-2">
                {product.badges.map((b) => (
                  <Badge key={b.id} variant="brand">{b.label}</Badge>
                ))}
                {product.isNew && <Badge variant="accent">Baru</Badge>}
                {product.isBestSeller && <Badge variant="success">Terlaris</Badge>}
              </div>

              <h1 className="font-serif text-3xl font-bold leading-tight text-[var(--ink-950)] sm:text-4xl">
                {product.name}
              </h1>

              <div className="flex items-center justify-between gap-3">
                <StarRating average={product.ratingAverage} count={product.ratingCount} />
                <ShareButton title={product.name} url={`${BASE}/produk/${product.slug}`} image={product.imageUrl} iconOnly />
              </div>

              {product.soldCount > 0 && (
                <p className="text-sm text-stone-400">Terjual {product.soldCount.toLocaleString("id-ID")}</p>
              )}

              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-bold text-[var(--brand-600)]">
                  {rupiah.format(product.price)}
                </span>
                {hasDiscount && (
                  <>
                    <span className="text-sm text-stone-400 line-through">
                      {rupiah.format(product.compareAtPrice!)}
                    </span>
                    <Badge variant="danger">
                      -{Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100)}%
                    </Badge>
                  </>
                )}
              </div>

              {product.categoryName && (
                <span className="inline-block text-sm text-[var(--ink-700)]">
                  Kategori: {product.categoryName}
                </span>
              )}

              {product.shortDescription && (
                <p className="text-[var(--ink-700)] leading-relaxed">{product.shortDescription}</p>
              )}

              <div className="grid grid-cols-2 gap-3 rounded-xl border border-[var(--border)] bg-white p-4 text-sm">
                {product.weightValue && (
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-stone-400">Berat</dt>
                    <dd className="mt-0.5 font-semibold text-[var(--ink-950)]">{product.weightValue} {product.weightUnit}</dd>
                  </div>
                )}
                {product.piecesMin && (
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-stone-400">Isi</dt>
                    <dd className="mt-0.5 font-semibold text-[var(--ink-950)]">
                      {product.piecesMin === product.piecesMax
                        ? `${product.piecesMin} pcs`
                        : `${product.piecesMin}–${product.piecesMax} pcs`}
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-stone-400">SKU</dt>
                  <dd className="mt-0.5 font-semibold text-[var(--ink-950)]">{product.sku}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-stone-400">Stok</dt>
                  <dd className="mt-0.5 font-semibold text-[var(--ink-950)]">
                    {product.currentStock > 0 ? `${product.currentStock} unit` : "Habis"}
                  </dd>
                </div>
              </div>
            </div>

            <StickyPurchase
              product={{
                id: product.id,
                name: product.name,
                slug: product.slug,
                price: product.price,
                compareAtPrice: product.compareAtPrice,
                currentStock: product.currentStock,
              }}
            />
          </div>

          <div className="mt-12 space-y-8 border-t border-[var(--border)] pt-10">
            {product.description && (
              <section>
                <h2 className="mb-3 font-serif text-xl font-bold text-[var(--ink-950)]">Deskripsi Produk</h2>
                <div className="prose-sm max-w-none text-[var(--ink-700)] leading-relaxed whitespace-pre-line">
                  {product.description}
                </div>
              </section>
            )}

            {product.article && (
              <section>
                <h2 className="mb-3 font-serif text-xl font-bold text-[var(--ink-950)]">Artikel Panduan Memasak</h2>
                <div className="rounded-2xl border border-[var(--brand-200)] bg-[var(--brand-50)] p-5">
                  <h3 className="font-semibold text-[var(--brand-800)]">{product.article.title}</h3>
                  <p className="mt-1 text-sm text-[var(--brand-700)] line-clamp-2">{product.article.excerpt}</p>
                  <Link href={`/artikel/${product.article.slug}`} className="mt-3 inline-flex items-center text-sm font-semibold text-[var(--brand-700)] hover:text-[var(--brand-800)]">
                    Baca panduan selengkapnya <span aria-hidden="true" className="ml-1">→</span>
                  </Link>
                </div>
              </section>
            )}

            {product.storageInstructions && (
              <section>
                <h2 className="mb-3 font-serif text-xl font-bold text-[var(--ink-950)]">Cara Penyimpanan</h2>
                <div className="prose-sm max-w-none text-[var(--ink-700)] leading-relaxed whitespace-pre-line">
                  {product.storageInstructions}
                </div>
              </section>
            )}
          </div>

          <div className="mt-12">
            <RelatedProducts products={product.related} />
          </div>
        </Container>
      </main>

      <StoreFooter />
    </div>
  );
}
