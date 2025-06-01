import { Metadata } from "next";
import Link from "next/link";
import {
  TagIcon,
  WrenchScrewdriverIcon,
  ChartBarIcon,
  PlusIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui";
import { TagUsageStats } from "@/components/admin/TagUsageStats";

export const metadata: Metadata = {
  title: "Tool-Tag Relationships | Admin - tool-chest",
  description:
    "Manage relationships between tools and tags with bulk operations and analytics.",
};

export default function AdminRelationshipsPage() {
  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            Tool-Tag Relationships
          </h1>
          <p className="text-body text-neutral-600 dark:text-neutral-400 mt-2">
            Manage which tags are assigned to tools and analyze usage patterns
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/admin/relationships/bulk">
            <Button variant="primary" size="lg">
              <PlusIcon className="w-5 h-5 mr-2" />
              Bulk Operations
            </Button>
          </Link>
          <Link href="/admin/relationships/matrix">
            <Button variant="secondary">
              <ChartBarIcon className="w-5 h-5 mr-2" />
              Relationship Matrix
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="card p-8 group hover:scale-[1.02] transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-2">
                Total Tools
              </p>
              <p className="text-display text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                --
              </p>
            </div>
            <div className="w-16 h-16 bg-brand-100 dark:bg-brand-950/30 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <WrenchScrewdriverIcon className="w-8 h-8 text-brand-600 dark:text-brand-400" />
            </div>
          </div>
          <div className="mt-6">
            <Link
              href="/admin/tools"
              className="text-sm text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-medium inline-flex items-center gap-2 group/link"
            >
              Manage Tools
              <svg
                className="w-4 h-4 transform group-hover/link:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        </div>

        <div className="card p-8 group hover:scale-[1.02] transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-2">
                Total Tags
              </p>
              <p className="text-display text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                --
              </p>
            </div>
            <div className="w-16 h-16 bg-accent-100 dark:bg-accent-950/30 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <TagIcon className="w-8 h-8 text-accent-600 dark:text-accent-400" />
            </div>
          </div>
          <div className="mt-6">
            <Link
              href="/admin/tags"
              className="text-sm text-accent-600 dark:text-accent-400 hover:text-accent-700 dark:hover:text-accent-300 font-medium inline-flex items-center gap-2 group/link"
            >
              Manage Tags
              <svg
                className="w-4 h-4 transform group-hover/link:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        </div>

        <div className="card p-8 group hover:scale-[1.02] transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-2">
                Active Relationships
              </p>
              <p className="text-display text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                --
              </p>
            </div>
            <div className="w-16 h-16 bg-success-100 dark:bg-success-950/30 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <ArrowPathIcon className="w-8 h-8 text-success-600 dark:text-success-400" />
            </div>
          </div>
          <div className="mt-6">
            <Link
              href="/admin/relationships/validation"
              className="text-sm text-success-600 dark:text-success-400 hover:text-success-700 dark:hover:text-success-300 font-medium inline-flex items-center gap-2 group/link"
            >
              Validate Data
              <svg
                className="w-4 h-4 transform group-hover/link:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="px-8 py-6 border-b border-neutral-200 dark:border-neutral-800">
          <h2 className="text-title text-xl font-semibold text-neutral-900 dark:text-neutral-100">
            Quick Actions
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            Perform common operations on tool-tag relationships
          </p>
        </div>
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link
              href="/admin/relationships/bulk"
              className="card-interactive p-6 group"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-brand-100 dark:bg-brand-950/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <PlusIcon className="w-6 h-6 text-brand-600 dark:text-brand-400" />
                </div>
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                  Bulk Assign Tags
                </h3>
              </div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Assign multiple tags to selected tools at once
              </p>
            </Link>

            <Link
              href="/admin/relationships/bulk?mode=remove"
              className="card-interactive p-6 group"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-error-100 dark:bg-error-950/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <ArrowPathIcon className="w-6 h-6 text-error-600 dark:text-error-400" />
                </div>
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                  Bulk Remove Tags
                </h3>
              </div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Remove tags from multiple tools simultaneously
              </p>
            </Link>

            <Link
              href="/admin/relationships/matrix"
              className="card-interactive p-6 group"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-accent-100 dark:bg-accent-950/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <ChartBarIcon className="w-6 h-6 text-accent-600 dark:text-accent-400" />
                </div>
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                  View Matrix
                </h3>
              </div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                See all tool-tag relationships in a matrix view
              </p>
            </Link>

            <Link
              href="/admin/relationships/validation"
              className="card-interactive p-6 group"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-warning-100 dark:bg-warning-950/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <ArrowPathIcon className="w-6 h-6 text-warning-600 dark:text-warning-400" />
                </div>
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                  Validate Relationships
                </h3>
              </div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Check for orphaned tools and tags
              </p>
            </Link>
          </div>
        </div>
      </div>

      {/* Tag Usage Statistics */}
      <div className="card">
        <div className="px-8 py-6 border-b border-neutral-200 dark:border-neutral-800">
          <h2 className="text-title text-xl font-semibold text-neutral-900 dark:text-neutral-100">
            Tag Usage Statistics
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            Analyze how tags are being used across your tools
          </p>
        </div>
        <div className="p-8">
          <TagUsageStats />
        </div>
      </div>
    </div>
  );
}
