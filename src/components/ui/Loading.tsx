import React from 'react';
import { cn } from '@/utils';

export interface LoadingProps {
    size?: 'sm' | 'md' | 'lg';
    variant?: 'spinner' | 'dots' | 'pulse';
    text?: string;
    className?: string;
}

const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
};

export function Loading({
    size = 'md',
    variant = 'spinner',
    text = 'Loading...',
    className
}: LoadingProps) {
    if (variant === 'spinner') {
        return (
            <div className={cn('flex items-center justify-center', className)}>
                <svg
                    className={cn('animate-spin', sizeClasses[size])}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    />
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                </svg>
                <span className="sr-only">{text}</span>
            </div>
        );
    }

    if (variant === 'dots') {
        return (
            <div className={cn('flex items-center justify-center space-x-1', className)}>
                <div className={cn('bg-current rounded-full animate-pulse', sizeClasses[size])} />
                <div className={cn('bg-current rounded-full animate-pulse', sizeClasses[size])} style={{ animationDelay: '0.1s' }} />
                <div className={cn('bg-current rounded-full animate-pulse', sizeClasses[size])} style={{ animationDelay: '0.2s' }} />
                <span className="sr-only">{text}</span>
            </div>
        );
    }

    if (variant === 'pulse') {
        return (
            <div className={cn('flex items-center justify-center', className)}>
                <div className={cn('bg-current rounded-full animate-pulse', sizeClasses[size])} />
                <span className="sr-only">{text}</span>
            </div>
        );
    }

    return null;
}

export interface LoadingSkeletonProps {
    className?: string;
    lines?: number;
    height?: string;
}

export function LoadingSkeleton({
    className,
    lines = 3,
    height = 'h-4'
}: LoadingSkeletonProps) {
    return (
        <div className={cn('animate-pulse space-y-2', className)} aria-hidden="true">
            {Array.from({ length: lines }).map((_, index) => (
                <div
                    key={index}
                    className={cn('bg-gray-200 rounded', height)}
                    style={{
                        width: index === lines - 1 ? '75%' : '100%'
                    }}
                />
            ))}
            <span className="sr-only">Loading content...</span>
        </div>
    );
} 