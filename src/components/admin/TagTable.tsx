"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { AdminTagListItem, AdminTagsSortOptions } from "@/types/admin/tag";
import { Button } from "@/components/ui";

interface TagTableProps {
  tags: AdminTagListItem[];
  sortOptions: AdminTagsSortOptions;
  onSort: (field: AdminTagsSortOptions["field"]) => void;
  onDelete: (id: string, name: string) => Promise<void>;
}

export function TagTable({
  tags,
  sortOptions,
  onSort,
  onDelete,
}: TagTableProps) {
  const tAdmin = useTranslations("pages.admin.tags");
  const tForms = useTranslations("components.forms");
  const tCommon = useTranslations("common");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null,
  );

  const handleDelete = async (id: string, name: string) => {
    try {
      setDeletingId(id);
      await onDelete(id, name);
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error("Error deleting tag:", error);
    } finally {
      setDeletingId(null);
    }
  };

  const getSortIcon = (field: AdminTagsSortOptions["field"]) => {
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

  if (tags.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-neutral-400 dark:text-neutral-500 mb-6">
          <svg
            className="mx-auto h-16 w-16"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M6 6h.008v.008H6V6z"
            />
          </svg>
        </div>
        <h3 className="text-title text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
          {tCommon("ui.labels.noItems")}
        </h3>
        <p className="text-body text-neutral-600 dark:text-neutral-400 mb-8 max-w-sm mx-auto">
          {tAdmin("emptyState.description")}
        </p>
        <Link href="/admin/tags/create">
          <Button variant="primary" size="lg">
            {tAdmin("actions.createTag")}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-800">
            <thead className="bg-neutral-50/50 dark:bg-neutral-900/50">
              <tr>
                <th
                  scope="col"
                  className="px-8 py-5 text-left text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider cursor-pointer hover:bg-neutral-100/50 dark:hover:bg-neutral-800/50 transition-all duration-200 group"
                  onClick={() => onSort("name")}
                >
                  <div className="flex items-center gap-3">
                    <span>{tAdmin("table.name")}</span>
                    <div className="opacity-60 group-hover:opacity-100 transition-opacity duration-200">
                      {getSortIcon("name")}
                    </div>
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-8 py-5 text-left text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider cursor-pointer hover:bg-neutral-100/50 dark:hover:bg-neutral-800/50 transition-all duration-200 group"
                  onClick={() => onSort("slug")}
                >
                  <div className="flex items-center gap-3">
                    <span>{tAdmin("table.slug")}</span>
                    <div className="opacity-60 group-hover:opacity-100 transition-opacity duration-200">
                      {getSortIcon("slug")}
                    </div>
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-8 py-5 text-left text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider"
                >
                  {tAdmin("table.description")}
                </th>
                <th
                  scope="col"
                  className="px-8 py-5 text-left text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider cursor-pointer hover:bg-neutral-100/50 dark:hover:bg-neutral-800/50 transition-all duration-200 group"
                  onClick={() => onSort("toolCount")}
                >
                  <div className="flex items-center gap-3">
                    <span>{tAdmin("table.toolCount")}</span>
                    <div className="opacity-60 group-hover:opacity-100 transition-opacity duration-200">
                      {getSortIcon("toolCount")}
                    </div>
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-8 py-5 text-left text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider cursor-pointer hover:bg-neutral-100/50 dark:hover:bg-neutral-800/50 transition-all duration-200 group"
                  onClick={() => onSort("createdAt")}
                >
                  <div className="flex items-center gap-3">
                    <span>Created</span>
                    <div className="opacity-60 group-hover:opacity-100 transition-opacity duration-200">
                      {getSortIcon("createdAt")}
                    </div>
                  </div>
                </th>
                <th scope="col" className="relative px-8 py-5">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-neutral-900 divide-y divide-neutral-200 dark:divide-neutral-800">
              {tags.map((tag) => (
                <tr
                  key={tag.id}
                  className="hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors duration-200 group"
                >
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className="flex items-center gap-4">
                      {tag.color && (
                        <div
                          className="w-5 h-5 rounded-xl border border-neutral-300 dark:border-neutral-600 shadow-soft flex-shrink-0"
                          style={{ backgroundColor: tag.color }}
                          aria-label={`Tag color: ${tag.color}`}
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                          {tag.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className="text-code text-sm text-neutral-900 dark:text-neutral-100 bg-neutral-100 dark:bg-neutral-800 px-3 py-1 rounded-lg">
                      {tag.slug}
                    </div>
                  </td>
                  <td className="px-8 py-6 max-w-xs">
                    <div
                      className="text-sm text-neutral-700 dark:text-neutral-300 truncate"
                      title={tag.description || "No description"}
                    >
                      {tag.description || (
                        <span className="text-neutral-400 dark:text-neutral-500 italic">
                          No description
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded-lg min-w-8 text-center">
                        {tag.toolCount}
                      </span>
                      {tag.toolCount > 0 && (
                        <div className="flex -space-x-2">
                          {tag.tools.slice(0, 3).map((tool) => (
                            <div
                              key={tool.id}
                              className={`inline-flex items-center justify-center w-8 h-8 rounded-xl text-xs font-medium border-2 border-white dark:border-neutral-900 shadow-soft ${tool.isActive
                                ? "bg-success-100 text-success-700 dark:bg-success-950/30 dark:text-success-400"
                                : "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                                }`}
                              title={`${tool.name} (${tool.isActive ? "Active" : "Inactive"})`}
                            >
                              {tool.name.charAt(0).toUpperCase()}
                            </div>
                          ))}
                          {tag.toolCount > 3 && (
                            <div className="inline-flex items-center justify-center w-8 h-8 rounded-xl text-xs font-medium bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 border-2 border-white dark:border-neutral-900 shadow-soft">
                              +{tag.toolCount - 3}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">
                    {formatDate(tag.createdAt)}
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/tags/${tag.id}/edit`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-60 group-hover:opacity-100 transition-opacity"
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
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                          <span className="sr-only">Edit {tag.name}</span>
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowDeleteConfirm(tag.id)}
                        disabled={deletingId === tag.id}
                        className="opacity-60 group-hover:opacity-100 transition-opacity text-error-600 hover:text-error-700 hover:bg-error-50 dark:hover:bg-error-950/20"
                      >
                        {deletingId === tag.id ? (
                          <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                        ) : (
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
                        )}
                        <span className="sr-only">Delete {tag.name}</span>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="surface-elevated max-w-md w-full p-8 rounded-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-error-100 dark:bg-error-950/30 rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-error-600 dark:text-error-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
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
                <h3 className="text-title text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                  Delete Tag
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  This action cannot be undone
                </p>
              </div>
            </div>

            <p className="text-body text-neutral-700 dark:text-neutral-300 mb-8">
              Are you sure you want to delete the tag{" "}
              <strong className="text-neutral-900 dark:text-neutral-100">
                {tags.find((t) => t.id === showDeleteConfirm)?.name}
              </strong>
              ? This will remove it from all associated tools.
            </p>

            <div className="flex items-center justify-end gap-4">
              <Button
                variant="ghost"
                onClick={() => setShowDeleteConfirm(null)}
                disabled={deletingId === showDeleteConfirm}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  const tag = tags.find((t) => t.id === showDeleteConfirm);
                  if (tag) {
                    handleDelete(tag.id, tag.name);
                  }
                }}
                disabled={deletingId === showDeleteConfirm}
                className="bg-error-600 hover:bg-error-700 focus:ring-error-500/50"
              >
                {deletingId === showDeleteConfirm ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Deleting...
                  </div>
                ) : (
                  "Delete Tag"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
