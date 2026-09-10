"use client";

import Link from "next/link";
import { CheckCircle2, X } from "lucide-react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { ApiError, apiFetch } from "@/lib/client-api";
import type { CartItem } from "@/types/cart";
import type { Product } from "@/types/product";

type CartPayload = { id: string; items: CartItem[]; itemCount: number; subtotal: number };
type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  isLoading: boolean;
  error: string | null;
  addProduct: (product: Product, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  refreshCart: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  function applyCart(cart: CartPayload) {
    setItems(cart.items);
    setError(null);
  }

  async function refreshCart() {
    try {
      applyCart((await apiFetch<{ cart: CartPayload }>("/api/cart", { cache: "no-store" })).cart);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Gagal memuat keranjang");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    apiFetch<{ cart: CartPayload }>("/api/cart", { cache: "no-store" })
      .then((payload) => { setItems(payload.cart.items); setError(null); })
      .catch((caught) => setError(caught instanceof Error ? caught.message : "Gagal memuat keranjang"))
      .finally(() => setIsLoading(false));
  }, []);
  useEffect(() => {
    if (!notification) return;
    const timeoutId = window.setTimeout(() => setNotification(null), 3200);
    return () => window.clearTimeout(timeoutId);
  }, [notification]);

  const totals = useMemo(() => items.reduce(
    (result, item) => ({ itemCount: result.itemCount + item.quantity, subtotal: result.subtotal + item.lineTotal }),
    { itemCount: 0, subtotal: 0 },
  ), [items]);

  async function addProduct(product: Product, quantity = 1) {
    try {
      if (isLoading) await refreshCart();
      const payload = await apiFetch<{ cart: CartPayload }>("/api/cart/items", {
        method: "POST",
        body: JSON.stringify({ productId: product.id, quantity }),
      });
      applyCart(payload.cart);
      setNotification(`${product.name} berhasil ditambahkan ke keranjang`);
    } catch (caught) {
      const message = caught instanceof ApiError ? caught.message : "Gagal menambahkan produk";
      setError(message);
      setNotification(message);
    }
  }

  async function updateQuantity(itemId: string, quantity: number) {
    try {
      applyCart((await apiFetch<{ cart: CartPayload }>(`/api/cart/items/${encodeURIComponent(itemId)}`, {
        method: "PATCH", body: JSON.stringify({ quantity }),
      })).cart);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Gagal mengubah jumlah");
    }
  }

  async function removeItem(itemId: string) {
    try {
      applyCart((await apiFetch<{ cart: CartPayload }>(`/api/cart/items/${encodeURIComponent(itemId)}`, {
        method: "DELETE",
      })).cart);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Gagal menghapus item");
    }
  }

  return (
    <CartContext.Provider value={{ items, itemCount: totals.itemCount, subtotal: totals.subtotal, isLoading, error, addProduct, updateQuantity, removeItem, refreshCart }}>
      {children}
      {notification ? (
        <div role="status" aria-live="polite" className="fixed bottom-5 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-center gap-3 rounded-2xl border border-stone-700 bg-stone-950 p-3.5 text-white shadow-2xl sm:bottom-7">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-emerald-500/15 text-emerald-400"><CheckCircle2 size={19} /></span>
          <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{notification}</p><Link href="/keranjang" className="mt-0.5 inline-block text-xs text-[var(--brand-200)]">Lihat keranjang</Link></div>
          <button type="button" onClick={() => setNotification(null)} aria-label="Tutup notifikasi" className="grid size-8 place-items-center rounded-full text-stone-400"><X size={16} /></button>
        </div>
      ) : null}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart harus digunakan di dalam CartProvider");
  return context;
}
