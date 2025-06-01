import { NextRequest, NextResponse } from "next/server";
import { AnalyticsService } from "@/services/admin/analyticsService";

const analyticsService = AnalyticsService.getInstance();

/**
 * GET /api/admin/analytics/status - Get analytics service status and health
 * This endpoint provides real-time status information about the analytics service
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const detailed = searchParams.get("detailed") === "true";

    const startTime = Date.now();

    // Basic service availability checks
    const serviceChecks = await Promise.allSettled([
      // Test analytics summary generation
      analyticsService
        .getAnalyticsSummary()
        .then(() => ({ service: "analytics", status: "healthy" })),

      // Test system metrics collection
      analyticsService
        .getCurrentMetrics()
        .then(() => ({ service: "metrics", status: "healthy" })),

      // Test chart generation
      analyticsService
        .generateCharts()
        .then(() => ({ service: "charts", status: "healthy" })),

      // Test export functionality
      analyticsService
        .exportAnalytics({
          format: "json",
          includeCharts: false,
          includeRawData: false,
        })
        .then(() => ({ service: "export", status: "healthy" })),
    ]);

    const responseTime = Date.now() - startTime;

    // Process service check results
    const services = serviceChecks.map((result, index) => {
      const serviceNames = ["analytics", "metrics", "charts", "export"];
      const serviceName = serviceNames[index];

      if (result.status === "fulfilled") {
        return {
          name: serviceName,
          status: "healthy" as const,
          responseTime: responseTime / serviceChecks.length, // Approximate per-service time
          lastCheck: new Date().toISOString(),
        };
      } else {
        return {
          name: serviceName,
          status: "unhealthy" as const,
          responseTime: null,
          lastCheck: new Date().toISOString(),
          error:
            result.reason instanceof Error
              ? result.reason.message
              : "Unknown error",
        };
      }
    });

    // Calculate overall status
    const healthyServices = services.filter(
      (s) => s.status === "healthy",
    ).length;
    const totalServices = services.length;

    let overallStatus: "healthy" | "degraded" | "unhealthy";
    if (healthyServices === totalServices) {
      overallStatus = "healthy";
    } else if (healthyServices > totalServices / 2) {
      overallStatus = "degraded";
    } else {
      overallStatus = "unhealthy";
    }

    // Basic status response
    const statusResponse = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      services: {
        healthy: healthyServices,
        total: totalServices,
        availability: `${((healthyServices / totalServices) * 100).toFixed(1)}%`,
      },
      uptime: process.uptime(),
      version: "1.0.0",
    };

    // Add detailed information if requested
    if (detailed) {
      const systemHealth = await analyticsService.getSystemHealthDashboard();

      (statusResponse as any).detailed = {
        services: services,
        systemHealth: {
          overallStatus: systemHealth.overallStatus,
          activeAlerts: systemHealth.activeAlerts.length,
          recentErrors: systemHealth.recentErrors.length,
          uptime: systemHealth.uptime,
          lastUpdated: systemHealth.lastUpdated,
        },
        metrics: {
          memoryUsage: systemHealth.metrics.memoryUsage,
          apiResponseTime: systemHealth.metrics.apiResponseTime,
          errorRate: systemHealth.metrics.errorRate,
          activeConnections: systemHealth.metrics.activeConnections,
        },
        capabilities: {
          analytics: true,
          charts: true,
          export: true,
          monitoring: true,
          realTimeMetrics: true,
        },
      };
    }

    // Set appropriate HTTP status code
    const httpStatus =
      overallStatus === "healthy"
        ? 200
        : overallStatus === "degraded"
          ? 206
          : 503;

    return NextResponse.json(
      {
        success: overallStatus !== "unhealthy",
        data: statusResponse,
      },
      {
        status: httpStatus,
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    console.error("Analytics status API error:", error);

    return NextResponse.json(
      {
        success: false,
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: "Failed to retrieve service status",
        details: error instanceof Error ? error.message : "Unknown error",
        uptime: process.uptime(),
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Content-Type": "application/json",
        },
      },
    );
  }
}
