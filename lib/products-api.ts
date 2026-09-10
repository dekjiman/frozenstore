import type { Product } from "@/types/product";

type ProductsResponse = {
  products: Product[];
};

type ProductResponse = {
  product: Product;
};

type RequestOptions = {
  signal?: AbortSignal;
  params?: Record<string, string>;
};

const baseUrl = typeof window !== "undefined" ? "" : "http://localhost:3000";

export const productsApi = {
  async list({ signal, params }: RequestOptions = {}): Promise<Product[]> {
    const url = new URL("/api/products", baseUrl);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value) url.searchParams.set(key, value);
      }
    }
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal,
    });

    if (!response.ok) {
      throw new Error(`Gagal memuat produk (${response.status})`);
    }

    const payload = (await response.json()) as ProductsResponse;

    if (!Array.isArray(payload.products)) {
      throw new Error("Respons API produk tidak valid");
    }

    return payload.products;
  },

  async get(id: string, { signal }: RequestOptions = {}): Promise<Product> {
    const response = await fetch(`/api/products/${encodeURIComponent(id)}`, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal,
    });

    if (!response.ok) {
      throw new Error(
        response.status === 404 ? "Produk tidak ditemukan" : `Gagal memuat detail produk (${response.status})`,
      );
    }

    const payload = (await response.json()) as ProductResponse;

    if (!payload.product || payload.product.id !== id) {
      throw new Error("Respons API detail produk tidak valid");
    }

    return payload.product;
  },
};
