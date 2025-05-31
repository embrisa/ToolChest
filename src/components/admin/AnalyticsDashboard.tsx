'use client';

import React, { useState, useEffect } from 'react';
import { AnalyticsChart } from './AnalyticsChart';
import { Loading } from '@/components/ui/Loading';
import type {
    AnalyticsSummary,
    AnalyticsChart as AnalyticsChartType,
    SystemPerformanceMetrics,
    AnalyticsDashboardProps,
} from '@/types/admin/analytics';

export function AnalyticsDashboard({ initialData }: AnalyticsDashboardProps) {
    const [summary, setSummary] = useState<AnalyticsSummary | null>(initialData || null);
    const [charts, setCharts] = useState<AnalyticsChartType[]>([]);
    const [systemMetrics, setSystemMetrics] = useState<SystemPerformanceMetrics | null>(null);
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

            const [summaryResponse, chartsResponse, systemResponse] = await Promise.all([
                fetch('/api/admin/analytics'),
                fetch('/api/admin/analytics/charts'),
                fetch('/api/admin/analytics/system'),
            ]);

            if (!summaryResponse.ok || !chartsResponse.ok || !systemResponse.ok) {
                throw new Error('Failed to load analytics data');
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
            setError(err instanceof Error ? err.message : 'Failed to load analytics data');
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
        return `${num >= 0 ? '+' : ''}${num.toFixed(1)}%`;
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
        const sizes = ['B', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 B';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loading size="lg" />
                <span className="ml-3 text-gray-600">Loading analytics data...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <div className="flex items-center">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">Error loading analytics</h3>
                        <p className="mt-1 text-sm text-red-700">{error}</p>
                        <button
                            onClick={loadAnalyticsData}
                            className="mt-2 text-sm text-red-800 underline hover:text-red-900"
                        >
                            Try again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!summary || !systemMetrics) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">No analytics data available</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Summary Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Tools</p>
                            <p className="text-2xl font-semibold text-gray-900">{summary.totalTools}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                </svg>
                            </div>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Tags</p>
                            <p className="text-2xl font-semibold text-gray-900">{summary.totalTags}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            </div>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Usage</p>
                            <p className="text-2xl font-semibold text-gray-900">{formatNumber(summary.totalUsage)}</p>
                            <p className="text-sm text-gray-500">
                                {formatPercentage(summary.periodComparison.growthRates.usage)} vs last period
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                </svg>
                            </div>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Active Users</p>
                            <p className="text-2xl font-semibold text-gray-900">{formatNumber(summary.activeUsers)}</p>
                            <p className="text-sm text-gray-500">
                                {formatPercentage(summary.periodComparison.growthRates.newUsers)} vs last period
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts */}
            {charts.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {charts.map((chart, index) => (
                        <div key={index} className="bg-white rounded-lg shadow p-6">
                            <AnalyticsChart chart={chart} />
                        </div>
                    ))}
                </div>
            )}

            {/* System Performance */}
            <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">System Performance</h3>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* API Performance */}
                        <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-3">API Response Times</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Average:</span>
                                    <span className="text-sm font-medium">{systemMetrics.apiResponseTimes.average}ms</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">95th percentile:</span>
                                    <span className="text-sm font-medium">{systemMetrics.apiResponseTimes.p95}ms</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">99th percentile:</span>
                                    <span className="text-sm font-medium">{systemMetrics.apiResponseTimes.p99}ms</span>
                                </div>
                            </div>
                        </div>

                        {/* Memory Usage */}
                        <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-3">Memory Usage</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Heap Used:</span>
                                    <span className="text-sm font-medium">{formatBytes(systemMetrics.memoryUsage.heapUsed)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Heap Total:</span>
                                    <span className="text-sm font-medium">{formatBytes(systemMetrics.memoryUsage.heapTotal)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">External:</span>
                                    <span className="text-sm font-medium">{formatBytes(systemMetrics.memoryUsage.external)}</span>
                                </div>
                            </div>
                        </div>

                        {/* System Health */}
                        <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-3">System Health</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Status:</span>
                                    <span className={`text-sm font-medium ${systemMetrics.systemHealth.status === 'healthy' ? 'text-green-600' :
                                        systemMetrics.systemHealth.status === 'warning' ? 'text-yellow-600' :
                                            'text-red-600'
                                        }`}>
                                        {systemMetrics.systemHealth.status}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Uptime:</span>
                                    <span className="text-sm font-medium">{formatUptime(systemMetrics.systemHealth.uptime)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Error Rate:</span>
                                    <span className="text-sm font-medium">{(systemMetrics.errorRates.overall * 100).toFixed(2)}%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Top Tools */}
            {summary.topTools.length > 0 && (
                <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">Top Tools</h3>
                    </div>
                    <div className="p-6">
                        <div className="space-y-4">
                            {summary.topTools.map((tool, index) => (
                                <div key={tool.toolId} className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                                            <span className="text-sm font-medium text-gray-600">{index + 1}</span>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm font-medium text-gray-900">{tool.name}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-gray-900">{formatNumber(tool.usageCount)} uses</p>
                                        <p className="text-sm text-gray-500">{formatPercentage(tool.growthRate)} growth</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Recent Activity */}
            {summary.recentActivity.length > 0 && (
                <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
                    </div>
                    <div className="p-6">
                        <div className="space-y-4">
                            {summary.recentActivity.slice(0, 5).map((activity, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 w-2 h-2 bg-blue-400 rounded-full"></div>
                                        <div className="ml-3">
                                            <p className="text-sm text-gray-900">
                                                <span className="font-medium">{activity.toolName}</span> was used
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {new Date(activity.timestamp).toLocaleTimeString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 