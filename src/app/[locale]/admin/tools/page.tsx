"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  AdminToolListItem,
  AdminToolsSortOptions,
  AdminToolsFilters,
} from "@/types/admin/tool";
import { TagDTO } from "@/types/tools/tool";
import { ToolTable, ToolFilters } from "@/components/admin";
import { Button } from "@/components/ui";

export default function AdminToolsPage() {
  const t = useTranslations("pages.admin.tools");
  const tCommon = useTranslations("common");

  const [tools, setTools] = useState<AdminToolListItem[]>([]);
  const [availableTags, setAvailableTags] = useState<TagDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [sortOptions, setSortOptions] = useState<AdminToolsSortOptions>({
    field: "displayOrder",
    direction: "asc",
  });

  const [filters, setFilters] = useState<AdminToolsFilters>({});

  // Memoize the loadData function to prevent unnecessary re-creation
  const loadData = useCallback(async () => {
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
  }, [
    sortOptions.field,
    sortOptions.direction,
    filters.search,
    filters.isActive,
    filters.tagIds,
  ]);

  // Load tools and tags - use specific dependencies instead of objects
  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSort = useCallback((field: AdminToolsSortOptions["field"]) => {
    setSortOptions((prev) => ({
      field,
      direction:
        prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
  }, []);

  const handleFiltersChange = useCallback((newFilters: AdminToolsFilters) => {
    setFilters(newFilters);
  }, []);

  const handleFiltersReset = useCallback(() => {
    setFilters({});
  }, []);

  const handleDelete = useCallback(
    async (id: string, _name: string) => {
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
    },
    [loadData],
  );

  if (loading) {
    return (
      <div className="container-wide section-spacing-md">
        <div className="flex items-center justify-center py-20">
          <div className="text-center animate-fade-in-up">
            <div className="w-12 h-12 border-3 border-neutral-200 border-t-brand-500 rounded-full animate-spin mx-auto mb-6"></div>
            <p className="text-secondary text-lg">
              {tCommon("ui.status.loading")}...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-wide section-spacing-md">
        <div className="card rounded-2xl p-8 border-l-4 border-l-error-500 animate-fade-in-up">
          <div className="flex items-start space-x-6">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-error-50 rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-error-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
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
              <h3 className="text-xl font-semibold text-error-900 mb-3">
                {tCommon("errors.loadingFailed")}
              </h3>
              <p className="text-base text-error-700 mb-6">{error}</p>
              <Button
                onClick={loadData}
                variant="secondary"
                size="md"
                className="focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
              >
                {tCommon("ui.actions.tryAgain")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-wide section-spacing-md">
      <div className="space-y-12 animate-fade-in-up">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-primary">{t("title")}</h1>
            <p className="text-lg text-secondary max-w-2xl">
              {t("description")}
            </p>
          </div>
          <div className="flex-shrink-0">
            <Link
              href="/admin/tools/create"
              className="focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 rounded-xl"
            >
              <Button
                variant="primary"
                size="lg"
                className="w-full lg:w-auto shadow-colored hover:shadow-large transition-all duration-200"
              >
                <svg
                  className="w-5 h-5 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                {t("actions.createTool")}
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters Section */}
        <div className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <ToolFilters
            filters={filters}
            availableTags={availableTags}
            onFiltersChange={handleFiltersChange}
            onReset={handleFiltersReset}
          />
        </div>

        {/* Tools Table Section */}
        <div className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <div className="card rounded-2xl overflow-hidden shadow-medium">
            {/* Table Header */}
            <div className="px-8 py-6 bg-neutral-50 border-b border-neutral-150">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-primary">
                  Tools Collection
                </h2>
                <div className="flex items-center space-x-4">
                  <div className="bg-brand-50 px-4 py-2 rounded-xl border border-brand-100">
                    <span className="text-sm font-medium text-brand-700">
                      {tools.length} {tools.length === 1 ? "tool" : "tools"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Table Content */}
            <ToolTable
              tools={tools}
              sortOptions={sortOptions}
              onSort={handleSort}
              onDelete={handleDelete}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
