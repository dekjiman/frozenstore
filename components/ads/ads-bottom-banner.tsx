"use client";

import { usePathname } from "next/navigation";
import { AdUnit } from "@/components/ads/ad-unit";

const BLOCKED_PREFIXES = ["/admin", "/akun", "/keranjang", "/checkout", "/masuk", "/daftar"];

type AdsBottomBannerProps = {
  slot: string;
};

export function AdsBottomBanner({ slot }: AdsBottomBannerProps) {
  const pathname = usePathname();

  if (!slot || BLOCKED_PREFIXES.some((prefix) => pathname?.startsWith(prefix))) {
    return null;
  }

  return (
    <div className="bg-[var(--cream-50)] px-4 pb-8 pt-4 sm:px-6">
      <AdUnit slot={slot} />
    </div>
  );
}