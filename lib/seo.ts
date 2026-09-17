import type { Metadata } from "next";

export const SEO_BASE = (
  process.env.NEXT_PUBLIC_BASE_URL ??
  process.env.BASE_URL ??
  "http://localhost:3000"
).replace(/\/+$/, "");

export const SITE_NAME = "Jasmine Frozen Food";

export const SITE_TAGLINE = "Frozen Food Premium, Halal & Bergizi";

export const SITE_DESCRIPTION =
  "Temukan frozen food premium dari Jasmine Frozen Food. Ayam katsu, nugget, sosis, dan produk siap masak lainnya. Halal, bergizi, dan harga terjangkau.";

export const DEFAULT_OG_IMAGE = "/images/og-default.jpg";

const DAY_INDEX: Record<string, number> = {
  senin: 1,
  selasa: 2,
  rabu: 3,
  kamis: 4,
  jumat: 5,
  "jum'at": 5,
  sabtu: 6,
  minggu: 0,
  ahad: 0,
  "setiap hari": 1,
};

export function absoluteUrl(path: string | null | undefined): string {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${SEO_BASE}/${path.replace(/^\/+/, "")}`;
}

export function jsonLdScript(graph: Record<string, unknown>): string {
  return JSON.stringify(graph)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}

export function canonical(path: string): Pick<Metadata, "alternates"> {
  return { alternates: { canonical: absoluteUrl(path) } };
}

export function noIndex(): Pick<Metadata, "robots"> {
  return { robots: { index: false, follow: true, googleBot: { index: false, follow: true } } };
}

export function breadcrumbJsonLd(
  items: { name: string; path: string }[],
): Record<string, unknown> {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function parseOpeningHoursSpecification(
  text: string | null | undefined,
): Record<string, unknown>[] | undefined {
  if (!text) return undefined;
  const times = [...text.matchAll(/(\d{1,2})[.:](\d{2})/g)].map(
    (m) => `${m[1].padStart(2, "0")}:${m[2]}`,
  );
  if (times.length < 2) return undefined;
  const lowered = text.toLowerCase().replace(/[–—]/g, "-");
  const dayNames = Object.keys(DAY_INDEX).filter((d) => lowered.includes(d));
  if (dayNames.length === 0) return undefined;

  let daysOfWeek: string[] = [];
  const rangeSeparator = lowered.includes("-") ? "-" : "sampai";
  const [startDay, endDay] = lowered.split(rangeSeparator).map((s) => s.trim());
  const startName = Object.keys(DAY_INDEX).find((d) => startDay?.startsWith(d));
  const endName = Object.keys(DAY_INDEX).find((d) => endDay?.startsWith(d));

  if (startName && endName && DAY_INDEX[startName] !== undefined && DAY_INDEX[endName] !== undefined) {
    const start = DAY_INDEX[startName];
    const end = DAY_INDEX[endName];
    if (start <= end) {
      for (let d = start; d <= end; d += 1) daysOfWeek.push(String(d));
    } else {
      for (let d = start; d <= 6; d += 1) daysOfWeek.push(String(d));
      for (let d = 0; d <= end; d += 1) daysOfWeek.push(String(d));
    }
  }

  if (daysOfWeek.length === 0) {
    daysOfWeek = [...new Set(dayNames.map((d) => String(DAY_INDEX[d])))];
  }

  return [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: daysOfWeek,
      opens: times[0],
      closes: times[1],
    },
  ];
}

export type StoreProfile = {
  brandName: string;
  tagline?: string | null;
  logoUrl?: string | null;
  email?: string | null;
  whatsappNumber?: string | null;
  address?: string | null;
  operatingHours?: string | null;
  instagramUrl?: string | null;
  tiktokUrl?: string | null;
  facebookUrl?: string | null;
  youtubeUrl?: string | null;
  marketplaceUrls?: string[];
};

function normalizePhone(raw: string | null | undefined): string | undefined {
  if (!raw) return undefined;
  const digits = raw.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return digits;
  if (digits.startsWith("62")) return `+${digits}`;
  if (digits.startsWith("0")) return `+62${digits.slice(1)}`;
  return digits.length >= 9 ? `+62${digits}` : undefined;
}

export function storeJsonLd(profile: StoreProfile): Record<string, unknown> {
  const sameAs = [
    profile.instagramUrl,
    profile.tiktokUrl,
    profile.facebookUrl,
    profile.youtubeUrl,
    ...(profile.marketplaceUrls ?? []),
  ].filter((url): url is string => Boolean(url));

  const telephone = normalizePhone(profile.whatsappNumber);

  const node: Record<string, unknown> = {
    "@type": "Store",
    "@id": `${SEO_BASE}/#store`,
    name: profile.brandName,
    url: SEO_BASE,
    image: absoluteUrl(profile.logoUrl),
    logo: absoluteUrl(profile.logoUrl),
    priceRange: "Rp",
    currenciesAccepted: "IDR",
    areaServed: { "@type": "Country", name: "Indonesia" },
  };

  if (profile.tagline) node.slogan = profile.tagline;
  if (telephone) node.telephone = telephone;
  if (profile.email) node.email = profile.email;

  const postalAddress = profile.address
    ? {
        "@type": "PostalAddress",
        streetAddress: profile.address.split(",")[0]?.trim() ?? profile.address,
        addressLocality: "Jakarta Selatan",
        addressRegion: "DKI Jakarta",
        addressCountry: "ID",
      }
    : undefined;
  if (postalAddress) node.address = postalAddress;

  const openingHours = parseOpeningHoursSpecification(profile.operatingHours);
  if (openingHours) node.openingHoursSpecification = openingHours;
  if (sameAs.length > 0) node.sameAs = sameAs;

  return node;
}

export function organizationJsonLd(): Record<string, unknown> {
  return {
    "@type": "Organization",
    "@id": `${SEO_BASE}/#organization`,
    name: SITE_NAME,
    url: SEO_BASE,
    logo: absoluteUrl("/images/logo/logo_jusmine.png"),
  };
}

export function websiteJsonLd(): Record<string, unknown> {
  return {
    "@type": "WebSite",
    "@id": `${SEO_BASE}/#website`,
    name: SITE_NAME,
    url: SEO_BASE,
    inLanguage: "id-ID",
    publisher: { "@id": `${SEO_BASE}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SEO_BASE}/produk?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}
