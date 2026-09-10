import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { StoreHeader } from "@/components/storefront/store-header";
import { StoreFooter } from "@/components/storefront/store-footer";
import { ProductCard } from "@/components/storefront/product-card";
import { getCatalogProducts } from "@/lib/queries/catalog";
import { db } from "@/db/client";
import { categories as categoriesTable } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const SORT_OPTIONS = [
  { value: "name-asc", label: "Nama A–Z" },
  { value: "name-desc", label: "Nama Z–A" },
  { value: "price-asc", label: "Harga Terendah" },
  { value: "price-desc", label: "Harga Tertinggi" },
  { value: "newest", label: "Terbaru" },
  { value: "popular", label: "Terlaris" },
  { value: "rating", label: "Rating Tertinggi" },
];

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string | null;
  iconKey: string | null;
  sortOrder: number;
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : undefined;
  const promo = typeof params.promo === "string" && params.promo === "true";
  if (q) {
    return {
      title: `Hasil pencarian "${q}" — Jasmine Shop Premium Product`,
      description: `Hasil pencarian "${q}" di Jasmine Shop Premium Product. Temukan frozen food berkualitas, halal, dan bergizi.`,
    };
  }
  if (promo) {
    return {
      title: "Produk Promo — Jasmine Shop Premium Product",
      description: "Temukan produk-produk promo spesial Jasmine Shop Premium Product. Harga menarik untuk produk favorit.",
    };
  }

  return {
    title: "Semua Produk — Jasmine Shop Premium Product",
    description:
      "Jelajahi koleksi frozen food Jasmine Shop Premium Product. Ayam katsu, nugget, sosis, dan produk siap masak lainnya. Halal, bergizi, harga terjangkau.",
  };
}

async function getCatalog(params: Record<string, string | undefined>) {
  const result = await getCatalogProducts({
    q: params.q,
    category: params.category,
    sort: params.sort,
    page: params.page ? Number(params.page) : 1,
    promo: params.promo === "true",
    bestSeller: params.bestSeller === "true",
    featured: params.featured === "true",
    limit: 20,
  });

  return {
    data: result.products,
    meta: {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    },
  };
}

async function getCategories(): Promise<Category[]> {
  try {
    const list = await db.query.categories.findMany({
      where: eq(categoriesTable.isActive, true),
      orderBy: [asc(categoriesTable.sortOrder)],
    });
    return list;
  } catch {
    return [];
  }
}

export default async function CatalogPage({ searchParams }: PageProps) {
  const raw = await searchParams;
  const q = typeof raw.q === "string" ? raw.q : "";
  const category = typeof raw.category === "string" ? raw.category : "";
  const sort = typeof raw.sort === "string" ? raw.sort : "popular";
  const page = typeof raw.page === "string" ? Math.max(1, Number(raw.page)) : 1;
  const promo = typeof raw.promo === "string" ? raw.promo === "true" : false;
  const bestSeller = typeof raw.bestSeller === "string" ? raw.bestSeller === "true" : false;
  const featured = typeof raw.featured === "string" ? raw.featured === "true" : false;

  const [catalog, categories] = await Promise.all([
    getCatalog({ q: q || undefined, category: category || undefined, sort, page: String(page), promo: promo ? "true" : undefined, bestSeller: bestSeller ? "true" : undefined, featured: featured ? "true" : undefined }),
    getCategories(),
  ]);

  const { data: products, meta } = catalog;

  const currentCategory = categories.find((c) => c.slug === category || c.id === category);
  const selectedCategoryValue = currentCategory ? currentCategory.slug : category;

  const buildHref = (overrides: Record<string, string>) => {
    const sp = new URLSearchParams();
    const merged = { q, category, sort, promo: promo ? "true" : undefined, bestSeller: bestSeller ? "true" : undefined, featured: featured ? "true" : undefined, page: "1", ...overrides };
    for (const [k, v] of Object.entries(merged)) {
      if (v) sp.set(k, v);
    }
    return `/produk?${sp.toString()}`;
  };

  return (
    <div className="min-h-screen bg-[var(--cream-50)]">
      <StoreHeader />

      <main className="pb-16">
        <Container className="pt-6 pb-4">
          <h1 className="mb-6 font-serif text-2xl font-bold text-[var(--ink-950)] sm:text-3xl">
            {q
              ? `Hasil pencarian "${q}"`
              : currentCategory
                ? `Kategori: ${currentCategory.name}`
                : promo
                  ? "Produk Promo"
                  : bestSeller
                    ? "Produk Terlaris"
                    : featured
                      ? "Produk Pilihan"
                      : "Semua Produk"}
          </h1>

          <form className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <svg className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-stone-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                type="text"
                name="q"
                defaultValue={q}
                placeholder="Cari produk..."
                className="h-10 w-full rounded-lg border border-[var(--border)] bg-white pl-10 pr-4 text-sm text-[var(--ink-950)] placeholder:text-stone-400 outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-[var(--brand-600)]/10"
              />
            </div>

            <select
              name="category"
              defaultValue={selectedCategoryValue}
              className="h-10 rounded-lg border border-[var(--border)] bg-white px-3 text-sm text-[var(--ink-950)] outline-none focus:border-[var(--brand-600)]"
            >
              <option value="">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>{c.name}</option>
              ))}
            </select>

            <select
              name="sort"
              defaultValue={sort}
              className="h-10 rounded-lg border border-[var(--border)] bg-white px-3 text-sm text-[var(--ink-950)] outline-none focus:border-[var(--brand-600)]"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>

            <button
              type="submit"
              className="h-10 rounded-lg bg-[var(--brand-600)] px-5 text-sm font-medium text-white hover:bg-[var(--brand-700)] transition-colors"
            >
              Cari
            </button>
          </form>
        </Container>

        <Container>
          {products.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-lg font-medium text-[var(--ink-700)]">Produk tidak ditemukan</p>
              <Link href="/produk" className="mt-3 inline-block text-sm text-[var(--brand-600)] hover:underline">
                Lihat semua produk
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 sm:gap-4">
              {products.map((p) => (
                <ProductCard
                  key={p.id}
                  product={{
                    ...p,
                    compareAtPrice: p.compareAtPrice,
                    primaryMediaUrl: p.primaryMediaUrl,
                  }}
                />
              ))}
            </div>
          )}

          {meta.totalPages > 1 && (
            <nav aria-label="Paginasi" className="mt-10 flex items-center justify-center gap-1.5">
              {page > 1 && (
                <Link
                  href={buildHref({ page: String(page - 1) })}
                  className="inline-flex h-9 items-center rounded-lg border border-[var(--border)] bg-white px-3 text-sm text-[var(--ink-700)] hover:bg-stone-50"
                >
                  Sebelumnya
                </Link>
              )}
              {Array.from({ length: meta.totalPages }, (_, i) => i + 1)
                .filter((p) => Math.abs(p - page) <= 2 || p === 1 || p === meta.totalPages)
                .reduce<(number | "...")[]>((acc, p, i, arr) => {
                  if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("...");
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === "..." ? (
                    <span key={`ellipsis-${i}`} className="px-1 text-stone-400">...</span>
                  ) : (
                    <Link
                      key={p}
                      href={buildHref({ page: String(p) })}
                      className={`inline-flex size-9 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                        p === page
                          ? "bg-[var(--brand-600)] text-white"
                          : "border border-[var(--border)] bg-white text-[var(--ink-700)] hover:bg-stone-50"
                      }`}
                    >
                      {p}
                    </Link>
                  ),
                )}
              {page < meta.totalPages && (
                <Link
                  href={buildHref({ page: String(page + 1) })}
                  className="inline-flex h-9 items-center rounded-lg border border-[var(--border)] bg-white px-3 text-sm text-[var(--ink-700)] hover:bg-stone-50"
                >
                  Selanjutnya
                </Link>
              )}
            </nav>
          )}
        </Container>
      </main>

      <StoreFooter />
    </div>
  );
}
