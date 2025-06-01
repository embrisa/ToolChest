"use client";

import { useState, useEffect } from "react";
import { AdminTagsFilters } from "@/types/admin/tag";
import { Input, Button } from "@/components/ui";

interface TagFiltersProps {
  filters: AdminTagsFilters;
  onFiltersChange: (filters: AdminTagsFilters) => void;
  onReset: () => void;
}

export function TagFilters({
  filters,
  onFiltersChange,
  onReset,
}: TagFiltersProps) {
  const [localFilters, setLocalFilters] = useState<AdminTagsFilters>(filters);
  const [isExpanded, setIsExpanded] = useState(false);

  // Update local filters when props change
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterChange = (key: keyof AdminTagsFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleReset = () => {
    setLocalFilters({});
    onReset();
    setIsExpanded(false);
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== undefined && value !== null && value !== "",
  );

  const activeFilterCount = Object.values(filters).filter(
    (value) => value !== undefined && value !== null && value !== "",
  ).length;

  return (
    <div className="surface rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4 flex-1">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400 dark:text-neutral-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <Input
                type="text"
                placeholder="Search tags..."
                value={localFilters.search || ""}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Filter Toggle */}
          <Button
            onClick={() => setIsExpanded(!isExpanded)}
            variant="secondary"
            size="md"
            className="flex items-center space-x-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z"
              />
            </svg>
            <span>Filters</span>
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </Button>
        </div>

        {/* Filter Status */}
        <div className="flex items-center space-x-3">
          {hasActiveFilters && (
            <>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-brand-100 text-brand-700 dark:bg-brand-950/30 dark:text-brand-400 border border-brand-200 dark:border-brand-800">
                {activeFilterCount}{" "}
                {activeFilterCount === 1 ? "filter" : "filters"} active
              </span>
              <Button
                onClick={handleReset}
                variant="ghost"
                size="sm"
                className="text-error-600 hover:text-error-700 dark:text-error-400 dark:hover:text-error-300 hover:bg-error-50 dark:hover:bg-error-950/30"
              >
                Clear All
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Expanded filters */}
      {isExpanded && (
        <div className="border-t border-neutral-200 dark:border-neutral-800 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Has Tools Filter */}
            <div className="form-group">
              <label className="form-label">Tool Assignment</label>
              <select
                value={
                  localFilters.hasTools === undefined
                    ? ""
                    : localFilters.hasTools.toString()
                }
                onChange={(e) => {
                  const value = e.target.value;
                  handleFilterChange(
                    "hasTools",
                    value === "" ? undefined : value === "true",
                  );
                }}
                className="select"
              >
                <option value="">All Tags</option>
                <option value="true">Has Tools</option>
                <option value="false">No Tools</option>
              </select>
            </div>

            {/* Color Filter - Placeholder */}
            <div className="form-group">
              <label className="form-label">Color</label>
              <select disabled className="select opacity-50 cursor-not-allowed">
                <option>All Colors (Coming Soon)</option>
              </select>
              <p className="form-help">
                Color-based filtering will be available in a future update.
              </p>
            </div>

            {/* Usage Filter - Placeholder */}
            <div className="form-group">
              <label className="form-label">Usage Level</label>
              <select disabled className="select opacity-50 cursor-not-allowed">
                <option>All Usage Levels (Coming Soon)</option>
              </select>
              <p className="form-help">
                Usage-based filtering will be available in a future update.
              </p>
            </div>
          </div>

          {/* Filter Help */}
          <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center justify-between">
              <div className="text-sm text-neutral-500 dark:text-neutral-400">
                Use filters to narrow down the tag list and find exactly what
                you're looking for.
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  onClick={() => setIsExpanded(false)}
                  variant="ghost"
                  size="sm"
                >
                  Collapse Filters
                </Button>
                {hasActiveFilters && (
                  <Button
                    onClick={handleReset}
                    variant="secondary"
                    size="sm"
                    className="text-error-600 hover:text-error-700 dark:text-error-400 dark:hover:text-error-300 border-error-300 dark:border-error-700 hover:bg-error-50 dark:hover:bg-error-950/30"
                  >
                    Reset All Filters
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
