import Script from "next/script";

const adClientId = process.env.NEXT_PUBLIC_AD_CLIENT_ID;

export function AdSenseProvider() {
  if (!adClientId || process.env.NODE_ENV !== "production") return null;

  return (
    <Script
      id="adsense-sdk"
      async
      strategy="afterInteractive"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adClientId}`}
      crossOrigin="anonymous"
      onReady={() => {
        if (adClientId) {
          const adsWindow = window as Window & { adsbygoogle?: unknown[] };
          const ads = adsWindow.adsbygoogle ?? [];
          adsWindow.adsbygoogle = ads;
          ads.push({});
        }
      }}
    />
  );
}