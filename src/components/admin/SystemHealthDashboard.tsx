'use client';

import { useState, useEffect, useRef } from 'react';
import type {
    SystemHealthDashboard as SystemHealthDashboardData,
    SystemMonitoringConfig,
    SystemAlert,
    ErrorLogEntry,
} from '@/types/admin/analytics';

interface SystemHealthDashboardProps {
    data: SystemHealthDashboardData;
    config: SystemMonitoringConfig;
    onAlertAcknowledge?: (alertId: string) => void;
    onErrorResolve?: (errorId: string) => void;
    refreshInterval?: number;
}

interface StatusCardProps {
    title: string;
    status: 'healthy' | 'degraded' | 'unhealthy';
    value?: string;
    details?: string;
    lastUpdated?: Date;
}

function StatusCard({ title, status, value, details, lastUpdated }: StatusCardProps) {
    const statusColors = {
        healthy: 'bg-green-50 border-green-200 text-green-800',
        degraded: 'bg-yellow-50 border-yellow-200 text-yellow-800',
        unhealthy: 'bg-red-50 border-red-200 text-red-800',
    };

    const statusIcons = {
        healthy: '✅',
        degraded: '⚠️',
        unhealthy: '❌',
    };

    return (
        <div
            className={`p-4 border rounded-lg ${statusColors[status]}`}
            role="status"
            aria-label={`${title} status: ${status}`}
        >
            <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2">
                    <span aria-hidden="true">{statusIcons[status]}</span>
                    {title}
                </h3>
                {value && <span className="text-lg font-mono">{value}</span>}
            </div>
            {details && (
                <p className="text-sm mt-1 opacity-90">{details}</p>
            )}
            {lastUpdated && (
                <p className="text-xs mt-2 opacity-75">
                    Last checked: {lastUpdated.toLocaleTimeString()}
                </p>
            )}
        </div>
    );
}

interface AlertItemProps {
    alert: SystemAlert;
    onAcknowledge?: (alertId: string) => void;
}

function AlertItem({ alert, onAcknowledge }: AlertItemProps) {
    const severityColors = {
        low: 'bg-blue-50 border-blue-200 text-blue-800',
        medium: 'bg-yellow-50 border-yellow-200 text-yellow-800',
        high: 'bg-orange-50 border-orange-200 text-orange-800',
        critical: 'bg-red-50 border-red-200 text-red-800',
    };

    const severityIcons = {
        low: 'ℹ️',
        medium: '⚠️',
        high: '🔶',
        critical: '🚨',
    };

    return (
        <div
            className={`p-3 border rounded-lg ${severityColors[alert.severity]}`}
            role="alert"
            aria-label={`${alert.severity} severity alert: ${alert.title}`}
        >
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <h4 className="font-semibold flex items-center gap-2">
                        <span aria-hidden="true">{severityIcons[alert.severity]}</span>
                        {alert.title}
                        <span className="text-xs font-normal bg-white bg-opacity-60 px-2 py-1 rounded">
                            {alert.severity}
                        </span>
                    </h4>
                    <p className="text-sm mt-1">{alert.description}</p>
                    <div className="text-xs mt-2 space-y-1">
                        <p>Triggered: {alert.triggered.toLocaleString()}</p>
                        <p>Threshold: {alert.threshold}, Current: {alert.currentValue.toFixed(2)}</p>
                        {alert.acknowledgedBy && (
                            <p>Acknowledged by {alert.acknowledgedBy} at {alert.acknowledgedAt?.toLocaleString()}</p>
                        )}
                    </div>
                </div>
                {onAcknowledge && !alert.acknowledgedBy && (
                    <button
                        onClick={() => onAcknowledge(alert.id)}
                        className="ml-2 px-3 py-1 text-xs bg-white bg-opacity-60 hover:bg-opacity-80 rounded transition-colors"
                        aria-label={`Acknowledge alert: ${alert.title}`}
                    >
                        Acknowledge
                    </button>
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

    const levelColors = {
        error: 'bg-red-50 border-red-200 text-red-800',
        warn: 'bg-yellow-50 border-yellow-200 text-yellow-800',
        info: 'bg-blue-50 border-blue-200 text-blue-800',
        debug: 'bg-gray-50 border-gray-200 text-gray-800',
    };

    const levelIcons = {
        error: '❌',
        warn: '⚠️',
        info: 'ℹ️',
        debug: '🔍',
    };

    return (
        <div className={`p-3 border rounded-lg ${levelColors[error.level]}`}>
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <h4 className="font-semibold flex items-center gap-2">
                        <span aria-hidden="true">{levelIcons[error.level]}</span>
                        {error.message}
                        <span className="text-xs font-normal bg-white bg-opacity-60 px-2 py-1 rounded">
                            {error.level}
                        </span>
                    </h4>
                    <p className="text-xs mt-1">{error.timestamp.toLocaleString()}</p>
                    {error.endpoint && (
                        <p className="text-xs mt-1">Endpoint: {error.endpoint}</p>
                    )}
                    {error.stack && (
                        <div className="mt-2">
                            <button
                                onClick={() => setExpanded(!expanded)}
                                className="text-xs underline hover:no-underline"
                                aria-expanded={expanded}
                                aria-controls={`error-stack-${error.id}`}
                            >
                                {expanded ? 'Hide' : 'Show'} stack trace
                            </button>
                            {expanded && (
                                <pre
                                    id={`error-stack-${error.id}`}
                                    className="text-xs mt-2 p-2 bg-white bg-opacity-60 rounded overflow-x-auto"
                                >
                                    {error.stack}
                                </pre>
                            )}
                        </div>
                    )}
                </div>
                {onResolve && !error.resolved && (
                    <button
                        onClick={() => onResolve(error.id)}
                        className="ml-2 px-3 py-1 text-xs bg-white bg-opacity-60 hover:bg-opacity-80 rounded transition-colors"
                        aria-label={`Resolve error: ${error.message}`}
                    >
                        Resolve
                    </button>
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
}

function MetricsChart({ title, data, timestamps, unit = '', color = '#3b82f6' }: MetricsChartProps) {
    const chartRef = useRef<SVGSVGElement>(null);
    const maxValue = Math.max(...data, 1);
    const minValue = Math.min(...data, 0);
    const range = maxValue - minValue || 1;

    // Generate SVG path for the line chart
    const generatePath = () => {
        if (data.length < 2) return '';

        const width = 300;
        const height = 100;
        const padding = 20;

        const points = data.map((value, index) => {
            const x = padding + (index / (data.length - 1)) * (width - 2 * padding);
            const y = height - padding - ((value - minValue) / range) * (height - 2 * padding);
            return `${x},${y}`;
        });

        return `M ${points.join(' L ')}`;
    };

    const latestValue = data[data.length - 1] || 0;

    return (
        <div className="p-4 bg-white border rounded-lg">
            <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900">{title}</h4>
                <span className="text-lg font-mono" aria-label={`Current value: ${latestValue}${unit}`}>
                    {latestValue.toFixed(1)}{unit}
                </span>
            </div>
            <svg
                ref={chartRef}
                width="300"
                height="100"
                className="w-full h-24"
                aria-label={`${title} trend chart showing values from ${timestamps[0]?.toLocaleTimeString()} to ${timestamps[timestamps.length - 1]?.toLocaleTimeString()}`}
                role="img"
            >
                <defs>
                    <linearGradient id={`gradient-${title}`} x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                        <stop offset="100%" stopColor={color} stopOpacity="0.1" />
                    </linearGradient>
                </defs>

                {/* Grid lines */}
                <g stroke="#e5e7eb" strokeWidth="1" opacity="0.5">
                    <line x1="20" y1="20" x2="280" y2="20" />
                    <line x1="20" y1="50" x2="280" y2="50" />
                    <line x1="20" y1="80" x2="280" y2="80" />
                </g>

                {/* Area under the curve */}
                {data.length > 1 && (
                    <path
                        d={`${generatePath()} L 280,80 L 20,80 Z`}
                        fill={`url(#gradient-${title})`}
                    />
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
                    const x = 20 + (index / (data.length - 1 || 1)) * 260;
                    const y = 80 - ((value - minValue) / range) * 60;
                    return (
                        <circle
                            key={index}
                            cx={x}
                            cy={y}
                            r="3"
                            fill={color}
                        />
                    );
                })}
            </svg>
            <div className="text-xs text-gray-500 mt-2 flex justify-between">
                <span>{timestamps[0]?.toLocaleTimeString()}</span>
                <span>{timestamps[timestamps.length - 1]?.toLocaleTimeString()}</span>
            </div>
        </div>
    );
}

export default function SystemHealthDashboard({
    data,
    config,
    onAlertAcknowledge,
    onErrorResolve,
    refreshInterval = 30000,
}: SystemHealthDashboardProps) {
    const [autoRefresh, setAutoRefresh] = useState(true);

    useEffect(() => {
        if (!autoRefresh) return;

        const interval = setInterval(() => {
            // In a real implementation, this would trigger a data refresh
        }, refreshInterval);

        return () => clearInterval(interval);
    }, [autoRefresh, refreshInterval]);

    const formatUptime = (seconds: number): string => {
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);

        if (days > 0) return `${days}d ${hours}h ${minutes}m`;
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">System Health Dashboard</h2>
                    <p className="text-gray-600 mt-1">
                        Last updated: {data.lastUpdated.toLocaleString()}
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={autoRefresh}
                            onChange={(e) => setAutoRefresh(e.target.checked)}
                            className="rounded border-gray-300"
                        />
                        <span className="text-sm">Auto-refresh</span>
                    </label>
                    <div className="text-sm text-gray-500">
                        Uptime: {formatUptime(data.uptime)}
                    </div>
                </div>
            </div>

            {/* Overall Status */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatusCard
                    title="Overall Status"
                    status={data.overallStatus}
                    value={data.overallStatus.toUpperCase()}
                    details={`${data.healthChecks.length} services monitored`}
                    lastUpdated={data.lastUpdated}
                />
                <StatusCard
                    title="API Response Time"
                    status={data.metrics.apiResponseTime > 500 ? 'unhealthy' : data.metrics.apiResponseTime > 200 ? 'degraded' : 'healthy'}
                    value={`${data.metrics.apiResponseTime.toFixed(0)}ms`}
                    details="Average response time"
                />
                <StatusCard
                    title="Error Rate"
                    status={data.metrics.errorRate > 5 ? 'unhealthy' : data.metrics.errorRate > 2 ? 'degraded' : 'healthy'}
                    value={`${data.metrics.errorRate.toFixed(1)}%`}
                    details="Current error rate"
                />
                <StatusCard
                    title="Memory Usage"
                    status={data.metrics.memoryUsage.percentage > 85 ? 'unhealthy' : data.metrics.memoryUsage.percentage > 70 ? 'degraded' : 'healthy'}
                    value={`${data.metrics.memoryUsage.percentage.toFixed(1)}%`}
                    details={`${Math.round(data.metrics.memoryUsage.heapUsed / 1024 / 1024)}MB used`}
                />
            </div>

            {/* Service Health Checks */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Health Checks</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {data.healthChecks.map((check, index) => (
                        <StatusCard
                            key={index}
                            title={check.service}
                            status={check.status}
                            value={check.responseTime >= 0 ? `${check.responseTime}ms` : 'N/A'}
                            details={Object.entries(check.details || {})
                                .map(([key, value]) => `${key}: ${value}`)
                                .join(', ')}
                            lastUpdated={check.lastCheck}
                        />
                    ))}
                </div>
            </div>

            {/* Performance Trends */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Trends</h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <MetricsChart
                        title="Response Time"
                        data={data.trends.responseTime}
                        timestamps={data.trends.timestamps}
                        unit="ms"
                        color="#3b82f6"
                    />
                    <MetricsChart
                        title="Error Rate"
                        data={data.trends.errorRate}
                        timestamps={data.trends.timestamps}
                        unit="%"
                        color="#ef4444"
                    />
                    <MetricsChart
                        title="Memory Usage"
                        data={data.trends.memoryUsage}
                        timestamps={data.trends.timestamps}
                        unit="%"
                        color="#10b981"
                    />
                </div>
            </div>

            {/* Active Alerts */}
            {data.activeAlerts.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Active Alerts ({data.activeAlerts.length})
                    </h3>
                    <div className="space-y-3">
                        {data.activeAlerts.map((alert) => (
                            <AlertItem
                                key={alert.id}
                                alert={alert}
                                onAcknowledge={onAlertAcknowledge}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Recent Errors */}
            {data.recentErrors.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Recent Errors ({data.recentErrors.length})
                    </h3>
                    <div className="space-y-3">
                        {data.recentErrors.map((error) => (
                            <ErrorLogItem
                                key={error.id}
                                error={error}
                                onResolve={onErrorResolve}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Configuration Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Monitoring Configuration</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                        <span className="text-gray-600">Refresh Interval:</span>
                        <div className="font-mono">{config.refreshInterval}s</div>
                    </div>
                    <div>
                        <span className="text-gray-600">Retention Period:</span>
                        <div className="font-mono">{config.retentionPeriod} days</div>
                    </div>
                    <div>
                        <span className="text-gray-600">Error Rate Threshold:</span>
                        <div className="font-mono">{config.alertThresholds.errorRate}%</div>
                    </div>
                    <div>
                        <span className="text-gray-600">Response Time Threshold:</span>
                        <div className="font-mono">{config.alertThresholds.responseTime}ms</div>
                    </div>
                </div>
            </div>
        </div>
    );
} 