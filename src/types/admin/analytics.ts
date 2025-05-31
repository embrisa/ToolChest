export interface ToolUsageAnalytics {
    toolId: string;
    toolName: string;
    toolSlug: string;
    usageCount: number;
    uniqueUsers: number;
    averageSessionTime: number;
    lastUsed: Date;
    trend: {
        daily: number[];
        weekly: number[];
        monthly: number[];
    };
    growth: {
        dailyGrowth: number;
        weeklyGrowth: number;
        monthlyGrowth: number;
    };
}

export interface SystemPerformanceMetrics {
    apiResponseTimes: {
        average: number;
        p50: number;
        p95: number;
        p99: number;
    };
    errorRates: {
        overall: number;
        byEndpoint: Record<string, number>;
    };
    databaseMetrics: {
        connectionPoolSize: number;
        activeConnections: number;
        queryTime: {
            average: number;
            slowQueries: number;
        };
    };
    memoryUsage: {
        heapUsed: number;
        heapTotal: number;
        external: number;
    };
    systemHealth: {
        uptime: number;
        status: 'healthy' | 'warning' | 'critical';
        lastHealthCheck: Date;
    };
}

export interface AnalyticsSummary {
    totalTools: number;
    totalTags: number;
    totalUsage: number;
    activeUsers: number;
    topTools: Array<{
        toolId: string;
        name: string;
        usageCount: number;
        growthRate: number;
    }>;
    recentActivity: Array<{
        timestamp: Date;
        action: string;
        toolName: string;
        metadata?: Record<string, any>;
    }>;
    periodComparison: {
        currentPeriod: {
            usage: number;
            newUsers: number;
            averageSessionTime: number;
        };
        previousPeriod: {
            usage: number;
            newUsers: number;
            averageSessionTime: number;
        };
        growthRates: {
            usage: number;
            newUsers: number;
            averageSessionTime: number;
        };
    };
}

export interface AnalyticsTimeRange {
    start: Date;
    end: Date;
    period: 'day' | 'week' | 'month' | 'quarter' | 'year';
}

export interface AnalyticsFilter {
    timeRange: AnalyticsTimeRange;
    toolIds?: string[];
    tagIds?: string[];
    includeInactive?: boolean;
}

export interface AnalyticsChart {
    type: 'line' | 'bar' | 'pie' | 'area';
    title: string;
    data: Array<{
        label: string;
        value: number;
        metadata?: Record<string, any>;
    }>;
    options?: {
        colors?: string[];
        showLegend?: boolean;
        showTooltip?: boolean;
    };
}

export interface ExportOptions {
    format: 'csv' | 'pdf' | 'json';
    includeCharts: boolean;
    includeRawData: boolean;
    filename?: string;
    compression?: boolean;
}

export interface AnalyticsExport {
    summary: AnalyticsSummary;
    toolUsage: ToolUsageAnalytics[];
    systemMetrics: SystemPerformanceMetrics;
    charts: AnalyticsChart[];
    metadata: {
        generatedAt: Date;
        timeRange: AnalyticsTimeRange;
        filters: AnalyticsFilter;
        version: string;
    };
}

export interface AnalyticsError {
    code: 'INSUFFICIENT_DATA' | 'INVALID_RANGE' | 'EXPORT_FAILED' | 'SERVICE_ERROR';
    message: string;
    details?: Record<string, any>;
}

// Validation and utility types
export interface AnalyticsValidationRules {
    maxTimeRange: number; // in days
    minDataPoints: number;
    supportedFormats: ExportOptions['format'][];
    maxExportSize: number; // in MB
}

export interface AnalyticsConfig {
    refreshInterval: number; // in seconds
    cacheTimeout: number; // in seconds
    enableRealTimeUpdates: boolean;
    exportLimits: {
        maxRecords: number;
        rateLimitWindow: number; // in minutes
        rateLimitRequests: number;
    };
}

// Component prop types
export interface AnalyticsDashboardProps {
    initialData?: AnalyticsSummary;
    config?: AnalyticsConfig;
}

export interface AnalyticsChartProps {
    chart: AnalyticsChart;
    className?: string;
    height?: number;
    interactive?: boolean;
    onDataPointClick?: (dataPoint: any) => void;
}

export interface AnalyticsFiltersProps {
    currentFilter: AnalyticsFilter;
    onChange: (filter: AnalyticsFilter) => void;
    availableTools: Array<{ id: string; name: string }>;
    availableTags: Array<{ id: string; name: string }>;
}

export interface AnalyticsExportProps {
    onExport: (options: ExportOptions) => Promise<void>;
    isExporting: boolean;
    supportedFormats: ExportOptions['format'][];
}

// System Monitoring Extensions
export interface SystemMonitoringConfig {
    enabled: boolean;
    refreshInterval: number; // in seconds
    alertThresholds: {
        errorRate: number; // percentage
        responseTime: number; // milliseconds
        memoryUsage: number; // percentage
        diskUsage: number; // percentage
        dbConnectionPool: number; // percentage
    };
    retentionPeriod: number; // in days
    enableNotifications: boolean;
}

export interface ErrorLogEntry {
    id: string;
    timestamp: Date;
    level: 'error' | 'warn' | 'info' | 'debug';
    message: string;
    stack?: string;
    metadata: Record<string, any>;
    endpoint?: string;
    userId?: string;
    ipAddress?: string;
    userAgent?: string;
    resolved: boolean;
    tags: string[];
}

export interface SystemAlert {
    id: string;
    type: 'error_rate' | 'response_time' | 'memory_usage' | 'disk_usage' | 'database' | 'custom';
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    threshold: number;
    currentValue: number;
    triggered: Date;
    resolved?: Date;
    acknowledgedBy?: string;
    acknowledgedAt?: Date;
    metadata?: Record<string, any>;
}

export interface RealTimeMetrics {
    timestamp: Date;
    apiResponseTime: number;
    errorRate: number;
    memoryUsage: {
        heapUsed: number;
        heapTotal: number;
        percentage: number;
    };
    activeConnections: number;
    requestsPerMinute: number;
    cpuUsage?: number;
    diskUsage?: number;
}

export interface SystemHealthCheck {
    service: string;
    status: 'healthy' | 'degraded' | 'unhealthy';
    responseTime: number;
    lastCheck: Date;
    details?: Record<string, any>;
    dependencies?: SystemHealthCheck[];
}

export interface SystemHealthDashboard {
    overallStatus: 'healthy' | 'degraded' | 'unhealthy';
    lastUpdated: Date;
    uptime: number;
    healthChecks: SystemHealthCheck[];
    activeAlerts: SystemAlert[];
    recentErrors: ErrorLogEntry[];
    metrics: RealTimeMetrics;
    trends: {
        responseTime: number[];
        errorRate: number[];
        memoryUsage: number[];
        timestamps: Date[];
    };
}

export interface MonitoringFilter {
    timeRange: AnalyticsTimeRange;
    severity?: SystemAlert['severity'][];
    services?: string[];
    errorLevels?: ErrorLogEntry['level'][];
    resolved?: boolean;
}

export interface AlertConfiguration {
    id: string;
    name: string;
    type: SystemAlert['type'];
    threshold: number;
    condition: 'greater_than' | 'less_than' | 'equals';
    enabled: boolean;
    notifications: {
        email?: string[];
        slack?: string;
        webhook?: string;
    };
    cooldownPeriod: number; // in minutes
}

// Component prop types for monitoring
export interface SystemHealthDashboardProps {
    data: SystemHealthDashboard;
    config: SystemMonitoringConfig;
    onAlertAcknowledge?: (alertId: string) => void;
    onErrorResolve?: (errorId: string) => void;
}

export interface ErrorLogViewerProps {
    errors: ErrorLogEntry[];
    filter: MonitoringFilter;
    onFilterChange: (filter: MonitoringFilter) => void;
    onErrorResolve: (errorId: string) => void;
}

export interface AlertManagerProps {
    alerts: SystemAlert[];
    configurations: AlertConfiguration[];
    onAlertAcknowledge: (alertId: string) => void;
    onConfigurationUpdate: (config: AlertConfiguration) => void;
}

export interface RealTimeMonitorProps {
    metrics: RealTimeMetrics[];
    refreshInterval: number;
    onRefreshIntervalChange: (interval: number) => void;
} 