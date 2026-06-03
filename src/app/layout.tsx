import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Playfair_Display } from "next/font/google";
import "./globals.css";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});

const BASE_URL = "https://holysnacks.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "HolySnacks — Snack Holy. Live Wholly.",
    template: "%s | HolySnacks",
  },
  description:
    "Premium natural & organic snacks with zero junk. Scan any product's ingredients instantly, earn XP for healthy choices, and discover clean alternatives to gummies, chocolate, chips, drinks and more.",
  keywords: [
    "healthy snacks", "organic snacks", "natural snacks", "clean eating",
    "ingredient scanner", "food label scanner", "healthy alternatives",
    "no artificial colors", "no preservatives", "Lithuania snacks",
    "gummy bears", "dark chocolate", "baked chips", "healthy drinks",
  ],
  authors: [{ name: "HolySnacks" }],
  creator: "HolySnacks",
  publisher: "HolySnacks",
  category: "food",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: "HolySnacks",
    title: "HolySnacks — Snack Holy. Live Wholly.",
    description:
      "Premium natural & organic snacks. Scan any product's ingredients, earn XP for healthy choices, and find clean alternatives to everything you love.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "HolySnacks — Snack Holy. Live Wholly.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HolySnacks — Snack Holy. Live Wholly.",
    description:
      "Premium natural & organic snacks. Scan ingredients, earn XP, discover clean food.",
    images: ["/og-image.png"],
    creator: "@holysnacks",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geist.variable} ${playfair.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#0b1220] text-[#f5f0eb]">
        {children}
        <PWAInstallPrompt />
      </body>
    </html>
  );
}
