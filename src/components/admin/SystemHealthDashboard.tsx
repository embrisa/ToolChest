"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import type {
  SystemHealthDashboard as SystemHealthDashboardData,
  SystemMonitoringConfig,
  SystemAlert,
  ErrorLogEntry,
} from "@/types/admin/analytics";

interface SystemHealthDashboardProps {
  data: SystemHealthDashboardData;
  config: SystemMonitoringConfig;
  onAlertAcknowledge?: (alertId: string) => void;
  onErrorResolve?: (errorId: string) => void;
  refreshInterval?: number;
}

interface StatusCardProps {
  title: string;
  status: "healthy" | "degraded" | "unhealthy";
  value?: string;
  details?: string;
  lastUpdated?: Date;
}

function StatusCard({
  title,
  status,
  value,
  details,
  lastUpdated,
}: StatusCardProps) {
  const statusConfig = {
    healthy: {
      colors:
        "bg-success-50 dark:bg-success-900/10 border-success-200 dark:border-success-800/30",
      textColors: "text-success-900 dark:text-success-100",
      icon: (
        <svg
          className="w-5 h-5 text-success-600 dark:text-success-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      badge:
        "bg-success-100 dark:bg-success-900/20 text-success-800 dark:text-success-200",
    },
    degraded: {
      colors:
        "bg-warning-50 dark:bg-warning-900/10 border-warning-200 dark:border-warning-800/30",
      textColors: "text-warning-900 dark:text-warning-100",
      icon: (
        <svg
          className="w-5 h-5 text-warning-600 dark:text-warning-400"
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
      ),
      badge:
        "bg-warning-100 dark:bg-warning-900/20 text-warning-800 dark:text-warning-200",
    },
    unhealthy: {
      colors:
        "bg-error-50 dark:bg-error-900/10 border-error-200 dark:border-error-800/30",
      textColors: "text-error-900 dark:text-error-100",
      icon: (
        <svg
          className="w-5 h-5 text-error-600 dark:text-error-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      ),
      badge:
        "bg-error-100 dark:bg-error-900/20 text-error-800 dark:text-error-200",
    },
  };

  const config = statusConfig[status];

  return (
    <div
      className={`card p-6 ${config.colors} transition-all duration-200 hover:shadow-medium`}
      role="status"
      aria-label={`${title} status: ${status}`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">{config.icon}</div>
            <h3
              className={`text-title text-lg font-semibold ${config.textColors}`}
            >
              {title}
            </h3>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.badge}`}
            >
              {status}
            </span>
          </div>

          {value && (
            <div
              className={`text-2xl font-mono font-bold ${config.textColors}`}
            >
              {value}
            </div>
          )}

          {details && (
            <p className={`text-body text-sm ${config.textColors} opacity-90`}>
              {details}
            </p>
          )}
        </div>
      </div>

      {lastUpdated && (
        <div className="mt-4 pt-3 border-t border-current/10">
          <p className={`text-xs ${config.textColors} opacity-75`}>
            Last checked: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
      )}
    </div>
  );
}

interface AlertItemProps {
  alert: SystemAlert;
  onAcknowledge?: (alertId: string) => void;
}

function AlertItem({ alert, onAcknowledge }: AlertItemProps) {
  const severityConfig = {
    low: {
      colors:
        "bg-brand-50 dark:bg-brand-900/10 border-brand-200 dark:border-brand-800/30",
      textColors: "text-brand-900 dark:text-brand-100",
      icon: (
        <svg
          className="w-5 h-5 text-brand-600 dark:text-brand-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      badge:
        "bg-brand-100 dark:bg-brand-900/20 text-brand-800 dark:text-brand-200",
    },
    medium: {
      colors:
        "bg-warning-50 dark:bg-warning-900/10 border-warning-200 dark:border-warning-800/30",
      textColors: "text-warning-900 dark:text-warning-100",
      icon: (
        <svg
          className="w-5 h-5 text-warning-600 dark:text-warning-400"
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
      ),
      badge:
        "bg-warning-100 dark:bg-warning-900/20 text-warning-800 dark:text-warning-200",
    },
    high: {
      colors:
        "bg-accent-50 dark:bg-accent-900/10 border-accent-200 dark:border-accent-800/30",
      textColors: "text-accent-900 dark:text-accent-100",
      icon: (
        <svg
          className="w-5 h-5 text-accent-600 dark:text-accent-400"
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
      ),
      badge:
        "bg-accent-100 dark:bg-accent-900/20 text-accent-800 dark:text-accent-200",
    },
    critical: {
      colors:
        "bg-error-50 dark:bg-error-900/10 border-error-200 dark:border-error-800/30",
      textColors: "text-error-900 dark:text-error-100",
      icon: (
        <svg
          className="w-5 h-5 text-error-600 dark:text-error-400"
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
      ),
      badge:
        "bg-error-100 dark:bg-error-900/20 text-error-800 dark:text-error-200",
    },
  };

  const config = severityConfig[alert.severity];

  return (
    <div
      className={`card p-6 ${config.colors} transition-all duration-200 hover:shadow-medium`}
      role="alert"
      aria-label={`${alert.severity} severity alert: ${alert.title}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-3">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">{config.icon}</div>
            <h4
              className={`text-title text-lg font-semibold ${config.textColors}`}
            >
              {alert.title}
            </h4>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.badge}`}
            >
              {alert.severity}
            </span>
          </div>

          <p className={`text-body ${config.textColors} opacity-90`}>
            {alert.description}
          </p>

          <div className={`space-y-2 text-sm ${config.textColors} opacity-75`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <p>Triggered: {alert.triggered.toLocaleString()}</p>
              <p>
                Threshold: {alert.threshold}, Current:{" "}
                {alert.currentValue.toFixed(2)}
              </p>
            </div>
            {alert.acknowledgedBy && (
              <p className="font-medium">
                Acknowledged by {alert.acknowledgedBy} at{" "}
                {alert.acknowledgedAt?.toLocaleString()}
              </p>
            )}
          </div>
        </div>

        {onAcknowledge && !alert.acknowledgedBy && (
          <div className="flex-shrink-0 ml-4">
            <Button
              onClick={() => onAcknowledge(alert.id)}
              variant="secondary"
              size="sm"
              aria-label={`Acknowledge alert: ${alert.title}`}
            >
              Acknowledge
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

interface ErrorLogItemProps {
  error: ErrorLogEntry;
  onResolve?: (errorId: string) => void;
}

function ErrorLogItem({ error, onResolve }: ErrorLogItemProps) {
  const [expanded, setExpanded] = useState(false);

  const levelConfig = {
    error: {
      colors:
        "bg-error-50 dark:bg-error-900/10 border-error-200 dark:border-error-800/30",
      textColors: "text-error-900 dark:text-error-100",
      icon: (
        <svg
          className="w-5 h-5 text-error-600 dark:text-error-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      ),
      badge:
        "bg-error-100 dark:bg-error-900/20 text-error-800 dark:text-error-200",
    },
    warn: {
      colors:
        "bg-warning-50 dark:bg-warning-900/10 border-warning-200 dark:border-warning-800/30",
      textColors: "text-warning-900 dark:text-warning-100",
      icon: (
        <svg
          className="w-5 h-5 text-warning-600 dark:text-warning-400"
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
      ),
      badge:
        "bg-warning-100 dark:bg-warning-900/20 text-warning-800 dark:text-warning-200",
    },
    info: {
      colors:
        "bg-brand-50 dark:bg-brand-900/10 border-brand-200 dark:border-brand-800/30",
      textColors: "text-brand-900 dark:text-brand-100",
      icon: (
        <svg
          className="w-5 h-5 text-brand-600 dark:text-brand-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      badge:
        "bg-brand-100 dark:bg-brand-900/20 text-brand-800 dark:text-brand-200",
    },
    debug: {
      colors:
        "bg-neutral-50 dark:bg-neutral-900/10 border-neutral-200 dark:border-neutral-800/30",
      textColors: "text-neutral-900 dark:text-neutral-100",
      icon: (
        <svg
          className="w-5 h-5 text-neutral-600 dark:text-neutral-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      badge:
        "bg-neutral-100 dark:bg-neutral-900/20 text-neutral-800 dark:text-neutral-200",
    },
  };

  const config = levelConfig[error.level];

  return (
    <div
      className={`card p-6 ${config.colors} transition-all duration-200 hover:shadow-medium`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-3">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">{config.icon}</div>
            <h4
              className={`text-title text-lg font-semibold ${config.textColors} flex-1`}
            >
              {error.message}
            </h4>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.badge}`}
            >
              {error.level}
            </span>
          </div>

          <div className={`space-y-1 text-sm ${config.textColors} opacity-75`}>
            <p>{error.timestamp.toLocaleString()}</p>
            {error.endpoint && (
              <p className="font-mono">Endpoint: {error.endpoint}</p>
            )}
          </div>

          {error.stack && (
            <div className="space-y-2">
              <Button
                onClick={() => setExpanded(!expanded)}
                variant="ghost"
                size="sm"
                className={`p-0 h-auto ${config.textColors} opacity-75 hover:opacity-100`}
                aria-expanded={expanded}
                aria-controls={`error-stack-${error.id}`}
              >
                {expanded ? "Hide" : "Show"} stack trace
              </Button>
              {expanded && (
                <pre
                  id={`error-stack-${error.id}`}
                  className={`text-code text-xs p-4 rounded-lg bg-neutral-900 dark:bg-neutral-100 text-neutral-100 dark:text-neutral-900 overflow-x-auto max-h-64 scrollbar-thin`}
                >
                  {error.stack}
                </pre>
              )}
            </div>
          )}
        </div>

        {onResolve && !error.resolved && (
          <div className="flex-shrink-0 ml-4">
            <Button
              onClick={() => onResolve(error.id)}
              variant="secondary"
              size="sm"
              aria-label={`Resolve error: ${error.message}`}
            >
              Resolve
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

interface MetricsChartProps {
  title: string;
  data: number[];
  timestamps: Date[];
  unit?: string;
  color?: string;
  height?: number;
}

function MetricsChart({
  title,
  data,
  timestamps: _timestamps,
  unit = "",
  color = "rgb(14 165 233)",
  height = 200,
}: MetricsChartProps) {
  const maxValue = Math.max(...data);
  const minValue = Math.min(...data);
  const range = maxValue - minValue || 1;

  const generatePath = () => {
    if (data.length < 2) return "";

    return data
      .map((value, index) => {
        const x = (index / (data.length - 1)) * 340 + 40;
        const y = 180 - ((value - minValue) / range) * 140;
        return `${index === 0 ? "M" : "L"} ${x} ${y}`;
      })
      .join(" ");
  };

  const generateAreaPath = () => {
    if (data.length < 2) return "";

    const path = generatePath();
    const lastX = ((data.length - 1) / (data.length - 1)) * 340 + 40;
    return `${path} L ${lastX} 180 L 40 180 Z`;
  };

  return (
    <div className="card p-6 space-y-4">
      <div className="space-y-2">
        <h4 className="text-title text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          {title}
        </h4>
        <div className="flex items-center justify-between text-sm">
          <span className="text-neutral-600 dark:text-neutral-400">
            Current:{" "}
            <span className="font-mono font-medium text-neutral-900 dark:text-neutral-100">
              {data[data.length - 1]?.toFixed(2) || 0}
              {unit}
            </span>
          </span>
          <span className="text-neutral-600 dark:text-neutral-400">
            Range:{" "}
            <span className="font-mono font-medium text-neutral-900 dark:text-neutral-100">
              {minValue.toFixed(1)} - {maxValue.toFixed(1)}
              {unit}
            </span>
          </span>
        </div>
      </div>

      <div className="relative" style={{ height }}>
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 400 200"
          className="rounded-lg bg-neutral-50 dark:bg-neutral-900/50"
        >
          {/* Gradient definition */}
          <defs>
            <linearGradient
              id={`gradient-${title}`}
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <stop
                offset="0%"
                style={{ stopColor: color, stopOpacity: 0.3 }}
              />
              <stop
                offset="100%"
                style={{ stopColor: color, stopOpacity: 0.05 }}
              />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map((i) => (
            <line
              key={i}
              x1="40"
              y1={40 + i * 35}
              x2="380"
              y2={40 + i * 35}
              stroke="rgb(var(--border) / 0.3)"
              strokeWidth="1"
            />
          ))}

          {/* Y-axis labels */}
          {[0, 1, 2, 3, 4].map((i) => (
            <text
              key={i}
              x="35"
              y={45 + i * 35}
              textAnchor="end"
              fontSize="10"
              fill="rgb(var(--foreground-secondary) / 1)"
              className="text-code"
            >
              {(maxValue - (i * range) / 4).toFixed(1)}
            </text>
          ))}

          {/* Area fill */}
          {data.length > 1 && (
            <path d={generateAreaPath()} fill={`url(#gradient-${title})`} />
          )}

          {/* Line */}
          {data.length > 1 && (
            <path
              d={generatePath()}
              fill="none"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Data points */}
          {data.map((value, index) => {
            const x = (index / Math.max(data.length - 1, 1)) * 340 + 40;
            const y = 180 - ((value - minValue) / range) * 140;

            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="3"
                fill={color}
                stroke="white"
                strokeWidth="2"
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
}

export default function SystemHealthDashboard({
  data,
  config: _config,
  onAlertAcknowledge,
  onErrorResolve,
  refreshInterval = 30000,
}: SystemHealthDashboardProps) {
  const [lastRefresh, setLastRefresh] = useState(new Date());

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

  // Auto-refresh timestamp
  useEffect(() => {
    const interval = setInterval(() => {
      setLastRefresh(new Date());
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  return (
    <div className="space-y-8">
      {/* System Status Overview */}
      <div className="space-y-6">
        <div className="border-b border-neutral-200 dark:border-neutral-700 pb-4">
          <h2 className="text-title text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
            System Status Overview
          </h2>
          <p className="text-body text-neutral-600 dark:text-neutral-400 mt-1">
            Real-time monitoring of system health and performance metrics
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatusCard
            title="API Health"
            status={
              data.overallStatus === "healthy"
                ? "healthy"
                : data.overallStatus === "degraded"
                  ? "degraded"
                  : "unhealthy"
            }
            value={`${data.metrics.apiResponseTime}ms`}
            details="Average response time"
            lastUpdated={lastRefresh}
          />
          <StatusCard
            title="Database"
            status={
              data.metrics.activeConnections > 0 ? "healthy" : "unhealthy"
            }
            value={`${data.metrics.activeConnections} connections`}
            details="Active database connections"
            lastUpdated={lastRefresh}
          />
          <StatusCard
            title="Memory Usage"
            status={
              data.metrics.memoryUsage.percentage > 80
                ? "unhealthy"
                : data.metrics.memoryUsage.percentage > 60
                  ? "degraded"
                  : "healthy"
            }
            value={`${data.metrics.memoryUsage.percentage.toFixed(1)}%`}
            details={`${formatBytes(data.metrics.memoryUsage.heapUsed)} used`}
            lastUpdated={lastRefresh}
          />
          <StatusCard
            title="System Uptime"
            status="healthy"
            value={formatUptime(data.uptime)}
            details="Since last restart"
            lastUpdated={lastRefresh}
          />
        </div>
      </div>

      {/* Active Alerts */}
      {data.activeAlerts.length > 0 && (
        <div className="space-y-6">
          <div className="border-b border-neutral-200 dark:border-neutral-700 pb-4">
            <h3 className="text-title text-xl font-semibold text-neutral-900 dark:text-neutral-100">
              Active Alerts
            </h3>
            <p className="text-body text-neutral-600 dark:text-neutral-400 mt-1">
              {data.activeAlerts.length} alert
              {data.activeAlerts.length !== 1 ? "s" : ""} requiring attention
            </p>
          </div>

          <div className="space-y-4">
            {data.activeAlerts.map((alert: SystemAlert) => (
              <AlertItem
                key={alert.id}
                alert={alert}
                onAcknowledge={onAlertAcknowledge}
              />
            ))}
          </div>
        </div>
      )}

      {/* Performance Metrics */}
      <div className="space-y-6">
        <div className="border-b border-neutral-200 dark:border-neutral-700 pb-4">
          <h3 className="text-title text-xl font-semibold text-neutral-900 dark:text-neutral-100">
            Performance Metrics
          </h3>
          <p className="text-body text-neutral-600 dark:text-neutral-400 mt-1">
            Historical performance data and trends
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MetricsChart
            title="Response Time"
            data={data.trends.responseTime}
            timestamps={data.trends.timestamps}
            unit="ms"
            color="rgb(14 165 233)"
            height={250}
          />
          <MetricsChart
            title="Memory Usage"
            data={data.trends.memoryUsage}
            timestamps={data.trends.timestamps}
            unit="%"
            color="rgb(217 70 239)"
            height={250}
          />
          <MetricsChart
            title="Error Rate"
            data={data.trends.errorRate}
            timestamps={data.trends.timestamps}
            unit="%"
            color="rgb(239 68 68)"
            height={250}
          />
          <MetricsChart
            title="Requests Per Minute"
            data={data.trends.responseTime.map(
              (_) => data.metrics.requestsPerMinute || 0,
            )}
            timestamps={data.trends.timestamps}
            unit="/min"
            color="rgb(34 197 94)"
            height={250}
          />
        </div>
      </div>

      {/* Error Logs */}
      {data.recentErrors.length > 0 && (
        <div className="space-y-6">
          <div className="border-b border-neutral-200 dark:border-neutral-700 pb-4">
            <h3 className="text-title text-xl font-semibold text-neutral-900 dark:text-neutral-100">
              Recent Error Logs
            </h3>
            <p className="text-body text-neutral-600 dark:text-neutral-400 mt-1">
              {data.recentErrors.length} recent error
              {data.recentErrors.length !== 1 ? "s" : ""} and warnings
            </p>
          </div>

          <div className="space-y-4">
            {data.recentErrors.slice(0, 10).map((error: ErrorLogEntry) => (
              <ErrorLogItem
                key={error.id}
                error={error}
                onResolve={onErrorResolve}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
