"use client";

import React from "react";
import { cn } from "@/utils";
import { SuspenseFallbackProps } from "@/types/ui/loading";
import {
  SkeletonLoader,
  ToolCardSkeleton,
  TableSkeleton,
  FormSkeleton,
  DashboardSkeleton,
} from "./SkeletonLoader";
import { Loading } from "./Loading";

export function SuspenseFallback({
  variant = "section",
  message = "Loading...",
  className,
  height,
  showProgress = false,
  progress = 0,
}: SuspenseFallbackProps) {
  const renderFallback = () => {
    switch (variant) {
      case "page":
        return (
          <div
            className={cn(
              "min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center",
              className,
            )}
          >
            <div className="text-center max-w-md mx-auto p-8">
              <Loading size="lg" variant="spinner" text={message} />
              {showProgress && progress > 0 && (
                <div className="mt-6">
                  <div className="w-80 bg-neutral-200 dark:bg-neutral-700 rounded-full h-2 mx-auto overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-brand-500 to-brand-600 h-2 rounded-full transition-all duration-300 ease-out"
                      style={{
                        width: `${Math.min(Math.max(progress, 0), 100)}%`,
                      }}
                    />
                  </div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-3">
                    {Math.round(progress)}% complete
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case "section":
        return (
          <div
            className={cn("flex items-center justify-center py-16", className)}
            style={{ height }}
          >
            <div className="text-center">
              <Loading size="md" variant="spinner" text={message} />
              {showProgress && progress > 0 && (
                <div className="mt-4 text-sm text-neutral-600 dark:text-neutral-400">
                  {Math.round(progress)}% complete
                </div>
              )}
            </div>
          </div>
        );

      case "card":
        return (
          <div className={cn("card p-8", className)} style={{ height }}>
            <div className="space-y-6">
              <SkeletonLoader variant="text" className="h-6 w-3/4" />
              <SkeletonLoader variant="text" lines={3} className="space-y-3" />
              <div className="flex justify-between items-center pt-4">
                <SkeletonLoader variant="text" className="h-4 w-24" />
                <SkeletonLoader variant="button" className="w-20" />
              </div>
            </div>
            <div className="sr-only" role="status" aria-live="polite">
              {message}
            </div>
          </div>
        );

      case "list":
        return (
          <div className={cn("space-y-4", className)} style={{ height }}>
            {Array.from({ length: 5 }, (_, index) => (
              <div key={index} className="flex items-center space-x-4">
                <SkeletonLoader variant="circular" className="w-12 h-12" />
                <div className="flex-1 space-y-3">
                  <SkeletonLoader variant="text" className="h-5 w-3/4" />
                  <SkeletonLoader variant="text" className="h-4 w-1/2" />
                </div>
                <SkeletonLoader variant="text" className="h-4 w-20" />
              </div>
            ))}
            <div className="sr-only" role="status" aria-live="polite">
              {message}
            </div>
          </div>
        );

      case "form":
        return (
          <div className={cn("card p-8", className)} style={{ height }}>
            <FormSkeleton />
            <div className="sr-only" role="status" aria-live="polite">
              {message}
            </div>
          </div>
        );

      default:
        return (
          <div
            className={cn("flex items-center justify-center py-8", className)}
            style={{ height }}
          >
            <Loading size="md" variant="spinner" text={message} />
          </div>
        );
    }
  };

  return renderFallback();
}

// Specialized suspense fallbacks for common use cases
export function ToolPageFallback({
  message = "Loading tool...",
}: {
  message?: string;
}) {
  return (
    <SuspenseFallback
      variant="page"
      message={message}
      className="bg-neutral-50 dark:bg-neutral-950"
    />
  );
}

export function ToolGridFallback({
  count = 6,
  message = "Loading tools...",
}: {
  count?: number;
  message?: string;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SkeletonLoader variant="text" className="h-7 w-40" />
        <SkeletonLoader variant="text" className="h-5 w-28" />
      </div>
      <ToolCardSkeleton count={count} />
      <div className="sr-only" role="status" aria-live="polite">
        {message}
      </div>
    </div>
  );
}

export function AdminTableFallback({
  rows = 10,
  columns = 5,
  message = "Loading data...",
}: {
  rows?: number;
  columns?: number;
  message?: string;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SkeletonLoader variant="text" className="h-8 w-48" />
        <SkeletonLoader variant="button" className="w-28 h-10" />
      </div>
      <TableSkeleton rows={rows} columns={columns} />
      <div className="sr-only" role="status" aria-live="polite">
        {message}
      </div>
    </div>
  );
}

export function AdminDashboardFallback({
  message = "Loading dashboard...",
}: {
  message?: string;
}) {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <SkeletonLoader variant="text" className="h-9 w-56" />
        <SkeletonLoader variant="text" className="h-5 w-36" />
      </div>
      <DashboardSkeleton />
      <div className="sr-only" role="status" aria-live="polite">
        {message}
      </div>
    </div>
  );
}

export function FormFallback({
  message = "Loading form...",
}: {
  message?: string;
}) {
  return <SuspenseFallback variant="form" message={message} />;
}

// Higher-order component for wrapping components with suspense
export function withSuspense<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ComponentType<any>,
  fallbackProps?: any,
) {
  const WrappedComponent = (props: P) => (
    <React.Suspense
      fallback={
        fallback ? (
          React.createElement(fallback, fallbackProps)
        ) : (
          <SuspenseFallback />
        )
      }
    >
      <Component {...props} />
    </React.Suspense>
  );

  WrappedComponent.displayName = `withSuspense(${Component.displayName || Component.name})`;
  return WrappedComponent;
}

// Hook for managing suspense states
export function useSuspenseState(initialLoading = true) {
  const [isLoading, setIsLoading] = React.useState(initialLoading);
  const [error, setError] = React.useState<Error | null>(null);

  const startLoading = () => {
    setIsLoading(true);
    setError(null);
  };

  const stopLoading = () => {
    setIsLoading(false);
  };

  const setLoadingError = (error: Error) => {
    setError(error);
    setIsLoading(false);
  };

  const reset = () => {
    setIsLoading(false);
    setError(null);
  };

  return {
    isLoading,
    error,
    startLoading,
    stopLoading,
    setLoadingError,
    reset,
  };
}
