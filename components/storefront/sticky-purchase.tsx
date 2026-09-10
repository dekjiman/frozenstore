"use client";

import { useState } from "react";
import { Minus, Plus, ShoppingCart, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart-provider";
import type { Product } from "@/types/product";

type StickyPurchaseProps = {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    compareAtPrice: number | null;
    currentStock: number;
  };
};

const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export function StickyPurchase({ product }: StickyPurchaseProps) {
  const { addProduct } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  const inStock = product.currentStock > 0;
  const hasDiscount = product.compareAtPrice != null && product.compareAtPrice > product.price;

  async function handleAddToCart() {
    setAdding(true);
    await addProduct(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        category: "",
        description: "",
        imageUrl: "",
        sku: "",
        stock: product.currentStock,
      } as Product,
      quantity,
    );
    setAdding(false);
  }

  function handleBuyNow() {
    handleAddToCart().then(() => {
      window.location.href = "/keranjang";
    });
  }

  return (
    <>
      <div className="hidden lg:block sticky top-24">
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
          <div className="mb-4">
            {hasDiscount && (
              <span className="text-sm text-stone-400 line-through">
                {rupiah.format(product.compareAtPrice!)}
              </span>
            )}
            <p className="text-2xl font-bold text-[var(--brand-600)]">
              {rupiah.format(product.price)}
            </p>
            {hasDiscount && (
              <span className="mt-1 inline-block rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-[var(--error)]">
                Hemat {Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100)}%
              </span>
            )}
          </div>

          <div className="mb-4 text-sm" aria-live="polite">
            {inStock ? (
              <span className="text-[var(--success)]">Stok tersedia ({product.currentStock})</span>
            ) : (
              <span className="text-[var(--error)]">Stok habis</span>
            )}
          </div>

          <div className="mb-5 flex items-center gap-3">
            <span className="text-sm text-[var(--ink-700)]">Jumlah</span>
            <div className="flex items-center rounded-lg border border-[var(--border)]">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                aria-label="Kurangi jumlah"
                className="grid size-9 place-items-center text-[var(--ink-700)] hover:bg-stone-50 disabled:opacity-40"
              >
                <Minus size={14} />
              </button>
              <span className="w-10 text-center text-sm font-semibold">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(product.currentStock, q + 1))}
                disabled={quantity >= product.currentStock}
                aria-label="Tambah jumlah"
                className="grid size-9 place-items-center text-[var(--ink-700)] hover:bg-stone-50 disabled:opacity-40"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          <div className="space-y-2.5">
            <Button
              onClick={handleAddToCart}
              disabled={!inStock || adding}
              loading={adding}
              variant="primary"
              className="w-full"
            >
              <ShoppingCart size={16} />
              Masukkan Keranjang
            </Button>
            <Button
              onClick={handleBuyNow}
              disabled={!inStock}
              variant="secondary"
              className="w-full"
            >
              <Zap size={16} />
              Beli Langsung
            </Button>
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border)] bg-white p-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] lg:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-lg font-bold text-[var(--brand-600)]">{rupiah.format(product.price)}</p>
            {hasDiscount && (
              <span className="text-xs text-stone-400 line-through">
                {rupiah.format(product.compareAtPrice!)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-lg border border-[var(--border)]">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                aria-label="Kurangi jumlah"
                className="grid size-8 place-items-center text-[var(--ink-700)] disabled:opacity-40"
              >
                <Minus size={12} />
              </button>
              <span className="w-8 text-center text-sm font-semibold">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(product.currentStock, q + 1))}
                disabled={quantity >= product.currentStock}
                aria-label="Tambah jumlah"
                className="grid size-8 place-items-center text-[var(--ink-700)] disabled:opacity-40"
              >
                <Plus size={12} />
              </button>
            </div>
            <Button
              onClick={handleAddToCart}
              disabled={!inStock || adding}
              loading={adding}
              variant="primary"
              size="sm"
              aria-label="Masukkan ke keranjang"
            >
              <ShoppingCart size={14} />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
