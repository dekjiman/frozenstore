import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { StoreHeader } from "@/components/storefront/store-header";
import { StoreFooter } from "@/components/storefront/store-footer";
import { ProductCard } from "@/components/storefront/product-card";
import { getCatalogProducts } from "@/lib/queries/catalog";
import { db } from "@/db/client";
import { categories as categoriesTable } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export const revalidate = 300;

type PageProps = {
  params: Promise<{ slug: string }>;
};


type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string | null;
  iconKey: string | null;
  sortOrder: number;
};

type CatalogProduct = {
  id: string;
  name: string;
  slug: string | null;
  price: number;
  compareAtPrice: number | null;
  imageUrl: string;
  shortDescription: string;
  ratingAverage: number;
  ratingCount: number;
  soldCount: number;
  isFeatured: boolean;
  isBestSeller: boolean;
  isNew: boolean;
  isPromo: boolean;
  category: string;
  categoryId: string | null;
  categoryName: string | null;
  primaryMediaUrl: string | null;
  weightValue: number | null;
  weightUnit: string;
  piecesMin: number | null;
  piecesMax: number | null;
  currentStock: number;
};

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

async function getProductsByCategory(categoryId: string): Promise<CatalogProduct[]> {
  try {
    const result = await getCatalogProducts({
      category: categoryId,
      limit: 50,
    });
    return result.products;
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const categories = await getCategories();
  const cat = categories.find((c) => c.slug === slug);
  if (!cat) return { title: "Kategori tidak ditemukan" };
  return {
    title: `${cat.name} — Jasmine Frozen Food`,
    description: cat.description || `Belanja produk ${cat.name} di Jasmine Frozen Food`,
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const categories = await getCategories();
  const cat = categories.find((c) => c.slug === slug);

  if (!cat) notFound();

  const products = await getProductsByCategory(cat.id);

  return (
    <div className="min-h-screen bg-[var(--cream-50)]">
      <StoreHeader />

      <main className="pb-16">
        <Container className="pt-6 pb-4">
          <nav aria-label="Breadcrumb" className="mb-6 text-sm text-[var(--ink-700)]">
            <ol className="flex min-w-0 items-center gap-2">
              <li>
                <Link href="/" className="hover:text-[var(--brand-600)] transition-colors">Beranda</Link>
              </li>
              <li aria-hidden="true" className="text-stone-300">/</li>
              <li>
                <Link href="/produk" className="hover:text-[var(--brand-600)] transition-colors">Produk</Link>
              </li>
              <li aria-hidden="true" className="text-stone-300">/</li>
              <li aria-current="page" className="truncate font-medium text-[var(--ink-950)]">{cat.name}</li>
            </ol>
          </nav>

          <div className="mb-8">
            <h1 className="font-serif text-2xl font-bold text-[var(--ink-950)] sm:text-3xl">{cat.name}</h1>
            {cat.description && (
              <p className="mt-2 max-w-2xl text-[var(--ink-700)]">{cat.description}</p>
            )}
          </div>
        </Container>

        <Container>
          {products.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-lg font-medium text-[var(--ink-700)]">Belum ada produk di kategori ini</p>
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
        </Container>
      </main>

      <StoreFooter />
    </div>
  );
}
