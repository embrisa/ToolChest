import { NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { locales, defaultLocale } from "@/i18n/config";

// Create the internationalization middleware
const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: "as-needed", // Don't prefix default locale (English)
  localeDetection: true,
});

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for API routes, static files, and admin auth
  const shouldSkip = [
    "/api",
    "/_next",
    "/favicon.ico",
    "/robots.txt",
    "/sitemap.xml",
  ].some((path) => pathname.startsWith(path));

  if (shouldSkip) {
    return;
  }

  // Handle admin authentication for admin routes
  if (pathname.match(/^\/[a-z]{2}\/admin/) || pathname.startsWith("/admin")) {
    // Skip auth check for the auth endpoint itself
    if (pathname.endsWith("/admin/auth")) {
      return intlMiddleware(request);
    }

    const adminCookie = request.cookies.get("admin-auth");
    const secretToken = process.env.ADMIN_SECRET_TOKEN;

    if (!adminCookie || !secretToken || adminCookie.value !== secretToken) {
      // Extract locale from path for redirect
      const localeMatch = pathname.match(/^\/([a-z]{2})\//);
      const locale = localeMatch ? localeMatch[1] : defaultLocale;

      // Redirect to auth endpoint with locale
      const authUrl = new URL(`/${locale}/admin/auth`, request.url);
      authUrl.searchParams.set("redirect", pathname);
      return Response.redirect(authUrl);
    }
  }

  // Apply internationalization middleware
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * 1. /api (API routes)
     * 2. /_next (Next.js internals)
     * 3. /_static (inside /public)
     * 4. all root files inside /public (e.g. /favicon.ico)
     */
    "/((?!api|_next|_static|_vercel|[\\w-]+\\.\\w+).*)",
  ],
};
