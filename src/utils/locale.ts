import { NextRequest } from "next/server";
import { type Locale, isValidLocale } from "@/utils/i18n/modularTranslations";
import { defaultLocale } from "@/i18n/config";

/**
 * Extract locale from URL path (e.g., /en/api/tools -> "en")
 */
export function extractLocaleFromPath(pathname: string): string | null {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return null;

  const potentialLocale = segments[0];
  return isValidLocale(potentialLocale) ? potentialLocale : null;
}

/**
 * Parse Accept-Language header and return the best match
 */
export function parseAcceptLanguage(
  acceptLanguage: string | null,
): string | null {
  if (!acceptLanguage) return null;

  // Parse the Accept-Language header
  const languages = acceptLanguage
    .split(",")
    .map((lang) => {
      const [code, q = "1"] = lang.trim().split(";q=");
      return { code: code.split("-")[0], quality: parseFloat(q) };
    })
    .sort((a, b) => b.quality - a.quality);

  // Find the first supported language
  for (const lang of languages) {
    if (isValidLocale(lang.code)) {
      return lang.code;
    }
  }

  return null;
}

/**
 * Extract locale from Next.js request with priority order:
 * 1. URL path parameter (/{locale}/api/...)
 * 2. Cookie preference (toolchest-locale)
 * 3. Accept-Language header
 * 4. Default to English
 */
export function extractLocaleFromRequest(request: NextRequest): Locale {
  // 1. Check URL path (/{locale}/api/...)
  const urlLocale = extractLocaleFromPath(request.nextUrl.pathname);
  if (urlLocale && isValidLocale(urlLocale)) {
    return urlLocale;
  }

  // 2. Check cookie preference
  const cookieLocale = request.cookies.get("toolchest-locale")?.value;
  if (cookieLocale && isValidLocale(cookieLocale)) {
    return cookieLocale;
  }

  // 3. Check Accept-Language header
  const headerLocale = parseAcceptLanguage(
    request.headers.get("accept-language"),
  );
  if (headerLocale && isValidLocale(headerLocale)) {
    return headerLocale;
  }

  // 4. Default to English
  return defaultLocale;
}

/**
 * Get locale-specific cache key
 */
export function getLocaleCacheKey(baseKey: string, locale: Locale): string {
  return `${baseKey}:${locale}`;
}

/**
 * Set locale cookie for client-side locale persistence
 */
export function createLocaleCookieHeaders(
  locale: Locale,
): Record<string, string> {
  return {
    "Set-Cookie": `toolchest-locale=${locale}; Path=/; SameSite=Lax; Max-Age=${60 * 60 * 24 * 365}`, // 1 year
  };
}

/**
 * Get locale for default routes (server-side) using cookies and headers
 * This is used by pages that don't have explicit locale in the URL
 */
export async function getDefaultRouteLocale(): Promise<Locale> {
  const { cookies, headers } = await import("next/headers");

  try {
    // 1. Check cookie preference
    const cookieStore = await cookies();
    const cookieLocale = cookieStore.get("toolchest-locale")?.value;
    if (cookieLocale && isValidLocale(cookieLocale)) {
      return cookieLocale;
    }

    // 2. Check Accept-Language header
    const headerStore = await headers();
    const acceptLanguage = headerStore.get("accept-language");
    const headerLocale = parseAcceptLanguage(acceptLanguage);
    if (headerLocale && isValidLocale(headerLocale)) {
      return headerLocale;
    }

    // 3. Default to English
    return defaultLocale;
  } catch (error) {
    // Fallback if cookies/headers are not available
    console.warn("Failed to detect locale from cookies/headers:", error);
    return defaultLocale;
  }
}
