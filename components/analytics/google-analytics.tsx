import Script from "next/script";

const gaMeasurementId =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "G-7YXV62BC63";

export function GoogleAnalytics() {
  if (!gaMeasurementId || process.env.NODE_ENV !== "production") return null;

  return (
    <>
      <Script
        id="ga-sdk"
        async
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
      />
      <Script
        id="ga-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${gaMeasurementId}');`,
        }}
      />
    </>
  );
}
