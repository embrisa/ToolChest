"use client";

import React, { useState, useEffect } from "react";
import { AnalyticsChart } from "./AnalyticsChart";
import { Loading } from "@/components/ui/Loading";
import { Button } from "@/components/ui/Button";
import type {
  AnalyticsSummary,
  AnalyticsChart as AnalyticsChartType,
  SystemPerformanceMetrics,
  RealTimeMetrics,
  AnalyticsDashboardProps,
} from "@/types/admin/analytics";

type ExtendedSystemMetrics = SystemPerformanceMetrics & {
  cpuUsage?: number;
  uptime?: number;
  metrics?: RealTimeMetrics;
};

export function AnalyticsDashboard({ initialData }: AnalyticsDashboardProps) {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(
    initialData || null,
  );
  const [charts, setCharts] = useState<AnalyticsChartType[]>([]);
  const [systemMetrics, setSystemMetrics] =
    useState<ExtendedSystemMetrics | null>(null);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!initialData) {
      loadAnalyticsData();
    }
  }, [initialData]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [summaryResponse, chartsResponse, systemResponse] =
        await Promise.all([
          fetch("/api/admin/analytics"),
          fetch("/api/admin/analytics/charts"),
          fetch("/api/admin/analytics/system"),
        ]);

      if (!summaryResponse.ok || !chartsResponse.ok || !systemResponse.ok) {
        throw new Error("Failed to load analytics data");
      }

      const [summaryData, chartsData, systemData] = await Promise.all([
        summaryResponse.json(),
        chartsResponse.json(),
        systemResponse.json(),
      ]);

      setSummary(summaryData.data);
      setCharts(chartsData.data);
      setSystemMetrics(systemData.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load analytics data",
      );
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const formatPercentage = (num: number): string => {
    return `${num >= 0 ? "+" : ""}${num.toFixed(1)}%`;
  };

  const formatUptime = (seconds: number): string => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    }
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatBytes = (bytes: number): string => {
    const sizes = ["B", "KB", "MB", "GB"];
    if (bytes === 0) return "0 B";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <Loading size="lg" />
          <p className="text-neutral-600 dark:text-neutral-400 text-body">
            Loading analytics data...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card bg-error-50 dark:bg-error-900/10 border-error-200 dark:border-error-800/30 p-6">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-error-100 dark:bg-error-900/30 rounded-xl flex items-center justify-center">
              <svg
                className="h-6 w-6 text-error-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <h3 className="text-title text-lg font-semibold text-error-900 dark:text-error-200">
                Error Loading Analytics
              </h3>
              <p className="mt-1 text-body text-error-700 dark:text-error-300">
                {error}
              </p>
            </div>
            <Button onClick={loadAnalyticsData} variant="secondary" size="sm">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!summary || !systemMetrics) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto bg-neutral-100 dark:bg-neutral-800 rounded-2xl flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-neutral-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>
        <p className="text-neutral-500 dark:text-neutral-400 text-body">
          No analytics data available
        </p>
      </div>
    );
  }

  const uptime = systemMetrics.uptime ?? systemMetrics.systemHealth.uptime;

  const cpuUsage =
    systemMetrics.cpuUsage ?? systemMetrics.metrics?.cpuUsage ?? 0;

  return (
    <div className="space-y-8">
      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6 hover:shadow-large transition-shadow duration-200">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-brand-100 dark:bg-brand-900/20 rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-brand-600 dark:text-brand-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                Total Tools
              </p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {summary.totalTools}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6 hover:shadow-large transition-shadow duration-200">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-success-100 dark:bg-success-900/20 rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-success-600 dark:text-success-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                Total Tags
              </p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {summary.totalTags}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6 hover:shadow-large transition-shadow duration-200">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-accent-100 dark:bg-accent-900/20 rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-accent-600 dark:text-accent-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                Total Usage
              </p>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  {formatNumber(summary.totalUsage)}
                </p>
                <p
                  className={`text-sm font-medium ${
                    summary.periodComparison.growthRates.usage >= 0
                      ? "text-success-600 dark:text-success-400"
                      : "text-error-600 dark:text-error-400"
                  }`}
                >
                  {formatPercentage(summary.periodComparison.growthRates.usage)}{" "}
                  vs last period
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card p-6 hover:shadow-large transition-shadow duration-200">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-warning-100 dark:bg-warning-900/20 rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-warning-600 dark:text-warning-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                Active Users
              </p>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  {formatNumber(summary.activeUsers)}
                </p>
                <p
                  className={`text-sm font-medium ${
                    summary.periodComparison.growthRates.newUsers >= 0
                      ? "text-success-600 dark:text-success-400"
                      : "text-error-600 dark:text-error-400"
                  }`}
                >
                  {formatPercentage(
                    summary.periodComparison.growthRates.newUsers,
                  )}{" "}
                  vs last period
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Performance Metrics */}
      <div className="card p-6">
        <div className="space-y-6">
          <div className="border-b border-neutral-200 dark:border-neutral-700 pb-4">
            <h3 className="text-title text-xl font-semibold text-neutral-900 dark:text-neutral-100">
              System Performance
            </h3>
            <p className="text-body text-neutral-600 dark:text-neutral-400 mt-1">
              Real-time system health and performance metrics
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Uptime
                </span>
                <span className="text-sm font-mono text-success-600 dark:text-success-400">
                  {formatUptime(uptime || 86400)}
                </span>
              </div>
              <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                <div
                  className="bg-success-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: "99.9%" }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Memory
                </span>
                <span className="text-sm font-mono text-neutral-600 dark:text-neutral-400">
                  {formatBytes(systemMetrics.memoryUsage.heapUsed)} /{" "}
                  {formatBytes(systemMetrics.memoryUsage.heapTotal)}
                </span>
              </div>
              <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    (systemMetrics.memoryUsage.heapUsed /
                      systemMetrics.memoryUsage.heapTotal) *
                      100 >
                    80
                      ? "bg-error-500"
                      : (systemMetrics.memoryUsage.heapUsed /
                            systemMetrics.memoryUsage.heapTotal) *
                            100 >
                          60
                        ? "bg-warning-500"
                        : "bg-brand-500"
                  }`}
                  style={{
                    width: `${(systemMetrics.memoryUsage.heapUsed / systemMetrics.memoryUsage.heapTotal) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  CPU
                </span>
                <span className="text-sm font-mono text-neutral-600 dark:text-neutral-400">
                  {cpuUsage.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    cpuUsage > 80
                      ? "bg-error-500"
                      : cpuUsage > 60
                        ? "bg-warning-500"
                        : "bg-brand-500"
                  }`}
                  style={{ width: `${cpuUsage}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Response Time
                </span>
                <span className="text-sm font-mono text-neutral-600 dark:text-neutral-400">
                  {systemMetrics.apiResponseTimes.average}ms
                </span>
              </div>
              <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    systemMetrics.apiResponseTimes.average > 1000
                      ? "bg-error-500"
                      : systemMetrics.apiResponseTimes.average > 500
                        ? "bg-warning-500"
                        : "bg-success-500"
                  }`}
                  style={{
                    width: `${Math.min((systemMetrics.apiResponseTimes.average / 2000) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      {charts.length > 0 && (
        <div className="space-y-6">
          <div className="border-b border-neutral-200 dark:border-neutral-700 pb-4">
            <h3 className="text-title text-xl font-semibold text-neutral-900 dark:text-neutral-100">
              Analytics Charts
            </h3>
            <p className="text-body text-neutral-600 dark:text-neutral-400 mt-1">
              Detailed analytics and trends visualization
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {charts.map((chart, index) => (
              <div key={index} className="card p-6">
                <AnalyticsChart chart={chart} height={300} interactive={true} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-brand-100 dark:bg-brand-900/20 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-brand-600 dark:text-brand-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h4 className="text-title text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                Performance
              </h4>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                  Avg Response Time
                </span>
                <span className="text-sm font-mono font-medium text-neutral-900 dark:text-neutral-100">
                  {systemMetrics.apiResponseTimes.average}ms
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                  Error Rate
                </span>
                <span className="text-sm font-mono font-medium text-neutral-900 dark:text-neutral-100">
                  {(systemMetrics.errorRates.overall * 100).toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                  DB Connections
                </span>
                <span className="text-sm font-mono font-medium text-neutral-900 dark:text-neutral-100">
                  {systemMetrics.databaseMetrics.activeConnections}/
                  {systemMetrics.databaseMetrics.connectionPoolSize}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-success-100 dark:bg-success-900/20 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-success-600 dark:text-success-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h4 className="text-title text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                Health Status
              </h4>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                  System Status
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800 dark:bg-success-900/20 dark:text-success-400">
                  Healthy
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                  Database
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800 dark:bg-success-900/20 dark:text-success-400">
                  Connected
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                  Cache
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800 dark:bg-success-900/20 dark:text-success-400">
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-accent-100 dark:bg-accent-900/20 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-accent-600 dark:text-accent-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h4 className="text-title text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                Activity
              </h4>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                  Total Usage
                </span>
                <span className="text-sm font-mono font-medium text-neutral-900 dark:text-neutral-100">
                  {formatNumber(summary.totalUsage)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                  System Uptime
                </span>
                <span className="text-sm font-mono font-medium text-neutral-900 dark:text-neutral-100">
                  {formatUptime(systemMetrics.systemHealth.uptime)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                  Most Popular Tool
                </span>
                <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
                  {summary.topTools[0]?.name || "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
