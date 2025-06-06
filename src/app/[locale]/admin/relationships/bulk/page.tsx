"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeftIcon,
  UserGroupIcon,
  TagIcon,
} from "@heroicons/react/24/outline";
import { Button, Loading } from "@/components/ui";
import { MultiSelect } from "@/components/ui/MultiSelect";
import { BulkOperations } from "@/components/admin/BulkOperations";
import { MultiSelectOption } from "@/types/admin/relationship";
import { AdminToolListItem } from "@/types/admin/tool";
import { TagDTO } from "@/types/tools/tool";
import { classNames } from "@/utils";

export default function BulkOperationsPage() {
  // const searchParams = useSearchParams();
  // const initialMode = searchParams.get('mode') === 'remove' ? 'remove' : 'assign';

  const [tools, setTools] = useState<AdminToolListItem[]>([]);
  const [tags, setTags] = useState<TagDTO[]>([]);
  const [selectedToolIds, setSelectedToolIds] = useState<string[]>([]);
  const [showBulkOperations, setShowBulkOperations] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load tools and tags in parallel
      const [toolsResponse, tagsResponse] = await Promise.all([
        fetch("/api/admin/tools"),
        fetch("/api/admin/tags"),
      ]);

      if (!toolsResponse.ok || !tagsResponse.ok) {
        throw new Error("Failed to load data");
      }

      const [toolsData, tagsData] = await Promise.all([
        toolsResponse.json(),
        tagsResponse.json(),
      ]);

      setTools(toolsData.tools || []);
      setTags(tagsData.tags || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleStartBulkOperation = () => {
    if (selectedToolIds.length === 0) {
      setError("Please select at least one tool");
      return;
    }
    setShowBulkOperations(true);
  };

  const handleOperationComplete = () => {
    setShowBulkOperations(false);
    setSelectedToolIds([]);
    // Optionally reload data or show success message
  };

  const handleCloseBulkOperations = () => {
    setShowBulkOperations(false);
  };

  // Convert tools to MultiSelect options
  const toolOptions: MultiSelectOption[] = tools.map((tool) => ({
    id: tool.id,
    label: tool.name,
    description: `${tool.slug} (${tool.tagCount} tags)`,
    isActive: tool.isActive,
    metadata: {
      slug: tool.slug,
      tagCount: tool.tagCount,
      displayOrder: tool.displayOrder,
    },
  }));

  const selectedTools = tools.filter((tool) =>
    selectedToolIds.includes(tool.id),
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loading size="lg" />
          <p className="mt-6 text-neutral-600 dark:text-neutral-400">
            Loading tools and tags...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Link href="/admin/relationships">
            <Button variant="ghost" size="sm">
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back to Relationships
            </Button>
          </Link>
          <h1 className="text-display text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Bulk Operations
          </h1>
        </div>

        <div className="card p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-error-100 dark:bg-error-950/30 rounded-xl flex items-center justify-center">
              <svg
                className="w-6 h-6 text-error-600 dark:text-error-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-title text-lg font-semibold text-error-800 dark:text-error-200">
                Error Loading Data
              </h3>
              <p className="text-error-600 dark:text-error-400">{error}</p>
            </div>
          </div>
          <Button onClick={loadData} variant="secondary">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/relationships">
          <Button variant="ghost" size="sm">
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Relationships
          </Button>
        </Link>
        <div>
          <h1 className="text-display text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Bulk Tag Operations
          </h1>
          <p className="text-body text-neutral-600 dark:text-neutral-400">
            Select tools and perform bulk tag assignments or removals
          </p>
        </div>
      </div>

      {!showBulkOperations ? (
        <>
          {/* Tool Selection */}
          <div className="card">
            <div className="px-8 py-6 border-b border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-100 dark:bg-brand-950/30 rounded-xl flex items-center justify-center">
                  <UserGroupIcon className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                </div>
                <div>
                  <h2 className="text-title text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                    Select Tools
                  </h2>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Choose the tools you want to apply bulk tag operations to
                  </p>
                </div>
              </div>
            </div>
            <div className="p-8">
              <MultiSelect
                options={toolOptions}
                selectedIds={selectedToolIds}
                onSelectionChange={setSelectedToolIds}
                placeholder="Search and select tools..."
                searchable={true}
                label="Tools"
                description="You can select multiple tools to apply the same tag operations"
              />

              {selectedToolIds.length > 0 && (
                <div className="mt-6 card-glass p-6">
                  <h3 className="font-semibold text-brand-900 dark:text-brand-100 mb-4">
                    Selected Tools ({selectedToolIds.length})
                  </h3>
                  <div className="space-y-3 max-h-48 overflow-y-auto scrollbar-thin">
                    {selectedTools.map((tool) => (
                      <div
                        key={tool.id}
                        className="flex items-center justify-between text-sm p-3 bg-white/50 dark:bg-neutral-800/50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-neutral-900 dark:text-neutral-100">
                            {tool.name}
                          </span>
                          <span className="text-neutral-500 dark:text-neutral-400 text-code">
                            ({tool.slug})
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={classNames(
                              "px-3 py-1 text-xs rounded-lg font-medium",
                              tool.isActive
                                ? "bg-success-100 text-success-800 dark:bg-success-950/30 dark:text-success-400"
                                : "bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300",
                            )}
                          >
                            {tool.isActive ? "Active" : "Inactive"}
                          </span>
                          <span className="text-xs text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded-lg">
                            {tool.tagCount} tags
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Button */}
          <div className="flex items-center justify-between pt-6 border-t border-neutral-200 dark:border-neutral-800">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {selectedToolIds.length === 0
                ? "Select tools to continue"
                : `${selectedToolIds.length} tool${selectedToolIds.length === 1 ? "" : "s"} selected`}
            </p>
            <Button
              onClick={handleStartBulkOperation}
              disabled={selectedToolIds.length === 0}
              variant="primary"
              size="lg"
            >
              <TagIcon className="w-5 h-5 mr-2" />
              Continue to Tag Operations
            </Button>
          </div>
        </>
      ) : (
        <div className="card p-8">
          <BulkOperations
            selectedTools={selectedTools}
            availableTags={tags}
            onOperationComplete={handleOperationComplete}
            onClose={handleCloseBulkOperations}
          />
        </div>
      )}
    </div>
  );
}
