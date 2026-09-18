const gaMeasurementId =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "G-7YXV62BC63";

const gaSnippet = `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${gaMeasurementId}');`;

export function GoogleAnalytics() {
  if (!gaMeasurementId || process.env.NODE_ENV !== "production") return null;

  return (
    <>
      <link rel="preconnect" href="https://www.googletagmanager.com" />
      <script async src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`} />
      <script dangerouslySetInnerHTML={{ __html: gaSnippet }} />
    </>
  );
}