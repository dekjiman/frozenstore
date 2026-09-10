import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { CartProvider } from "@/components/cart-provider";
import { AuthProvider } from "@/components/auth-provider";
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

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Jasmine Frozen Food — Frozen Food Berkualitas, Halal & Bergizi",
    template: "%s | Jasmine Frozen Food",
  },
  description:
    "Temukan frozen food berkualitas dari Jasmine Frozen Food. Ayam katsu, nugget, sosis, dan produk siap masak lainnya. Halal, bergizi, dan harga terjangkau.",
  keywords: ["frozen food", "ayam katsu", "nugget", "sosis", "halal", "Jasmine"],
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "Jasmine Frozen Food",
  },
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
          <CartProvider>{children}</CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
