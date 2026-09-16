import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { shippingSettings } from "@/db/schema";
import { requireAdmin } from "@/lib/admin-auth";
import { readShippingSettings } from "@/lib/shipping-service";

export const runtime = "nodejs";

const DEFAULT_ID = "default";

function boolValue(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}
function intValue(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return Math.round(value);
  if (typeof value === "string" && value.trim() !== "" && Number.isFinite(Number(value))) return Math.round(Number(value));
  return undefined;
}
function methodValue(value: unknown): "regular" | "same_day" | "instant" | undefined {
  return value === "regular" || value === "same_day" || value === "instant" ? value : undefined;
}

export async function GET(request: Request) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const settings = await readShippingSettings();
    return NextResponse.json({
      data: {
        id: DEFAULT_ID,
        enableRegular: settings.enableRegular,
        enableSameDay: settings.enableSameDay,
        enableInstant: settings.enableInstant,
        defaultMethod: settings.defaultMethod,
        sameDayFixedCost: settings.sameDayFixedCost,
        flatDeliveryCost: settings.flatDeliveryCost,
      },
    });
  } catch (error) {
    console.error("Failed to get shipping settings", error);
    return NextResponse.json(
      { error: { code: "SHIPPING_SETTINGS_GET_FAILED", message: "Gagal memuat pengaturan pengiriman" } },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const updates: Record<string, unknown> = {};

    if ("enableRegular" in body) updates.enableRegular = boolValue(body.enableRegular);
    if ("enableSameDay" in body) updates.enableSameDay = boolValue(body.enableSameDay);
    if ("enableInstant" in body) updates.enableInstant = boolValue(body.enableInstant);
    if ("sameDayFixedCost" in body) updates.sameDayFixedCost = intValue(body.sameDayFixedCost);
    if ("flatDeliveryCost" in body) updates.flatDeliveryCost = intValue(body.flatDeliveryCost);
    if ("defaultMethod" in body) {
      const defaultMethod = methodValue(body.defaultMethod);
      if (defaultMethod !== undefined) updates.defaultMethod = defaultMethod;
    }
    updates.updatedAt = new Date();

    const existing = await db.query.shippingSettings.findFirst({ where: eq(shippingSettings.id, DEFAULT_ID) });
    if (existing) {
      await db.update(shippingSettings).set(updates).where(eq(shippingSettings.id, DEFAULT_ID));
    } else {
      await db.insert(shippingSettings).values({ id: DEFAULT_ID, ...updates });
    }

    const settings = await readShippingSettings();
    return NextResponse.json({
      data: {
        id: DEFAULT_ID,
        enableRegular: settings.enableRegular,
        enableSameDay: settings.enableSameDay,
        enableInstant: settings.enableInstant,
        defaultMethod: settings.defaultMethod,
        sameDayFixedCost: settings.sameDayFixedCost,
        flatDeliveryCost: settings.flatDeliveryCost,
      },
    });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: { code: "INVALID_JSON", message: "Body JSON tidak valid" } }, { status: 400 });
    }
    console.error("Failed to update shipping settings", error);
    return NextResponse.json(
      { error: { code: "SHIPPING_SETTINGS_UPDATE_FAILED", message: "Gagal mengupdate pengaturan pengiriman" } },
      { status: 500 },
    );
  }
}