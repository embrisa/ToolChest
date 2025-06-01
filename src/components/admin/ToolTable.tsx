"use client";

import { useState } from "react";
import Link from "next/link";
import { AdminToolListItem, AdminToolsSortOptions } from "@/types/admin/tool";
import { Button } from "@/components/ui";

interface ToolTableProps {
  tools: AdminToolListItem[];
  sortOptions: AdminToolsSortOptions;
  onSort: (field: AdminToolsSortOptions["field"]) => void;
  onDelete: (id: string, name: string) => void;
}

export function ToolTable({
  tools,
  sortOptions,
  onSort,
  onDelete,
}: ToolTableProps) {
  const [deletingToolId, setDeletingToolId] = useState<string | null>(null);

  const handleSort = (field: AdminToolsSortOptions["field"]) => {
    onSort(field);
  };

  const handleDeleteClick = (id: string, name: string) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      )
    ) {
      setDeletingToolId(id);
      onDelete(id, name);
    }
  };

  const getSortIcon = (field: AdminToolsSortOptions["field"]) => {
    if (sortOptions.field !== field) {
      return (
        <svg
          className="w-4 h-4 text-neutral-400 dark:text-neutral-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
          />
        </svg>
      );
    }
    return sortOptions.direction === "asc" ? (
      <svg
        className="w-4 h-4 text-brand-600 dark:text-brand-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
        />
      </svg>
    ) : (
      <svg
        className="w-4 h-4 text-brand-600 dark:text-brand-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4"
        />
      </svg>
    );
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  return (
    <div className="surface rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-800">
          <thead className="bg-neutral-50 dark:bg-neutral-900">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                <button
                  onClick={() => handleSort("name")}
                  className="flex items-center gap-2 hover:text-neutral-900 dark:hover:text-neutral-100 focus:outline-none focus:text-neutral-900 dark:focus:text-neutral-100 transition-colors group"
                  aria-label="Sort by name"
                >
                  <span>Name</span>
                  <div className="opacity-60 group-hover:opacity-100 transition-opacity">
                    {getSortIcon("name")}
                  </div>
                </button>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                <button
                  onClick={() => handleSort("slug")}
                  className="flex items-center gap-2 hover:text-neutral-900 dark:hover:text-neutral-100 focus:outline-none focus:text-neutral-900 dark:focus:text-neutral-100 transition-colors group"
                  aria-label="Sort by slug"
                >
                  <span>Slug</span>
                  <div className="opacity-60 group-hover:opacity-100 transition-opacity">
                    {getSortIcon("slug")}
                  </div>
                </button>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                Tags
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                <button
                  onClick={() => handleSort("displayOrder")}
                  className="flex items-center gap-2 hover:text-neutral-900 dark:hover:text-neutral-100 focus:outline-none focus:text-neutral-900 dark:focus:text-neutral-100 transition-colors group"
                  aria-label="Sort by display order"
                >
                  <span>Order</span>
                  <div className="opacity-60 group-hover:opacity-100 transition-opacity">
                    {getSortIcon("displayOrder")}
                  </div>
                </button>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                <button
                  onClick={() => handleSort("usageCount")}
                  className="flex items-center gap-2 hover:text-neutral-900 dark:hover:text-neutral-100 focus:outline-none focus:text-neutral-900 dark:focus:text-neutral-100 transition-colors group"
                  aria-label="Sort by usage count"
                >
                  <span>Usage</span>
                  <div className="opacity-60 group-hover:opacity-100 transition-opacity">
                    {getSortIcon("usageCount")}
                  </div>
                </button>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                <button
                  onClick={() => handleSort("updatedAt")}
                  className="flex items-center gap-2 hover:text-neutral-900 dark:hover:text-neutral-100 focus:outline-none focus:text-neutral-900 dark:focus:text-neutral-100 transition-colors group"
                  aria-label="Sort by last updated"
                >
                  <span>Updated</span>
                  <div className="opacity-60 group-hover:opacity-100 transition-opacity">
                    {getSortIcon("updatedAt")}
                  </div>
                </button>
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-neutral-900 divide-y divide-neutral-200 dark:divide-neutral-800">
            {tools.map((tool) => (
              <tr
                key={tool.id}
                className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {tool.iconClass && (
                      <span
                        className={`${tool.iconClass} mr-3 text-neutral-600 dark:text-neutral-400`}
                        aria-hidden="true"
                      />
                    )}
                    <div>
                      <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                        {tool.name}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-neutral-900 dark:text-neutral-100 font-mono text-code">
                    {tool.slug}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div
                    className="text-sm text-neutral-700 dark:text-neutral-300 max-w-xs truncate"
                    title={tool.description || "No description"}
                  >
                    {tool.description || (
                      <span className="text-neutral-400 dark:text-neutral-500 italic">
                        No description
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-wrap gap-1">
                    {tool.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border transition-all duration-200"
                        style={{
                          backgroundColor: tag.color
                            ? `${tag.color}15`
                            : "rgb(var(--neutral-100))",
                          borderColor: tag.color || "rgb(var(--neutral-300))",
                          color: tag.color || "rgb(var(--neutral-700))",
                        }}
                      >
                        {tag.name}
                      </span>
                    ))}
                    {tool.tags.length === 0 && (
                      <span className="text-neutral-400 dark:text-neutral-500 italic text-sm">
                        No tags
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  {tool.displayOrder}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  {tool.usageCount.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                      tool.isActive
                        ? "bg-success-50 text-success-700 border-success-200 dark:bg-success-950/30 dark:text-success-400 dark:border-success-800"
                        : "bg-error-50 text-error-700 border-error-200 dark:bg-error-950/30 dark:text-error-400 dark:border-error-800"
                    }`}
                  >
                    {tool.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">
                  {formatDate(tool.updatedAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-3">
                    <Link
                      href={`/admin/tools/${tool.id}/edit`}
                      className="text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-neutral-900 transition-colors rounded-md px-2 py-1"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDeleteClick(tool.id, tool.name)}
                      disabled={deletingToolId === tool.id}
                      className="text-error-600 hover:text-error-700 dark:text-error-400 dark:hover:text-error-300 font-medium focus:outline-none focus:ring-2 focus:ring-error-500/50 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-md px-2 py-1"
                      aria-label={`Delete ${tool.name}`}
                    >
                      {deletingToolId === tool.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {tools.length === 0 && (
        <div className="text-center py-16">
          <div className="text-neutral-400 dark:text-neutral-500 mb-4">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
            No tools found
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">
            Get started by creating your first tool.
          </p>
          <Link href="/admin/tools/create">
            <Button>Create New Tool</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
