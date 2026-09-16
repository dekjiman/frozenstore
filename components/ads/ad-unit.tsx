"use client";

import { useEffect, useRef } from "react";

const adClientId = process.env.NEXT_PUBLIC_AD_CLIENT_ID;
const adsEnabled = Boolean(adClientId && process.env.NODE_ENV === "production");

type AdsWindow = Window & { adsbygoogle?: unknown[] };

type AdUnitProps = {
  slot: string;
  format?: "auto" | "rectangle" | "horizontal" | "vertical";
  className?: string;
};

export function AdUnit({ slot, format = "auto", className }: AdUnitProps) {
  const insRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    if (!adsEnabled || !insRef.current) return;
    try {
      const adsWindow = window as AdsWindow;
      const ads = adsWindow.adsbygoogle ?? [];
      adsWindow.adsbygoogle = ads;
      ads.push({});
    } catch (error) {
      console.warn("Gagal memuat iklan:", error);
    }
  }, [slot]);

  if (!adClientId) return null;

  if (!adsEnabled) {
    return (
      <div
        aria-hidden
        className={[
          "grid min-h-20 place-items-center rounded-xl border border-dashed border-stone-300 bg-stone-100/60 text-xs font-medium text-stone-400",
          className ?? "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        Iklan
      </div>
    );
  }

  return (
    <ins
      ref={insRef}
      className={["adsbygoogle block", className ?? ""].filter(Boolean).join(" ")}
      style={{ display: "block", width: "100%" }}
      data-ad-client={adClientId}
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive="true"
    />
  );
}