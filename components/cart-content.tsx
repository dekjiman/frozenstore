"use client";

import Link from "next/link";
import { LockKeyhole, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/components/cart-provider";
import { ProductImage } from "@/components/product-image";

const rupiahFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export function CartContent() {
  const { items, itemCount, subtotal, isLoading, error, updateQuantity, removeItem } = useCart();
  const [announcement, setAnnouncement] = useState("");

  function changeQuantity(itemId: string, nextQuantity: number) {
    const targetItem = items.find((item) => item.id === itemId);
    if (!targetItem) return;

    const quantity = Math.min(Math.max(nextQuantity, 1), targetItem.product.stock);
    updateQuantity(itemId, quantity);
    setAnnouncement(`Jumlah ${targetItem.product.name} diperbarui menjadi ${quantity}`);
  }

  function deleteItem(itemId: string) {
    const removedItem = items.find((item) => item.id === itemId);
    if (!removedItem) return;

    removeItem(itemId);
    setAnnouncement(`${removedItem.product.name} dihapus dari keranjang`);
  }

  if (isLoading) {
    return <div className="grid min-h-[60vh] place-items-center text-sm text-stone-500">Memuat keranjang...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="grid min-h-[60vh] place-items-center px-5 py-12 text-center sm:px-8">
        <div>
          <span className="mx-auto grid size-16 place-items-center rounded-full bg-orange-100 text-orange-700">
            <ShoppingBag aria-hidden="true" size={28} />
          </span>
          <h1 className="mt-6 font-serif text-4xl tracking-tight sm:text-5xl">Keranjangmu masih kosong</h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-stone-500">
            {error ?? "Temukan produk pilihan Raf Store dan tambahkan barang yang kamu suka."}
          </p>
          <Link
            href="/#products"
            className="mt-7 inline-flex rounded-full bg-stone-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-700 focus:outline-none focus:ring-4 focus:ring-orange-600/20"
          >
            Jelajahi produk
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14 lg:px-10 lg:py-16">
      <p className="sr-only" role="status" aria-live="polite">
        {announcement}
      </p>

      <div className="mb-8 sm:mb-10">
        <p className="text-sm font-semibold text-orange-700">Belanjaanmu</p>
        <h1 className="mt-1 font-serif text-4xl tracking-tight sm:text-5xl">Keranjang belanja</h1>
        <p className="mt-3 text-sm text-stone-500">
          {itemCount} item dari {items.length} produk
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-12">
        <section aria-labelledby="cart-items-heading">
          <h2 id="cart-items-heading" className="sr-only">
            Daftar produk di keranjang
          </h2>
          <div className="divide-y divide-stone-200 border-y border-stone-200">
            {items.map((item) => {
              const lineTotal = item.product.price * item.quantity;

              return (
                <article key={item.id} className="flex gap-4 py-6 sm:gap-6 sm:py-7">
                  <ProductImage
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    variant="thumbnail"
                  />
                  <div className="flex min-w-0 flex-1 flex-col justify-between gap-4">
                    <div className="flex min-w-0 justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-stone-500">{item.product.category}</p>
                        <h3 className="mt-1 text-base font-semibold text-stone-900 sm:text-lg">
                          <Link
                            href={`/produk/${item.product.id}`}
                            className="transition hover:text-orange-700"
                          >
                            {item.product.name}
                          </Link>
                        </h3>
                        <p className="mt-1 text-xs text-stone-500">SKU {item.product.sku}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteItem(item.id)}
                        aria-label={`Hapus ${item.product.name} dari keranjang`}
                        className="grid size-9 shrink-0 place-items-center rounded-full text-stone-400 transition hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-4 focus:ring-red-600/10"
                      >
                        <Trash2 aria-hidden="true" size={17} />
                      </button>
                    </div>

                    <div className="flex flex-wrap items-end justify-between gap-3">
                      <div
                        className="inline-flex h-10 items-center rounded-full border border-stone-300 bg-white"
                        aria-label={`Atur jumlah ${item.product.name}`}
                      >
                        <button
                          type="button"
                          onClick={() => changeQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          aria-label={`Kurangi jumlah ${item.product.name}`}
                          className="grid size-10 place-items-center rounded-full text-stone-700 transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:text-stone-300"
                        >
                          <Minus aria-hidden="true" size={16} />
                        </button>
                        <output
                          aria-label={`Jumlah ${item.product.name}`}
                          className="min-w-8 text-center text-sm font-semibold"
                        >
                          {item.quantity}
                        </output>
                        <button
                          type="button"
                          onClick={() => changeQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stock}
                          aria-label={`Tambah jumlah ${item.product.name}`}
                          className="grid size-10 place-items-center rounded-full text-stone-700 transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:text-stone-300"
                        >
                          <Plus aria-hidden="true" size={16} />
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-stone-500">
                          {rupiahFormatter.format(item.product.price)} / item
                        </p>
                        <p className="mt-1 font-semibold text-stone-900">
                          {rupiahFormatter.format(lineTotal)}
                        </p>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <aside className="rounded-3xl border border-stone-200 bg-white p-6 shadow-[0_18px_50px_-30px_rgba(28,25,23,0.35)] lg:sticky lg:top-8">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-full bg-orange-100 text-orange-700">
              <ShoppingBag aria-hidden="true" size={19} />
            </span>
            <h2 className="font-serif text-2xl">Ringkasan belanja</h2>
          </div>

          <dl className="mt-6 space-y-4 text-sm">
            <div className="flex items-center justify-between gap-4 text-stone-600">
              <dt>Subtotal ({itemCount} item)</dt>
              <dd className="font-medium text-stone-900">{rupiahFormatter.format(subtotal)}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 text-stone-600">
              <dt>Pengiriman</dt>
              <dd className="text-right text-xs">Dihitung saat checkout</dd>
            </div>
          </dl>

          <div className="my-6 h-px bg-stone-200" />

          <div className="flex items-end justify-between gap-4">
            <p className="font-semibold text-stone-900">Total sementara</p>
            <p className="text-xl font-bold text-orange-700">
              {rupiahFormatter.format(subtotal)}
            </p>
          </div>

          <Link
            href="/checkout"
            className="mt-6 flex w-full items-center justify-center rounded-full bg-stone-900 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-orange-700 focus:outline-none focus:ring-4 focus:ring-orange-600/20"
          >
            Lanjut ke checkout
          </Link>
          <p className="mt-4 flex items-center justify-center gap-2 text-xs text-stone-500">
            <LockKeyhole aria-hidden="true" size={14} />
            Transaksi aman dan terlindungi
          </p>
        </aside>
      </div>
    </div>
  );
}
