'use client';

import React from 'react';
import { cn } from '@/utils';
import { SuspenseFallbackProps } from '@/types/ui/loading';
import { SkeletonLoader, ToolCardSkeleton, TableSkeleton, FormSkeleton, DashboardSkeleton } from './SkeletonLoader';
import { Loading } from './Loading';

export function SuspenseFallback({
    variant = 'section',
    message = 'Loading...',
    className,
    height,
    showProgress = false,
    progress = 0
}: SuspenseFallbackProps) {
    const renderFallback = () => {
        switch (variant) {
            case 'page':
                return (
                    <div className={cn('min-h-screen bg-gray-50 flex items-center justify-center', className)}>
                        <div className="text-center">
                            <Loading size="lg" variant="spinner" text={message} />
                            {showProgress && progress > 0 && (
                                <div className="mt-4 w-64 bg-gray-200 rounded-full h-2 mx-auto">
                                    <div
                                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                );

            case 'section':
                return (
                    <div className={cn('flex items-center justify-center py-12', className)} style={{ height }}>
                        <div className="text-center">
                            <Loading size="md" variant="spinner" text={message} />
                            {showProgress && progress > 0 && (
                                <div className="mt-3 text-sm text-gray-600">
                                    {Math.round(progress)}% complete
                                </div>
                            )}
                        </div>
                    </div>
                );

            case 'card':
                return (
                    <div className={cn('bg-white rounded-lg border border-gray-200 p-6', className)} style={{ height }}>
                        <div className="animate-pulse space-y-4">
                            <SkeletonLoader variant="text" className="h-5 w-3/4" />
                            <SkeletonLoader variant="text" lines={3} className="space-y-2" />
                            <div className="flex justify-between items-center">
                                <SkeletonLoader variant="text" className="h-4 w-20" />
                                <SkeletonLoader variant="button" className="w-16" />
                            </div>
                        </div>
                        <div className="sr-only" role="status" aria-live="polite">
                            {message}
                        </div>
                    </div>
                );

            case 'list':
                return (
                    <div className={cn('space-y-4', className)} style={{ height }}>
                        {Array.from({ length: 5 }, (_, index) => (
                            <div key={index} className="flex items-center space-x-3 animate-pulse">
                                <SkeletonLoader variant="circular" className="w-10 h-10" />
                                <div className="flex-1 space-y-2">
                                    <SkeletonLoader variant="text" className="h-4 w-3/4" />
                                    <SkeletonLoader variant="text" className="h-3 w-1/2" />
                                </div>
                                <SkeletonLoader variant="text" className="h-3 w-16" />
                            </div>
                        ))}
                        <div className="sr-only" role="status" aria-live="polite">
                            {message}
                        </div>
                    </div>
                );

            case 'form':
                return (
                    <div className={cn('bg-white rounded-lg border border-gray-200 p-6', className)} style={{ height }}>
                        <FormSkeleton />
                        <div className="sr-only" role="status" aria-live="polite">
                            {message}
                        </div>
                    </div>
                );

            default:
                return (
                    <div className={cn('flex items-center justify-center', className)} style={{ height }}>
                        <Loading size="md" variant="spinner" text={message} />
                    </div>
                );
        }
    };

    return renderFallback();
}

// Specialized suspense fallbacks for common use cases
export function ToolPageFallback({ message = 'Loading tool...' }: { message?: string }) {
    return (
        <SuspenseFallback
            variant="page"
            message={message}
            className="bg-gray-50"
        />
    );
}

export function ToolGridFallback({ count = 6, message = 'Loading tools...' }: { count?: number; message?: string }) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <SkeletonLoader variant="text" className="h-6 w-32" />
                <SkeletonLoader variant="text" className="h-4 w-24" />
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
    message = 'Loading data...'
}: {
    rows?: number;
    columns?: number;
    message?: string;
}) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <SkeletonLoader variant="text" className="h-6 w-40" />
                <SkeletonLoader variant="button" className="w-24" />
            </div>
            <TableSkeleton rows={rows} columns={columns} />
            <div className="sr-only" role="status" aria-live="polite">
                {message}
            </div>
        </div>
    );
}

export function AdminDashboardFallback({ message = 'Loading dashboard...' }: { message?: string }) {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <SkeletonLoader variant="text" className="h-8 w-48" />
                <SkeletonLoader variant="text" className="h-4 w-32" />
            </div>
            <DashboardSkeleton />
            <div className="sr-only" role="status" aria-live="polite">
                {message}
            </div>
        </div>
    );
}

export function FormFallback({ message = 'Loading form...' }: { message?: string }) {
    return (
        <SuspenseFallback
            variant="form"
            message={message}
        />
    );
}

// Higher-order component for wrapping components with suspense
export function withSuspense<P extends object>(
    Component: React.ComponentType<P>,
    fallback?: React.ComponentType<any>,
    fallbackProps?: any
) {
    const WrappedComponent = (props: P) => (
        <React.Suspense fallback={fallback ? React.createElement(fallback, fallbackProps) : <SuspenseFallback />}>
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
        reset
    };
} 