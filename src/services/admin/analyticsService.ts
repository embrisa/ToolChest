import { BaseService } from "../core/baseService";
import { prisma } from "@/lib/prisma";
import type {
  AnalyticsSummary,
  ToolUsageAnalytics,
  SystemPerformanceMetrics,
  AnalyticsFilter,
  AnalyticsChart,
  AnalyticsExport,
  ExportOptions,
  AnalyticsTimeRange,
  AnalyticsConfig,
  // System Monitoring Types
  SystemMonitoringConfig,
  ErrorLogEntry,
  SystemAlert,
  RealTimeMetrics,
  SystemHealthCheck,
  SystemHealthDashboard,
  MonitoringFilter,
} from "@/types/admin/analytics";

export class AnalyticsService extends BaseService {
  private static instance: AnalyticsService;
  private config: AnalyticsConfig = {
    refreshInterval: 300, // 5 minutes
    cacheTimeout: 600, // 10 minutes
    enableRealTimeUpdates: false,
    exportLimits: {
      maxRecords: 10000,
      rateLimitWindow: 60, // 1 hour
      rateLimitRequests: 10,
    },
  };

  // System Monitoring Configuration
  private monitoringConfig: SystemMonitoringConfig = {
    enabled: true,
    refreshInterval: 30, // 30 seconds for real-time monitoring
    alertThresholds: {
      errorRate: 5, // 5%
      responseTime: 1000, // 1 second
      memoryUsage: 80, // 80%
      diskUsage: 85, // 85%
      dbConnectionPool: 90, // 90%
    },
    retentionPeriod: 30, // 30 days
    enableNotifications: true,
  };

  private errorLogs: ErrorLogEntry[] = [];
  private activeAlerts: SystemAlert[] = [];
  private metricsHistory: RealTimeMetrics[] = [];

  constructor() {
    super(prisma);
    this.initializeMonitoring();
  }

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  /**
   * Initialize system monitoring
   */
  private initializeMonitoring(): void {
    if (this.monitoringConfig.enabled) {
      // Start real-time metrics collection
      this.startMetricsCollection();

      // Clean up old logs and metrics
      this.scheduleCleanup();
    }
  }

  /**
   * Start collecting real-time metrics
   */
  private startMetricsCollection(): void {
    const collectMetrics = async () => {
      try {
        const metrics = await this.collectRealTimeMetrics();
        this.metricsHistory.push(metrics);

        // Keep only recent metrics (last 24 hours)
        const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
        this.metricsHistory = this.metricsHistory.filter(
          (m) => m.timestamp > cutoff,
        );

        // Check for alerts
        await this.checkAlertThresholds(metrics);
      } catch (error) {
        this.logError("metrics_collection_failed", error as Error);
      }
    };

    // Initial collection
    collectMetrics();

    // Schedule periodic collection
    setInterval(collectMetrics, this.monitoringConfig.refreshInterval * 1000);
  }

  /**
   * Collect current real-time metrics
   */
  private async collectRealTimeMetrics(): Promise<RealTimeMetrics> {
    const memoryUsage = process.memoryUsage();

    // In a real implementation, these would be collected from monitoring systems
    // For now, we'll simulate realistic values with some variation
    const baseResponseTime = 100;
    const responseTimeVariation = Math.random() * 50 - 25; // ±25ms

    const baseErrorRate = 0.5;
    const errorRateVariation = Math.random() * 1 - 0.5; // ±0.5%

    return {
      timestamp: new Date(),
      apiResponseTime: Math.max(50, baseResponseTime + responseTimeVariation),
      errorRate: Math.max(0, baseErrorRate + errorRateVariation),
      memoryUsage: {
        heapUsed: memoryUsage.heapUsed,
        heapTotal: memoryUsage.heapTotal,
        percentage: (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100,
      },
      activeConnections: Math.floor(Math.random() * 10) + 1,
      requestsPerMinute: Math.floor(Math.random() * 100) + 50,
      cpuUsage: Math.random() * 100,
      diskUsage: Math.random() * 100,
    };
  }

  /**
   * Check alert thresholds and trigger alerts if necessary
   */
  private async checkAlertThresholds(metrics: RealTimeMetrics): Promise<void> {
    const checks = [
      {
        type: "response_time" as const,
        value: metrics.apiResponseTime,
        threshold: this.monitoringConfig.alertThresholds.responseTime,
        title: "High API Response Time",
        description: `API response time is ${metrics.apiResponseTime}ms, exceeding threshold of ${this.monitoringConfig.alertThresholds.responseTime}ms`,
      },
      {
        type: "error_rate" as const,
        value: metrics.errorRate,
        threshold: this.monitoringConfig.alertThresholds.errorRate,
        title: "High Error Rate",
        description: `Error rate is ${metrics.errorRate}%, exceeding threshold of ${this.monitoringConfig.alertThresholds.errorRate}%`,
      },
      {
        type: "memory_usage" as const,
        value: metrics.memoryUsage.percentage,
        threshold: this.monitoringConfig.alertThresholds.memoryUsage,
        title: "High Memory Usage",
        description: `Memory usage is ${metrics.memoryUsage.percentage.toFixed(1)}%, exceeding threshold of ${this.monitoringConfig.alertThresholds.memoryUsage}%`,
      },
    ];

    for (const check of checks) {
      if (check.value > check.threshold) {
        await this.triggerAlert(
          check.type,
          check.title,
          check.description,
          check.threshold,
          check.value,
        );
      }
    }
  }

  /**
   * Trigger a system alert
   */
  private async triggerAlert(
    type: SystemAlert["type"],
    title: string,
    description: string,
    threshold: number,
    currentValue: number,
  ): Promise<void> {
    // Check if similar alert already exists and is not resolved
    const existingAlert = this.activeAlerts.find(
      (alert) => alert.type === type && !alert.resolved,
    );

    if (!existingAlert) {
      const severity = this.calculateAlertSeverity(
        type,
        threshold,
        currentValue,
      );

      const alert: SystemAlert = {
        id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type,
        severity,
        title,
        description,
        threshold,
        currentValue,
        triggered: new Date(),
      };

      this.activeAlerts.push(alert);

      // Log the alert
      this.logError("system_alert_triggered", new Error(description), {
        alertId: alert.id,
        type,
        severity,
        threshold,
        currentValue,
      });
    }
  }

  /**
   * Calculate alert severity based on how much the threshold is exceeded
   */
  private calculateAlertSeverity(
    type: SystemAlert["type"],
    threshold: number,
    currentValue: number,
  ): SystemAlert["severity"] {
    const exceedanceRatio = currentValue / threshold;

    if (exceedanceRatio >= 2) return "critical";
    if (exceedanceRatio >= 1.5) return "high";
    if (exceedanceRatio >= 1.25) return "medium";
    return "low";
  }

  /**
   * Log an error with structured data
   */
  public logError(
    message: string,
    error: Error,
    metadata: Record<string, unknown> = {},
  ): void {
    const errorEntry: ErrorLogEntry = {
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      level: "error",
      message,
      stack: error.stack,
      metadata: {
        ...metadata,
        errorName: error.name,
        errorMessage: error.message,
      },
      resolved: false,
      tags: [],
    };

    this.errorLogs.push(errorEntry);
  }

  /**
   * Get system health dashboard data
   */
  public async getSystemHealthDashboard(): Promise<SystemHealthDashboard> {
    try {
      const healthChecks = await this.performHealthChecks();
      const overallStatus = this.calculateOverallHealth(healthChecks);
      const currentMetrics = await this.collectRealTimeMetrics();

      // Get trends (last 24 hours)
      const trends = this.calculateTrends();

      return {
        overallStatus,
        lastUpdated: new Date(),
        uptime: process.uptime(),
        healthChecks,
        activeAlerts: this.activeAlerts.filter((alert) => !alert.resolved),
        recentErrors: this.errorLogs
          .filter((error) => !error.resolved)
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
          .slice(0, 10),
        metrics: currentMetrics,
        trends,
      };
    } catch (error) {
      this.logError("system_health_dashboard_failed", error as Error);
      throw error;
    }
  }

  /**
   * Perform health checks on various system components
   */
  private async performHealthChecks(): Promise<SystemHealthCheck[]> {
    const checks: SystemHealthCheck[] = [];

    // Database health check
    try {
      const start = Date.now();
      await this.prisma.$queryRaw`SELECT 1`;
      const responseTime = Date.now() - start;

      checks.push({
        service: "Database",
        status:
          responseTime < 100
            ? "healthy"
            : responseTime < 500
              ? "degraded"
              : "unhealthy",
        responseTime,
        lastCheck: new Date(),
        details: {
          type: "postgresql",
          responseTime: `${responseTime}ms`,
        },
      });
    } catch (error) {
      checks.push({
        service: "Database",
        status: "unhealthy",
        responseTime: -1,
        lastCheck: new Date(),
        details: {
          error: (error as Error).message,
        },
      });
    }

    // Memory health check
    const memoryUsage = process.memoryUsage();
    const memoryPercentage =
      (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;

    checks.push({
      service: "Memory",
      status:
        memoryPercentage < 70
          ? "healthy"
          : memoryPercentage < 85
            ? "degraded"
            : "unhealthy",
      responseTime: 0,
      lastCheck: new Date(),
      details: {
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
        percentage: `${memoryPercentage.toFixed(1)}%`,
      },
    });

    // API health check (self-check)
    checks.push({
      service: "API",
      status: "healthy",
      responseTime: 0,
      lastCheck: new Date(),
      details: {
        uptime: `${Math.round(process.uptime())}s`,
        nodeVersion: process.version,
      },
    });

    return checks;
  }

  /**
   * Calculate overall system health based on individual checks
   */
  private calculateOverallHealth(
    checks: SystemHealthCheck[],
  ): "healthy" | "degraded" | "unhealthy" {
    const unhealthyCount = checks.filter(
      (check) => check.status === "unhealthy",
    ).length;
    const degradedCount = checks.filter(
      (check) => check.status === "degraded",
    ).length;

    if (unhealthyCount > 0) return "unhealthy";
    if (degradedCount > 0) return "degraded";
    return "healthy";
  }

  /**
   * Calculate trends from recent metrics
   */
  private calculateTrends() {
    const recentMetrics = this.metricsHistory.slice(-100); // Last 100 data points

    return {
      responseTime: recentMetrics.map((m) => m.apiResponseTime),
      errorRate: recentMetrics.map((m) => m.errorRate),
      memoryUsage: recentMetrics.map((m) => m.memoryUsage.percentage),
      timestamps: recentMetrics.map((m) => m.timestamp),
    };
  }

  /**
   * Get error logs with filtering
   */
  public async getErrorLogs(
    filter?: MonitoringFilter,
  ): Promise<ErrorLogEntry[]> {
    let filteredLogs = [...this.errorLogs];

    if (filter) {
      if (filter.timeRange) {
        filteredLogs = filteredLogs.filter(
          (log) =>
            log.timestamp >= filter.timeRange.start &&
            log.timestamp <= filter.timeRange.end,
        );
      }

      if (filter.errorLevels?.length) {
        filteredLogs = filteredLogs.filter((log) =>
          filter.errorLevels!.includes(log.level),
        );
      }

      if (filter.resolved !== undefined) {
        filteredLogs = filteredLogs.filter(
          (log) => log.resolved === filter.resolved,
        );
      }
    }

    return filteredLogs
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 1000); // Limit to 1000 most recent
  }

  /**
   * Acknowledge an alert
   */
  public async acknowledgeAlert(
    alertId: string,
    acknowledgedBy: string = "admin",
  ): Promise<void> {
    const alert = this.activeAlerts.find((a) => a.id === alertId);
    if (alert) {
      alert.acknowledgedBy = acknowledgedBy;
      alert.acknowledgedAt = new Date();
    }
  }

  /**
   * Resolve an alert
   */
  public async resolveAlert(alertId: string): Promise<void> {
    const alert = this.activeAlerts.find((a) => a.id === alertId);
    if (alert) {
      alert.resolved = new Date();
    }
  }

  /**
   * Resolve an error log entry
   */
  public async resolveError(errorId: string): Promise<void> {
    const error = this.errorLogs.find((e) => e.id === errorId);
    if (error) {
      error.resolved = true;
    }
  }

  /**
   * Get real-time metrics for live monitoring
   */
  public async getRealTimeMetrics(
    limit: number = 100,
  ): Promise<RealTimeMetrics[]> {
    return this.metricsHistory.slice(-limit);
  }

  /**
   * Get current real-time metrics (public method for API access)
   */
  public async getCurrentMetrics(): Promise<RealTimeMetrics> {
    return await this.collectRealTimeMetrics();
  }

  /**
   * Schedule cleanup of old logs and metrics
   */
  private scheduleCleanup(): void {
    const cleanup = () => {
      const cutoffDate = new Date(
        Date.now() -
          this.monitoringConfig.retentionPeriod * 24 * 60 * 60 * 1000,
      );

      // Clean up old error logs
      this.errorLogs = this.errorLogs.filter(
        (log) => log.timestamp > cutoffDate,
      );

      // Clean up resolved alerts older than 7 days
      const alertCutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      this.activeAlerts = this.activeAlerts.filter(
        (alert) =>
          !alert.resolved || (alert.resolved && alert.resolved > alertCutoff),
      );

      // Clean up old metrics (keep last 24 hours)
      const metricsCutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
      this.metricsHistory = this.metricsHistory.filter(
        (metric) => metric.timestamp > metricsCutoff,
      );
    };

    // Run cleanup daily
    setInterval(cleanup, 24 * 60 * 60 * 1000);
  }

  /**
   * Get comprehensive analytics summary
   */
  public async getAnalyticsSummary(
    filter?: AnalyticsFilter,
  ): Promise<AnalyticsSummary> {
    try {
      const cacheKey = `analytics_summary_${JSON.stringify(filter)}`;

      return await this.getCached(
        cacheKey,
        async () => {
          const timeRange = filter?.timeRange || this.getDefaultTimeRange();

          // Get basic counts
          const [totalTools, totalTags, totalUsage] = await Promise.all([
            this.prisma.tool.count({
              where: { isActive: !filter?.includeInactive ? true : undefined },
            }),
            this.prisma.tag.count(),
            this.getTotalUsageCount(timeRange),
          ]);

          // Get top tools
          const topTools = await this.getTopTools(timeRange, 5);

          // Get recent activity
          const recentActivity = await this.getRecentActivity(timeRange, 10);

          // Get period comparison
          const periodComparison = await this.getPeriodComparison(timeRange);

          const summary: AnalyticsSummary = {
            totalTools,
            totalTags,
            totalUsage,
            activeUsers: await this.getActiveUsersCount(timeRange),
            topTools,
            recentActivity,
            periodComparison,
          };

          return summary;
        },
        this.config.cacheTimeout,
      );
    } catch (error) {
      this.handleError(error, "getAnalyticsSummary");
    }
  }

  /**
   * Get detailed tool usage analytics
   */
  public async getToolUsageAnalytics(
    filter?: AnalyticsFilter,
  ): Promise<ToolUsageAnalytics[]> {
    try {
      const cacheKey = `tool_usage_analytics_${JSON.stringify(filter)}`;

      return await this.getCached(
        cacheKey,
        async () => {
          const timeRange = filter?.timeRange || this.getDefaultTimeRange();
          const toolFilter = filter?.toolIds
            ? { id: { in: filter.toolIds } }
            : {};

          const tools = await this.prisma.tool.findMany({
            where: {
              ...toolFilter,
              isActive: !filter?.includeInactive ? true : undefined,
            },
            include: {
              usages: {
                where: {
                  timestamp: {
                    gte: timeRange.start,
                    lte: timeRange.end,
                  },
                },
              },
              toolUsageStats: true,
            },
          });

          const analytics: ToolUsageAnalytics[] = await Promise.all(
            tools.map(async (tool) => {
              const usageCount = tool.usages.length;
              const trend = await this.getUsageTrend(tool.id, timeRange);
              const growth = this.calculateGrowthRates(trend);

              return {
                toolId: tool.id,
                toolName: tool.name,
                toolSlug: tool.slug,
                usageCount,
                uniqueUsers: await this.getUniqueUsersCount(tool.id, timeRange),
                averageSessionTime: await this.getAverageSessionTime(
                  tool.id,
                  timeRange,
                ),
                lastUsed: tool.toolUsageStats?.lastUsed || new Date(0),
                trend,
                growth,
              };
            }),
          );

          return analytics;
        },
        this.config.cacheTimeout,
      );
    } catch (error) {
      this.handleError(error, "getToolUsageAnalytics");
    }
  }

  /**
   * Get system performance metrics
   */
  public async getSystemPerformanceMetrics(): Promise<SystemPerformanceMetrics> {
    try {
      const cacheKey = "system_performance_metrics";

      return await this.getCached(
        cacheKey,
        async () => {
          // In a real implementation, these would come from monitoring systems
          // For now, we'll return mock data with realistic values
          const metrics: SystemPerformanceMetrics = {
            apiResponseTimes: {
              average: 120,
              p50: 95,
              p95: 250,
              p99: 500,
            },
            errorRates: {
              overall: 0.02, // 2%
              byEndpoint: {
                "/api/tools": 0.01,
                "/api/admin/tools": 0.015,
                "/api/admin/analytics": 0.005,
              },
            },
            databaseMetrics: {
              connectionPoolSize: 10,
              activeConnections: 3,
              queryTime: {
                average: 15,
                slowQueries: 2,
              },
            },
            memoryUsage: {
              heapUsed: process.memoryUsage().heapUsed,
              heapTotal: process.memoryUsage().heapTotal,
              external: process.memoryUsage().external,
            },
            systemHealth: {
              uptime: process.uptime(),
              status: "healthy",
              lastHealthCheck: new Date(),
            },
          };

          return metrics;
        },
        60,
      ); // Cache for 1 minute
    } catch (error) {
      this.handleError(error, "getSystemPerformanceMetrics");
    }
  }

  /**
   * Generate analytics charts
   */
  public async generateCharts(
    filter?: AnalyticsFilter,
  ): Promise<AnalyticsChart[]> {
    try {
      const timeRange = filter?.timeRange || this.getDefaultTimeRange();

      const [usageChart, toolsChart, trendsChart] = await Promise.all([
        this.generateUsageChart(timeRange),
        this.generateTopToolsChart(timeRange),
        this.generateTrendsChart(timeRange),
      ]);

      return [usageChart, toolsChart, trendsChart];
    } catch (error) {
      this.handleError(error, "generateCharts");
    }
  }

  /**
   * Export analytics data
   */
  public async exportAnalytics(
    options: ExportOptions,
    filter?: AnalyticsFilter,
  ): Promise<AnalyticsExport> {
    try {
      const [summary, toolUsage, systemMetrics, charts] = await Promise.all([
        this.getAnalyticsSummary(filter),
        this.getToolUsageAnalytics(filter),
        this.getSystemPerformanceMetrics(),
        options.includeCharts ? this.generateCharts(filter) : [],
      ]);

      const exportData: AnalyticsExport = {
        summary,
        toolUsage,
        systemMetrics,
        charts,
        metadata: {
          generatedAt: new Date(),
          timeRange: filter?.timeRange || this.getDefaultTimeRange(),
          filters: filter || { timeRange: this.getDefaultTimeRange() },
          version: "1.0.0",
        },
      };

      return exportData;
    } catch (error) {
      this.handleError(error, "exportAnalytics");
    }
  }

  // Private helper methods

  private getDefaultTimeRange(): AnalyticsTimeRange {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30); // Last 30 days

    return {
      start,
      end,
      period: "day",
    };
  }

  private async getTotalUsageCount(
    timeRange: AnalyticsTimeRange,
  ): Promise<number> {
    return this.prisma.toolUsage.count({
      where: {
        timestamp: {
          gte: timeRange.start,
          lte: timeRange.end,
        },
      },
    });
  }

  private async getActiveUsersCount(
    timeRange: AnalyticsTimeRange,
  ): Promise<number> {
    // Since we don't track individual users for privacy, return estimated count
    const totalUsage = await this.getTotalUsageCount(timeRange);
    // Estimate based on average sessions per user (rough approximation)
    return Math.ceil(totalUsage / 3);
  }

  private async getTopTools(timeRange: AnalyticsTimeRange, limit: number) {
    const tools = await this.prisma.tool.findMany({
      include: {
        usages: {
          where: {
            timestamp: {
              gte: timeRange.start,
              lte: timeRange.end,
            },
          },
        },
      },
    });

    return tools
      .map((tool) => ({
        toolId: tool.id,
        name: tool.name,
        usageCount: tool.usages.length,
        growthRate: 0, // Calculate based on previous period
      }))
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, limit);
  }

  private async getRecentActivity(
    timeRange: AnalyticsTimeRange,
    limit: number,
  ) {
    const recentUsages = await this.prisma.toolUsage.findMany({
      where: {
        timestamp: {
          gte: timeRange.start,
          lte: timeRange.end,
        },
      },
      include: {
        tool: true,
      },
      orderBy: {
        timestamp: "desc",
      },
      take: limit,
    });

    return recentUsages.map((usage) => ({
      timestamp: usage.timestamp,
      action: "tool_used",
      toolName: usage.tool.name,
      metadata: (usage.metadata as Record<string, unknown>) || {},
    }));
  }

  private async getPeriodComparison(timeRange: AnalyticsTimeRange) {
    const periodLength = timeRange.end.getTime() - timeRange.start.getTime();
    const previousStart = new Date(timeRange.start.getTime() - periodLength);
    const previousEnd = new Date(timeRange.end.getTime() - periodLength);

    const [currentUsage, previousUsage] = await Promise.all([
      this.getTotalUsageCount(timeRange),
      this.getTotalUsageCount({
        start: previousStart,
        end: previousEnd,
        period: timeRange.period,
      }),
    ]);

    const currentUsers = Math.ceil(currentUsage / 3);
    const previousUsers = Math.ceil(previousUsage / 3);

    return {
      currentPeriod: {
        usage: currentUsage,
        newUsers: currentUsers,
        averageSessionTime: 180, // 3 minutes average
      },
      previousPeriod: {
        usage: previousUsage,
        newUsers: previousUsers,
        averageSessionTime: 175,
      },
      growthRates: {
        usage:
          previousUsage > 0
            ? ((currentUsage - previousUsage) / previousUsage) * 100
            : 0,
        newUsers:
          previousUsers > 0
            ? ((currentUsers - previousUsers) / previousUsers) * 100
            : 0,
        averageSessionTime: ((180 - 175) / 175) * 100,
      },
    };
  }

  private async getUsageTrend(toolId: string, timeRange: AnalyticsTimeRange) {
    // Generate trend data (daily, weekly, monthly)
    const usages = await this.prisma.toolUsage.findMany({
      where: {
        toolId,
        timestamp: {
          gte: timeRange.start,
          lte: timeRange.end,
        },
      },
      orderBy: {
        timestamp: "asc",
      },
    });

    // Group by day for daily trend
    const dailyData = this.groupUsagesByPeriod(usages, "day");
    const weeklyData = this.groupUsagesByPeriod(usages, "week");
    const monthlyData = this.groupUsagesByPeriod(usages, "month");

    return {
      daily: dailyData,
      weekly: weeklyData,
      monthly: monthlyData,
    };
  }

  private groupUsagesByPeriod(
    usages: Array<{ timestamp: Date }>,
    period: "day" | "week" | "month",
  ): number[] {
    // Simple implementation - group usages by period and count
    const groups: Record<string, number> = {};

    usages.forEach((usage) => {
      const date = new Date(usage.timestamp);
      let key: string;

      if (period === "day") {
        key = date.toISOString().split("T")[0];
      } else if (period === "week") {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split("T")[0];
      } else {
        key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}`;
      }

      groups[key] = (groups[key] || 0) + 1;
    });

    return Object.values(groups);
  }

  private calculateGrowthRates(trend: {
    daily: number[];
    weekly: number[];
    monthly: number[];
  }) {
    const calculateRate = (data: number[]) => {
      if (data.length < 2) return 0;
      const current = data[data.length - 1];
      const previous = data[data.length - 2];
      return previous > 0 ? ((current - previous) / previous) * 100 : 0;
    };

    return {
      dailyGrowth: calculateRate(trend.daily),
      weeklyGrowth: calculateRate(trend.weekly),
      monthlyGrowth: calculateRate(trend.monthly),
    };
  }

  private async getUniqueUsersCount(
    toolId: string,
    timeRange: AnalyticsTimeRange,
  ): Promise<number> {
    // Since we don't track individual users, estimate based on usage patterns
    const totalUsage = await this.prisma.toolUsage.count({
      where: {
        toolId,
        timestamp: {
          gte: timeRange.start,
          lte: timeRange.end,
        },
      },
    });

    return Math.ceil(totalUsage / 2); // Estimate 2 uses per unique user
  }

  private async getAverageSessionTime(
    _toolId: string,
    _timeRange: AnalyticsTimeRange,
  ): Promise<number> {
    // Return mock data - in real implementation, this would track session duration
    return 180; // 3 minutes average
  }

  private async generateUsageChart(
    timeRange: AnalyticsTimeRange,
  ): Promise<AnalyticsChart> {
    const usages = await this.prisma.toolUsage.findMany({
      where: {
        timestamp: {
          gte: timeRange.start,
          lte: timeRange.end,
        },
      },
    });

    const dailyUsage = this.groupUsagesByPeriod(usages, "day");
    const labels = this.generateDateLabels(timeRange, "day");

    return {
      type: "line",
      title: "Daily Usage Trend",
      data: labels.map((label, index) => ({
        label,
        value: dailyUsage[index] || 0,
      })),
      options: {
        colors: ["#3B82F6"],
        showLegend: false,
        showTooltip: true,
      },
    };
  }

  private async generateTopToolsChart(
    timeRange: AnalyticsTimeRange,
  ): Promise<AnalyticsChart> {
    const topTools = await this.getTopTools(timeRange, 10);

    return {
      type: "bar",
      title: "Most Popular Tools",
      data: topTools.map((tool) => ({
        label: tool.name,
        value: tool.usageCount,
        metadata: { toolId: tool.toolId },
      })),
      options: {
        colors: ["#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#F97316"],
        showLegend: false,
        showTooltip: true,
      },
    };
  }

  private async generateTrendsChart(
    timeRange: AnalyticsTimeRange,
  ): Promise<AnalyticsChart> {
    // Generate a pie chart showing usage distribution by tool category
    const tools = await this.prisma.tool.findMany({
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
        usages: {
          where: {
            timestamp: {
              gte: timeRange.start,
              lte: timeRange.end,
            },
          },
        },
      },
    });

    const categoryUsage: Record<string, number> = {};
    tools.forEach((tool) => {
      const category = tool.tags[0]?.tag.name || "Uncategorized";
      categoryUsage[category] =
        (categoryUsage[category] || 0) + tool.usages.length;
    });

    return {
      type: "pie",
      title: "Usage by Category",
      data: Object.entries(categoryUsage).map(([label, value]) => ({
        label,
        value,
      })),
      options: {
        colors: ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"],
        showLegend: true,
        showTooltip: true,
      },
    };
  }

  private generateDateLabels(
    timeRange: AnalyticsTimeRange,
    period: "day" | "week" | "month",
  ): string[] {
    const labels: string[] = [];
    const current = new Date(timeRange.start);

    while (current <= timeRange.end) {
      if (period === "day") {
        labels.push(current.toISOString().split("T")[0]);
        current.setDate(current.getDate() + 1);
      } else if (period === "week") {
        labels.push(`Week of ${current.toISOString().split("T")[0]}`);
        current.setDate(current.getDate() + 7);
      } else {
        labels.push(
          `${current.getFullYear()}-${(current.getMonth() + 1).toString().padStart(2, "0")}`,
        );
        current.setMonth(current.getMonth() + 1);
      }
    }

    return labels;
  }
}
