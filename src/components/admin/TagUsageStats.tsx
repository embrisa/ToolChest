'use client';

import { useState, useEffect } from 'react';
import {
    ChartBarIcon,
    TagIcon,
    ArrowTrendingUpIcon,
    ClockIcon,
    SparklesIcon,
    InformationCircleIcon
} from '@heroicons/react/24/outline';
import { TagUsageStatistics } from '@/types/admin/relationship';
import { Button, Loading } from '@/components/ui';
import { classNames } from '@/utils';

interface TagUsageStatsProps {
    onTagSelect?: (tagId: string) => void;
    className?: string;
}

export function TagUsageStats({ onTagSelect, className }: TagUsageStatsProps) {
    const [stats, setStats] = useState<TagUsageStatistics[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<'usage' | 'popularity' | 'recent'>('usage');
    const [showDetails, setShowDetails] = useState<string | null>(null);

    useEffect(() => {
        loadTagUsageStats();
    }, []);

    const loadTagUsageStats = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch('/api/admin/relationships/tag-stats');
            if (!response.ok) {
                throw new Error('Failed to load tag usage statistics');
            }

            const statsData: TagUsageStatistics[] = await response.json();
            setStats(statsData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load statistics');
        } finally {
            setLoading(false);
        }
    };

    const sortedStats = [...stats].sort((a, b) => {
        switch (sortBy) {
            case 'usage':
                return b.totalTools - a.totalTools;
            case 'popularity':
                return a.popularityRank - b.popularityRank;
            case 'recent':
                return b.recentUsage.toolsAddedThisMonth - a.recentUsage.toolsAddedThisMonth;
            default:
                return 0;
        }
    });

    const getUsageLevel = (percentage: number): { level: string; color: string; description: string } => {
        if (percentage >= 75) return { level: 'Very High', color: 'text-emerald-600', description: 'Widely used across tools' };
        if (percentage >= 50) return { level: 'High', color: 'text-green-600', description: 'Commonly used' };
        if (percentage >= 25) return { level: 'Medium', color: 'text-yellow-600', description: 'Moderately used' };
        if (percentage >= 10) return { level: 'Low', color: 'text-orange-600', description: 'Occasionally used' };
        return { level: 'Very Low', color: 'text-red-600', description: 'Rarely used' };
    };

    const getTrendIndicator = (stat: TagUsageStatistics) => {
        const recentGrowth = stat.recentUsage.toolsAddedThisMonth;
        if (recentGrowth >= 3) return { icon: ArrowTrendingUpIcon, color: 'text-green-500', label: 'Growing' };
        if (recentGrowth >= 1) return { icon: SparklesIcon, color: 'text-blue-500', label: 'Active' };
        return { icon: ClockIcon, color: 'text-gray-400', label: 'Stable' };
    };

    if (loading) {
        return (
            <div className={classNames('flex items-center justify-center py-12', className)}>
                <div className="text-center">
                    <Loading size="md" />
                    <p className="mt-2 text-sm text-gray-600">Loading tag statistics...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={classNames('bg-red-50 border border-red-200 rounded-lg p-4', className)}>
                <div className="flex items-center gap-2 mb-2">
                    <InformationCircleIcon className="w-5 h-5 text-red-600" />
                    <h3 className="font-medium text-red-800">Error Loading Statistics</h3>
                </div>
                <p className="text-sm text-red-700 mb-3">{error}</p>
                <Button variant="outline" size="sm" onClick={loadTagUsageStats}>
                    Try Again
                </Button>
            </div>
        );
    }

    if (stats.length === 0) {
        return (
            <div className={classNames('text-center py-12', className)}>
                <TagIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Tag Statistics Available</h3>
                <p className="text-gray-600">Create some tags and assign them to tools to see usage statistics.</p>
            </div>
        );
    }

    return (
        <div className={classNames('space-y-6', className)}>
            {/* Header and Sort Controls */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <ChartBarIcon className="w-5 h-5 text-gray-600" />
                    <h3 className="text-lg font-medium text-gray-900">Tag Usage Statistics</h3>
                </div>

                <div className="flex items-center gap-2">
                    <label htmlFor="sort-select" className="text-sm font-medium text-gray-700">
                        Sort by:
                    </label>
                    <select
                        id="sort-select"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="usage">Total Usage</option>
                        <option value="popularity">Popularity Rank</option>
                        <option value="recent">Recent Activity</option>
                    </select>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedStats.map((stat) => {
                    const usageLevel = getUsageLevel(stat.usagePercentage);
                    const trend = getTrendIndicator(stat);
                    const isDetailExpanded = showDetails === stat.tagId;

                    return (
                        <div
                            key={stat.tagId}
                            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-3 h-3 rounded-full border border-gray-300"
                                        style={{ backgroundColor: stat.tagColor || '#6B7280' }}
                                        aria-hidden="true"
                                    />
                                    <h4 className="font-medium text-gray-900 truncate">
                                        {stat.tagName}
                                    </h4>
                                </div>
                                <div className="flex items-center gap-1">
                                    <trend.icon
                                        className={classNames('w-4 h-4', trend.color)}
                                        title={trend.label}
                                    />
                                    <span className="text-xs text-gray-500">#{stat.popularityRank}</span>
                                </div>
                            </div>

                            {/* Usage Stats */}
                            <div className="space-y-3">
                                {/* Total Tools */}
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Total Tools</span>
                                    <span className="font-semibold text-gray-900">
                                        {stat.totalTools}
                                    </span>
                                </div>

                                {/* Usage Percentage */}
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm text-gray-600">Usage</span>
                                        <span className={classNames('text-sm font-medium', usageLevel.color)}>
                                            {stat.usagePercentage.toFixed(1)}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full transition-all"
                                            style={{ width: `${Math.min(stat.usagePercentage, 100)}%` }}
                                            aria-label={`${stat.usagePercentage.toFixed(1)}% usage rate`}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">{usageLevel.description}</p>
                                </div>

                                {/* Active vs Inactive */}
                                <div className="grid grid-cols-2 gap-2 text-center">
                                    <div className="bg-green-50 rounded-lg p-2">
                                        <div className="text-lg font-bold text-green-600">
                                            {stat.activeTools}
                                        </div>
                                        <div className="text-xs text-green-700">Active</div>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-2">
                                        <div className="text-lg font-bold text-gray-600">
                                            {stat.inactiveTools}
                                        </div>
                                        <div className="text-xs text-gray-700">Inactive</div>
                                    </div>
                                </div>

                                {/* Recent Activity */}
                                {stat.recentUsage.toolsAddedThisMonth > 0 && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                                        <div className="flex items-center gap-1 mb-1">
                                            <SparklesIcon className="w-3 h-3 text-blue-600" />
                                            <span className="text-xs font-medium text-blue-800">Recent Activity</span>
                                        </div>
                                        <p className="text-xs text-blue-700">
                                            {stat.recentUsage.toolsAddedThisMonth} new assignment{stat.recentUsage.toolsAddedThisMonth !== 1 ? 's' : ''} this month
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                                <button
                                    onClick={() => setShowDetails(isDetailExpanded ? null : stat.tagId)}
                                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                                >
                                    {isDetailExpanded ? 'Hide' : 'Show'} Details
                                </button>

                                {onTagSelect && (
                                    <button
                                        onClick={() => onTagSelect(stat.tagId)}
                                        className="text-xs text-gray-600 hover:text-gray-800 font-medium"
                                    >
                                        Manage
                                    </button>
                                )}
                            </div>

                            {/* Expanded Details */}
                            {isDetailExpanded && (
                                <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                                    <h5 className="text-xs font-medium text-gray-900 mb-2">
                                        Tools using this tag ({stat.tools.length})
                                    </h5>
                                    <div className="max-h-32 overflow-y-auto space-y-1">
                                        {stat.tools.map((tool) => (
                                            <div
                                                key={tool.id}
                                                className="flex items-center justify-between text-xs"
                                            >
                                                <span className={classNames(
                                                    'truncate',
                                                    tool.isActive ? 'text-gray-900' : 'text-gray-500'
                                                )}>
                                                    {tool.name}
                                                </span>
                                                <span className={classNames(
                                                    'px-1 py-0.5 rounded text-xs',
                                                    tool.isActive
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-gray-100 text-gray-600'
                                                )}>
                                                    {tool.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Summary Stats */}
            <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Summary</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                        <div className="text-2xl font-bold text-blue-600">
                            {stats.length}
                        </div>
                        <div className="text-sm text-gray-600">Total Tags</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-green-600">
                            {stats.filter(s => s.totalTools > 0).length}
                        </div>
                        <div className="text-sm text-gray-600">Used Tags</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-purple-600">
                            {Math.round(stats.reduce((sum, s) => sum + s.usagePercentage, 0) / stats.length)}%
                        </div>
                        <div className="text-sm text-gray-600">Avg Usage</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-amber-600">
                            {stats.reduce((sum, s) => sum + s.recentUsage.toolsAddedThisMonth, 0)}
                        </div>
                        <div className="text-sm text-gray-600">Recent Activity</div>
                    </div>
                </div>
            </div>
        </div>
    );
} 