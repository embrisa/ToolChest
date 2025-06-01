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
          className="w-4 h-4 text-secondary opacity-60 group-hover:opacity-100 transition-opacity"
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
        className="w-4 h-4 text-brand-600"
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
        className="w-4 h-4 text-brand-600"
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
    <div className="surface rounded-2xl overflow-hidden shadow-medium">
      <div className="overflow-x-auto">
        <table className="min-w-full" role="table">
          <thead className="bg-neutral-25 border-b border-neutral-200">
            <tr>
              <th
                scope="col"
                className="px-6 py-5 text-left text-xs font-bold text-primary uppercase tracking-wider"
              >
                <button
                  onClick={() => handleSort("name")}
                  className="flex items-center gap-3 hover:text-brand-600 focus:outline-none focus:text-brand-600 transition-colors group touch-target-min"
                  aria-label={`Sort by name ${sortOptions.field === "name" ? `(currently ${sortOptions.direction === "asc" ? "ascending" : "descending"})` : ""}`}
                >
                  <span>Tool Name</span>
                  <div className="opacity-60 group-hover:opacity-100 transition-opacity">
                    {getSortIcon("name")}
                  </div>
                </button>
              </th>
              <th
                scope="col"
                className="px-6 py-5 text-left text-xs font-bold text-primary uppercase tracking-wider"
              >
                <button
                  onClick={() => handleSort("slug")}
                  className="flex items-center gap-3 hover:text-brand-600 focus:outline-none focus:text-brand-600 transition-colors group touch-target-min"
                  aria-label={`Sort by URL slug ${sortOptions.field === "slug" ? `(currently ${sortOptions.direction === "asc" ? "ascending" : "descending"})` : ""}`}
                >
                  <span>URL Slug</span>
                  <div className="opacity-60 group-hover:opacity-100 transition-opacity">
                    {getSortIcon("slug")}
                  </div>
                </button>
              </th>
              <th
                scope="col"
                className="px-6 py-5 text-left text-xs font-bold text-primary uppercase tracking-wider"
              >
                Description
              </th>
              <th
                scope="col"
                className="px-6 py-5 text-left text-xs font-bold text-primary uppercase tracking-wider"
              >
                Categories
              </th>
              <th
                scope="col"
                className="px-6 py-5 text-left text-xs font-bold text-primary uppercase tracking-wider"
              >
                <button
                  onClick={() => handleSort("displayOrder")}
                  className="flex items-center gap-3 hover:text-brand-600 focus:outline-none focus:text-brand-600 transition-colors group touch-target-min"
                  aria-label={`Sort by display order ${sortOptions.field === "displayOrder" ? `(currently ${sortOptions.direction === "asc" ? "ascending" : "descending"})` : ""}`}
                >
                  <span>Order</span>
                  <div className="opacity-60 group-hover:opacity-100 transition-opacity">
                    {getSortIcon("displayOrder")}
                  </div>
                </button>
              </th>
              <th
                scope="col"
                className="px-6 py-5 text-left text-xs font-bold text-primary uppercase tracking-wider"
              >
                <button
                  onClick={() => handleSort("usageCount")}
                  className="flex items-center gap-3 hover:text-brand-600 focus:outline-none focus:text-brand-600 transition-colors group touch-target-min"
                  aria-label={`Sort by usage count ${sortOptions.field === "usageCount" ? `(currently ${sortOptions.direction === "asc" ? "ascending" : "descending"})` : ""}`}
                >
                  <span>Usage</span>
                  <div className="opacity-60 group-hover:opacity-100 transition-opacity">
                    {getSortIcon("usageCount")}
                  </div>
                </button>
              </th>
              <th
                scope="col"
                className="px-6 py-5 text-left text-xs font-bold text-primary uppercase tracking-wider"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-6 py-5 text-left text-xs font-bold text-primary uppercase tracking-wider"
              >
                <button
                  onClick={() => handleSort("updatedAt")}
                  className="flex items-center gap-3 hover:text-brand-600 focus:outline-none focus:text-brand-600 transition-colors group touch-target-min"
                  aria-label={`Sort by last updated ${sortOptions.field === "updatedAt" ? `(currently ${sortOptions.direction === "asc" ? "ascending" : "descending"})` : ""}`}
                >
                  <span>Last Updated</span>
                  <div className="opacity-60 group-hover:opacity-100 transition-opacity">
                    {getSortIcon("updatedAt")}
                  </div>
                </button>
              </th>
              <th
                scope="col"
                className="px-6 py-5 text-right text-xs font-bold text-primary uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-neutral-150">
            {tools.map((tool, index) => (
              <tr
                key={tool.id}
                className="hover:bg-neutral-25 transition-colors duration-200 group"
                role="row"
              >
                <td className="px-6 py-5 whitespace-nowrap" role="gridcell">
                  <div className="flex items-center space-x-4">
                    {tool.iconClass && (
                      <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl flex items-center justify-center shadow-soft flex-shrink-0">
                        <span
                          className={`${tool.iconClass} text-white w-5 h-5`}
                          aria-hidden="true"
                        />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-primary truncate">
                        {tool.name}
                      </div>
                      {tool.iconClass && (
                        <div className="text-xs text-secondary truncate">
                          {tool.iconClass}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 whitespace-nowrap" role="gridcell">
                  <div className="text-sm text-primary font-mono bg-neutral-25 px-3 py-1.5 rounded-lg border border-neutral-200 inline-block">
                    {tool.slug}
                  </div>
                </td>
                <td className="px-6 py-5" role="gridcell">
                  <div className="max-w-xs">
                    {tool.description ? (
                      <div
                        className="text-sm text-secondary line-clamp-2"
                        title={tool.description}
                      >
                        {tool.description}
                      </div>
                    ) : (
                      <span className="text-tertiary italic text-sm">
                        No description provided
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-5 whitespace-nowrap" role="gridcell">
                  <div className="flex flex-wrap gap-2 max-w-xs">
                    {tool.tags.length > 0 ? (
                      tool.tags.map((tag) => (
                        <span
                          key={tag.id}
                          className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border transition-all duration-200"
                          style={{
                            backgroundColor: tag.color
                              ? `${tag.color}15`
                              : "rgb(241 243 244)",
                            borderColor: tag.color || "rgb(232 234 237)",
                            color: tag.color || "rgb(95 99 104)",
                          }}
                        >
                          {tag.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-tertiary italic text-sm">
                        No categories
                      </span>
                    )}
                  </div>
                </td>
                <td
                  className="px-6 py-5 whitespace-nowrap text-sm font-semibold text-primary"
                  role="gridcell"
                >
                  <div className="bg-neutral-25 px-3 py-1.5 rounded-lg border border-neutral-200 inline-block">
                    {tool.displayOrder}
                  </div>
                </td>
                <td
                  className="px-6 py-5 whitespace-nowrap text-sm font-semibold text-primary"
                  role="gridcell"
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
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                    <span>{tool.usageCount.toLocaleString()}</span>
                  </div>
                </td>
                <td className="px-6 py-5 whitespace-nowrap" role="gridcell">
                  <span
                    className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                      tool.isActive
                        ? "bg-success-50 text-success-700 border-success-200"
                        : "bg-warning-50 text-warning-700 border-warning-200"
                    }`}
                    aria-label={
                      tool.isActive
                        ? "Tool is published and visible to users"
                        : "Tool is in draft mode and hidden from users"
                    }
                  >
                    <div
                      className={`w-2 h-2 rounded-full mr-2 ${
                        tool.isActive ? "bg-success-500" : "bg-warning-500"
                      }`}
                    />
                    {tool.isActive ? "Published" : "Draft"}
                  </span>
                </td>
                <td
                  className="px-6 py-5 whitespace-nowrap text-sm text-secondary"
                  role="gridcell"
                >
                  <div className="flex items-center space-x-2">
                    <svg
                      className="w-4 h-4 text-tertiary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>{formatDate(tool.updatedAt)}</span>
                  </div>
                </td>
                <td
                  className="px-6 py-5 whitespace-nowrap text-right"
                  role="gridcell"
                >
                  <div className="flex items-center justify-end gap-3">
                    <Link
                      href={`/admin/tools/${tool.id}/edit`}
                      className="touch-target-comfortable text-brand-600 hover:text-brand-700 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:ring-offset-2 focus:ring-offset-white transition-colors rounded-lg px-3 py-2 bg-brand-50 hover:bg-brand-100 border border-brand-200 hover:border-brand-300"
                      aria-label={`Edit ${tool.name}`}
                    >
                      <div className="flex items-center space-x-2">
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
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                        <span>Edit</span>
                      </div>
                    </Link>
                    <button
                      onClick={() => handleDeleteClick(tool.id, tool.name)}
                      disabled={deletingToolId === tool.id}
                      className="touch-target-comfortable text-error-600 hover:text-error-700 font-medium focus:outline-none focus:ring-2 focus:ring-error-500/50 focus:ring-offset-2 focus:ring-offset-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-lg px-3 py-2 bg-error-50 hover:bg-error-100 border border-error-200 hover:border-error-300"
                      aria-label={`Delete ${tool.name}`}
                    >
                      <div className="flex items-center space-x-2">
                        {deletingToolId === tool.id ? (
                          <>
                            <div className="w-4 h-4 border-2 border-error-400 border-t-error-600 rounded-full animate-spin" />
                            <span>Deleting...</span>
                          </>
                        ) : (
                          <>
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
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                            <span>Delete</span>
                          </>
                        )}
                      </div>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Enhanced Empty State */}
      {tools.length === 0 && (
        <div className="text-center py-20 px-8">
          <div className="w-20 h-20 bg-neutral-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-neutral-200">
            <svg
              className="w-10 h-10 text-secondary"
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
          <h3 className="text-heading text-xl font-semibold text-primary mb-3">
            No Tools Found
          </h3>
          <p className="text-body text-secondary mb-8 max-w-md mx-auto">
            Get started by creating your first tool. Tools help users accomplish
            specific tasks and can be organized into categories.
          </p>
          <Link href="/admin/tools/create">
            <Button className="touch-target-comfortable shadow-medium">
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
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Create Your First Tool
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
