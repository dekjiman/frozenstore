import { NextResponse } from "next/server";
import { getCatalogProducts, type CatalogParams } from "@/lib/queries/catalog";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const searchParams = new URL(request.url).searchParams;
    const query = searchParams.get("q")?.trim() ?? "";

    if (query.length > 100) {
      return NextResponse.json(
        { error: { code: "INVALID_SEARCH_QUERY", message: "Kata kunci maksimal 100 karakter" } },
        { status: 400 },
      );
    }

    const params: CatalogParams = {
      q: query || undefined,
      category: searchParams.get("category") ?? undefined,
      featured: searchParams.get("featured") === "true",
      bestSeller: searchParams.get("bestSeller") === "true" || searchParams.get("best-seller") === "true",
      promo: searchParams.get("promo") === "true",
      sort: searchParams.get("sort") ?? undefined,
      minPrice: searchParams.has("minPrice") ? Number(searchParams.get("minPrice")) : undefined,
      maxPrice: searchParams.has("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined,
      inStock: searchParams.get("inStock") === "true",
      page: searchParams.has("page") ? Number(searchParams.get("page")) : undefined,
      limit: searchParams.has("limit") ? Number(searchParams.get("limit")) : undefined,
    };

    const result = await getCatalogProducts(params);

    return NextResponse.json({
      data: result.products,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    });
  } catch (error) {
    console.error("Failed to list products", error);
    return NextResponse.json(
      { error: { code: "PRODUCTS_LIST_FAILED", message: "Gagal memuat daftar produk" } },
      { status: 500 },
    );
  }
}
