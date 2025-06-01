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

  const activeFilterCount = Object.keys(filters).filter(
    (key) => filters[key as keyof AdminToolsFilters] !== undefined,
  ).length;

  return (
    <div className="surface rounded-2xl p-8 space-y-8">
      {/* Enhanced Header with Better Spacing */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl flex items-center justify-center shadow-soft">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-heading text-xl font-semibold text-primary mb-1">
              Filter Tools
            </h3>
            <p className="text-small text-secondary">
              Refine your tool list with search and category filters
            </p>
          </div>
        </div>
        {hasFilters && (
          <div className="flex items-center space-x-3">
            <div className="bg-brand-50 text-brand-700 px-3 py-1.5 rounded-full text-sm font-medium border border-brand-200">
              {activeFilterCount} active filter
              {activeFilterCount !== 1 ? "s" : ""}
            </div>
            <Button
              onClick={onReset}
              variant="secondary"
              size="sm"
              className="text-tertiary hover:text-primary transition-colors focus-ring"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Clear All
            </Button>
          </div>
        )}
      </div>

      {/* Enhanced Filter Grid with Better Spacing */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Search Filter */}
        <div className="space-y-3">
          <label
            htmlFor="search-tools"
            className="block text-sm font-semibold text-primary"
          >
            <div className="flex items-center space-x-2">
              <svg
                className="w-4 h-4 text-secondary"
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
            aria-describedby="search-help"
          />
          <p id="search-help" className="text-small text-secondary">
            Search across tool names, descriptions, and URL slugs
          </p>
        </div>

        {/* Status Filter */}
        <div className="space-y-3">
          <label
            htmlFor="status-filter"
            className="block text-sm font-semibold text-primary"
          >
            <div className="flex items-center space-x-2">
              <svg
                className="w-4 h-4 text-secondary"
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
              <span>Publication Status</span>
            </div>
          </label>
          <select
            id="status-filter"
            className="input-field focus-ring text-primary"
            value={
              typeof filters.isActive === "boolean"
                ? filters.isActive
                  ? "active"
                  : "inactive"
                : "all"
            }
            onChange={(e) => handleActiveFilterChange(e.target.value)}
            aria-describedby="status-help"
          >
            <option value="all">All Tools</option>
            <option value="active">Published Tools</option>
            <option value="inactive">Draft Tools</option>
          </select>
          <p id="status-help" className="text-small text-secondary">
            Filter by publication status
          </p>
        </div>

        {/* Quick Status Filters */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-primary">
            <div className="flex items-center space-x-2">
              <svg
                className="w-4 h-4 text-secondary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
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
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleActiveFilterChange("active")}
              className={`touch-target-comfortable px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 focus-ring ${
                filters.isActive === true
                  ? "bg-success-500 text-white shadow-colored border-2 border-success-600"
                  : "bg-neutral-50 text-tertiary border-2 border-neutral-200 hover:bg-neutral-25 hover:border-neutral-300 hover:text-primary"
              }`}
              aria-pressed={filters.isActive === true}
              aria-label="Filter to show only published tools"
            >
              <div className="flex items-center space-x-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    filters.isActive === true ? "bg-white" : "bg-success-500"
                  }`}
                />
                <span>Published</span>
              </div>
            </button>
            <button
              onClick={() => handleActiveFilterChange("inactive")}
              className={`touch-target-comfortable px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 focus-ring ${
                filters.isActive === false
                  ? "bg-warning-500 text-white shadow-colored border-2 border-warning-600"
                  : "bg-neutral-50 text-tertiary border-2 border-neutral-200 hover:bg-neutral-25 hover:border-neutral-300 hover:text-primary"
              }`}
              aria-pressed={filters.isActive === false}
              aria-label="Filter to show only draft tools"
            >
              <div className="flex items-center space-x-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    filters.isActive === false ? "bg-white" : "bg-warning-500"
                  }`}
                />
                <span>Drafts</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Tag Filters */}
      {availableTags.length > 0 && (
        <div className="space-y-6 pt-6 border-t border-neutral-200">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-semibold text-primary">
              <div className="flex items-center space-x-2">
                <svg
                  className="w-4 h-4 text-secondary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
                <span>Filter by Categories</span>
              </div>
            </label>
            {filters.tagIds && filters.tagIds.length > 0 && (
              <div className="bg-accent-50 text-accent-700 px-3 py-1.5 rounded-full text-sm font-medium border border-accent-200">
                {filters.tagIds.length} categor
                {filters.tagIds.length !== 1 ? "ies" : "y"} selected
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            {availableTags.map((tag) => {
              const isSelected = filters.tagIds?.includes(tag.id) || false;
              return (
                <button
                  key={tag.id}
                  onClick={() => handleTagToggle(tag.id)}
                  className={`touch-target-comfortable inline-flex items-center px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 focus-ring border-2 ${
                    isSelected
                      ? "bg-brand-500 text-white shadow-colored border-brand-600 transform hover:scale-105"
                      : "bg-neutral-50 text-tertiary border-neutral-200 hover:bg-neutral-25 hover:border-neutral-300 hover:text-primary"
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
                  aria-label={`${isSelected ? "Remove" : "Add"} ${tag.name} category filter`}
                >
                  <span>{tag.name}</span>
                  {tag.toolCount !== undefined && (
                    <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs font-medium">
                      {tag.toolCount}
                    </span>
                  )}
                  {isSelected && (
                    <svg
                      className="ml-2 w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Enhanced Active Filters Summary */}
      {hasFilters && (
        <div className="pt-6 border-t border-neutral-200">
          <div className="bg-neutral-25 rounded-xl p-6 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-brand-500 rounded-lg flex items-center justify-center">
                <svg
                  className="w-3 h-3 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
              </div>
              <h4 className="text-body font-semibold text-primary">
                Active Filters Applied
              </h4>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {filters.search && (
                <div className="flex items-center space-x-2 bg-brand-50 px-3 py-2 rounded-lg border border-brand-200">
                  <svg
                    className="w-3 h-3 text-brand-600"
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
                  <span className="text-sm font-medium text-brand-700">
                    Search: "{filters.search}"
                  </span>
                </div>
              )}

              {typeof filters.isActive === "boolean" && (
                <div
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg border ${
                    filters.isActive
                      ? "bg-success-50 border-success-200"
                      : "bg-warning-50 border-warning-200"
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      filters.isActive ? "bg-success-500" : "bg-warning-500"
                    }`}
                  />
                  <span
                    className={`text-sm font-medium ${
                      filters.isActive ? "text-success-700" : "text-warning-700"
                    }`}
                  >
                    {filters.isActive ? "Published Only" : "Drafts Only"}
                  </span>
                </div>
              )}

              {filters.tagIds && filters.tagIds.length > 0 && (
                <div className="flex items-center space-x-2 bg-accent-50 px-3 py-2 rounded-lg border border-accent-200">
                  <svg
                    className="w-3 h-3 text-accent-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                  <span className="text-sm font-medium text-accent-700">
                    {filters.tagIds.length} categor
                    {filters.tagIds.length !== 1 ? "ies" : "y"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
