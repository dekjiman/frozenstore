import { NextResponse } from "next/server";
import { getHomepageData } from "@/lib/queries/homepage";

export const runtime = "nodejs";
export const revalidate = 60;

export async function GET() {
  try {
    const data = await getHomepageData();
    return NextResponse.json({ data });
  } catch (error) {
    console.error("Failed to fetch homepage data", error);
    return NextResponse.json(
      { error: { code: "HOMEPAGE_FAILED", message: "Gagal memuat data homepage" } },
      { status: 500 },
    );
  }
}
