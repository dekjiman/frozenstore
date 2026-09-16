import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { shippingSettings } from "@/db/schema";

export type ShippingMethod = "regular" | "same_day" | "instant";

export type ShippingSettingsDto = {
  enableRegular: boolean;
  enableSameDay: boolean;
  enableInstant: boolean;
  defaultMethod: ShippingMethod;
  sameDayFixedCost: number;
  flatDeliveryCost: number;
};

type FullSettings = ShippingSettingsDto & {
  id: string;
  updatedAt: Date;
};

function isShippingMethod(value: unknown): value is ShippingMethod {
  return value === "regular" || value === "same_day" || value === "instant";
}

export async function readShippingSettings(): Promise<FullSettings> {
  const row = await db.query.shippingSettings.findFirst({
    where: eq(shippingSettings.id, "default"),
  });

  if (!row) {
    return {
      id: "default",
      updatedAt: new Date(),
      enableRegular: true,
      enableSameDay: true,
      enableInstant: true,
      defaultMethod: "regular",
      sameDayFixedCost: 25000,
      flatDeliveryCost: 20000,
    };
  }

  return {
    id: row.id,
    updatedAt: row.updatedAt,
    enableRegular: row.enableRegular,
    enableSameDay: row.enableSameDay,
    enableInstant: row.enableInstant,
    defaultMethod: isShippingMethod(row.defaultMethod) ? row.defaultMethod : "regular",
    sameDayFixedCost: row.sameDayFixedCost,
    flatDeliveryCost: row.flatDeliveryCost,
  };
}

export type ShippingDecision = {
  method: ShippingMethod;
  shippingAmount: number;
  orderStatus: "waiting_payment" | "waiting_shipping_fee";
  freeShipping: boolean;
};

export function decideShipping(input: {
  method: ShippingMethod;
  settings: ShippingSettingsDto;
}): ShippingDecision {
  const { method, settings } = input;

  switch (method) {
    case "same_day":
      return {
        method,
        shippingAmount: settings.sameDayFixedCost,
        orderStatus: "waiting_payment",
        freeShipping: false,
      };
    case "instant":
      return {
        method,
        shippingAmount: 0,
        orderStatus: "waiting_shipping_fee",
        freeShipping: false,
      };
    case "regular":
    default:
      return {
        method: "regular",
        shippingAmount: settings.flatDeliveryCost,
        orderStatus: "waiting_payment",
        freeShipping: false,
      };
  }
}