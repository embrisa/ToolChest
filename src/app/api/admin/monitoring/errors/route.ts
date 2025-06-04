import { NextRequest, NextResponse } from "next/server";
import { AnalyticsService } from "@/services/admin/analyticsService";
import type { MonitoringFilter } from "@/types/admin/analytics";

/**
 * GET /api/admin/monitoring/errors - Get error logs with filtering
 */
export async function GET(request: NextRequest) {
  try {
    const analyticsService = AnalyticsService.getInstance();
    const { searchParams } = new URL(request.url);

    // Parse query parameters for filtering
    const startDate = searchParams.get("start");
    const endDate = searchParams.get("end");
    const levels = searchParams.get("levels")?.split(",");
    const resolved = searchParams.get("resolved");

    // Build filter object
    const filter: Partial<MonitoringFilter> = {};

    if (startDate && endDate) {
      filter.timeRange = {
        start: new Date(startDate),
        end: new Date(endDate),
        period: "day" as const,
      };
    }

    if (levels?.length) {
      filter.errorLevels = levels as MonitoringFilter["errorLevels"];
    }

    if (resolved !== null) {
      filter.resolved = resolved === "true";
    }

    const errorLogs = await analyticsService.getErrorLogs(
      filter as MonitoringFilter,
    );

    return NextResponse.json({
      success: true,
      data: {
        errors: errorLogs,
        total: errorLogs.length,
        filter,
      },
    });
  } catch (error) {
    console.error("Error logs API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch error logs",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/admin/monitoring/errors - Resolve error logs
 */
export async function PATCH(request: NextRequest) {
  try {
    const analyticsService = AnalyticsService.getInstance();
    const body = await request.json();

    const { errorId, action } = body;

    if (!errorId || action !== "resolve") {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields or invalid action",
        },
        { status: 400 },
      );
    }

    await analyticsService.resolveError(errorId);

    return NextResponse.json({
      success: true,
      message: "Error resolved successfully",
    });
  } catch (error) {
    console.error("Error resolution API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to resolve error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
