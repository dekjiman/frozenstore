import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { CartProvider } from "@/components/cart-provider";
import { AuthProvider } from "@/components/auth-provider";
import { AdSenseProvider } from "@/components/ads/adsense-provider";
import { AdsBottomBanner } from "@/components/ads/ads-bottom-banner";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import {
  DEFAULT_OG_IMAGE,
  SEO_BASE,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TAGLINE,
} from "@/lib/seo";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const adClientId = process.env.NEXT_PUBLIC_AD_CLIENT_ID;
const defaultTitle = `${SITE_NAME} — ${SITE_TAGLINE}`;

export const metadata: Metadata = {
  metadataBase: new URL(SEO_BASE),
  applicationName: SITE_NAME,
  title: {
    default: defaultTitle,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: ["frozen food", "ayam katsu", "nugget", "sosis", "halal", "Jasmine Frozen Food"],
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: SITE_NAME,
    url: SEO_BASE,
    title: defaultTitle,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} — ${SITE_TAGLINE}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: SITE_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
  ...(adClientId ? { other: { "google-adsense-account": adClientId } } : {}),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" data-scroll-behavior="smooth">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <AuthProvider>
          <CartProvider>
            {children}
            <AdsBottomBanner slot={process.env.NEXT_PUBLIC_AD_SLOT_BOTTOM ?? ""} />
          </CartProvider>
        </AuthProvider>
        <AdSenseProvider />
        <GoogleAnalytics />
      </body>
    </html>
  );
}
