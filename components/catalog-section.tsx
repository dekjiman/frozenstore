"use client";

import Link from "next/link";
import { Check, ShoppingBag } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/components/cart-provider";
import { CatalogSearch } from "@/components/catalog-search";
import { EmptySearchState } from "@/components/empty-search-state";
import { ProductImage } from "@/components/product-image";
import { productsApi } from "@/lib/products-api";
import type { Product } from "@/types/product";

const rupiahFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export function CatalogSection() {
  const { addProduct } = useCart();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [addedProductId, setAddedProductId] = useState<string | null>(null);

  const apiParams: Record<string, string> = {};
  if (searchParams.get("q")) apiParams.q = searchParams.get("q")!;
  if (searchParams.get("category")) apiParams.category = searchParams.get("category")!;
  if (searchParams.get("promo") === "true") apiParams.promo = "true";
  if (searchParams.get("bestSeller") === "true") apiParams.bestSeller = "true";
  if (searchParams.get("featured") === "true") apiParams.featured = "true";
  if (searchParams.get("sort")) apiParams.sort = searchParams.get("sort")!;

  useEffect(() => {
    const controller = new AbortController();
    productsApi.list({ signal: controller.signal, params: apiParams })
      .then((items) => {
        setProducts(items);
        setLoadError(null);
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setLoadError(error instanceof Error ? error.message : "Gagal memuat produk");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, []);

  const filteredProducts = useMemo(() => {
    const keyword = query.trim().toLocaleLowerCase("id-ID");

    if (!keyword) {
      return products;
    }

    return products.filter((product) =>
      [product.name, product.category, product.sku].some((field) =>
        field.toLocaleLowerCase("id-ID").includes(keyword),
      ),
    );
  }, [products, query]);

  const hasQuery = query.trim().length > 0;

  function handleAddProduct(product: Product) {
    addProduct(product);
    setAddedProductId(product.id);
    window.setTimeout(
      () => setAddedProductId((currentId) => (currentId === product.id ? null : currentId)),
      1400,
    );
  }

  return (
    <section
      id="products"
      aria-busy={isLoading}
      className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10"
    >
      <p className="sr-only" role="status" aria-live="polite">
        {addedProductId
          ? `${products.find((product) => product.id === addedProductId)?.name} ditambahkan ke keranjang`
          : ""}
      </p>

      <div className="mb-8 flex flex-col gap-6 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-[var(--brand-600)]">Katalog Jasmine Shop Premium Product</p>
          <h2 className="mt-1 font-serif text-3xl tracking-tight sm:text-4xl">Semua produk</h2>
        </div>
        <CatalogSearch value={query} onChange={setQuery} />
      </div>

      {loadError ? (
        <p role="alert" className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {loadError}.
        </p>
      ) : null}

      <div className="mb-5 flex items-center justify-between gap-4 border-b border-stone-200 pb-4">
        <p className="min-w-0 truncate text-sm text-stone-500" aria-live="polite">
          {isLoading
            ? "Memuat produk..."
            : hasQuery
              ? `Hasil pencarian untuk “${query.trim()}”`
              : "Menampilkan seluruh koleksi"}
        </p>
        <p className="shrink-0 text-sm font-medium text-stone-700">
          {filteredProducts.length} produk
        </p>
      </div>

      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 sm:gap-y-10 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product, index) => (
            <article key={product.id} className="min-w-0">
              <Link
                href={`/produk/${product.id}`}
                className="group block rounded-2xl outline-none focus-visible:ring-4 focus-visible:ring-[var(--brand-600)]/25"
              >
                <ProductImage
                  src={product.imageUrl}
                  alt={product.name}
                  variant="card"
                  loading={index < 4 ? "eager" : "lazy"}
                  badge="Tersedia"
                />
                <div className="pt-4">
                  <p className="truncate text-xs font-medium text-stone-500">{product.category}</p>
                  <h3 className="mt-1 truncate text-sm font-semibold tracking-tight text-stone-900 transition group-hover:text-[var(--brand-600)] sm:text-base">
                    {product.name}
                  </h3>
                </div>
              </Link>
              <div className="mt-2 flex items-center justify-between gap-2">
                <p className="min-w-0 truncate text-sm font-medium text-[var(--brand-600)] sm:text-base">
                  {rupiahFormatter.format(product.price)}
                </p>
                <button
                  type="button"
                  onClick={() => handleAddProduct(product)}
                  disabled={product.stock < 1}
                  aria-label={
                    addedProductId === product.id
                      ? `${product.name} ditambahkan ke keranjang`
                      : `Tambah ${product.name} ke keranjang`
                  }
                  className="grid size-9 shrink-0 place-items-center rounded-full bg-stone-900 text-white transition hover:bg-[var(--brand-700)] focus:outline-none focus:ring-4 focus:ring-[var(--brand-600)]/20 disabled:cursor-not-allowed disabled:bg-stone-300 sm:size-10"
                >
                  {addedProductId === product.id ? (
                    <Check aria-hidden="true" size={17} />
                  ) : (
                    <ShoppingBag aria-hidden="true" size={16} />
                  )}
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : isLoading ? (
        <div className="grid min-h-56 place-items-center text-sm text-stone-500">Memuat katalog...</div>
      ) : (
        <EmptySearchState query={query.trim()} onClear={() => setQuery("")} />
      )}
    </section>
  );
}
