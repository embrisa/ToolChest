import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const token = formData.get("token") as string;
    const redirect = (formData.get("redirect") as string) || "/admin/dashboard";

    const secretToken = process.env.ADMIN_SECRET_TOKEN;

    if (!token) {
      return NextResponse.redirect(
        new URL(
          `/admin/auth?error=Token is required&redirect=${encodeURIComponent(redirect)}`,
          request.url,
        ),
      );
    }

    if (!secretToken) {
      console.error("ADMIN_SECRET_TOKEN not configured");
      return NextResponse.redirect(
        new URL(
          `/admin/auth?error=Server configuration error&redirect=${encodeURIComponent(redirect)}`,
          request.url,
        ),
      );
    }

    if (token !== secretToken) {
      return NextResponse.redirect(
        new URL(
          `/admin/auth?error=Invalid token&redirect=${encodeURIComponent(redirect)}`,
          request.url,
        ),
      );
    }

    // Set the admin cookie
    const response = NextResponse.redirect(new URL(redirect, request.url));

    response.cookies.set("admin-auth", token, {
      path: "/admin",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    return response;
  } catch (error) {
    console.error("Admin auth error:", error);
    return NextResponse.redirect(
      new URL("/admin/auth?error=Authentication failed", request.url),
    );
  }
}

// GET endpoint for logout
export async function DELETE(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/admin/auth", request.url));

  response.cookies.delete("admin-auth");

  return response;
}
