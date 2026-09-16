import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

function isPublicHttps() {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? process.env.BASE_URL ?? "";
  return base.startsWith("https://");
}

const nextConfig: NextConfig = {
  output: "standalone",
  turbopack: {
    root: projectRoot,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async headers() {
    const isProduction = process.env.NODE_ENV === "production";
    const hasAds = Boolean(process.env.NEXT_PUBLIC_AD_CLIENT_ID);
    const adScriptSrc = hasAds
      ? " https://pagead2.googlesyndication.com https://*.googlesyndication.com"
      : "";
    const adImgSrc = hasAds
      ? " https://*.googlesyndication.com https://*.doubleclick.net https://*.google.com"
      : "";
    const adConnectSrc = hasAds
      ? " https://*.googlesyndication.com https://googleads.g.doubleclick.net"
      : "";
    const devEvalSrc = isProduction ? "" : " 'unsafe-eval'";
    const frameSrc = [
      "https://www.google.com",
      "https://www.google.co.id",
      "https://maps.google.com",
      ...(hasAds
        ? [
            "https://googleads.g.doubleclick.net",
            "https://*.googlesyndication.com",
            "https://*.doubleclick.net",
            "https://adservice.google.com",
          ]
        : []),
    ];
    const cspDirectives = [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline'${devEvalSrc}${adScriptSrc}`,
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      `img-src 'self' data: blob: https://images.unsplash.com https://lh3.googleusercontent.com https://pps.whatsapp.net${adImgSrc}`,
      "font-src 'self' data: https://fonts.gstatic.com",
      `connect-src 'self'${adConnectSrc}`,
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      `frame-src ${frameSrc.join(" ")}`,
      ...(isProduction && isPublicHttps() ? ["upgrade-insecure-requests"] : []),
    ];
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-DNS-Prefetch-Control", value: "off" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
          },
          {
            key: "Content-Security-Policy",
            value: cspDirectives.join("; "),
          },
          ...(isProduction && isPublicHttps()
            ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }]
            : []),
        ],
      },
    ];
  },
};

export default nextConfig;
