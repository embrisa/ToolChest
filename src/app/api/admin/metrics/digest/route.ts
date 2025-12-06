import { NextRequest, NextResponse } from "next/server";
import { metricsDigestService } from "@/services/admin/metricsDigestService";

function isAuthorized(request: NextRequest): boolean {
  const token = request.cookies.get("admin-auth")?.value;
  const secret = process.env.ADMIN_SECRET_TOKEN;
  if (!secret || !token) return false;
  return token === secret;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const windowDays = Number(searchParams.get("windowDays") ?? "7");
    const digest = metricsDigestService.getDigest(windowDays);

    return NextResponse.json(
      {
        success: true,
        data: digest,
        timestamp: new Date().toISOString(),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("[admin/metrics/digest] failed", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to load metrics digest",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

