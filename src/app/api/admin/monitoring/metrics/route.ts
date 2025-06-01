import { NextRequest, NextResponse } from "next/server";
import { AnalyticsService } from "@/services/admin/analyticsService";

const analyticsService = AnalyticsService.getInstance();

// Rate limiting
const requestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 120; // requests per window
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
 * GET /api/admin/monitoring/metrics - Get real-time system metrics
 * Query parameters:
 * - limit: number of metrics entries to return (default: 100, max: 1000)
 * - from: start timestamp (ISO string)
 * - to: end timestamp (ISO string)
 * - current: if 'true', return only current metrics
 * - stream: if 'true', enable server-sent events (not implemented in this version)
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

    // Parse query parameters
    const limit = Math.min(parseInt(searchParams.get("limit") || "100"), 1000);
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const currentOnly = searchParams.get("current") === "true";
    const includeHistory = searchParams.get("includeHistory") === "true";

    let metricsData;

    if (currentOnly) {
      // Get only current metrics
      const currentMetrics = await analyticsService.getCurrentMetrics();
      metricsData = {
        current: currentMetrics,
        history: [],
        summary: {
          total: 1,
          timeRange: {
            start: currentMetrics.timestamp,
            end: currentMetrics.timestamp,
          },
        },
      };
    } else {
      // Get historical metrics
      const metrics = await analyticsService.getRealTimeMetrics(limit);

      // Apply date filters if provided
      let filteredMetrics = metrics;
      if (from || to) {
        const fromDate = from ? new Date(from) : new Date(0);
        const toDate = to ? new Date(to) : new Date();

        filteredMetrics = metrics.filter(
          (m) => m.timestamp >= fromDate && m.timestamp <= toDate,
        );
      }

      // Calculate summary statistics
      const summary = calculateMetricsSummary(filteredMetrics);

      metricsData = {
        current:
          filteredMetrics.length > 0
            ? filteredMetrics[0]
            : await analyticsService.getCurrentMetrics(),
        history: includeHistory ? filteredMetrics : [],
        summary,
        filters: {
          limit,
          from,
          to,
          appliedFilters: from || to ? "date" : "none",
        },
      };
    }

    const current = requestCounts.get(clientIP);
    const remaining = current
      ? Math.max(0, RATE_LIMIT - current.count)
      : RATE_LIMIT - 1;

    return NextResponse.json(
      {
        success: true,
        data: metricsData,
        timestamp: new Date().toISOString(),
        currentOnly,
        includeHistory,
      },
      {
        headers: {
          "Cache-Control": "private, max-age=15", // 15 seconds cache for real-time data
          "X-RateLimit-Limit": RATE_LIMIT.toString(),
          "X-RateLimit-Remaining": remaining.toString(),
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    console.error("Metrics API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to retrieve metrics data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

function calculateMetricsSummary(metrics: any[]): any {
  if (metrics.length === 0) {
    return {
      total: 0,
      averages: {},
      peaks: {},
      timeRange: null,
    };
  }

  const averages = {
    apiResponseTime:
      metrics.reduce((sum, m) => sum + m.apiResponseTime, 0) / metrics.length,
    errorRate:
      metrics.reduce((sum, m) => sum + m.errorRate, 0) / metrics.length,
    memoryUsagePercentage:
      metrics.reduce((sum, m) => sum + m.memoryUsage.percentage, 0) /
      metrics.length,
    activeConnections:
      metrics.reduce((sum, m) => sum + m.activeConnections, 0) / metrics.length,
    requestsPerMinute:
      metrics.reduce((sum, m) => sum + m.requestsPerMinute, 0) / metrics.length,
    cpuUsage: metrics.reduce((sum, m) => sum + m.cpuUsage, 0) / metrics.length,
    diskUsage:
      metrics.reduce((sum, m) => sum + m.diskUsage, 0) / metrics.length,
  };

  const peaks = {
    maxApiResponseTime: Math.max(...metrics.map((m) => m.apiResponseTime)),
    maxErrorRate: Math.max(...metrics.map((m) => m.errorRate)),
    maxMemoryUsage: Math.max(...metrics.map((m) => m.memoryUsage.percentage)),
    maxActiveConnections: Math.max(...metrics.map((m) => m.activeConnections)),
    maxRequestsPerMinute: Math.max(...metrics.map((m) => m.requestsPerMinute)),
    maxCpuUsage: Math.max(...metrics.map((m) => m.cpuUsage)),
    maxDiskUsage: Math.max(...metrics.map((m) => m.diskUsage)),
  };

  const timeRange = {
    start: metrics[metrics.length - 1].timestamp,
    end: metrics[0].timestamp,
    duration:
      new Date(metrics[0].timestamp).getTime() -
      new Date(metrics[metrics.length - 1].timestamp).getTime(),
  };

  return {
    total: metrics.length,
    averages: Object.fromEntries(
      Object.entries(averages).map(([key, value]) => [
        key,
        Math.round(value * 100) / 100,
      ]),
    ),
    peaks,
    timeRange,
    trends: calculateTrends(metrics),
  };
}

function calculateTrends(metrics: any[]): any {
  if (metrics.length < 2) {
    return {
      apiResponseTime: "stable",
      errorRate: "stable",
      memoryUsage: "stable",
      cpuUsage: "stable",
    };
  }

  // Simple trend calculation based on first and last values
  const first = metrics[metrics.length - 1];
  const last = metrics[0];

  const calculateTrend = (oldVal: number, newVal: number) => {
    const change = ((newVal - oldVal) / oldVal) * 100;
    if (change > 5) return "increasing";
    if (change < -5) return "decreasing";
    return "stable";
  };

  return {
    apiResponseTime: calculateTrend(
      first.apiResponseTime,
      last.apiResponseTime,
    ),
    errorRate: calculateTrend(first.errorRate, last.errorRate),
    memoryUsage: calculateTrend(
      first.memoryUsage.percentage,
      last.memoryUsage.percentage,
    ),
    cpuUsage: calculateTrend(first.cpuUsage, last.cpuUsage),
  };
}
