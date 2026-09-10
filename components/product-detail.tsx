"use client";

import { useEffect, useState } from "react";
import { Check, PackageCheck, ShieldCheck, ShoppingBag, Truck } from "lucide-react";
import { useCart } from "@/components/cart-provider";
import { ProductImage } from "@/components/product-image";
import { productsApi } from "@/lib/products-api";
import type { Product } from "@/types/product";

type ProductDetailProps = {
  initialProduct: Product;
};

const rupiahFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export function ProductDetail({ initialProduct }: ProductDetailProps) {
  const { addProduct } = useCart();
  const [product, setProduct] = useState(initialProduct);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    productsApi
      .get(initialProduct.id, { signal: controller.signal })
      .then((item) => {
        setProduct(item);
        setLoadError(null);
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setLoadError(error instanceof Error ? error.message : "Gagal memuat detail produk");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [initialProduct.id]);

  function handleAddToCart() {
    addProduct(product);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1600);
  }

  return (
    <div
      aria-busy={isLoading}
      className="grid gap-9 lg:grid-cols-2 lg:items-start lg:gap-16"
    >
      <div className="lg:sticky lg:top-8">
        <ProductImage
          src={product.imageUrl}
          alt={product.name}
          variant="detail"
          loading="eager"
        />
      </div>

      <section aria-labelledby="product-name" className="lg:py-4">
        {loadError ? (
          <p role="alert" className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {loadError}. Menampilkan detail produk tersimpan.
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-[var(--brand-50)] px-3 py-1 text-xs font-semibold text-[var(--brand-700)]">
            {product.category}
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
            <span className="size-1.5 rounded-full bg-emerald-600" />
            Stok tersedia
          </span>
        </div>

        <h1
          id="product-name"
          className="mt-5 max-w-xl font-serif text-4xl leading-tight tracking-tight sm:text-5xl"
        >
          {product.name}
        </h1>
        <p className="mt-4 text-2xl font-semibold tracking-tight text-[var(--brand-600)]">
          {rupiahFormatter.format(product.price)}
        </p>

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={product.stock < 1}
          className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-stone-900 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[var(--brand-700)] focus:outline-none focus:ring-4 focus:ring-[var(--brand-600)]/20 disabled:cursor-not-allowed disabled:bg-stone-300 sm:w-auto"
        >
          {justAdded ? <Check aria-hidden="true" size={18} /> : <ShoppingBag aria-hidden="true" size={18} />}
          {justAdded ? "Ditambahkan ke keranjang" : "Tambah ke keranjang"}
        </button>
        <p className="sr-only" role="status" aria-live="polite">
          {justAdded ? `${product.name} ditambahkan ke keranjang` : ""}
        </p>

        <div className="my-8 h-px bg-stone-200" />

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-stone-900">
            Tentang produk
          </h2>
          <p className="mt-3 max-w-xl text-base leading-7 text-stone-600">{product.description}</p>
        </div>

        <dl className="mt-8 grid grid-cols-2 gap-4 rounded-2xl border border-stone-200 bg-white p-5">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-stone-500">SKU</dt>
            <dd className="mt-1 text-sm font-semibold text-stone-900">{product.sku}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-stone-500">Stok saat ini</dt>
            <dd className="mt-1 text-sm font-semibold text-stone-900">{product.stock} unit</dd>
          </div>
        </dl>

        <ul className="mt-8 grid gap-4 border-t border-stone-200 pt-7 text-sm text-stone-600 sm:grid-cols-3">
          <li className="flex items-center gap-3">
            <PackageCheck aria-hidden="true" size={20} className="shrink-0 text-[var(--brand-600)]" />
            Stok terpantau
          </li>
          <li className="flex items-center gap-3">
            <ShieldCheck aria-hidden="true" size={20} className="shrink-0 text-[var(--brand-600)]" />
            Produk pilihan
          </li>
          <li className="flex items-center gap-3">
            <Truck aria-hidden="true" size={20} className="shrink-0 text-[var(--brand-600)]" />
            Siap dikirim
          </li>
        </ul>
      </section>
    </div>
  );
}
