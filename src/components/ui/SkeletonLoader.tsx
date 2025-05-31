'use client';

import React from 'react';
import { cn } from '@/utils';
import { SkeletonLoadingProps } from '@/types/ui/loading';

export interface SkeletonLoaderProps extends SkeletonLoadingProps {
    variant?: 'text' | 'circular' | 'rectangular' | 'card' | 'avatar' | 'button';
    count?: number;
}

const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full aspect-square',
    rectangular: 'rounded-md',
    card: 'rounded-lg',
    avatar: 'rounded-full aspect-square',
    button: 'rounded-md h-10'
};

const sizeClasses = {
    xs: 'h-2',
    sm: 'h-3',
    md: 'h-4',
    lg: 'h-5',
    xl: 'h-6'
};

export function SkeletonLoader({
    variant = 'text',
    lines = 1,
    count = 1,
    height,
    width,
    animated = true,
    className,
    'aria-label': ariaLabel = 'Loading content'
}: SkeletonLoaderProps) {
    const getRandomWidth = () => {
        const widths = ['100%', '95%', '90%', '85%', '75%'];
        return widths[Math.floor(Math.random() * widths.length)];
    };

    const renderSkeletonItem = (index: number) => {
        const itemWidth = Array.isArray(width) ? width[index % width.length] : width;
        const finalWidth = itemWidth || (lines > 1 && index === lines - 1 ? getRandomWidth() : '100%');

        return (
            <div
                key={index}
                className={cn(
                    'bg-gray-200 dark:bg-gray-700',
                    variantClasses[variant],
                    height || sizeClasses.md,
                    animated && 'animate-pulse',
                    className
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
            <div key={groupIndex} className="space-y-2">
                {Array.from({ length: lines }, (_, lineIndex) =>
                    renderSkeletonItem(lineIndex)
                )}
            </div>
        );
    };

    return (
        <div
            className={cn('w-full', count > 1 && 'space-y-4')}
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
                <div key={index} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
                    <div className="flex items-center space-x-3 mb-4">
                        <SkeletonLoader variant="circular" className="w-8 h-8" />
                        <SkeletonLoader variant="text" className="h-5 w-32" />
                    </div>
                    <SkeletonLoader variant="text" lines={2} className="mb-4" />
                    <div className="flex items-center justify-between">
                        <SkeletonLoader variant="text" className="h-4 w-16" />
                        <SkeletonLoader variant="button" className="w-20" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export function TableSkeleton({
    rows = 5,
    columns = 4,
    showHeader = true
}: {
    rows?: number;
    columns?: number;
    showHeader?: boolean;
}) {
    return (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden animate-pulse">
            {showHeader && (
                <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                    <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
                        {Array.from({ length: columns }, (_, index) => (
                            <SkeletonLoader key={index} variant="text" className="h-4 w-20" />
                        ))}
                    </div>
                </div>
            )}
            <div className="divide-y divide-gray-200">
                {Array.from({ length: rows }, (_, rowIndex) => (
                    <div key={rowIndex} className="px-6 py-4">
                        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
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
        <div className="space-y-6 animate-pulse">
            <div className="space-y-2">
                <SkeletonLoader variant="text" className="h-4 w-24" />
                <SkeletonLoader variant="rectangular" className="h-10 w-full" />
            </div>
            <div className="space-y-2">
                <SkeletonLoader variant="text" className="h-4 w-32" />
                <SkeletonLoader variant="rectangular" className="h-24 w-full" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <SkeletonLoader variant="text" className="h-4 w-20" />
                    <SkeletonLoader variant="rectangular" className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                    <SkeletonLoader variant="text" className="h-4 w-28" />
                    <SkeletonLoader variant="rectangular" className="h-10 w-full" />
                </div>
            </div>
            <div className="flex justify-end space-x-3">
                <SkeletonLoader variant="button" className="w-20" />
                <SkeletonLoader variant="button" className="w-24" />
            </div>
        </div>
    );
}

export function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array.from({ length: 4 }, (_, index) => (
                    <div key={index} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
                        <div className="flex items-center justify-between">
                            <div className="space-y-2">
                                <SkeletonLoader variant="text" className="h-4 w-16" />
                                <SkeletonLoader variant="text" className="h-6 w-12" />
                            </div>
                            <SkeletonLoader variant="circular" className="w-10 h-10" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
                    <SkeletonLoader variant="text" className="h-5 w-32 mb-4" />
                    <SkeletonLoader variant="rectangular" className="h-64 w-full" />
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
                    <SkeletonLoader variant="text" className="h-5 w-40 mb-4" />
                    <SkeletonLoader variant="rectangular" className="h-64 w-full" />
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
                <SkeletonLoader variant="text" className="h-5 w-32 mb-4" />
                <div className="space-y-3">
                    {Array.from({ length: 5 }, (_, index) => (
                        <div key={index} className="flex items-center space-x-3">
                            <SkeletonLoader variant="circular" className="w-8 h-8" />
                            <div className="flex-1 space-y-1">
                                <SkeletonLoader variant="text" className="h-4 w-48" />
                                <SkeletonLoader variant="text" className="h-3 w-24" />
                            </div>
                            <SkeletonLoader variant="text" className="h-3 w-16" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
} 