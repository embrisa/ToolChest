import { NextRequest, NextResponse } from "next/server";
import { serviceFactory } from "@/services/core/serviceFactory";

function getClientIP(request: NextRequest): string | null {
  // Prefer standard proxy headers; fall back to Next.js runtime if available
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIP = request.headers.get("x-real-ip");
  if (realIP) return realIP.trim();
  // Some deployments expose request.ip
  // @ts-expect-error: not typed in NextRequest in all environments
  if (request?.ip) return String(request.ip);
  return null;
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const toolService = serviceFactory.getToolService();

    // Count once per unique IP per day. If IP is unavailable, fall back to simple increment.
    const ip = getClientIP(_request);
    if (ip) {
      const { counted } = await toolService.recordUniqueDailyUsage(slug, ip);
      return NextResponse.json({
        success: true,
        counted,
        message: counted
          ? "Usage recorded successfully"
          : "Duplicate visit for today; usage not incremented",
        timestamp: new Date().toISOString(),
      });
    }

    // Fallback: increment without dedup when IP cannot be determined
    await toolService.recordToolUsage(slug);

    return NextResponse.json({
      success: true,
      counted: true,
      message: "Usage recorded successfully (no IP available)",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error recording tool usage:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to record tool usage",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
