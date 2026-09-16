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

    const rawMin = searchParams.get("minPrice");
    const rawMax = searchParams.get("maxPrice");
    const minPrice = rawMin === null ? undefined : Number(rawMin);
    const maxPrice = rawMax === null ? undefined : Number(rawMax);
    if (minPrice !== undefined && (!Number.isFinite(minPrice) || minPrice < 0)) {
      return NextResponse.json(
        { error: { code: "INVALID_PRICE_FILTER", message: "Harga minimum tidak valid" } },
        { status: 400 },
      );
    }
    if (maxPrice !== undefined && (!Number.isFinite(maxPrice) || maxPrice < 0)) {
      return NextResponse.json(
        { error: { code: "INVALID_PRICE_FILTER", message: "Harga maksimum tidak valid" } },
        { status: 400 },
      );
    }
    if (minPrice !== undefined && maxPrice !== undefined && maxPrice < minPrice) {
      return NextResponse.json(
        { error: { code: "INVALID_PRICE_FILTER", message: "Harga maksimum tidak boleh kurang dari harga minimum" } },
        { status: 400 },
      );
    }

    const rawPage = searchParams.get("page");
    const rawLimit = searchParams.get("limit");
    const page = rawPage === null ? undefined : Number(rawPage);
    const limit = rawLimit === null ? undefined : Number(rawLimit);
    if (page !== undefined && (!Number.isInteger(page) || page < 1)) {
      return NextResponse.json(
        { error: { code: "INVALID_PAGINATION", message: "Parameter halaman tidak valid" } },
        { status: 400 },
      );
    }
    if (limit !== undefined && (!Number.isInteger(limit) || limit < 1 || limit > 48)) {
      return NextResponse.json(
        { error: { code: "INVALID_PAGINATION", message: "Parameter limit harus antara 1 dan 48" } },
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
      minPrice,
      maxPrice,
      inStock: searchParams.get("inStock") === "true",
      page,
      limit,
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
