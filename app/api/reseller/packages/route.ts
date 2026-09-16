import { asc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { resellerPackages } from "@/db/schema";

export const runtime = "nodejs";

export async function GET() {
  try {
    const packages = await db
      .select()
      .from(resellerPackages)
      .where(eq(resellerPackages.isActive, true))
      .orderBy(asc(resellerPackages.sortOrder));

    return NextResponse.json({ data: packages });
  } catch (error) {
    console.error("Failed to list reseller packages", error);
    return NextResponse.json(
      { error: { code: "RESELLER_PACKAGES_LIST_FAILED", message: "Gagal memuat paket kemitraan" } },
      { status: 500 },
    );
  }
}