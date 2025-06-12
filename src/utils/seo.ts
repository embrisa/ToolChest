import { Metadata } from "next";
import { locales, openGraphLocales, type Locale } from "@/i18n/config";

/**
 * Generate hreflang alternates for SEO
 */
export function generateAlternates(
  currentLocale: Locale,
  pathname: string,
): Metadata["alternates"] {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  const languages: Record<string, string> = {};
  const canonical = `${baseUrl}${pathname}`;

  // Add all supported languages
  locales.forEach((locale) => {
    languages[locale] = `${baseUrl}/${locale}${pathname}`;
  });

  // Add x-default for English (default language)
  languages["x-default"] = `${baseUrl}${pathname}`;

  return {
    canonical,
    languages,
  };
}

/**
 * Generate OpenGraph metadata with proper locale
 */
export function generateOpenGraph(
  currentLocale: Locale,
  title: string,
  description: string,
  pathname: string,
  type: "website" | "article" = "website",
): Metadata["openGraph"] {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  return {
    type,
    locale: openGraphLocales[currentLocale],
    url: `${baseUrl}/${currentLocale}${pathname}`,
    title,
    description,
    siteName: "tool-chest",
    // Add alternate locales for social media
    alternateLocale: locales
      .filter((locale) => locale !== currentLocale)
      .map((locale) => openGraphLocales[locale]),
  };
}

/**
 * Enhanced metadata generator with full i18n SEO support
 */
export function generateSEOMetadata({
  locale,
  title,
  description,
  keywords,
  pathname,
  type = "website",
}: {
  locale: Locale;
  title: string;
  description: string;
  keywords?: string[];
  pathname: string;
  type?: "website" | "article";
}): Metadata {
  return {
    title,
    description,
    ...(keywords && { keywords }),
    alternates: generateAlternates(locale, pathname),
    openGraph: generateOpenGraph(locale, title, description, pathname, type),
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
  };
}
