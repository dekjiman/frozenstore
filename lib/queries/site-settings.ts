import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { siteSettings } from "@/db/schema";

export type SiteSettingsDTO = {
  brandName: string;
  tagline: string;
  logoUrl: string | null;
  whatsappNumber: string | null;
  email: string | null;
  address: string | null;
  operatingHours: string | null;
  freeShippingThreshold: number;
  instagramUrl: string | null;
  tiktokUrl: string | null;
  youtubeUrl: string | null;
  facebookUrl: string | null;
};

export async function getSiteSettings(): Promise<SiteSettingsDTO | null> {
  try {
    const row = await db.query.siteSettings.findFirst({
      where: eq(siteSettings.id, "default"),
    });

    if (!row) {
      return null;
    }

    return {
      brandName: row.brandName,
      tagline: row.tagline,
      logoUrl: row.logoUrl,
      whatsappNumber: row.whatsappNumber,
      email: row.email,
      address: row.address,
      operatingHours: row.operatingHours,
      freeShippingThreshold: row.freeShippingThreshold,
      instagramUrl: row.instagramUrl,
      tiktokUrl: row.tiktokUrl,
      youtubeUrl: row.youtubeUrl,
      facebookUrl: row.facebookUrl,
    };
  } catch (error) {
    console.error("Failed to query site settings", error);
    return null;
  }
}
