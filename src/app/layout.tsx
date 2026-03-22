import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Providers } from "@/components/providers/Providers";
import ToastProvider from "@/components/providers/ToastProvider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  weight: ["300", "400", "500"],
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "ZARVAYA JEWELS | Premium Pakistani Jewellery",
    template: "%s | ZARVAYA JEWELS",
  },
  description: "Shop handpicked necklaces, jhumky, rings and bangles crafted for modern Pakistani elegance.",
  keywords: [
    "jewellery Pakistan",
    "jhumky online",
    "gold plated jewellery",
    "Pakistani jewellery store",
    "online jewellery Pakistan",
  ],
  openGraph: {
    type: "website",
    locale: "en_PK",
    siteName: "ZARVAYA JEWELS",
    title: "ZARVAYA JEWELS | Premium Pakistani Jewellery",
    description: "Shop handpicked necklaces, jhumky, rings and bangles crafted for modern Pakistani elegance.",
  },
  twitter: {
    card: "summary_large_image",
    site: "@ZarvayaJewels",
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION ?? "google-site-verification-pending",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} scroll-smooth`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-cream text-charcoal antialiased">
        <Providers>
          {children}
          <ToastProvider />
        </Providers>
      </body>
    </html>
  );
}
