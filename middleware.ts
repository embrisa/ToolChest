import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // Only protect admin routes
  if (request.nextUrl.pathname.startsWith("/admin")) {
    // Skip auth check for the auth endpoint itself
    if (request.nextUrl.pathname === "/admin/auth") {
      return NextResponse.next();
    }

    const adminCookie = request.cookies.get("admin-auth");
    const secretToken = process.env.ADMIN_SECRET_TOKEN;

    if (!adminCookie || !secretToken || adminCookie.value !== secretToken) {
      // Redirect to auth endpoint to set the cookie
      const authUrl = new URL("/admin/auth", request.url);
      authUrl.searchParams.set("redirect", request.nextUrl.pathname);
      return NextResponse.redirect(authUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all admin routes except for api routes, _next/static, _next/image, favicon.ico
     */
    "/admin/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
