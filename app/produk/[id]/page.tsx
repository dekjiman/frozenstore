import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ProductDetail } from "@/components/product-detail";
import { db } from "@/db/client";
import { products } from "@/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { toProduct } from "@/lib/product-mapper";

type ProductDetailPageProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

async function findProduct(id: string) {
  const row = await db.query.products.findFirst({
    where: and(eq(products.id, id), eq(products.isActive, true), isNull(products.deletedAt)),
  });
  return row ? toProduct(row) : null;
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await findProduct(id);

  if (!product) {
    return { title: "Produk tidak ditemukan — Raf Store" };
  }

  return {
    title: `${product.name} — Raf Store`,
    description: product.description,
  };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params;
  const product = await findProduct(id);

  if (!product) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-stone-50 text-stone-950">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <Link href="/" className="font-serif text-2xl tracking-tight sm:text-[1.7rem]">
            Raf Store<span className="text-orange-600">.</span>
          </Link>
          <Link
            href="/#products"
            className="inline-flex items-center gap-2 text-sm font-medium text-stone-600 transition hover:text-orange-700"
          >
            <ArrowLeft aria-hidden="true" size={17} />
            Kembali ke katalog
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12 lg:px-10 lg:py-16">
        <nav aria-label="Breadcrumb" className="mb-7 text-sm text-stone-500">
          <ol className="flex min-w-0 items-center gap-2">
            <li>
              <Link href="/" className="transition hover:text-orange-700">
                Beranda
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href="/#products" className="transition hover:text-orange-700">
                Produk
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="truncate font-medium text-stone-800">
              {product.name}
            </li>
          </ol>
        </nav>

        <ProductDetail initialProduct={product} />
      </div>
    </main>
  );
}
