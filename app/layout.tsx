import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { CartProvider } from "@/components/cart-provider";
import { AuthProvider } from "@/components/auth-provider";
import { AdSenseProvider } from "@/components/ads/adsense-provider";
import { AdsBottomBanner } from "@/components/ads/ads-bottom-banner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";
const adClientId = process.env.NEXT_PUBLIC_AD_CLIENT_ID;

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Jasmine Shop Premium Product — Frozen Food Premium, Halal & Bergizi",
    template: "%s | Jasmine Shop Premium Product",
  },
  description:
    "Temukan frozen food premium dari Jasmine Shop Premium Product. Ayam katsu, nugget, sosis, dan produk siap masak lainnya. Halal, bergizi, dan harga terjangkau.",
  keywords: ["frozen food", "ayam katsu", "nugget", "sosis", "halal", "Jasmine"],
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "Jasmine Shop Premium Product",
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
      </body>
    </html>
  );
}
