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
  onLoadingComplete?: (result: {
    naturalWidth: number;
    naturalHeight: number;
  }) => void;
}

export function OptimizedImage({
  src,
  alt,
  fallbackSrc,
  showPlaceholder = true,
  placeholderClassName,
  errorFallback,
  className,
  onLoadingComplete,
  priority = false,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  const handleLoadingComplete = useCallback(
    (result: { naturalWidth: number; naturalHeight: number }) => {
      setIsLoading(false);
      onLoadingComplete?.(result);
    },
    [onLoadingComplete],
  );

  const handleError = useCallback(() => {
    setHasError(true);
    setIsLoading(false);

    // Try fallback if available and not already using it
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setHasError(false);
      setIsLoading(true);
    }
  }, [fallbackSrc, currentSrc]);

  const handleLoadStart = useCallback(() => {
    setIsLoading(true);
    setHasError(false);
  }, []);

  // Show error fallback if image failed to load
  if (hasError && errorFallback) {
    return <>{errorFallback}</>;
  }

  // Show default error state if no custom fallback provided
  if (hasError) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500",
          className,
        )}
        role="img"
        aria-label={`Failed to load image: ${alt}`}
      >
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Loading placeholder */}
      {isLoading && showPlaceholder && (
        <div
          className={cn(
            "absolute inset-0 skeleton flex items-center justify-center",
            placeholderClassName,
          )}
          aria-label="Loading image"
        >
          <svg
            className="w-8 h-8 text-neutral-400 dark:text-neutral-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      )}

      {/* Optimized Next.js Image */}
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
        // Optimize for Core Web Vitals
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
        // Enable responsive loading
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        // Optimize loading strategy
        loading={priority ? "eager" : "lazy"}
        {...props}
      />
    </div>
  );
}

// Pre-configured variants for common use cases
export function ToolIcon({ src, alt, ...props }: OptimizedImageProps) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={32}
      height={32}
      className="rounded-xl"
      priority={false}
      {...props}
    />
  );
}

export function HeroImage({ src, alt, ...props }: OptimizedImageProps) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      priority={true}
      className="w-full h-auto"
      {...props}
    />
  );
}

export function Thumbnail({ src, alt, ...props }: OptimizedImageProps) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={150}
      height={150}
      className="rounded-xl object-cover"
      priority={false}
      {...props}
    />
  );
}
