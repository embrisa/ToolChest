'use client';

import { useState, useEffect } from 'react';
import SystemHealthDashboard from '@/components/admin/SystemHealthDashboard';
import type {
    SystemHealthDashboard as SystemHealthDashboardData,
    SystemMonitoringConfig,
} from '@/types/admin/analytics';

export default function MonitoringPage() {
    const [dashboardData, setDashboardData] = useState<SystemHealthDashboardData | null>(null);
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
            const response = await fetch('/api/admin/analytics/system');

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.success) {
                setDashboardData(result.data);
            } else {
                throw new Error(result.error || 'Failed to fetch system health data');
            }
        } catch (err) {
            console.error('Failed to fetch system health:', err);
            setError(err instanceof Error ? err.message : 'Unknown error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleAlertAcknowledge = async (alertId: string) => {
        try {
            const response = await fetch('/api/admin/monitoring/alerts', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    alertId,
                    action: 'acknowledge',
                    acknowledgedBy: 'admin',
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
                throw new Error(result.error || 'Failed to acknowledge alert');
            }
        } catch (err) {
            console.error('Failed to acknowledge alert:', err);
            setError(err instanceof Error ? err.message : 'Failed to acknowledge alert');
        }
    };

    const handleErrorResolve = async (errorId: string) => {
        try {
            const response = await fetch('/api/admin/monitoring/errors', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    errorId,
                    action: 'resolve',
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
                throw new Error(result.error || 'Failed to resolve error');
            }
        } catch (err) {
            console.error('Failed to resolve error:', err);
            setError(err instanceof Error ? err.message : 'Failed to resolve error');
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
            if (document.visibilityState === 'visible') {
                fetchSystemHealth();
            }
        }, refreshInterval);

        return () => clearInterval(interval);
    }, [autoRefresh, refreshInterval]);

    // Handle visibility change - pause refresh when tab is not visible
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && autoRefresh) {
                fetchSystemHealth();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [autoRefresh]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading system health data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-500 text-xl mb-4">❌ Error</div>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={() => {
                            setError(null);
                            setLoading(true);
                            fetchSystemHealth();
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (!dashboardData) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600">No system health data available</p>
                    <button
                        onClick={fetchSystemHealth}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                        Refresh
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Page Header */}
            <div className="bg-white shadow-sm border-b border-gray-200 mb-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">System Monitoring</h1>
                            <p className="text-gray-600 mt-1">
                                Real-time system health, performance metrics, and alerts
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
                            <select
                                value={refreshInterval}
                                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                                className="text-sm border border-gray-300 rounded px-2 py-1"
                                disabled={!autoRefresh}
                            >
                                <option value={15000}>15s</option>
                                <option value={30000}>30s</option>
                                <option value={60000}>1m</option>
                                <option value={300000}>5m</option>
                            </select>
                            <button
                                onClick={fetchSystemHealth}
                                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                            >
                                Refresh Now
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Error Alert */}
            {error && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                        <div className="flex items-center justify-between">
                            <span>{error}</span>
                            <button
                                onClick={() => setError(null)}
                                className="text-red-500 hover:text-red-700"
                                aria-label="Dismiss error"
                            >
                                ×
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Dashboard Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
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