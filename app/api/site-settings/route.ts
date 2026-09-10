import { NextResponse } from "next/server";
import { getSiteSettings } from "@/lib/queries/site-settings";

export const runtime = "nodejs";
export const revalidate = 60;

export async function GET() {
  try {
    const data = await getSiteSettings();
    return NextResponse.json({ data });
  } catch (error) {
    console.error("Failed to fetch site settings", error);
    return NextResponse.json(
      { error: { code: "SITE_SETTINGS_FAILED", message: "Gagal memuat data pengaturan situs" } },
      { status: 500 },
    );
  }
}
