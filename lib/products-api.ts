import type { Product } from "@/types/product";

type ProductsResponse = {
  products: Product[];
};

type ProductResponse = {
  product: Product;
};

type RequestOptions = {
  signal?: AbortSignal;
};

export const productsApi = {
  async list({ signal }: RequestOptions = {}): Promise<Product[]> {
    const response = await fetch("/api/products", {
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
