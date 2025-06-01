"use client";

import { useState, useEffect } from "react";
import {
  ChartBarIcon,
  TagIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  SparklesIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { TagUsageStatistics } from "@/types/admin/relationship";
import { Button, Loading } from "@/components/ui";
import { classNames } from "@/utils";

interface TagUsageStatsProps {
  onTagSelect?: (tagId: string) => void;
  className?: string;
}

export function TagUsageStats({ onTagSelect, className }: TagUsageStatsProps) {
  const [stats, setStats] = useState<TagUsageStatistics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"usage" | "popularity" | "recent">(
    "usage",
  );
  const [showDetails, setShowDetails] = useState<string | null>(null);

  useEffect(() => {
    loadTagUsageStats();
  }, []);

  const loadTagUsageStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/admin/relationships/tag-stats");
      if (!response.ok) {
        throw new Error("Failed to load tag usage statistics");
      }

      const statsData: TagUsageStatistics[] = await response.json();
      setStats(statsData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load statistics",
      );
    } finally {
      setLoading(false);
    }
  };

  const sortedStats = [...stats].sort((a, b) => {
    switch (sortBy) {
      case "usage":
        return b.totalTools - a.totalTools;
      case "popularity":
        return a.popularityRank - b.popularityRank;
      case "recent":
        return (
          b.recentUsage.toolsAddedThisMonth - a.recentUsage.toolsAddedThisMonth
        );
      default:
        return 0;
    }
  });

  const getUsageLevel = (
    percentage: number,
  ): { level: string; color: string; description: string } => {
    if (percentage >= 75)
      return {
        level: "Very High",
        color: "text-success-600 dark:text-success-400",
        description: "Widely used across tools",
      };
    if (percentage >= 50)
      return {
        level: "High",
        color: "text-success-600 dark:text-success-400",
        description: "Commonly used",
      };
    if (percentage >= 25)
      return {
        level: "Medium",
        color: "text-warning-600 dark:text-warning-400",
        description: "Moderately used",
      };
    if (percentage >= 10)
      return {
        level: "Low",
        color: "text-warning-600 dark:text-warning-400",
        description: "Occasionally used",
      };
    return {
      level: "Very Low",
      color: "text-error-600 dark:text-error-400",
      description: "Rarely used",
    };
  };

  const getTrendIndicator = (stat: TagUsageStatistics) => {
    const recentGrowth = stat.recentUsage.toolsAddedThisMonth;
    if (recentGrowth >= 3)
      return {
        icon: ArrowTrendingUpIcon,
        color: "text-success-500 dark:text-success-400",
        label: "Growing",
      };
    if (recentGrowth >= 1)
      return {
        icon: SparklesIcon,
        color: "text-brand-500 dark:text-brand-400",
        label: "Active",
      };
    return {
      icon: ClockIcon,
      color: "text-neutral-400 dark:text-neutral-500",
      label: "Stable",
    };
  };

  if (loading) {
    return (
      <div
        className={classNames(
          "flex items-center justify-center py-16",
          className,
        )}
      >
        <div className="text-center">
          <Loading size="lg" />
          <p className="mt-4 text-sm text-neutral-600 dark:text-neutral-400">
            Loading tag statistics...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={classNames("card p-6", className)}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-error-100 dark:bg-error-950/30 rounded-xl flex items-center justify-center">
            <InformationCircleIcon className="w-5 h-5 text-error-600 dark:text-error-400" />
          </div>
          <div>
            <h3 className="text-title font-semibold text-error-800 dark:text-error-200">
              Error Loading Statistics
            </h3>
            <p className="text-sm text-error-600 dark:text-error-400">
              {error}
            </p>
          </div>
        </div>
        <Button variant="secondary" size="sm" onClick={loadTagUsageStats}>
          Try Again
        </Button>
      </div>
    );
  }

  if (stats.length === 0) {
    return (
      <div className={classNames("text-center py-16", className)}>
        <div className="text-neutral-400 dark:text-neutral-500 mb-6">
          <TagIcon className="w-16 h-16 mx-auto" />
        </div>
        <h3 className="text-title text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
          No Tag Statistics Available
        </h3>
        <p className="text-body text-neutral-600 dark:text-neutral-400 max-w-sm mx-auto">
          Create some tags and assign them to tools to see usage statistics.
        </p>
      </div>
    );
  }

  return (
    <div className={classNames("space-y-8", className)}>
      {/* Header and Sort Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-100 dark:bg-brand-950/30 rounded-xl flex items-center justify-center">
            <ChartBarIcon className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          </div>
          <div>
            <h3 className="text-title text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              Tag Usage Statistics
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Analyze how tags are being used across your tools
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label htmlFor="sort-select" className="form-label text-sm">
            Sort by:
          </label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="select text-sm"
          >
            <option value="usage">Total Usage</option>
            <option value="popularity">Popularity Rank</option>
            <option value="recent">Recent Activity</option>
          </select>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedStats.map((stat) => {
          const usageLevel = getUsageLevel(stat.usagePercentage);
          const trend = getTrendIndicator(stat);
          const isDetailExpanded = showDetails === stat.tagId;

          return (
            <div
              key={stat.tagId}
              className={classNames(
                "card-interactive p-6 transition-all duration-200",
                onTagSelect && "cursor-pointer",
                isDetailExpanded &&
                  "ring-2 ring-brand-500/20 border-brand-200 dark:border-brand-800",
              )}
              onClick={() => onTagSelect?.(stat.tagId)}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div
                    className="w-4 h-4 rounded-lg border border-neutral-300 dark:border-neutral-600 flex-shrink-0"
                    style={{ backgroundColor: stat.tagColor || "#6B7280" }}
                    aria-hidden="true"
                  />
                  <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                    {stat.tagName}
                  </h4>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <trend.icon
                    className={classNames("w-4 h-4", trend.color)}
                    title={trend.label}
                  />
                  <span className="text-xs text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded-lg">
                    #{stat.popularityRank}
                  </span>
                </div>
              </div>

              {/* Usage Stats */}
              <div className="space-y-4">
                {/* Total Tools */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">
                    Total Tools
                  </span>
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100 bg-neutral-100 dark:bg-neutral-800 px-3 py-1 rounded-lg">
                    {stat.totalTools}
                  </span>
                </div>

                {/* Usage Percentage */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">
                      Usage Rate
                    </span>
                    <span
                      className={classNames(
                        "text-sm font-semibold",
                        usageLevel.color,
                      )}
                    >
                      {stat.usagePercentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-neutral-200 dark:bg-neutral-800 rounded-full h-2.5">
                    <div
                      className="bg-gradient-to-r from-brand-500 to-brand-600 h-2.5 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(stat.usagePercentage, 100)}%`,
                      }}
                      aria-label={`${stat.usagePercentage.toFixed(1)}% usage rate`}
                    />
                  </div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    {usageLevel.description}
                  </p>
                </div>

                {/* Recent Activity */}
                <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-600 dark:text-neutral-400">
                      This Month
                    </span>
                    <div className="flex items-center gap-2">
                      <span
                        className={classNames(
                          "font-medium",
                          stat.recentUsage.toolsAddedThisMonth > 0
                            ? "text-success-600 dark:text-success-400"
                            : "text-neutral-500 dark:text-neutral-400",
                        )}
                      >
                        +{stat.recentUsage.toolsAddedThisMonth}
                      </span>
                      <span className="text-neutral-500 dark:text-neutral-400">
                        tools
                      </span>
                    </div>
                  </div>
                </div>

                {/* Expanded Details Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDetails(isDetailExpanded ? null : stat.tagId);
                  }}
                  className="w-full text-center text-xs text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 py-2 border-t border-neutral-200 dark:border-neutral-800 focus:outline-none focus:ring-2 focus:ring-brand-500/50 rounded-lg transition-colors"
                >
                  {isDetailExpanded ? "Hide Details" : "Show Details"}
                </button>
              </div>

              {/* Expanded Details */}
              {isDetailExpanded && (
                <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800 space-y-3 animate-fade-in-up">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-neutral-50 dark:bg-neutral-800/50 p-3 rounded-lg">
                      <div className="text-neutral-500 dark:text-neutral-400">
                        Last Week
                      </div>
                      <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                        +{stat.recentUsage.toolsAddedThisWeek}
                      </div>
                    </div>
                    <div className="bg-neutral-50 dark:bg-neutral-800/50 p-3 rounded-lg">
                      <div className="text-neutral-500 dark:text-neutral-400">
                        Trend
                      </div>
                      <div className={classNames("font-semibold", trend.color)}>
                        {trend.label}
                      </div>
                    </div>
                  </div>

                  {stat.tools && stat.tools.length > 0 && (
                    <div>
                      <h5 className="text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Top Tools Using This Tag
                      </h5>
                      <div className="space-y-1">
                        {stat.tools.slice(0, 3).map((tool: any) => (
                          <div
                            key={tool.id}
                            className="flex items-center gap-2 text-xs"
                          >
                            <div className="w-2 h-2 rounded-full bg-brand-500 flex-shrink-0" />
                            <span className="text-neutral-600 dark:text-neutral-400 truncate">
                              {tool.name}
                            </span>
                          </div>
                        ))}
                        {stat.tools.length > 3 && (
                          <div className="text-xs text-neutral-500 dark:text-neutral-400 pl-4">
                            +{stat.tools.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      {stats.length > 0 && (
        <div className="card p-6">
          <h4 className="text-title font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
            Summary Statistics
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-brand-600 dark:text-brand-400 mb-1">
                {stats.length}
              </div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">
                Total Tags Tracked
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success-600 dark:text-success-400 mb-1">
                {stats.reduce((sum, stat) => sum + stat.totalTools, 0)}
              </div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">
                Total Tool Assignments
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent-600 dark:text-accent-400 mb-1">
                {Math.round(
                  stats.reduce((sum, stat) => sum + stat.usagePercentage, 0) /
                    stats.length,
                )}
                %
              </div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">
                Average Usage Rate
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
