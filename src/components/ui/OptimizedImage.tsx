"use client";

import React, { useState, useCallback } from "react";
import Image, { ImageProps } from "next/image";
import { cn } from "@/utils";

export interface OptimizedImageProps extends Omit<ImageProps, "src" | "alt"> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  showPlaceholder?: boolean;
  placeholderClassName?: string;
  errorFallback?: React.ReactNode;
  loadingVariant?: "skeleton" | "blur" | "minimal";
  onLoadingComplete?: (result: {
    naturalWidth: number;
    naturalHeight: number;
  }) => void;
  onLoadError?: (error: string) => void;
}

export function OptimizedImage({
  src,
  alt,
  fallbackSrc,
  showPlaceholder = true,
  placeholderClassName,
  errorFallback,
  loadingVariant = "skeleton",
  className,
  onLoadingComplete,
  onLoadError,
  priority = false,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);
  const [retryCount, setRetryCount] = useState(0);

  const handleLoadingComplete = useCallback(
    (result: { naturalWidth: number; naturalHeight: number }) => {
      setIsLoading(false);
      setHasError(false);
      setRetryCount(0);
      onLoadingComplete?.(result);
    },
    [onLoadingComplete],
  );

  const handleError = useCallback(() => {
    const errorMessage = `Failed to load image: ${currentSrc}`;
    setHasError(true);
    setIsLoading(false);
    onLoadError?.(errorMessage);

    // Try fallback if available and not already using it
    if (fallbackSrc && currentSrc !== fallbackSrc && retryCount < 2) {
      setCurrentSrc(fallbackSrc);
      setHasError(false);
      setIsLoading(true);
      setRetryCount((prev) => prev + 1);
    }
  }, [fallbackSrc, currentSrc, retryCount, onLoadError]);

  const handleLoadStart = useCallback(() => {
    setIsLoading(true);
    setHasError(false);
  }, []);

  const handleRetry = useCallback(() => {
    if (retryCount < 3) {
      setHasError(false);
      setIsLoading(true);
      setRetryCount((prev) => prev + 1);
      // Force image reload by adding timestamp
      setCurrentSrc(`${src}?retry=${Date.now()}`);
    }
  }, [src, retryCount]);

  // Enhanced error fallback with light mode styling
  const renderErrorFallback = () => {
    if (errorFallback) {
      return <>{errorFallback}</>;
    }

    return (
      <div
        className={cn(
          // Light mode optimized background and text colors
          "flex flex-col items-center justify-center gap-3 p-6",
          "bg-neutral-100 text-neutral-500 border border-neutral-200 rounded-lg",
          "min-h-32", // Ensure minimum height for accessibility
          className,
        )}
        role="img"
        aria-label={`Image failed to load: ${alt}`}
      >
        {/* Error icon with proper contrast */}
        <svg
          className="w-8 h-8 text-neutral-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>

        {/* Error message with proper typography */}
        <p className="text-sm text-center text-neutral-600 max-w-48">
          Unable to load image
        </p>

        {/* Retry button if retries available */}
        {retryCount < 3 && (
          <button
            onClick={handleRetry}
            className="btn-secondary text-xs px-3 py-1.5 mt-2"
            aria-label="Retry loading image"
          >
            Retry
          </button>
        )}
      </div>
    );
  };

  // Loading placeholder variants
  const renderLoadingPlaceholder = () => {
    if (!isLoading || !showPlaceholder) return null;

    const baseClasses = "absolute inset-0 flex items-center justify-center";

    if (loadingVariant === "minimal") {
      return (
        <div
          className={cn(baseClasses, "bg-neutral-50", placeholderClassName)}
          aria-label="Loading image"
          role="img"
        />
      );
    }

    if (loadingVariant === "blur") {
      return (
        <div
          className={cn(
            baseClasses,
            "bg-neutral-100 backdrop-blur-sm",
            placeholderClassName,
          )}
          aria-label="Loading image"
          role="img"
        >
          <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      );
    }

    // Default skeleton variant
    return (
      <div
        className={cn(
          baseClasses,
          "bg-neutral-100 animate-pulse",
          placeholderClassName,
        )}
        aria-label="Loading image"
        role="img"
      >
        <svg
          className="w-8 h-8 text-neutral-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    );
  };

  // Show error state
  if (hasError && retryCount >= 2) {
    return renderErrorFallback();
  }

  return (
    <div className="relative overflow-hidden">
      {/* Loading placeholder */}
      {renderLoadingPlaceholder()}

      {/* Optimized Next.js Image with enhanced accessibility */}
      <Image
        src={currentSrc}
        alt={alt}
        className={cn(
          "transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100",
          className,
        )}
        onLoadingComplete={handleLoadingComplete}
        onError={handleError}
        onLoadStart={handleLoadStart}
        priority={priority}
        // Enhanced blur placeholder for better UX
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
        // Responsive image sizing for performance
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        // Optimized loading strategy
        loading={priority ? "eager" : "lazy"}
        // Decode async for better performance
        decoding="async"
        {...props}
      />

      {/* Screen reader announcements for loading state changes */}
      <div
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {isLoading
          ? "Image loading"
          : hasError
            ? "Image failed to load"
            : "Image loaded successfully"}
      </div>
    </div>
  );
}

// Pre-configured variants for common use cases with light mode optimization
export function ToolIcon({
  src,
  alt,
  className,
  ...props
}: OptimizedImageProps) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={32}
      height={32}
      className={cn("rounded-lg shadow-soft", className)}
      loadingVariant="minimal"
      priority={false}
      {...props}
    />
  );
}

export function HeroImage({
  src,
  alt,
  className,
  ...props
}: OptimizedImageProps) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      priority={true}
      className={cn("w-full h-auto rounded-xl shadow-medium", className)}
      loadingVariant="blur"
      {...props}
    />
  );
}

export function Thumbnail({
  src,
  alt,
  className,
  ...props
}: OptimizedImageProps) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={150}
      height={150}
      className={cn("rounded-lg object-cover shadow-soft", className)}
      loadingVariant="skeleton"
      priority={false}
      {...props}
    />
  );
}

export function CardImage({
  src,
  alt,
  className,
  ...props
}: OptimizedImageProps) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      className={cn("w-full h-48 object-cover rounded-t-lg", className)}
      loadingVariant="skeleton"
      priority={false}
      {...props}
    />
  );
}
