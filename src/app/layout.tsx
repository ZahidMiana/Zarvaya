import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
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
  title: {
    default: "ZARVAYA JEWELS",
    template: "%s | ZARVAYA JEWELS",
  },
  description:
    "Luxury Pakistani jewellery crafted for timeless elegance - necklaces, jhumky, rings, bangles, and sets.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  openGraph: {
    title: "ZARVAYA JEWELS",
    description:
      "Luxury Pakistani jewellery crafted for timeless elegance - necklaces, jhumky, rings, bangles, and sets.",
    siteName: "ZARVAYA JEWELS",
    type: "website",
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
        {children}
        <ToastProvider />
      </body>
    </html>
  );
}
