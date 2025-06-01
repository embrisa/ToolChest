"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  AdminToolListItem,
  AdminToolsSortOptions,
  AdminToolsFilters,
} from "@/types/admin/tool";
import { TagDTO } from "@/types/tools/tool";
import { ToolTable, ToolFilters } from "@/components/admin";
import { Button } from "@/components/ui";

export default function AdminToolsPage() {
  const [tools, setTools] = useState<AdminToolListItem[]>([]);
  const [availableTags, setAvailableTags] = useState<TagDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [sortOptions, setSortOptions] = useState<AdminToolsSortOptions>({
    field: "displayOrder",
    direction: "asc",
  });

  const [filters, setFilters] = useState<AdminToolsFilters>({});

  // Load tools and tags
  useEffect(() => {
    loadData();
  }, [sortOptions, filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load tools with current sort and filter options
      const toolsParams = new URLSearchParams({
        sortField: sortOptions.field,
        sortDirection: sortOptions.direction,
        ...(filters.search && { search: filters.search }),
        ...(typeof filters.isActive === "boolean" && {
          isActive: filters.isActive.toString(),
        }),
        ...(filters.tagIds &&
          filters.tagIds.length > 0 && { tagIds: filters.tagIds.join(",") }),
      });

      const [toolsResponse, tagsResponse] = await Promise.all([
        fetch(`/api/admin/tools?${toolsParams}`),
        fetch("/api/tags"),
      ]);

      if (!toolsResponse.ok) {
        throw new Error("Failed to load tools");
      }

      if (!tagsResponse.ok) {
        throw new Error("Failed to load tags");
      }

      const toolsData = await toolsResponse.json();
      const tagsData = await tagsResponse.json();

      setTools(toolsData.tools || []);
      setAvailableTags(tagsData.tags || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: AdminToolsSortOptions["field"]) => {
    setSortOptions((prev) => ({
      field,
      direction:
        prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleFiltersChange = (newFilters: AdminToolsFilters) => {
    setFilters(newFilters);
  };

  const handleFiltersReset = () => {
    setFilters({});
  };

  const handleDelete = async (id: string, name: string) => {
    try {
      const response = await fetch(`/api/admin/tools/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete tool");
      }

      // Reload data after successful deletion
      await loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete tool");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center animate-fade-in-up">
          <div className="w-12 h-12 border-3 border-brand-200 border-t-brand-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600 dark:text-neutral-400 text-body">
            Loading tools...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="surface-elevated rounded-2xl p-6 border-l-4 border-l-error-500 animate-fade-in-up">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-error-100 dark:bg-error-900/20 rounded-xl flex items-center justify-center">
              <svg
                className="w-5 h-5 text-error-600 dark:text-error-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-title text-lg font-semibold text-error-900 dark:text-error-100 mb-2">
              Error Loading Tools
            </h3>
            <p className="text-body text-error-700 dark:text-error-300 mb-4">
              {error}
            </p>
            <Button
              onClick={loadData}
              variant="secondary"
              size="sm"
              className="focus-ring"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-display text-3xl font-bold text-gradient-brand mb-2">
            Tools Management
          </h1>
          <p className="text-body text-neutral-600 dark:text-neutral-400">
            Manage your tools, their settings, and tag assignments.
          </p>
        </div>
        <Link href="/admin/tools/create" className="focus-ring rounded-xl">
          <Button
            variant="primary"
            size="lg"
            className="w-full sm:w-auto animate-glow"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Create New Tool
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
        <ToolFilters
          filters={filters}
          availableTags={availableTags}
          onFiltersChange={handleFiltersChange}
          onReset={handleFiltersReset}
        />
      </div>

      {/* Tools Table */}
      <div
        className="card rounded-2xl overflow-hidden animate-slide-up"
        style={{ animationDelay: "0.2s" }}
      >
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
          <div className="flex items-center justify-between">
            <h2 className="text-title text-xl font-semibold text-neutral-900 dark:text-neutral-100">
              Tools Collection
            </h2>
            <div className="flex items-center space-x-2">
              <div className="bg-brand-100 dark:bg-brand-900/20 px-3 py-1 rounded-full">
                <span className="text-sm font-medium text-brand-700 dark:text-brand-300">
                  {tools.length} {tools.length === 1 ? "tool" : "tools"}
                </span>
              </div>
            </div>
          </div>
        </div>
        <ToolTable
          tools={tools}
          sortOptions={sortOptions}
          onSort={handleSort}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
