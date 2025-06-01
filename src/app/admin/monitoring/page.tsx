"use client";

import { useState, useEffect } from "react";
import SystemHealthDashboard from "@/components/admin/SystemHealthDashboard";
import { Button } from "@/components/ui/Button";
import { Loading } from "@/components/ui/Loading";
import type {
  SystemHealthDashboard as SystemHealthDashboardData,
  SystemMonitoringConfig,
} from "@/types/admin/analytics";

export default function MonitoringPage() {
  const [dashboardData, setDashboardData] =
    useState<SystemHealthDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Mock monitoring configuration
  const monitoringConfig: SystemMonitoringConfig = {
    enabled: true,
    refreshInterval: 30,
    alertThresholds: {
      errorRate: 5,
      responseTime: 1000,
      memoryUsage: 80,
      diskUsage: 85,
      dbConnectionPool: 90,
    },
    retentionPeriod: 30,
    enableNotifications: true,
  };

  const fetchSystemHealth = async () => {
    try {
      setError(null);
      const response = await fetch("/api/admin/analytics/system");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setDashboardData(result.data);
      } else {
        throw new Error(result.error || "Failed to fetch system health data");
      }
    } catch (err) {
      console.error("Failed to fetch system health:", err);
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleAlertAcknowledge = async (alertId: string) => {
    try {
      const response = await fetch("/api/admin/monitoring/alerts", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          alertId,
          action: "acknowledge",
          acknowledgedBy: "admin",
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        // Refresh dashboard data to show updated alert status
        await fetchSystemHealth();
      } else {
        throw new Error(result.error || "Failed to acknowledge alert");
      }
    } catch (err) {
      console.error("Failed to acknowledge alert:", err);
      setError(
        err instanceof Error ? err.message : "Failed to acknowledge alert",
      );
    }
  };

  const handleErrorResolve = async (errorId: string) => {
    try {
      const response = await fetch("/api/admin/monitoring/errors", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          errorId,
          action: "resolve",
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        // Refresh dashboard data to show updated error status
        await fetchSystemHealth();
      } else {
        throw new Error(result.error || "Failed to resolve error");
      }
    } catch (err) {
      console.error("Failed to resolve error:", err);
      setError(err instanceof Error ? err.message : "Failed to resolve error");
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchSystemHealth();
  }, []);

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchSystemHealth();
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  // Handle visibility change - pause refresh when tab is not visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && autoRefresh) {
        fetchSystemHealth();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [autoRefresh]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <div className="text-center space-y-4">
          <Loading size="lg" />
          <p className="text-neutral-600 dark:text-neutral-400 text-body">
            Loading system health data...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-error-100 dark:bg-error-900/30 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-error-600"
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
          <div className="space-y-2">
            <h2 className="text-title text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
              Connection Error
            </h2>
            <p className="text-body text-neutral-600 dark:text-neutral-400">
              {error}
            </p>
          </div>
          <Button
            onClick={() => {
              setError(null);
              setLoading(true);
              fetchSystemHealth();
            }}
            variant="primary"
            size="lg"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <div className="text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center">
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
          <div className="space-y-2">
            <h2 className="text-title text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
              No Data Available
            </h2>
            <p className="text-body text-neutral-600 dark:text-neutral-400">
              System health data is not available at the moment
            </p>
          </div>
          <Button onClick={fetchSystemHealth} variant="primary" size="lg">
            Refresh Data
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Page Header */}
      <div className="surface-glass border-b border-neutral-200/50 dark:border-neutral-800/50">
        <div className="container-wide py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-display text-4xl font-bold text-gradient-brand">
                System Monitoring
              </h1>
              <p className="text-body text-neutral-600 dark:text-neutral-400">
                Real-time system health monitoring and alerts
              </p>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {/* Auto-refresh toggle */}
              <div className="flex items-center gap-3">
                <label
                  htmlFor="auto-refresh"
                  className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
                >
                  Auto Refresh
                </label>
                <button
                  id="auto-refresh"
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-neutral-900 ${
                    autoRefresh
                      ? "bg-brand-500"
                      : "bg-neutral-200 dark:bg-neutral-700"
                  }`}
                  role="switch"
                  aria-checked={autoRefresh}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      autoRefresh ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Refresh interval */}
              <div className="flex items-center gap-2">
                <label
                  htmlFor="refresh-interval"
                  className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
                >
                  Interval:
                </label>
                <select
                  id="refresh-interval"
                  value={refreshInterval}
                  onChange={(e) => setRefreshInterval(Number(e.target.value))}
                  className="select text-sm"
                  disabled={!autoRefresh}
                >
                  <option value={15000}>15s</option>
                  <option value={30000}>30s</option>
                  <option value={60000}>1m</option>
                  <option value={300000}>5m</option>
                </select>
              </div>

              {/* Manual refresh */}
              <Button
                onClick={fetchSystemHealth}
                variant="secondary"
                size="md"
                disabled={loading}
                className="shrink-0"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="container-wide py-8">
        <SystemHealthDashboard
          data={dashboardData}
          config={monitoringConfig}
          onAlertAcknowledge={handleAlertAcknowledge}
          onErrorResolve={handleErrorResolve}
          refreshInterval={refreshInterval}
        />
      </div>
    </div>
  );
}
