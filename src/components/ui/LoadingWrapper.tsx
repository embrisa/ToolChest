"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/utils";
import { Loading } from "./Loading";
import { SkeletonLoader } from "./SkeletonLoader";

export interface LoadingWrapperProps {
    isLoading: boolean;
    children: React.ReactNode;
    loadingContent?: React.ReactNode;
    minDisplayTime?: number; // Minimum time to show loading in ms
    className?: string;
    loadingClassName?: string;
    fallbackVariant?: "spinner" | "skeleton" | "custom";
    spinnerSize?: "sm" | "md" | "lg" | "xl";
    spinnerVariant?: "spinner" | "dots" | "pulse";
    skeletonVariant?: "text" | "circular" | "rectangular" | "card" | "avatar" | "button";
    skeletonHeight?: string;
    skeletonLines?: number;
    loadingText?: string;
    showShimmer?: boolean;
    "aria-label"?: string;
}

export function LoadingWrapper({
    isLoading,
    children,
    loadingContent,
    minDisplayTime = 500,
    className,
    loadingClassName,
    fallbackVariant = "spinner",
    spinnerSize = "sm",
    spinnerVariant = "spinner",
    skeletonVariant = "rectangular",
    skeletonHeight = "h-40",
    skeletonLines = 1,
    loadingText,
    showShimmer = true,
    "aria-label": ariaLabel = "Loading content",
}: LoadingWrapperProps) {
    const [showLoading, setShowLoading] = useState(false);
    const [loadingStartTime, setLoadingStartTime] = useState<number | null>(null);

    useEffect(() => {
        if (isLoading) {
            setShowLoading(true);
            setLoadingStartTime(Date.now());
        } else if (loadingStartTime) {
            const elapsed = Date.now() - loadingStartTime;
            const remaining = Math.max(0, minDisplayTime - elapsed);

            if (remaining > 0) {
                const timer = setTimeout(() => {
                    setShowLoading(false);
                    setLoadingStartTime(null);
                }, remaining);
                return () => clearTimeout(timer);
            } else {
                setShowLoading(false);
                setLoadingStartTime(null);
            }
        }
    }, [isLoading, loadingStartTime, minDisplayTime]);

    const renderDefaultLoading = () => {
        switch (fallbackVariant) {
            case "skeleton":
                return (
                    <div className="space-y-3">
                        <SkeletonLoader
                            variant={skeletonVariant}
                            lines={skeletonLines}
                            className={cn(skeletonHeight, "animate-pulse")}
                            aria-label={ariaLabel}
                        />
                        {loadingText && (
                            <div className="text-center">
                                <span className="text-sm text-foreground-secondary font-medium">
                                    {loadingText}
                                </span>
                            </div>
                        )}
                    </div>
                );
            case "spinner":
                return (
                    <div className={cn(
                        "flex items-center justify-center",
                        skeletonHeight,
                        "bg-background-tertiary border border-border rounded-lg"
                    )}>
                        <div className="flex items-center gap-3 text-foreground-secondary">
                            <Loading size={spinnerSize} variant={spinnerVariant} />
                            {loadingText && (
                                <span className="text-sm font-medium">{loadingText}</span>
                            )}
                        </div>
                    </div>
                );
            case "custom":
            default:
                return loadingContent || (
                    <div className={cn(
                        "flex items-center justify-center",
                        skeletonHeight,
                        "bg-background-tertiary border border-border rounded-lg"
                    )}>
                        <div className="flex items-center gap-3 text-foreground-secondary">
                            <Loading size={spinnerSize} variant={spinnerVariant} />
                            {loadingText && (
                                <span className="text-sm font-medium">{loadingText}</span>
                            )}
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className={className} role="status" aria-live="polite">
            {showLoading ? (
                <div className={cn("relative overflow-hidden", loadingClassName)}>
                    {loadingContent || renderDefaultLoading()}
                    {/* Optional shimmer overlay */}
                    {showShimmer && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neutral-100/30 to-transparent animate-shimmer pointer-events-none" />
                    )}
                </div>
            ) : (
                children
            )}
            <span className="sr-only">
                {showLoading ? ariaLabel : "Content loaded"}
            </span>
        </div>
    );
}

// Convenience wrapper for textarea loading
export function TextareaLoadingWrapper({
    isLoading,
    children,
    loadingText = "Processing...",
    minDisplayTime = 800,
    className,
    ...props
}: Omit<LoadingWrapperProps, 'fallbackVariant' | 'skeletonHeight'> & {
    loadingText?: string;
}) {
    return (
        <LoadingWrapper
            isLoading={isLoading}
            fallbackVariant="spinner"
            spinnerSize="sm"
            spinnerVariant="spinner"
            skeletonHeight="h-40"
            loadingText={loadingText}
            minDisplayTime={minDisplayTime}
            className={className}
            {...props}
        >
            {children}
        </LoadingWrapper>
    );
} 