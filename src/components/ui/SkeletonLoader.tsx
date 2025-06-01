"use client";

import React from "react";
import { cn } from "@/utils";
import { SkeletonLoadingProps } from "@/types/ui/loading";

export interface SkeletonLoaderProps extends SkeletonLoadingProps {
  variant?: "text" | "circular" | "rectangular" | "card" | "avatar" | "button";
  count?: number;
}

const variantClasses = {
  text: "skeleton-text",
  circular: "skeleton-avatar",
  rectangular: "skeleton rounded-xl",
  card: "skeleton rounded-xl",
  avatar: "skeleton-avatar",
  button: "skeleton-button",
};

const sizeClasses = {
  xs: "h-2",
  sm: "h-3",
  md: "h-4",
  lg: "h-5",
  xl: "h-6",
};

export function SkeletonLoader({
  variant = "text",
  lines = 1,
  count = 1,
  height,
  width,
  animated = true,
  className,
  "aria-label": ariaLabel = "Loading content",
}: SkeletonLoaderProps) {
  const getRandomWidth = () => {
    const widths = ["100%", "95%", "90%", "85%", "75%"];
    return widths[Math.floor(Math.random() * widths.length)];
  };

  const renderSkeletonItem = (index: number) => {
    const itemWidth = Array.isArray(width)
      ? width[index % width.length]
      : width;
    const finalWidth =
      itemWidth ||
      (lines > 1 && index === lines - 1 ? getRandomWidth() : "100%");

    return (
      <div
        key={index}
        className={cn(
          variantClasses[variant],
          height || sizeClasses.md,
          !animated && "animate-none",
          className,
        )}
        style={{ width: finalWidth }}
        aria-hidden="true"
      />
    );
  };

  const renderSkeletonGroup = (groupIndex: number) => {
    if (lines === 1) {
      return renderSkeletonItem(groupIndex);
    }

    return (
      <div key={groupIndex} className="space-y-3">
        {Array.from({ length: lines }, (_, lineIndex) =>
          renderSkeletonItem(lineIndex),
        )}
      </div>
    );
  };

  return (
    <div
      className={cn("w-full", count > 1 && "space-y-6")}
      role="status"
      aria-label={ariaLabel}
    >
      {Array.from({ length: count }, (_, index) => renderSkeletonGroup(index))}
      <span className="sr-only">{ariaLabel}</span>
    </div>
  );
}

// Specialized skeleton components for common use cases
export function ToolCardSkeleton({ count = 1 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="card p-6">
          <div className="flex items-center space-x-4 mb-4">
            <SkeletonLoader variant="circular" className="w-10 h-10" />
            <SkeletonLoader variant="text" className="h-6 w-32" />
          </div>
          <SkeletonLoader variant="text" lines={2} className="mb-4" />
          <div className="flex items-center justify-between">
            <SkeletonLoader variant="text" className="h-4 w-20" />
            <SkeletonLoader variant="button" className="w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({
  rows = 5,
  columns = 4,
  showHeader = true,
}: {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
}) {
  return (
    <div className="card overflow-hidden">
      {showHeader && (
        <div className="bg-neutral-50 dark:bg-neutral-800/50 px-6 py-4 border-b border-neutral-200/50 dark:border-neutral-700/50">
          <div
            className="grid gap-4"
            style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
          >
            {Array.from({ length: columns }, (_, index) => (
              <SkeletonLoader key={index} variant="text" className="h-5 w-24" />
            ))}
          </div>
        </div>
      )}
      <div className="divide-y divide-neutral-200/50 dark:divide-neutral-700/50">
        {Array.from({ length: rows }, (_, rowIndex) => (
          <div key={rowIndex} className="px-6 py-4">
            <div
              className="grid gap-4"
              style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
            >
              {Array.from({ length: columns }, (_, colIndex) => (
                <SkeletonLoader key={colIndex} variant="text" className="h-4" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="form-group">
        <SkeletonLoader variant="text" className="h-5 w-24 mb-2" />
        <SkeletonLoader variant="rectangular" className="h-12 w-full" />
      </div>
      <div className="form-group">
        <SkeletonLoader variant="text" className="h-5 w-32 mb-2" />
        <SkeletonLoader variant="rectangular" className="h-28 w-full" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="form-group">
          <SkeletonLoader variant="text" className="h-5 w-20 mb-2" />
          <SkeletonLoader variant="rectangular" className="h-12 w-full" />
        </div>
        <div className="form-group">
          <SkeletonLoader variant="text" className="h-5 w-28 mb-2" />
          <SkeletonLoader variant="rectangular" className="h-12 w-full" />
        </div>
      </div>
      <div className="flex justify-end space-x-3">
        <SkeletonLoader variant="button" className="w-20 h-10" />
        <SkeletonLoader variant="button" className="w-24 h-10" />
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="card p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-3">
                <SkeletonLoader variant="text" className="h-4 w-20" />
                <SkeletonLoader variant="text" className="h-8 w-16" />
              </div>
              <SkeletonLoader variant="circular" className="w-12 h-12" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <SkeletonLoader variant="text" className="h-6 w-40 mb-6" />
          <SkeletonLoader variant="rectangular" className="h-80 w-full" />
        </div>
        <div className="card p-6">
          <SkeletonLoader variant="text" className="h-6 w-48 mb-6" />
          <SkeletonLoader variant="rectangular" className="h-80 w-full" />
        </div>
      </div>

      {/* Data Table */}
      <div className="card p-6">
        <SkeletonLoader variant="text" className="h-6 w-32 mb-6" />
        <TableSkeleton rows={8} columns={6} showHeader={true} />
      </div>
    </div>
  );
}
