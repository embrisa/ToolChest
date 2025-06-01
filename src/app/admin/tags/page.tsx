"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  AdminTagListItem,
  AdminTagsSortOptions,
  AdminTagsFilters,
} from "@/types/admin/tag";
import { TagTable, TagFilters } from "@/components/admin";
import { Button, Loading } from "@/components/ui";

export default function AdminTagsPage() {
  const [tags, setTags] = useState<AdminTagListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [sortOptions, setSortOptions] = useState<AdminTagsSortOptions>({
    field: "name",
    direction: "asc",
  });

  const [filters, setFilters] = useState<AdminTagsFilters>({});

  // Memoize loadData to prevent infinite re-renders
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Load tags with current sort and filter options
      const tagsParams = new URLSearchParams({
        sortField: sortOptions.field,
        sortDirection: sortOptions.direction,
        ...(filters.search && { search: filters.search }),
        ...(typeof filters.hasTools === "boolean" && {
          hasTools: filters.hasTools.toString(),
        }),
      });

      const response = await fetch(`/api/admin/tags?${tagsParams}`);

      if (!response.ok) {
        throw new Error("Failed to load tags");
      }

      const data = await response.json();
      setTags(data.tags || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [
    sortOptions.field,
    sortOptions.direction,
    filters.search,
    filters.hasTools,
  ]);

  // Load tags - use specific dependencies instead of objects
  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSort = (field: AdminTagsSortOptions["field"]) => {
    setSortOptions((prev) => ({
      field,
      direction:
        prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleFiltersChange = (newFilters: AdminTagsFilters) => {
    setFilters(newFilters);
  };

  const handleFiltersReset = () => {
    setFilters({});
  };

  const handleDelete = async (id: string, name: string) => {
    try {
      const response = await fetch(`/api/admin/tags/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete tag");
      }

      // Reload data after successful deletion
      await loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete tag");
    }
  };

  if (loading) {
    return (
      <div className="container-narrow">
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <Loading size="lg" className="mx-auto mb-4" />
            <p className="text-neutral-600 dark:text-neutral-400 text-body">
              Loading tags...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-narrow">
        <div className="surface rounded-2xl p-6 border-error-200 dark:border-error-800 bg-error-50 dark:bg-error-950/30">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-6 w-6 text-error-600 dark:text-error-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                />
              </svg>
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-sm font-semibold text-error-800 dark:text-error-200">
                Error loading tags
              </h3>
              <div className="mt-2 text-sm text-error-700 dark:text-error-300">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <Button onClick={loadData} variant="secondary" size="sm">
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-narrow space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
            Tags Management
          </h1>
          <p className="text-body text-neutral-600 dark:text-neutral-400 max-w-2xl">
            Organize your tools with tags. Create, edit, and manage tag
            categories to help users discover and filter tools effectively.
          </p>
        </div>
        <Link href="/admin/tags/create">
          <Button variant="primary" size="lg" className="shadow-colored">
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Create New Tag
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <TagFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onReset={handleFiltersReset}
      />

      {/* Tags Table */}
      <div className="surface rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
          <div className="flex items-center justify-between">
            <h2 className="text-title text-xl font-semibold text-neutral-900 dark:text-neutral-100">
              Tags
            </h2>
            <div className="text-sm text-neutral-500 dark:text-neutral-400">
              {tags.length === 1
                ? "1 tag"
                : `${tags.length.toLocaleString()} tags`}
            </div>
          </div>
        </div>
        <TagTable
          tags={tags}
          sortOptions={sortOptions}
          onSort={handleSort}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
