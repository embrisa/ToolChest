"use client";

import { useState, useEffect } from "react";
import { AdminToolsFilters } from "@/types/admin/tool";
import { TagDTO } from "@/types/tools/tool";
import { Input, Button } from "@/components/ui";

interface ToolFiltersProps {
  filters: AdminToolsFilters;
  availableTags: TagDTO[];
  onFiltersChange: (filters: AdminToolsFilters) => void;
  onReset: () => void;
}

export function ToolFilters({
  filters,
  availableTags,
  onFiltersChange,
  onReset,
}: ToolFiltersProps) {
  const [searchInput, setSearchInput] = useState(filters.search || "");
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(
    null,
  );

  // Debounced search
  useEffect(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const timer = setTimeout(() => {
      onFiltersChange({
        ...filters,
        search: searchInput.trim() || undefined,
      });
    }, 300);

    setDebounceTimer(timer);

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [searchInput]);

  const handleActiveFilterChange = (value: string) => {
    let isActive: boolean | undefined;
    if (value === "active") isActive = true;
    else if (value === "inactive") isActive = false;
    else isActive = undefined;

    onFiltersChange({
      ...filters,
      isActive,
    });
  };

  const handleTagToggle = (tagId: string) => {
    const currentTagIds = filters.tagIds || [];
    const newTagIds = currentTagIds.includes(tagId)
      ? currentTagIds.filter((id) => id !== tagId)
      : [...currentTagIds, tagId];

    onFiltersChange({
      ...filters,
      tagIds: newTagIds.length > 0 ? newTagIds : undefined,
    });
  };

  const hasFilters =
    filters.search ||
    typeof filters.isActive === "boolean" ||
    (filters.tagIds && filters.tagIds.length > 0);

  return (
    <div className="card rounded-2xl p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl flex items-center justify-center">
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
          </div>
          <h3 className="text-title text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Filter Tools
          </h3>
        </div>
        {hasFilters && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-neutral-500 dark:text-neutral-400">
              {
                Object.keys(filters).filter(
                  (key) =>
                    filters[key as keyof AdminToolsFilters] !== undefined,
                ).length
              }{" "}
              active
            </span>
            <Button
              onClick={onReset}
              variant="ghost"
              size="sm"
              className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
            >
              Clear All
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Search */}
        <div className="space-y-2">
          <label htmlFor="search-tools" className="form-label">
            <div className="flex items-center space-x-2">
              <svg
                className="w-4 h-4 text-neutral-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <span>Search Tools</span>
            </div>
          </label>
          <Input
            id="search-tools"
            type="text"
            placeholder="Search by name, description, or slug..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full focus-ring"
          />
        </div>

        {/* Status Filter */}
        <div className="space-y-2">
          <label htmlFor="status-filter" className="form-label">
            <div className="flex items-center space-x-2">
              <svg
                className="w-4 h-4 text-neutral-500"
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
              <span>Status</span>
            </div>
          </label>
          <select
            id="status-filter"
            className="select focus-ring"
            value={
              typeof filters.isActive === "boolean"
                ? filters.isActive
                  ? "active"
                  : "inactive"
                : "all"
            }
            onChange={(e) => handleActiveFilterChange(e.target.value)}
          >
            <option value="all">All Tools</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>

        {/* Quick Actions */}
        <div className="space-y-2">
          <label className="form-label">
            <div className="flex items-center space-x-2">
              <svg
                className="w-4 h-4 text-neutral-500"
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
              <span>Quick Filters</span>
            </div>
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleActiveFilterChange("active")}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 focus-ring ${
                filters.isActive === true
                  ? "bg-success-100 text-success-700 border border-success-200 dark:bg-success-900/20 dark:text-success-400 dark:border-success-800"
                  : "bg-neutral-100 text-neutral-700 border border-neutral-200 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700 dark:hover:bg-neutral-700"
              }`}
            >
              Active
            </button>
            <button
              onClick={() => handleActiveFilterChange("inactive")}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 focus-ring ${
                filters.isActive === false
                  ? "bg-warning-100 text-warning-700 border border-warning-200 dark:bg-warning-900/20 dark:text-warning-400 dark:border-warning-800"
                  : "bg-neutral-100 text-neutral-700 border border-neutral-200 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700 dark:hover:bg-neutral-700"
              }`}
            >
              Inactive
            </button>
          </div>
        </div>
      </div>

      {/* Tag Filters */}
      {availableTags.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
          <label className="form-label">
            <div className="flex items-center space-x-2">
              <svg
                className="w-4 h-4 text-neutral-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
              <span>Filter by Tags</span>
              {filters.tagIds && filters.tagIds.length > 0 && (
                <span className="bg-brand-100 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 px-2 py-0.5 rounded-full text-xs font-medium">
                  {filters.tagIds.length} selected
                </span>
              )}
            </div>
          </label>
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => {
              const isSelected = filters.tagIds?.includes(tag.id) || false;
              return (
                <button
                  key={tag.id}
                  onClick={() => handleTagToggle(tag.id)}
                  className={`inline-flex items-center px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 focus-ring ${
                    isSelected
                      ? "bg-brand-500 text-white shadow-colored hover:bg-brand-600 transform hover:scale-105"
                      : "bg-neutral-100 text-neutral-700 border border-neutral-200 hover:bg-neutral-200 hover:border-neutral-300 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700 dark:hover:bg-neutral-700"
                  }`}
                  style={
                    isSelected && tag.color
                      ? {
                          backgroundColor: tag.color,
                          borderColor: tag.color,
                          color: "#ffffff",
                        }
                      : {}
                  }
                  aria-pressed={isSelected}
                  aria-label={`${isSelected ? "Remove" : "Add"} ${tag.name} filter`}
                >
                  {tag.name}
                  {tag.toolCount !== undefined && (
                    <span className="ml-2 px-1.5 py-0.5 bg-white/20 rounded-full text-xs">
                      {tag.toolCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Active Filters Summary */}
      {hasFilters && (
        <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Active Filters:
            </span>

            {filters.search && (
              <div className="flex items-center space-x-2 bg-brand-50 dark:bg-brand-900/20 px-3 py-1 rounded-lg">
                <svg
                  className="w-3 h-3 text-brand-600 dark:text-brand-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <span className="text-sm text-brand-700 dark:text-brand-300">
                  "{filters.search}"
                </span>
              </div>
            )}

            {typeof filters.isActive === "boolean" && (
              <div
                className={`flex items-center space-x-2 px-3 py-1 rounded-lg ${
                  filters.isActive
                    ? "bg-success-50 dark:bg-success-900/20"
                    : "bg-warning-50 dark:bg-warning-900/20"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    filters.isActive ? "bg-success-500" : "bg-warning-500"
                  }`}
                />
                <span
                  className={`text-sm ${
                    filters.isActive
                      ? "text-success-700 dark:text-success-300"
                      : "text-warning-700 dark:text-warning-300"
                  }`}
                >
                  {filters.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            )}

            {filters.tagIds && filters.tagIds.length > 0 && (
              <div className="flex items-center space-x-2 bg-accent-50 dark:bg-accent-900/20 px-3 py-1 rounded-lg">
                <svg
                  className="w-3 h-3 text-accent-600 dark:text-accent-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
                <span className="text-sm text-accent-700 dark:text-accent-300">
                  {filters.tagIds.length} tag
                  {filters.tagIds.length !== 1 ? "s" : ""}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
