const createIntlMiddleware = require("next-intl/middleware");
const { locales, defaultLocale } = require("./src/i18n/config");

// Create the internationalization middleware
const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always",
  localeDetection: true,
});

// Export the middleware and config
module.exports = function (request) {
  return intlMiddleware(request);
};

module.exports.config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
