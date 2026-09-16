import {
  Beef,
  Box,
  Cake,
  Carrot,
  Circle,
  Cookie,
  Cone,
  Croissant,
  Donut,
  Drumstick,
  Egg,
  Fish,
  Flame,
  HandPlatter,
  IceCreamCone,
  Leaf,
  Microwave,
  Package,
  Pizza,
  Refrigerator,
  Salad,
  Sandwich,
  ShieldCheck,
  Snowflake,
  Soup,
  Sprout,
  Truck,
  Utensils,
  Wheat,
  Citrus,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { createElement } from "react";

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  drumstick: Drumstick,
  ayam: Drumstick,
  beef: Beef,
  fish: Fish,
  seafood: Fish,
  soup: Soup,
  dimsum: Soup,
  circle: Circle,
  bakso: Circle,
  salami: Sandwich,
  sosis: Sandwich,
  potato: Carrot,
  kentang: Carrot,
  cookie: Cookie,
  snack: Cookie,
  utensils: Utensils,
  "ready-meal": Utensils,
  package: Package,
  lainnya: Package,
  snowflake: Snowflake,
  cake: Cake,
  pizza: Pizza,
  salad: Salad,
  sprout: Sprout,
  citrus: Citrus,
  wheat: Wheat,
  egg: Egg,
  croissant: Croissant,
  donut: Donut,
  "ice-cream-cone": IceCreamCone,
  "hand-platter": HandPlatter,
  leaf: Leaf,
  cone: Cone,
  microwave: Microwave,
  refrigerator: Refrigerator,
  box: Box,
  flame: Flame,
  truck: Truck,
  shield: ShieldCheck,
};

export const CATEGORY_ICON_OPTIONS = [
  { key: "drumstick", label: "Ayam" },
  { key: "beef", label: "Daging" },
  { key: "fish", label: "Ikan / Seafood" },
  { key: "soup", label: "Sup / Dimsum" },
  { key: "circle", label: "Bulat / Bakso" },
  { key: "salami", label: "Sosis" },
  { key: "potato", label: "Kentang" },
  { key: "cookie", label: "Snack" },
  { key: "utensils", label: "Makanan Siap Saji" },
  { key: "package", label: "Paket / Lainnya" },
  { key: "snowflake", label: "Dingin" },
  { key: "cake", label: "Kue" },
  { key: "pizza", label: "Pizza" },
  { key: "salad", label: "Salad" },
  { key: "sprout", label: "Sayuran" },
  { key: "citrus", label: "Buah" },
  { key: "wheat", label: "Gandum" },
  { key: "egg", label: "Telur" },
  { key: "croissant", label: "Roti" },
  { key: "donut", label: "Donat" },
  { key: "ice-cream-cone", label: "Es Krim" },
  { key: "hand-platter", label: "Hidangan" },
  { key: "leaf", label: "Daun / Alami" },
  { key: "cone", label: "Kerucut" },
  { key: "microwave", label: "Microwave" },
  { key: "refrigerator", label: "Kulkas" },
  { key: "box", label: "Kotak" },
  { key: "flame", label: "Panas / Masak" },
  { key: "truck", label: "Pengiriman" },
  { key: "shield", label: "Keamanan" },
];

export function getCategoryIcon(iconKey: string | null | undefined): LucideIcon {
  if (!iconKey) return Package;
  const normalized = iconKey.trim().toLowerCase().replace(/_/g, "-");
  return CATEGORY_ICONS[normalized] ?? Package;
}

export function CategoryIcon({
  iconKey,
  className,
  strokeWidth = 1.5,
}: {
  iconKey?: string | null;
  className?: string;
  strokeWidth?: number;
}) {
  const Icon = getCategoryIcon(iconKey);
  return createElement(Icon, { className, strokeWidth, "aria-hidden": true });
}