import React, { Suspense, lazy, ComponentType, LazyExoticComponent } from 'react';
import { SkeletonLoader } from './SkeletonLoader';
import { ErrorBoundary } from '../errors/ErrorBoundary';

export interface LazyLoaderProps {
    component: LazyExoticComponent<ComponentType<any>>;
    fallback?: React.ReactNode;
    errorFallback?: React.ReactNode;
    props?: any;
    loadingType?: 'skeleton' | 'spinner' | 'custom';
    skeletonVariant?: 'text' | 'circular' | 'rectangular' | 'card' | 'avatar' | 'button';
    className?: string;
}

export function LazyLoader({
    component: Component,
    fallback,
    errorFallback,
    props = {},
    loadingType = 'skeleton',
    skeletonVariant = 'card',
    className,
}: LazyLoaderProps) {
    // Default loading fallback
    const defaultFallback = React.useMemo(() => {
        if (fallback) return fallback;

        switch (loadingType) {
            case 'skeleton':
                return (
                    <SkeletonLoader
                        variant={skeletonVariant}
                        className={className}
                        aria-label="Loading component..."
                    />
                );
            case 'spinner':
                return (
                    <div
                        className="flex items-center justify-center p-4"
                        role="status"
                        aria-label="Loading component..."
                    >
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                );
            case 'custom':
            default:
                return (
                    <div
                        className="flex items-center justify-center p-4 text-gray-500"
                        role="status"
                        aria-label="Loading component..."
                    >
                        Loading...
                    </div>
                );
        }
    }, [fallback, loadingType, skeletonVariant, className]);

    return (
        <ErrorBoundary fallback={errorFallback}>
            <Suspense fallback={defaultFallback}>
                <Component {...props} />
            </Suspense>
        </ErrorBoundary>
    );
}

// Higher-order component for creating lazy-loaded components
export function withLazyLoading<P extends object>(
    componentImport: () => Promise<any>,
    options: Omit<LazyLoaderProps, 'component' | 'props'> = {}
) {
    const LazyComponent = lazy(componentImport);

    return function LazyLoadedComponent(props: P) {
        return (
            <LazyLoader
                component={LazyComponent}
                props={props}
                {...options}
            />
        );
    };
}

// Pre-configured lazy loaders for common components
// Note: These would need the components to be exported as default exports
// For now, we'll comment these out and use direct lazy imports in the actual pages

// Utility function for preloading components
export function preloadComponent(componentImport: () => Promise<any>) {
    if (typeof window !== 'undefined') {
        // Use requestIdleCallback if available for non-critical preloading
        if ('requestIdleCallback' in window) {
            (window as any).requestIdleCallback(() => {
                componentImport().catch(console.warn);
            });
        } else {
            // Fallback to setTimeout for browsers without requestIdleCallback
            setTimeout(() => {
                componentImport().catch(console.warn);
            }, 100);
        }
    }
}

// Hook for component preloading
export function useComponentPreloader() {
    const preloadToolComponents = React.useCallback(() => {
        const components = [
            () => import('../tools/Base64Tool'),
            () => import('../tools/HashGeneratorTool'),
            () => import('../tools/FaviconGeneratorTool'),
            () => import('../tools/MarkdownToPdfTool'),
        ];

        components.forEach(componentImport => {
            preloadComponent(componentImport);
        });
    }, []);

    const preloadAdminComponents = React.useCallback(() => {
        const components = [
            () => import('../admin/ToolTable'),
            () => import('../admin/TagTable'),
            () => import('../admin/AnalyticsDashboard'),
            () => import('../admin/SystemHealthDashboard'),
        ];

        components.forEach(componentImport => {
            preloadComponent(componentImport);
        });
    }, []);

    return {
        preloadToolComponents,
        preloadAdminComponents,
        preloadComponent,
    };
} 