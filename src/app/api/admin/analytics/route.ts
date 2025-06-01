import { NextRequest, NextResponse } from "next/server";
import { AnalyticsService } from "@/services/admin/analyticsService";
import type { AnalyticsFilter } from "@/types/admin/analytics";

const analyticsService = AnalyticsService.getInstance();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse filter parameters
    const filter: AnalyticsFilter | undefined = (() => {
      const startDate = searchParams.get("startDate");
      const endDate = searchParams.get("endDate");
      const period = searchParams.get("period") as
        | "day"
        | "week"
        | "month"
        | "quarter"
        | "year";
      const toolIds = searchParams.get("toolIds")?.split(",").filter(Boolean);
      const tagIds = searchParams.get("tagIds")?.split(",").filter(Boolean);
      const includeInactive = searchParams.get("includeInactive") === "true";

      if (!startDate || !endDate) {
        return undefined; // Use default time range
      }

      return {
        timeRange: {
          start: new Date(startDate),
          end: new Date(endDate),
          period: period || "day",
        },
        toolIds,
        tagIds,
        includeInactive,
      };
    })();

    const summary = await analyticsService.getAnalyticsSummary(filter);

    return NextResponse.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error("Analytics API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to retrieve analytics data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
