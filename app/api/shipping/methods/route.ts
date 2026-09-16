import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { siteSettings } from "@/db/schema";
import { readShippingSettings } from "@/lib/shipping-service";

export const runtime = "nodejs";

export async function GET() {
  try {
    const [settings, site] = await Promise.all([
      readShippingSettings(),
      db.query.siteSettings.findFirst({ where: eq(siteSettings.id, "default") }),
    ]);
    return NextResponse.json({
      enableRegular: settings.enableRegular,
      enableSameDay: settings.enableSameDay,
      enableInstant: settings.enableInstant,
      defaultMethod: settings.defaultMethod,
      sameDayFixedCost: settings.sameDayFixedCost,
      flatDeliveryCost: settings.flatDeliveryCost,
      whatsappNumber: site?.whatsappNumber ?? "",
    });
  } catch (error) {
    console.error("Failed to load shipping methods", error);
    return NextResponse.json(
      { error: { code: "SHIPPING_METHODS_FAILED", message: "Gagal memuat metode pengiriman" } },
      { status: 500 },
    );
  }
}