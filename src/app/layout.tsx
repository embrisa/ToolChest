import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { getLocale } from "next-intl/server";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
  fallback: ["system-ui", "arial"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
  preload: true,
  fallback: ["monospace"],
});

export const metadata: Metadata = {
  title: {
    default: "tool-chest - Utility Tools for Common Tasks",
    template: "%s | tool-chest",
  },
  description:
    "A collection of useful utility tools for common tasks including Base64 encoding/decoding, hash generation, favicon creation, and more.",
  keywords: [
    "tools",
    "utilities",
    "base64",
    "hash",
    "favicon",
    "markdown",
    "pdf",
    "converter",
  ],
  authors: [{ name: "tool-chest" }],
  creator: "tool-chest",
  publisher: "tool-chest",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
  ),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "tool-chest - Utility Tools for Common Tasks",
    description:
      "A collection of useful utility tools for common tasks including Base64 encoding/decoding, hash generation, favicon creation, and more.",
    siteName: "tool-chest",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  return (
    <html lang={locale}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="theme-color" content="#0ea5e9" />
        <meta name="color-scheme" content="light" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} flex flex-col min-h-screen bg-background text-foreground font-sans antialiased transition-colors duration-300`}
      >
        <div
          className="fixed inset-0 -z-10 bg-gradient-shift"
          aria-hidden="true"
        />
        <div
          className="fixed inset-0 -z-10 bg-noise opacity-20"
          aria-hidden="true"
        />
        {children}
      </body>
    </html>
  );
}
