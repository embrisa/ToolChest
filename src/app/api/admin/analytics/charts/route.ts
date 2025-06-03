import { NextRequest, NextResponse } from "next/server";
import { AnalyticsService } from "@/services/admin/analyticsService";
import type { AnalyticsFilter, AnalyticsChart } from "@/types/admin/analytics";

const analyticsService = AnalyticsService.getInstance();

// Simple in-memory cache for chart data
const chartCache = new Map<string, { data: AnalyticsChart[]; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function getCacheKey(filter?: AnalyticsFilter): string {
  return JSON.stringify(filter || {});
}

function isValidCacheEntry(entry: { data: AnalyticsChart[]; timestamp: number }): boolean {
  return Date.now() - entry.timestamp < CACHE_DURATION;
}

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

    // Check cache first
    const cacheKey = getCacheKey(filter);
    const cached = chartCache.get(cacheKey);

    if (cached && isValidCacheEntry(cached)) {
      return NextResponse.json(
        {
          success: true,
          data: cached.data,
          cached: true,
          cacheTime: new Date(cached.timestamp).toISOString(),
        },
        {
          headers: {
            "Cache-Control": "public, max-age=300", // 5 minutes
            "X-Cache": "HIT",
          },
        },
      );
    }

    // Generate fresh chart data
    const charts = await analyticsService.generateCharts(filter);

    // Cache the result
    chartCache.set(cacheKey, {
      data: charts,
      timestamp: Date.now(),
    });

    // Clean up old cache entries
    for (const [key, entry] of chartCache.entries()) {
      if (!isValidCacheEntry(entry)) {
        chartCache.delete(key);
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: charts,
        cached: false,
        generatedAt: new Date().toISOString(),
      },
      {
        headers: {
          "Cache-Control": "public, max-age=300", // 5 minutes
          "X-Cache": "MISS",
        },
      },
    );
  } catch (error) {
    console.error("Charts API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate chart data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
