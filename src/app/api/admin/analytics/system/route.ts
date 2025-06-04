import { NextRequest, NextResponse } from "next/server";
import { AnalyticsService } from "@/services/admin/analyticsService";
import type {
  SystemHealthDashboard,
  SystemPerformanceMetrics,
  RealTimeMetrics,
} from "@/types/admin/analytics";

const analyticsService = AnalyticsService.getInstance();

// Simple rate limiting
const requestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 60; // requests per window
const RATE_WINDOW = 60 * 1000; // 1 minute

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  if (realIP) {
    return realIP;
  }
  return "unknown";
}

function checkRateLimit(clientIP: string): boolean {
  const now = Date.now();
  const current = requestCounts.get(clientIP);

  if (!current || now > current.resetTime) {
    requestCounts.set(clientIP, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }

  if (current.count >= RATE_LIMIT) {
    return false;
  }

  current.count++;
  return true;
}

/**
 * GET /api/admin/analytics/system - Get system health dashboard data
 */
export async function GET(request: NextRequest) {
  try {
    // Check rate limit
    const clientIP = getClientIP(request);
    if (!checkRateLimit(clientIP)) {
      const current = requestCounts.get(clientIP);
      const retryAfter = current
        ? Math.ceil((current.resetTime - Date.now()) / 1000)
        : 60;

      return NextResponse.json(
        {
          success: false,
          error: "Rate limit exceeded",
          message: `Maximum ${RATE_LIMIT} requests per minute allowed`,
          retryAfter,
        },
        {
          status: 429,
          headers: {
            "Retry-After": retryAfter.toString(),
            "X-RateLimit-Limit": RATE_LIMIT.toString(),
            "X-RateLimit-Remaining": "0",
          },
        },
      );
    }

    const { searchParams } = new URL(request.url);
    const detailed = searchParams.get("detailed") === "true";
    const includeHistory = searchParams.get("includeHistory") === "true";

    let systemMetrics: (SystemHealthDashboard | SystemPerformanceMetrics) & {
      metricsHistory?: RealTimeMetrics[];
    };

    if (detailed) {
      // Get comprehensive system health dashboard
      systemMetrics = await analyticsService.getSystemHealthDashboard();
    } else {
      // Get basic system performance metrics
      systemMetrics = await analyticsService.getSystemPerformanceMetrics();
    }

    // Add real-time metrics if requested
    if (includeHistory) {
      const metricsHistory = await analyticsService.getRealTimeMetrics(100);
      systemMetrics = { ...systemMetrics, metricsHistory };
    }

    const current = requestCounts.get(clientIP);
    const remaining = current
      ? Math.max(0, RATE_LIMIT - current.count)
      : RATE_LIMIT - 1;

    return NextResponse.json(
      {
        success: true,
        data: systemMetrics,
        timestamp: new Date().toISOString(),
        detailed,
        includeHistory,
      },
      {
        headers: {
          "Cache-Control": "private, max-age=30", // 30 seconds cache
          "X-RateLimit-Limit": RATE_LIMIT.toString(),
          "X-RateLimit-Remaining": remaining.toString(),
        },
      },
    );
  } catch (error) {
    console.error("System metrics API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to retrieve system metrics",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
