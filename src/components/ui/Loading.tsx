import React from "react";
import { cn } from "@/utils";

export interface LoadingProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "spinner" | "dots" | "pulse";
  text?: string;
  className?: string;
  showText?: boolean;
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
  xl: "h-10 w-10",
};

const textSizeClasses = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
  xl: "text-xl",
};

export function Loading({
  size = "md",
  variant = "spinner",
  text = "Loading...",
  className,
  showText = false,
}: LoadingProps) {
  if (variant === "spinner") {
    return (
      <div className={cn("flex items-center justify-center", className)}>
        <div className="flex flex-col items-center space-y-3">
          <svg
            className={cn("animate-spin text-brand-500", sizeClasses[size])}
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
          {showText && (
            <p
              className={cn("text-primary font-medium", textSizeClasses[size])}
            >
              {text}
            </p>
          )}
        </div>
        <span className="sr-only">{text}</span>
      </div>
    );
  }

  if (variant === "dots") {
    return (
      <div className={cn("flex items-center justify-center", className)}>
        <div className="flex flex-col items-center space-y-3">
          <div className="flex items-center space-x-2">
            <div
              className={cn(
                "bg-brand-500 rounded-full animate-pulse",
                sizeClasses[size],
              )}
            />
            <div
              className={cn(
                "bg-brand-500 rounded-full animate-pulse",
                sizeClasses[size],
              )}
              style={{ animationDelay: "0.15s" }}
            />
            <div
              className={cn(
                "bg-brand-500 rounded-full animate-pulse",
                sizeClasses[size],
              )}
              style={{ animationDelay: "0.3s" }}
            />
          </div>
          {showText && (
            <p
              className={cn("text-primary font-medium", textSizeClasses[size])}
            >
              {text}
            </p>
          )}
        </div>
        <span className="sr-only">{text}</span>
      </div>
    );
  }

  if (variant === "pulse") {
    return (
      <div className={cn("flex items-center justify-center", className)}>
        <div className="flex flex-col items-center space-y-3">
          <div
            className={cn(
              "bg-brand-500 rounded-full animate-pulse-gentle",
              sizeClasses[size],
            )}
          />
          {showText && (
            <p
              className={cn("text-primary font-medium", textSizeClasses[size])}
            >
              {text}
            </p>
          )}
        </div>
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
  animated?: boolean;
}

export function LoadingSkeleton({
  className,
  lines = 3,
  height = "h-4",
  animated = true,
}: LoadingSkeletonProps) {
  return (
    <div
      className={cn("space-y-3", className)}
      role="status"
      aria-label="Loading content"
    >
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={cn(
            "bg-neutral-200 rounded-lg",
            height,
            animated && "animate-pulse",
          )}
          style={{
            width: index === lines - 1 ? "75%" : "100%",
          }}
          aria-hidden="true"
        />
      ))}
      <span className="sr-only">Loading content...</span>
    </div>
  );
}
