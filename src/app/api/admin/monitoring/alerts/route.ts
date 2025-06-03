import { NextRequest, NextResponse } from "next/server";
import { AnalyticsService } from "@/services/admin/analyticsService";

/**
 * GET /api/admin/monitoring/alerts - Get all alerts with filtering
 */
export async function GET(_request: NextRequest) {
  try {
    const analyticsService = AnalyticsService.getInstance();
    // const { searchParams } = new URL(request.url);

    // In a real implementation, these would be used to filter alerts
    // const _severity = searchParams.get("severity");
    // const _resolved = searchParams.get("resolved");

    // For now, get all alerts from the dashboard data
    const dashboardData = await analyticsService.getSystemHealthDashboard();

    return NextResponse.json({
      success: true,
      data: {
        alerts: dashboardData.activeAlerts,
        total: dashboardData.activeAlerts.length,
      },
    });
  } catch (error) {
    console.error("Alerts API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch alerts",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/admin/monitoring/alerts - Acknowledge or resolve alerts
 */
export async function PATCH(request: NextRequest) {
  try {
    const analyticsService = AnalyticsService.getInstance();
    const body = await request.json();

    const { alertId, action, acknowledgedBy = "admin" } = body;

    if (!alertId || !action) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: alertId and action",
        },
        { status: 400 },
      );
    }

    if (action === "acknowledge") {
      await analyticsService.acknowledgeAlert(alertId, acknowledgedBy);
    } else if (action === "resolve") {
      await analyticsService.resolveAlert(alertId);
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid action. Must be "acknowledge" or "resolve"',
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      message: `Alert ${action}d successfully`,
    });
  } catch (error) {
    console.error("Alert management API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to manage alert",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
