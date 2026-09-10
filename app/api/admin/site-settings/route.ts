import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/db/client";
import { siteSettings } from "@/db/schema";
import { requireAdmin } from "@/lib/admin-auth";
import { revalidateCacheTag, CACHE_TAGS } from "@/lib/cache";

export const runtime = "nodejs";

const DEFAULT_ID = "default";

export async function GET(request: Request) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const row = await db.query.siteSettings.findFirst({
      where: eq(siteSettings.id, DEFAULT_ID),
    });

    return NextResponse.json({ data: row ?? null });
  } catch (error) {
    console.error("Failed to get site settings", error);
    return NextResponse.json(
      { error: { code: "SITE_SETTINGS_GET_FAILED", message: "Gagal memuat pengaturan situs" } },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const updates: Record<string, unknown> = {};

    if ("brandName" in body) updates.brandName = body.brandName;
    if ("tagline" in body) updates.tagline = body.tagline;
    if ("logoUrl" in body) updates.logoUrl = body.logoUrl;
    if ("whatsappNumber" in body) updates.whatsappNumber = body.whatsappNumber;
    if ("email" in body) updates.email = body.email;
    if ("address" in body) updates.address = body.address;
    if ("operatingHours" in body) updates.operatingHours = body.operatingHours;
    if ("freeShippingThreshold" in body) updates.freeShippingThreshold = body.freeShippingThreshold;
    if ("instagramUrl" in body) updates.instagramUrl = body.instagramUrl;
    if ("tiktokUrl" in body) updates.tiktokUrl = body.tiktokUrl;
    if ("youtubeUrl" in body) updates.youtubeUrl = body.youtubeUrl;
    if ("facebookUrl" in body) updates.facebookUrl = body.facebookUrl;
    updates.updatedAt = new Date();

    const existing = await db.query.siteSettings.findFirst({
      where: eq(siteSettings.id, DEFAULT_ID),
    });

    if (existing) {
      await db.update(siteSettings).set(updates).where(eq(siteSettings.id, DEFAULT_ID));
    } else {
      await db.insert(siteSettings).values({ id: DEFAULT_ID, ...updates });
    }

    revalidateCacheTag(CACHE_TAGS.HOMEPAGE);
    revalidatePath("/", "layout");
    revalidatePath("/bantuan");

    return NextResponse.json({ data: { id: DEFAULT_ID } });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: { code: "INVALID_JSON", message: "Body JSON tidak valid" } },
        { status: 400 },
      );
    }
    console.error("Failed to update site settings", error);
    return NextResponse.json(
      { error: { code: "SITE_SETTINGS_UPDATE_FAILED", message: "Gagal mengupdate pengaturan situs" } },
      { status: 500 },
    );
  }
}
